"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useMotionValue, useSpring } from "framer-motion";
import { journal, site, works } from "@/lib/content";

const EASE = [0.22, 1, 0.36, 1] as const;
type View = "sheet" | "list";
const VIEW_KEY = "topline-journal-view";
// a cover photo per note, borrowed from the builds until the journal has its own
const cover = (i: number) => works[(i * 3 + 1) % works.length];

export default function JournalList() {
  const [cat, setCat] = useState("All projects");
  const [hover, setHover] = useState(-1);
  const [view, setView] = useState<View>("sheet");
  useEffect(() => {
    try { const v = sessionStorage.getItem(VIEW_KEY); if (v === "sheet" || v === "list") setView(v); } catch {}
  }, []);
  const pick = (v: View) => { setView(v); setHover(-1); try { sessionStorage.setItem(VIEW_KEY, v); } catch {} };
  const cats = ["All projects", ...Array.from(new Set(journal.map((j) => j.cat)))];
  const count = (c: string) => (c === "All projects" ? journal.length : journal.filter((j) => j.cat === c).length);
  const list = journal.filter((j) => cat === "All projects" || j.cat === cat);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28 }), sy = useSpring(y, { stiffness: 260, damping: 28 });
  return (
    <section className="jr wrap" onPointerMove={(e) => { x.set(e.clientX); y.set(e.clientY); }}>
      <header className="pg-head">
        <h1 className="pg-label">Journal</h1>
        <div className="jr-head-end">
        <span className="label">Notes from the studio, since {site.since}</span>
        <div className="jr-view" role="tablist" aria-label="Layout">
          {(["sheet", "list"] as View[]).map((v) => (
            <button key={v} role="tab" aria-selected={view === v} data-on={view === v || undefined} onClick={() => pick(v)}>
              {view === v && <motion.i layoutId="jr-view-pill" className="pill-bg" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
              <span>{v === "sheet" ? "Contact sheet" : "List"}</span>
            </button>
          ))}
        </div>
        </div>
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
        {view === "sheet" ? (
          <motion.div className="jr-sheet" layout>
            <AnimatePresence mode="popLayout" initial>
              {list.map((j, i) => (
                <motion.article key={j.title} layout initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.7, ease: EASE, delay: i * 0.05 }}>
                  <a href="#">
                    <div className="jr-cell"><img src={cover(journal.indexOf(j)).thumb} alt="" loading="lazy" /><b>{j.cat}</b></div>
                    <span className="d">{j.date} · {j.min} min</span>
                    <h2>{j.title}</h2>
                  </a>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
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
        )}
      </div>
      <motion.div className="jr-float" style={{ x: sx, y: sy }}>
        <AnimatePresence>
          {view === "list" && hover >= 0 && (
            <motion.img key={hover} src={cover(hover).image} alt="" initial={{ opacity: 0, scale: 0.7, rotate: -4 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ duration: 0.4, ease: EASE }} />
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
.jr-head-end{display:flex;align-items:center;gap:20px}
.jr-view{display:flex;padding:3px;background:var(--chip);border-radius:999px}
.jr-view button{position:relative;padding:7px 14px;white-space:nowrap;font-size:12px;font-weight:600;color:var(--ink-3);transition:color .3s}
.jr-view button[data-on]{color:var(--on-accent)}
.jr-view button span{position:relative}
.jr-view .pill-bg{position:absolute;inset:0;border-radius:999px;background:var(--accent)}
.jr-sheet{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:32px 20px;margin-left:24px;margin-bottom:40px}
.jr-sheet a{display:block}
.jr-cell{position:relative;aspect-ratio:4/3;overflow:hidden;background:var(--chip)}
.jr-cell img{width:100%;height:100%;object-fit:cover;transition:transform 1.1s var(--ease-out)}
.jr-cell b{position:absolute;left:0;top:0;padding:6px 8px;background:var(--panel);color:#fff;font-size:11px;font-weight:700;transition:background-color .4s,color .4s}
.jr-sheet article:hover .jr-cell img{transform:scale(1.04)}
.jr-sheet article:hover .jr-cell b{background:var(--accent);color:var(--on-accent)}
.jr-sheet .d{display:block;margin-top:12px;font-size:12px;font-weight:500;color:var(--ink-3)}
.jr-sheet h2{margin-top:4px;font-size:20px;font-weight:600;letter-spacing:-.035em;line-height:1.15;text-wrap:balance}
.jr-float{position:fixed;left:0;top:0;pointer-events:none;z-index:50}
.jr-float img{width:200px;aspect-ratio:4/3;object-fit:cover;margin:-160px 0 0 24px;box-shadow:0 20px 40px -12px rgba(0,0,0,.35)}
@media (max-width:1100px){.jr-sheet{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:809px){.jr-sheet{margin-left:0;gap:28px 14px}.jr-sheet h2{font-size:17px}.jr-body{grid-template-columns:1fr;margin-top:30px}.jr-cats{flex-direction:row;flex-wrap:wrap;gap:14px;margin-bottom:20px}.jr-list{margin-left:0}.jr-list a{grid-template-columns:1fr;gap:6px}.jr-float{display:none}}
@media (max-width:809px){.jr-head-end{flex-direction:column;align-items:inherit;gap:14px}}
@media (max-width:520px){.jr-sheet{grid-template-columns:1fr}}
`;
