#!/usr/bin/env python3
"""Turn the Desktop project folders into web-ready media for the site.

  python3 scripts/process-projects.py ["/path/to/projects"]

Needs Pillow (pip3 install pillow) and ffmpeg. For each folder it:
  - picks the cover (CURATE below, else a file called cover.*, else the first photo),
  - resizes up to MAX_PHOTOS photos to 1800px JPEGs in public/projects/<slug>/,
  - turns the first video into a short, silent, compressed loop (video.mp4),
  - reads about.txt if present, and writes src/lib/media.json.
"""
import json, os, re, subprocess, sys
from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser("~/Desktop/TopLine Spaces Website/projects")
MAX_PHOTOS = 16

# Hand-picked covers and files to leave out (paths relative to each project folder).
CURATE = {
    "MBGN": {"cover": "3D View 1.jpg", "skip": ["PLAN", "Recovery", "EXPLODED COMPONENTS1.jpg", "EXPLODED COMPONENTS122", "COMPONENTSDDD.jpg", "COMPONENTSRRR", "COMPONENTSFFF.jpg"]},
    "BIG TALK WITH DSA": {"cover": "3D View 8 Copy 111.jpg", "skip": ["37b501cd", "Copy 1 Copy 111.jpg"]},
    "BOTTLE KING": {"cover": "11.jpg", "skip": ["Copy 1111111", "Copy 144", "Copy 166", "Cop444y", "Vittew", "2rrttttt", "40.jpg"]},
    "UBA CEO AWARDS 2019 SILVER CARPET": {"cover": "Untitled-3.jpg"},
    "SILVERBIRD TV SETS": {"cover": "MORNING SHOW LAGOS 2018/image00020.jpeg", "only": [
        "MORNING SHOW LAGOS 2018/image00020.jpeg", "MORNING SHOW LAGOS 2018/image00008.jpeg", "MORNING SHOW LAGOS 2018/image00023.jpeg",
        "MORNING SHOW LAGOS 2018/image00025.jpeg", "MORNING SHOW LAGOS 2018/image00021.jpeg", "MISCELLANEOUS SET, LAGOS 2018/image00009.jpeg",
        "MISCELLANEOUS SET, LAGOS 2018/image00011.jpeg", "MISCELLANEOUS SET, LAGOS 2018/image00024.jpeg", "RENDERS/3D View 15.jpg",
        "RENDERS/3D View 16.jpg", "RENDERS/3D View 20 Copy 3.jpg"], "abuja": 5},
    "RHYTHM FM": {"cover": "image00002.jpeg"},
    "NSIA": {"cover": "3D View 9 Copy 1.jpg"},
    "BUDWEISER": {"cover": "WhatsApp Image 2026-10-20 at 8.34.17 PM (1).jpeg"},
    "HYMNODIA": {"cover": "image00002.jpeg", "skip": ["image00015"]},
    "TALK ACTIVE WITH KIKE": {"cover": "image00027.jpeg"},
    "INTERIOR SET": {"cover": "WhatsApp Image 2026-10-20 at 7.59.40 PM (1).jpeg", "skip": ["7.59.40 PM (5)", "7.59.41 PM (1)", "7.59.36 PM (2)", "7.59.35 PM (5)"]},
    "RADIO NOW": {"cover": "WhatsApp Image 2026-10-20 at 9.29.56 PM (4).jpeg", "skip": ["daria mediaaa", "daria mediaeeee", "daria mediarrr"]},
    "OVATION RED CAROL": {}, "AY LIVE 2018": {}, "AFF SET": {}, "KIOSK": {}, "PREFABS": {}, "OTHERS": {},
}
IMG = (".jpg", ".jpeg", ".png", ".webp")
VID = (".mp4", ".mov", ".webm")
slugify = lambda s: re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", s.lower()))


