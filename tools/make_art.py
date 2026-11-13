"""Generates neutral, abstract placeholder artwork for Agency Simi (swap for real project images later)."""
import random, math, sys
from PIL import Image, ImageDraw, ImageFilter, ImageChops
OUT = sys.argv[1]
def grain(im, amt=18, seed=0):
    rnd = random.Random(seed)
    n = Image.effect_noise(im.size, amt).convert('L')
    n = Image.merge('RGB', (n, n, n))
    return ImageChops.overlay(im, n) if False else Image.blend(im, ImageChops.add(im, n, 2, -64), 0.35)
def grad(size, top, bot):
    w, h = size
    im = Image.new('RGB', size)
    d = ImageDraw.Draw(im)
    for y in range(h):
        t = y / (h - 1)
        d.line([(0, y), (w, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
    return im
def glow(im, cx, cy, r, col, a=1.0):
    w, h = im.size
    g = Image.new('RGB', im.size, (0, 0, 0))
    d = ImageDraw.Draw(g)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col)
    g = g.filter(ImageFilter.GaussianBlur(r * 0.6))
    return ImageChops.add(im, Image.blend(Image.new('RGB', im.size), g, a))
def vignette(im, s=0.75):
    w, h = im.size
    m = Image.new('L', im.size, 0)
    d = ImageDraw.Draw(m)
    d.ellipse([-w * 0.2, -h * 0.2, w * 1.2, h * 1.2], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(min(w, h) * 0.25))
    dark = Image.new('RGB', im.size, (0, 0, 0))
    return Image.composite(im, Image.blend(im, dark, s), m)
specs = [
  # name, size, palette top, bottom, glows [(x,y,r,col)], extra
  ('01', (1200, 1600), (18, 10, 12), (40, 14, 16), [(0.5, 0.35, 380, (190, 30, 40)), (0.3, 0.8, 260, (20, 90, 90))], 'neon'),
  ('02', (1600, 1200), (8, 14, 20), (12, 20, 26), [(0.5, 0.45, 520, (40, 110, 130))], 'grid'),
  ('03', (1600, 1600), (30, 26, 18), (12, 10, 8), [(0.75, 0.25, 420, (200, 160, 90))], 'rays'),
  ('04', (1600, 1200), (34, 24, 14), (16, 12, 8), [(0.5, 0.3, 500, (210, 150, 80))], 'window'),
  ('05', (1600, 1200), (150, 120, 80), (90, 70, 46), [(0.35, 0.4, 500, (240, 210, 150))], 'shadow'),
  ('06', (1600, 1200), (14, 16, 20), (6, 8, 10), [(0.55, 0.55, 300, (200, 40, 40)), (0.2, 0.3, 200, (40, 80, 100))], 'bars'),
  ('07', (1600, 1200), (40, 30, 22), (14, 10, 8), [(0.3, 0.3, 520, (220, 180, 120))], 'arc'),
  ('08', (1600, 1200), (10, 16, 18), (4, 6, 8), [(0.3, 0.6, 240, (240, 200, 120)), (0.7, 0.3, 360, (40, 120, 110))], 'lines'),
  ('09', (1200, 1600), (30, 18, 10), (10, 6, 4), [(0.5, 0.25, 460, (240, 170, 80))], 'corridor'),
  ('10', (1600, 1200), (60, 54, 30), (30, 28, 14), [(0.5, 0.3, 600, (150, 140, 70))], 'field'),
  ('11', (1200, 1600), (44, 30, 22), (18, 12, 8), [(0.6, 0.35, 480, (200, 140, 90))], 'curve'),
  ('12', (1600, 1200), (120, 150, 190), (60, 70, 50), [(0.5, 0.2, 600, (230, 230, 240))], 'land'),
]
for name, size, top, bot, glows, kind in specs:
    w, h = size
    rnd = random.Random(int(name))
    im = grad(size, top, bot)
    for gx, gy, r, col in glows:
        im = glow(im, gx * w, gy * h, r, col, 0.9)
    d = ImageDraw.Draw(im, 'RGBA')
    if kind == 'neon':
        for i in range(4):
            x0 = 140 + i * 240; y0 = 380 + rnd.randint(-30, 30)
            d.rounded_rectangle([x0, y0, x0 + 170, y0 + 260], 30, outline=(255, 70, 80, 230), width=14)
    elif kind == 'grid':
        for r_ in range(5):
            for c in range(11):
                if abs(c - 5) + r_ * 0.6 > 6.5: continue
                x = 260 + c * 100; y = 300 + r_ * 90
                col = rnd.choice([(170, 210, 220), (220, 220, 200), (150, 200, 190), (230, 180, 200)])
                d.rounded_rectangle([x, y, x + 70, y + 48], 8, fill=col + (200,))
        d.ellipse([740, 560, 860, 680], fill=(5, 8, 10, 255)); d.rectangle([720, 640, 880, 1200], fill=(5, 8, 10, 255))
    elif kind == 'rays':
        for i in range(7):
            d.polygon([(1300, 0), (1400, 0), (200 + i * 120, 1600), (120 + i * 120, 1600)], fill=(255, 220, 160, 14))
        for i in range(5):
            x = 620 + i * 90; d.rectangle([x, 900 - i * 12, x + 26, 1180], fill=(10, 8, 6, 230))
    elif kind == 'window':
        for c in range(4):
            for r_ in range(2):
                x = 380 + c * 220; y = 140 + r_ * 220
                d.rectangle([x, y, x + 200, y + 200], fill=(255, 230, 190, 120))
        d.ellipse([700, 480, 900, 700], fill=(10, 8, 6, 255)); d.rounded_rectangle([560, 640, 1040, 1200], 120, fill=(10, 8, 6, 255))
    elif kind == 'shadow':
        d.ellipse([500, 260, 900, 700], fill=(40, 50, 30, 200)); d.rounded_rectangle([380, 620, 1100, 1300], 220, fill=(40, 50, 30, 200))
        d.rectangle([180, 760, 220, 1200], fill=(14, 12, 10, 255)); d.rectangle([180, 760, 480, 790], fill=(14, 12, 10, 255))
    elif kind == 'bars':
        for i in range(9):
            d.rectangle([180 + i * 140, 200, 200 + i * 140, 1000], fill=(240, 240, 255, 26))
    elif kind == 'arc':
        for i in range(12):
            d.arc([200 - i * 40, 300 - i * 30, 1400 + i * 40, 1500 + i * 30], 200, 300, fill=(250, 230, 200, 40), width=6)
    elif kind == 'lines':
        for i in range(10):
            y = 200 + i * 26; d.line([(0, y), (1600, y - 60)], fill=(160, 230, 220, 40), width=8)
        d.ellipse([440, 680, 520, 760], fill=(255, 230, 160, 255))
    elif kind == 'corridor':
        d.polygon([(0, 0), (480, 0), (560, 1600), (0, 1600)], fill=(8, 5, 3, 235))
        d.polygon([(720, 0), (1200, 0), (1200, 1600), (640, 1600)], fill=(8, 5, 3, 235))
        d.rectangle([590, 1100, 610, 1180], fill=(8, 5, 3, 255))
    elif kind == 'field':
        for i in range(4000):
            x = rnd.randint(0, w); y = rnd.randint(0, h); d.line([(x, y), (x + rnd.randint(-6, 6), y - rnd.randint(10, 40))], fill=(200, 190, 120, 50), width=2)
        d.line([(800, 0), (790, 1200)], fill=(20, 20, 10, 255), width=12)
    elif kind == 'curve':
        d.pieslice([-600, 300, 900, 1900], 270, 360, fill=(90, 60, 40, 255)); d.pieslice([-520, 380, 820, 1820], 270, 360, fill=(44, 30, 22, 255))
    elif kind == 'land':
        d.polygon([(0, 560), (500, 440), (1100, 520), (1600, 450), (1600, 1200), (0, 1200)], fill=(60, 80, 50, 255))
        d.polygon([(0, 760), (1600, 720), (1600, 900), (0, 940)], fill=(40, 60, 70, 255))
        for i in range(1500):
            x = rnd.randint(0, w); y = rnd.randint(930, h); d.ellipse([x, y, x + 8, y + 8], fill=rnd.choice([(180, 40, 60, 200), (240, 230, 220, 220)]))
    im = im.filter(ImageFilter.GaussianBlur(2))
    im = vignette(im, 0.55)
    im = grain(im, 30, int(name))
    im.save(f'{OUT}/work-{name}.jpg', quality=84)
# team portraits: soft grayscale silhouettes
for i in range(3):
    w, h = 900, 1100
    im = grad((w, h), (200 - i * 30, 200 - i * 30, 200 - i * 30), (120 - i * 20,) * 3)
    d = ImageDraw.Draw(im)
    tone = 40 + i * 20
    d.ellipse([w / 2 - 150, 230, w / 2 + 150, 590], fill=(tone,) * 3)
    d.rounded_rectangle([w / 2 - 330, 600, w / 2 + 330, 1300], 260, fill=(tone,) * 3)
    im = im.filter(ImageFilter.GaussianBlur(3)); im = grain(im, 30, i)
    im.save(f'{OUT}/team-{i + 1}.jpg', quality=84)
print('ok')
