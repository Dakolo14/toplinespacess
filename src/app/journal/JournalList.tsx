"use client";
import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useMotionValue, useSpring } from "framer-motion";
import { journal, site, works } from "@/lib/content";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function JournalList() {
  const [cat, setCat] = useState("All");
  const [hover, setHover] = useState(-1);
  const cats = ["All", ...Array.from(new Set(journal.map((j) => j.cat)))];
  const count = (c: string) => (c === "All" ? journal.length : journal.filter((j) => j.cat === c).length);
  const list = journal.filter((j) => cat === "All" || j.cat === cat);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28 }), sy = useSpring(y, { stiffness: 260, damping: 28 });
  return (
    <section className="jr wrap" onPointerMove={(e) => { x.set(e.clientX); y.set(e.clientY); }}>
      <header className="pg-head">
        <h1 className="pg-label">Journal</h1>
        <span className="label">Notes from the studio, since {site.since}</span>
      </header>
      <div className="jr-body">
        <LayoutGroup id="jr">
          <nav className="jr-cats">
            {cats.map((c) => (
              <button key={c} data-on={c === cat || undefined} onClick={() => setCat(c)}>
                {c === cat && <motion.i layoutId="jr-dot" className="dot" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                {c} <sup>{count(c)}</sup>
              </button>
            ))}
          </nav>
        </LayoutGroup>
        <ul className="jr-list" onPointerLeave={() => setHover(-1)}>
          <AnimatePresence mode="popLayout" initial>
            {list.map((j, i) => (
              <motion.li key={j.title} layout initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: i * 0.05 }} onPointerEnter={() => setHover(journal.indexOf(j))}
                data-dim={hover >= 0 && hover !== journal.indexOf(j) ? "" : undefined}>
                <a href="#">
                  <span className="d">{j.date}</span>
                  <span className="t">{j.title}</span>
                  <span className="m">{j.cat}<b>{j.min} min</b></span>
                </a>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
      <motion.div className="jr-float" style={{ x: sx, y: sy }}>
        <AnimatePresence>
          {hover >= 0 && (
            <motion.img key={hover} src={works[(hover * 3 + 1) % works.length].image} alt="" initial={{ opacity: 0, scale: 0.7, rotate: -4 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.4, ease: EASE }} />
          )}
        </AnimatePresence>
      </motion.div>
      <style>{css}</style>
    </section>
  );
}

const css = `
.jr-body{display:grid;grid-template-columns:150px 1fr;gap:0;margin-top:80px;max-width:1060px}
.jr-cats{display:flex;flex-direction:column;gap:5px;padding-top:6px;padding-left:16px}
.jr-cats button{position:relative;white-space:nowrap;text-align:left;font-size:13px;font-weight:500;color:var(--ink-3);transition:color .3s}
.jr-cats button[data-on]{color:var(--ink);font-weight:600}
.jr-cats button:hover{color:var(--ink)}
.jr-cats sup{font-size:12px;vertical-align:0;margin-left:6px;color:var(--ink-4)}
.jr-cats .dot{position:absolute;left:-14px;top:50%;width:5px;height:5px;margin-top:-2.5px;border-radius:50%;background:var(--accent)}
.jr-list{list-style:none;border-top:1px solid #ececec;margin-left:24px}
.jr-list li{border-bottom:1px solid #ececec;transition:opacity .4s}
.jr-list li[data-dim]{opacity:.35}
.jr-list a{display:grid;grid-template-columns:144px 1fr auto;align-items:baseline;padding:22px 0 20px}
.jr-list .d{font-size:13px;color:var(--ink-2);font-weight:500}
.jr-list .t{font-size:24px;font-weight:600;letter-spacing:-.04em;line-height:1.1;transition:transform .6s var(--ease-out)}
.jr-list li:hover .t{transform:translateX(8px)}
.jr-list .m{font-size:13px;color:var(--ink-2);font-weight:500;display:flex;gap:12px}
.jr-list .m b{font-weight:500}
.jr-float{position:fixed;left:0;top:0;pointer-events:none;z-index:50}
.jr-float img{width:200px;aspect-ratio:4/3;object-fit:cover;margin:-160px 0 0 24px;box-shadow:0 20px 40px -12px rgba(0,0,0,.35)}
@media (max-width:809px){.jr-body{grid-template-columns:1fr;margin-top:30px}.jr-cats{flex-direction:row;flex-wrap:wrap;gap:14px;margin-bottom:20px}.jr-list{margin-left:0}.jr-list a{grid-template-columns:1fr;gap:6px}.jr-float{display:none}}
`;
