"use client";
import { useEffect, useState } from "react";

// Dark is the default. A visitor's choice is remembered in localStorage and applied before first paint
// by THEME_SCRIPT (in the root layout), so the page never flashes the wrong colours.
export type Theme = "dark" | "light";
export const THEME_KEY = "topline-theme";
export const THEME_SCRIPT = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`;

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
  }, []);

  const flip = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.add("theme-anim");
    root.setAttribute("data-theme", next);
    window.setTimeout(() => root.classList.remove("theme-anim"), 500);
    try { localStorage.setItem(THEME_KEY, next); } catch {}
    setTheme(next);
  };

  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  return (
    <button type="button" className={`theme-tg ${className}`} onClick={flip} aria-label={label} title={label} data-theme-now={theme}>
      <svg viewBox="0 0 24 24" aria-hidden>
        {/* sun: shows in dark mode (tap for light) */}
        <g className="tg-sun">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
        </g>
        {/* moon: shows in light mode (tap for dark) */}
        <path className="tg-moon" d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" />
      </svg>
      <style>{css}</style>
    </button>
  );
}

const css = `
.theme-tg{flex:none;width:40px;height:40px;display:grid;place-items:center;color:var(--ink);box-shadow:inset 0 0 0 1px var(--line);transition:background-color .3s,box-shadow .3s}
.theme-tg:hover{background:var(--chip);box-shadow:inset 0 0 0 1px var(--ink-4)}
.theme-tg:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.theme-tg svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;overflow:visible}
.theme-tg .tg-sun,.theme-tg .tg-moon{transform-box:fill-box;transform-origin:center;transition:transform .6s cubic-bezier(.34,1.56,.64,1),opacity .35s ease}
.theme-tg[data-theme-now=dark] .tg-moon,.theme-tg[data-theme-now=light] .tg-sun{opacity:0;transform:rotate(-90deg) scale(.4)}
.theme-tg[data-theme-now=dark]:hover .tg-sun{transform:rotate(45deg)}
.theme-tg[data-theme-now=light]:hover .tg-moon{transform:rotate(-18deg)}
`;