def walk(folder):
    out = []
    for r, ds, fs in os.walk(folder):
        ds[:] = sorted(d for d in ds if not d.startswith("."))
        for f in sorted(fs):
            if not f.startswith("."):
                out.append(os.path.relpath(os.path.join(r, f), folder))
    return out


def save_photo(src, dst):
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    im.thumbnail((1800, 1800), Image.LANCZOS)
    im.save(dst, "JPEG", quality=80, optimize=True, progressive=True)
    return im.width / im.height


media = {}
for name in sorted(os.listdir(SRC)):
    folder = os.path.join(SRC, name)
    if not os.path.isdir(folder):
        continue
    cfg = CURATE.get(name, {})
    slug = slugify(name)
    files = walk(folder)
    photos = [f for f in files if f.lower().endswith(IMG)]
    videos = [f for f in files if f.lower().endswith(VID)]
    if "only" in cfg:
        extra = [f for f in photos if f.startswith("STV ABUJA")][: cfg.get("abuja", 0) * 6 : 6]
        photos = [f for f in cfg["only"] if f in photos] + extra
    photos = [f for f in photos if not any(s in f for s in cfg.get("skip", []))]
    cover = cfg.get("cover") or next((f for f in photos if os.path.basename(f).lower().startswith("cover.")), photos[0] if photos else None)
    if cover in photos:
        photos.remove(cover)
        photos.insert(0, cover)
    photos = photos[:MAX_PHOTOS]

    out = os.path.join(ROOT, "public", "projects", slug)
    os.makedirs(out, exist_ok=True)
    m = {}
    if photos:
        m["images"] = []
        for i, f in enumerate(photos):
            dst = f"{i + 1:02d}.jpg"
            r = save_photo(os.path.join(folder, f), os.path.join(out, dst))
            if i == 0:
                m["ratio"] = round(r, 4)
            m["images"].append(f"/projects/{slug}/{dst}")
        m["cover"] = m["images"][0]
        th = Image.open(os.path.join(out, "01.jpg")); th.thumbnail((1000, 1000), Image.LANCZOS)
        th.save(os.path.join(out, "thumb.jpg"), "JPEG", quality=78, optimize=True, progressive=True)
        m["thumb"] = f"/projects/{slug}/thumb.jpg"
    if videos:
        v = os.path.join(folder, videos[0])
        subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", v, "-t", "20", "-an", "-vf",
                        "scale='if(gt(iw,ih),min(1280,iw),-2)':'if(gt(iw,ih),-2,min(1280,ih))',fps=30",
                        "-c:v", "libx264", "-crf", "28", "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart",
                        os.path.join(out, "video.mp4")], check=True)
        m["video"] = f"/projects/{slug}/video.mp4"
        if not photos:  # no photo at all: use a frame of the video as the cover
            subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", "1", "-i", v, "-frames:v", "1", "-q:v", "3", os.path.join(out, "01.jpg")], check=True)
            m["cover"] = f"/projects/{slug}/01.jpg"; m["images"] = [m["cover"]]
    notes = next((f for f in files if os.path.basename(f).lower() in ("about.txt", "about.md")), None)
    if notes:
        t = open(os.path.join(folder, notes), encoding="utf-8", errors="ignore").read()
        for k in ("Client", "Year", "Location"):
            mm = re.search(rf"^\s*{k}\s*:\s*(.+)$", t, re.I | re.M)
            if mm and mm.group(1).strip():
                m[k.lower()] = mm.group(1).strip()
        parts = re.split(r"^\s*What we built\s*:", t, flags=re.I | re.M)
        if len(parts) > 1 and parts[1].strip():
            m["about"] = parts[1].strip()
    if m:
        media[slug] = m
    print(f"{name:36} {len(photos):2} photo(s){' + video' if videos else ''}")

with open(os.path.join(ROOT, "src", "lib", "media.json"), "w") as fh:
    json.dump(media, fh, indent=2)
    fh.write("\n")
print(f"\nWrote src/lib/media.json for {len(media)} project(s).")
