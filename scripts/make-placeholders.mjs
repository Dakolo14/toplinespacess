// Draws a "set elevation" placeholder cover for every project that has no photos yet.
// node scripts/make-placeholders.mjs  ->  public/projects/<slug>/cover.svg
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const src = fs.readFileSync(path.join(root, "src/lib/content.ts"), "utf8");
const rows = [...src.matchAll(/mk\("([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)"[^\n]*?(ratio: 1)?\s*\}?\)?,\n/g)];

const INK = "#1d1b18", PAPER = "#efebe3", GREEN = "#0b7a4b", RED = "#b8202f";
const L = (d, w = 3, c = INK, extra = "") => `<path d="${d}" ${extra.includes("fill=") ? "" : 'fill="none"'} stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const R = (x, y, w, h, fill = "none", sw = 3, stroke = INK) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;

function truss(x, y, w, h) {
  let s = R(x, y, w, h, "none", 2.5);
  if (w > h) { for (let i = 0; i < w / h; i++) s += L(`M${x + i * h} ${y}L${x + (i + 1) * h} ${y + h}M${x + i * h} ${y + h}L${x + (i + 1) * h} ${y}`, 1.2); return s; }
  for (let i = 0; i < h / w; i++) s += L(`M${x} ${y + i * w}L${x + w} ${y + (i + 1) * w}M${x + w} ${y + i * w}L${x} ${y + (i + 1) * w}`, 1.2);
  return s;
}
const draw = {
  "TV & studio sets": (W, F) => {
    const c = W / 2;
    return R(c - 380, F - 420, 760, 420, "#e6e1d6") +
      [0, 1, 2, 3].map((i) => L(`M${c - 380 + i * 190 + 190} ${F - 420}V${F}`, 1.2)).join("") +
      R(c - 300, F - 360, 230, 140, INK, 3) + R(c + 70, F - 360, 230, 140, INK, 3) +
      `<rect x="${c - 285}" y="${F - 345}" width="200" height="110" fill="${GREEN}" opacity=".85"/>` +
      `<circle cx="${c + 185}" cy="${F - 290}" r="38" fill="none" stroke="${PAPER}" stroke-width="3"/>` +
      L(`M${c - 230} ${F - 140}Q${c} ${F - 175} ${c + 230} ${F - 140}L${c + 200} ${F - 30}H${c - 200}Z`, 3, INK, `fill="${PAPER}"`) +
      L(`M${c - 330} ${F - 110}h60v80M${c + 270} ${F - 110}h60M${c + 330} ${F - 110}v80`, 3);
  },
  "Stages & shows": (W, F) => {
    const c = W / 2;
    let s = truss(c - 470, F - 560, 34, 560) + truss(c + 436, F - 560, 34, 560) + truss(c - 470, F - 594, 940, 34);
    for (let i = 0; i < 6; i++) {
      const x = c - 360 + i * 144;
      s += `<path d="M${x} ${F - 560}L${x - 70} ${F - 150}H${x + 70}Z" fill="${INK}" opacity=".06"/>` + R(x - 10, F - 560, 20, 26, INK, 2);
    }
    s += R(c - 220, F - 470, 440, 250, INK) + `<rect x="${c - 205}" y="${F - 455}" width="410" height="220" fill="${GREEN}" opacity=".9"/>`;
    s += R(c - 420, F - 150, 840, 150, PAPER) + L(`M${c - 420} ${F - 120}H${c + 420}`, 1.5);
    for (let i = 0; i < 4; i++) s += R(c - 90, F - 150 + i * 37.5 - 0 + 150 - 150, 180, 37.5, "none", 1.5).replace(`y="${F - 150 + i * 37.5}"`, `y="${F - 150 + i * 37.5}"`);
    return s;
  },
  "Red carpets & events": (W, F) => {
    const c = W / 2;
    let s = R(c - 360, F - 520, 720, 400, "#e6e1d6");
    for (let r = 0; r < 5; r++) for (let k = 0; k < 6; k++) s += `<rect x="${c - 330 + k * 115 + (r % 2) * 40}" y="${F - 490 + r * 72}" width="${r % 2 ? 50 : 80}" height="22" fill="${(r + k) % 3 ? INK : GREEN}" opacity="${(r + k) % 3 ? 0.18 : 0.8}"/>`;
    s += `<path d="M${c - 260} ${F - 120}H${c + 260}L${c + 470} ${F + 40}H${c - 470}Z" fill="${RED}"/>`;
    for (const x of [-400, -250, 250, 400]) s += L(`M${c + x} ${F + 10}v-120`, 4) + `<circle cx="${c + x}" cy="${F - 114}" r="9" fill="${INK}"/>`;
    s += L(`M${c - 400} ${F - 90}Q${c - 325} ${F - 50} ${c - 250} ${F - 90}M${c + 250} ${F - 90}Q${c + 325} ${F - 50} ${c + 400} ${F - 90}`, 5, RED);
    return s;
  },
  "Brand activations": (W, F) => {
    const c = W / 2;
    return R(c - 360, F - 520, 720, 110, GREEN) + `<text x="${c}" y="${F - 448}" text-anchor="middle" font-family="Inter,Arial" font-weight="700" font-size="44" fill="${PAPER}" letter-spacing="-1">YOUR BRAND</text>` +
      L(`M${c - 340} ${F - 410}V${F}M${c + 340} ${F - 410}V${F}`, 4) + R(c - 320, F - 400, 640, 260, "#e6e1d6", 2) +
      [0, 1, 2].map((i) => R(c - 280 + i * 200, F - 370, 160, 30, "none", 2) + R(c - 280 + i * 200, F - 310, 160, 30, "none", 2)).join("") +
      R(c - 220, F - 140, 440, 140, PAPER) + `<rect x="${c - 220}" y="${F - 140}" width="440" height="22" fill="${INK}"/>`;
  },
  "Radio studios": (W, F) => {
    const c = W / 2;
    let s = "";
    for (let i = 0; i < 5; i++) s += R(c - 400 + i * 165, F - 520, 140, 200, "#e6e1d6", 2) + L(`M${c - 400 + i * 165 + 20} ${F - 500}v160M${c - 400 + i * 165 + 50} ${F - 500}v160M${c - 400 + i * 165 + 80} ${F - 500}v160M${c - 400 + i * 165 + 110} ${F - 500}v160`, 1);
    s += `<rect x="${c - 70}" y="${F - 480}" width="140" height="44" rx="6" fill="${RED}"/><text x="${c}" y="${F - 449}" text-anchor="middle" font-family="Inter,Arial" font-weight="700" font-size="22" fill="${PAPER}">ON AIR</text>`;
    s += L(`M${c - 380} ${F - 170}H${c + 380}L${c + 340} ${F - 140}H${c - 340}Z`, 3, INK, `fill="${PAPER}"`) + L(`M${c - 300} ${F - 140}V${F}M${c + 300} ${F - 140}V${F}`, 4);
    s += R(c - 160, F - 215, 320, 45, INK) + [...Array(12)].map((_, i) => `<rect x="${c - 145 + i * 25}" y="${F - 207}" width="6" height="${12 + (i * 7) % 20}" fill="${GREEN}"/>`).join("");
    for (const x of [-250, 250]) s += L(`M${c + x} ${F - 170}l${x > 0 ? -40 : 40} -120l${x > 0 ? -60 : 60} 30`, 4) + `<rect x="${c + x + (x > 0 ? -118 : 82)}" y="${F - 290}" width="36" height="60" rx="18" fill="${INK}"/>`;
    return s;
  },
  "Kiosks, prefabs & interiors": (W, F) => {
    const c = W / 2;
    return `<path d="M${c - 300} ${F - 470}L${c} ${F - 560}L${c + 300} ${F - 470}Z" fill="${GREEN}" stroke="${INK}" stroke-width="3"/>` +
      R(c - 260, F - 470, 520, 470, "#e6e1d6") + R(c - 210, F - 420, 420, 170, INK) +
      L(`M${c - 230} ${F - 250}L${c - 260} ${F - 200}H${c + 260}L${c + 230} ${F - 250}`, 3, INK, `fill="${PAPER}"`) +
      R(c - 210, F - 200, 420, 200, "none", 2) + L(`M${c} ${F - 200}V${F}`, 2) +
      [0, 1, 2, 3].map((i) => `<rect x="${c - 190 + i * 100}" y="${F - 400}" width="70" height="${70 + (i % 2) * 40}" fill="${PAPER}" opacity=".18"/>`).join("");
  },
};

const esc = (t) => t.replace(/&/g, "&amp;");
let n = 0;
for (const m of rows) {
  const [, folder, title, cat] = m;
  const square = !!m[5];
  const slug = folder.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const W = square ? 1000 : 1200, H = 1000 * (square ? 1 : 0.75) * (square ? 1 : 1);
  const HH = square ? 1000 : 900;
  const F = HH - 190;
  n++;
  const no = String(n).padStart(2, "0");
  let grid = "";
  for (let x = 0; x <= W; x += 50) grid += `M${x} 0V${HH}`;
  for (let y = 0; y <= HH; y += 50) grid += `M0 ${y}H${W}`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${HH}" width="${W}" height="${HH}">
<rect width="${W}" height="${HH}" fill="${PAPER}"/>
<path d="${grid}" stroke="${INK}" stroke-opacity=".05" stroke-width="1"/>
${draw[cat](W, F)}
${L(`M40 ${F}H${W - 40}`, 3)}
${L(`M40 ${F + 26}h${W - 80}`, 1, INK, 'stroke-dasharray="2 8"')}
<g font-family="Inter,Helvetica,Arial,sans-serif" fill="${INK}">
<text x="40" y="${HH - 92}" font-size="40" font-weight="700" letter-spacing="-1.6">${esc(title)}</text>
<text x="40" y="${HH - 56}" font-size="20" font-weight="500" opacity=".55">${esc(cat)} · Photos coming soon</text>
<text x="${W - 40}" y="${HH - 92}" font-size="40" font-weight="700" text-anchor="end" fill="${GREEN}">No. ${no}</text>
<text x="${W - 40}" y="${HH - 56}" font-size="20" font-weight="500" text-anchor="end" opacity=".55">TopLine Spaces · Lagos</text>
</g>
</svg>`;
  const dir = path.join(root, "public/projects", slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "cover.svg"), svg);
}
console.log(`drew ${n} placeholder covers`);
