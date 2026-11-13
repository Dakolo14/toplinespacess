// Shared-element style transition: the clicked artwork grows to fill the screen, the next page
// mounts underneath, then the overlay fades away (see releaseZoom).
type RouterLike = { push: (href: string) => void };

declare global {
  interface Window { __simiZoom?: { box: HTMLElement; veil: HTMLElement; at: number } }
}

export function zoomToPage(img: HTMLImageElement, href: string, router: RouterLike) {
  const r = img.getBoundingClientRect();
  const veil = document.createElement("div");
  veil.style.cssText = "position:fixed;inset:0;z-index:2147482999;background:var(--bg);opacity:0;pointer-events:none";
  const box = document.createElement("div");
  box.style.cssText = `position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:2147483000;overflow:hidden;pointer-events:none;transform-origin:0 0`;
  const pic = document.createElement("img");
  pic.src = img.currentSrc || img.src;
  pic.style.cssText = "width:100%;height:100%;object-fit:cover;display:block";
  box.appendChild(pic);
  document.body.append(veil, box);
  const vw = window.innerWidth, vh = window.innerHeight;
  const ez = bezier(0.4, 0, 0.12, 1);
  veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: "cubic-bezier(0.3,0,0.2,1)", fill: "forwards" });
  // box goes rect -> viewport; the picture is counter-scaled each step so it never stretches
  const boxK: Keyframe[] = [], picK: Keyframe[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = ez(i / 24);
    const x = r.left * (1 - t), y = r.top * (1 - t);
    const w = r.width + (vw - r.width) * t, h = r.height + (vh - r.height) * t;
    const bx = w / vw, by = h / vh, m = Math.max(bx, by);
    boxK.push({ transform: `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) scale(${bx.toFixed(5)},${by.toFixed(5)})` });
    picK.push({ transform: `scale(${(m / bx).toFixed(5)},${(m / by).toFixed(5)})` });
  }
  pic.style.transformOrigin = "50% 50%";
  pic.animate(picK, { duration: 720, easing: "linear", fill: "forwards" });
  const a = box.animate(boxK, { duration: 720, easing: "linear", fill: "forwards" });
  window.__simiZoom = { box, veil, at: Date.now() };
  a.finished.then(() => router.push(href), () => router.push(href));
}

export function releaseZoom() {
  const z = window.__simiZoom;
  if (!z) return;
  window.__simiZoom = undefined;
  const wait = Math.max(0, 760 - (Date.now() - z.at));
  setTimeout(() => {
    z.veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 550, easing: "ease-out", fill: "forwards" });
    z.box
      .animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: "scale(1.04)" }], { duration: 550, easing: "ease-out", fill: "forwards" })
      .finished.then(() => { z.box.remove(); z.veil.remove(); });
  }, wait + 60);
}

function bezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 40; i++) {
      const v = sx(t);
      if (Math.abs(v - x) < 1e-5) break;
      if (v < x) lo = t; else hi = t;
      t = (lo + hi) / 2;
    }
    return sy(t);
  };
}
