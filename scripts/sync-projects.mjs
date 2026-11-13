// Pulls photos, videos and notes from the Desktop project folders into the site.
//   npm run sync-projects                       (uses ~/Desktop/TopLine Spaces Website/projects)
//   npm run sync-projects -- "/some/other/folder"
// Each folder: photos (cover.jpg first), optional .mp4, optional about.txt with
//   Client: / Year: / Location: / What we built: lines.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const srcDir = process.argv[2] || path.join(os.homedir(), "Desktop", "TopLine Spaces Website", "projects");
if (!fs.existsSync(srcDir)) { console.error(`Folder not found: ${srcDir}`); process.exit(1); }

const IMG = /\.(jpe?g|png|webp|avif)$/i, VID = /\.(mp4|webm|mov)$/i;
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const safe = (s) => s.toLowerCase().replace(/[^a-z0-9.]+/g, "-");

function size(file) {
  const b = fs.readFileSync(file);
  if (b[0] === 0x89 && b[1] === 0x50) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1], len = b.readUInt16BE(i + 2);
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { w: b.readUInt16BE(i + 7), h: b.readUInt16BE(i + 5) };
      i += 2 + len;
    }
  }
  return null;
}

const media = {};
for (const folder of fs.readdirSync(srcDir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const dir = path.join(srcDir, folder.name), slug = slugify(folder.name);
  const files = fs.readdirSync(dir).filter((f) => !f.startsWith("."));
  const imgs = files.filter((f) => IMG.test(f)).sort((a, b) => (/^cover\./i.test(b) ? 1 : 0) - (/^cover\./i.test(a) ? 1 : 0) || a.localeCompare(b, undefined, { numeric: true }));
  const vid = files.find((f) => VID.test(f));
  const out = path.join(root, "public/projects", slug);
  fs.mkdirSync(out, { recursive: true });
  const m = {};
  if (imgs.length) {
    m.images = imgs.map((f) => { fs.copyFileSync(path.join(dir, f), path.join(out, safe(f))); return `/projects/${slug}/${safe(f)}`; });
    m.cover = m.images[0];
    const s = size(path.join(dir, imgs[0]));
    if (s) m.ratio = +(s.w / s.h).toFixed(4);
  }
  if (vid) { fs.copyFileSync(path.join(dir, vid), path.join(out, safe(vid))); m.video = `/projects/${slug}/${safe(vid)}`; }
  const notes = files.find((f) => /^about\.(txt|md)$/i.test(f));
  if (notes) {
    const t = fs.readFileSync(path.join(dir, notes), "utf8");
    const field = (k) => (t.match(new RegExp(`^\\s*${k}\\s*:\\s*(.+)$`, "im")) || [])[1]?.trim();
    m.client = field("Client"); m.year = field("Year"); m.location = field("Location");
    const built = t.split(/^\s*What we built\s*:/im)[1];
    if (built?.trim()) m.about = built.trim();
    for (const k of Object.keys(m)) if (!m[k]) delete m[k];
  }
  if (Object.keys(m).length) media[slug] = m;
  console.log(`${folder.name.padEnd(28)} ${imgs.length} photo(s)${vid ? ", video" : ""}${notes ? ", notes" : ""}`);
}
fs.writeFileSync(path.join(root, "src/lib/media.json"), JSON.stringify(media, null, 2) + "\n");
console.log(`\nUpdated src/lib/media.json for ${Object.keys(media).length} project(s).`);
console.log("Projects with no photos keep their drawn placeholder. New folders also need a line in src/lib/content.ts.");
