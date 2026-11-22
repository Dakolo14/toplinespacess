"use client";
import { useEffect, useRef, useState } from "react";

// Dark is the default. The visitor can pick Light, Dark or System (follow the device). The choice lives in
// localStorage and THEME_SCRIPT (in the root layout) applies it before first paint, so nothing flashes.
export type Mode = "light" | "dark" | "system";
export const THEME_KEY = "topline-theme";
export const THEME_SCRIPT = `try{var m=localStorage.getItem("${THEME_KEY}");var t=m==="light"||m==="dark"?m:m==="system"?(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):"dark";document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

const resolve = (m: Mode): "light" | "dark" =>
  m === "system" ? (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : m;

// Swap colours in one clean step: freeze every CSS transition for a frame so nothing animates
// piece by piece, and cross-fade the whole page where the browser supports view transitions.
function apply(theme: "light" | "dark") {
  const root = document.documentElement;
  if (root.getAttribute("data-theme") === theme) return;
  const swap = () => {
    root.classList.add("theme-freeze");
    root.setAttribute("data-theme", theme);
    void root.offsetHeight; // commit the new colours before transitions come back
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("theme-freeze")));
  };
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (doc.startViewTransition && !calm) doc.startViewTransition(swap);
  else swap();
}

const OPTIONS: { mode: Mode; label: string }[] = [
  { mode: "light", label: "Light" },
  { mode: "dark", label: "Dark" },
  { mode: "system", label: "System" },
];

export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("dark");
  const [shown, setShown] = useState<"light" | "dark">("dark");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const closeT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viaMouse = useRef(false);

  useEffect(() => {
    let m: Mode = "dark";
    try { const s = localStorage.getItem(THEME_KEY); if (s === "light" || s === "dark" || s === "system") m = s; } catch {}
    setMode(m);
    setShown(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
  }, []);

  // "System" follows the device live, e.g. when the phone switches to dark at sunset
  useEffect(() => {
    if (mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const on = () => { const t = resolve("system"); apply(t); setShown(t); };
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [mode]);

  // close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const down = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("pointerdown", down); document.removeEventListener("keydown", key); };
  }, [open]);

  const choose = (m: Mode) => {
    setMode(m);
    try { localStorage.setItem(THEME_KEY, m); } catch {}
    const t = resolve(m);
    apply(t);
    setShown(t);
    setOpen(false);
  };

  // hover opens it on a mouse; tap/click toggles it everywhere
  const enter = (e: React.PointerEvent) => { if (e.pointerType !== "mouse") return; if (closeT.current) clearTimeout(closeT.current); setOpen(true); };
  const leave = (e: React.PointerEvent) => { if (e.pointerType !== "mouse") return; closeT.current = setTimeout(() => setOpen(false), 200); };

  return (
    <div className="theme" ref={box} onPointerEnter={enter} onPointerLeave={leave} data-open={open || undefined}>
      <button type="button" className="theme-tg" aria-haspopup="menu" aria-expanded={open} aria-label="Colour mode"
        title="Colour mode" data-theme-now={shown}
        onPointerDown={(e) => { viaMouse.current = e.pointerType === "mouse"; }}
        // a mouse already opened it on hover, so a click must not close it again; touch and keyboard toggle
        onClick={() => { if (viaMouse.current) { viaMouse.current = false; setOpen(true); } else setOpen((o) => !o); }}>
        <Icon kind={shown} />
      </button>
      <div className="theme-menu" role="menu" aria-label="Colour mode">
        {OPTIONS.map((o) => (
          <button key={o.mode} type="button" role="menuitemradio" aria-checked={mode === o.mode}
            data-on={mode === o.mode || undefined} onClick={() => choose(o.mode)} tabIndex={open ? 0 : -1}>
            <Icon kind={o.mode} />
            <span>{o.label}</span>
            <i aria-hidden />
          </button>
        ))}
      </div>
      <style>{css}</style>
    </div>
  );
}

function Icon({ kind }: { kind: Mode }) {
  if (kind === "light")
    return (
      <svg viewBox="0 0 24 24" aria-hidden className="ti ti-sun">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
      </svg>
    );
  if (kind === "dark")
    return (
      <svg viewBox="0 0 24 24" aria-hidden className="ti ti-moon">
        <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="ti ti-sys">
      <rect x="3" y="4.5" width="18" height="12" rx="1.5" />
      <path d="M8.5 20h7M12 16.5V20" />
    </svg>
  );
}

const css = `
.theme{position:relative;flex:none}
.theme-tg{width:40px;height:40px;display:grid;place-items:center;color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);transition:background-color .3s,box-shadow .3s}
.theme-tg:hover,.theme[data-open] .theme-tg{background:var(--chip);box-shadow:inset 0 0 0 1px var(--ink-4)}
.theme-tg:focus-visible,.theme-menu button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.ti{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;overflow:visible;transform-box:fill-box;transform-origin:center;transition:transform .6s cubic-bezier(.34,1.56,.64,1)}
.theme-tg:hover .ti-sun{transform:rotate(45deg)}
.theme-tg:hover .ti-moon{transform:rotate(-18deg)}
.theme-menu{position:absolute;top:calc(100% + 8px);right:0;min-width:152px;padding:4px;display:flex;flex-direction:column;background:var(--bg);box-shadow:0 0 0 1px var(--line),0 18px 40px -16px rgba(0,0,0,.35);opacity:0;visibility:hidden;transform:translateY(-6px);transition:opacity .18s ease,transform .25s var(--ease-out),visibility 0s linear .18s;z-index:5}
.theme-menu::before{content:"";position:absolute;left:0;right:0;top:-10px;height:10px}
.theme[data-open] .theme-menu{opacity:1;visibility:visible;transform:none;transition:opacity .18s ease,transform .25s var(--ease-out),visibility 0s}
.theme-menu button{display:flex;align-items:center;gap:10px;height:38px;padding:0 10px;font-size:13px;font-weight:600;color:var(--ink-2);text-align:left;transition:background-color .2s,color .2s}
.theme-menu button .ti{width:16px;height:16px}
.theme-menu button span{flex:1}
.theme-menu button i{width:6px;height:6px;border-radius:50%;background:transparent;transition:background-color .2s}
.theme-menu button:hover{background:var(--chip);color:var(--ink)}
.theme-menu button[data-on]{color:var(--ink)}
.theme-menu button[data-on] i{background:var(--accent)}
`;
