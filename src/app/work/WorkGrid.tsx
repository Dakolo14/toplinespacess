"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { works, type Work } from "@/lib/content";
import { zoomToPage } from "@/lib/zoom";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function WorkGrid() {
  const router = useRouter();
  const [tag, setTag] = useState("All");
  const tags = useMemo(() => {
    const m = new Map<string, number>();
    works.forEach((w) => w.tags.forEach((t) => m.set(t, (m.get(t) || 0) + 1)));
    return [["All", works.length] as [string, number], ...[...m.entries()].sort((a, b) => b[1] - a[1])];
  }, []);
  const list = tag === "All" ? works : works.filter((w) => w.tags.includes(tag));
  // distribute into 3 masonry columns, keeping reading order left to right
  const cols: Work[][] = [[], [], []];
  const hs = [0, 0, 0];
  list.forEach((w) => {
    const i = hs.indexOf(Math.min(...hs));
    cols[i].push(w);
    hs[i] += 1 / w.ratio + 0.18;
  });

  return (
    <section className="wk wrap">
      <header className="pg-head">
        <motion.h1 className="pg-label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>Work</motion.h1>
        <LayoutGroup id="filters">
          <nav className="wk-filters">
            {tags.map(([t, n], i) => (
              <motion.button key={t} onClick={() => setTag(t)} data-on={tag === t || undefined}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.1 + i * 0.04 }}>
                {tag === t && <motion.i layoutId="dot" className="dot" transition={{ type: "spring", stiffness: 500, damping: 38 }} />}
                {t}<sup>{n}</sup>
              </motion.button>
            ))}
          </nav>
        </LayoutGroup>
      </header>
      <LayoutGroup id="grid">
        <div className="wk-grid">
          {cols.map((col, ci) => (
            <div className="wk-col" key={ci}>
              <AnimatePresence mode="popLayout">
                {col.map((w, i) => (
                  <motion.article key={w.slug} layout className="wk-card"
                    initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.8, ease: EASE, delay: ci * 0.06 + i * 0.05 }}>
                    <Link href={`/work/${w.slug}`} onClick={(e) => {
                      const img = (e.currentTarget as HTMLElement).querySelector("img");
                      if (img && !e.metaKey && !e.ctrlKey) { e.preventDefault(); zoomToPage(img, `/work/${w.slug}`, router); }
                    }}>
                      <div className="wk-img" style={{ aspectRatio: w.ratio }}>
                        <img src={w.image} alt={w.title} loading="lazy" />
                      </div>
                      <h2>{w.title}</h2>
                      <p>{w.blurb}</p>
                      <p className="wk-tags">{w.tags.join(", ")}</p>
                    </Link>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </LayoutGroup>
      <style>{css}</style>
    </section>
  );
}

const css = `
.wk-filters{display:flex;gap:18px;flex-wrap:wrap;justify-content:flex-end}
.wk-filters button{position:relative;font-size:13px;font-weight:500;color:var(--ink-3);transition:color .3s;padding-left:0}
.wk-filters button:hover{color:var(--ink)}
.wk-filters button[data-on]{color:var(--ink);font-weight:600}
.wk-filters sup{font-size:8px;margin-left:2px;color:var(--ink-4);vertical-align:6px}
.wk-filters .dot{position:absolute;left:-9px;top:50%;width:5px;height:5px;margin-top:-2.5px;border-radius:50%;background:var(--accent)}
.wk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:32px;align-items:start}
.wk-col{display:flex;flex-direction:column;gap:48px}
.wk-card a{display:block}
.wk-img{overflow:hidden;background:#ece9e4}
.wk-img img{width:100%;height:100%;object-fit:cover;transition:transform 1.1s var(--ease-out),filter .6s}
.wk-card:hover .wk-img img{transform:scale(1.035)}
.wk-card h2{margin-top:12px;font-size:20px;font-weight:600;letter-spacing:-.04em;line-height:1.1}
.wk-card p{margin-top:5px;font-size:13px;color:var(--ink-2);font-weight:500}
.wk-card .wk-tags{margin-top:3px;color:var(--ink-4)}
@media (max-width:1100px){.wk-grid{grid-template-columns:repeat(2,1fr)}.wk-col:nth-child(3){display:contents}}
@media (max-width:809px){.wk-grid{grid-template-columns:1fr}.wk-col{display:contents}.wk-filters{justify-content:flex-start;padding-left:10px}}
`;
