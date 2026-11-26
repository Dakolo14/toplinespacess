"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { categories, works, worksIn, type Work } from "@/lib/content";
import { zoomToPage } from "@/lib/zoom";

const EASE = [0.22, 1, 0.36, 1] as const;
type View = "index" | "sheet";

// Work as a production rundown: one numbered line per build, with the photo riding the cursor.
// "Sheet" swaps to an even contact sheet of every cover.
// Work as a production rundown: one numbered line per build, with the photo riding the cursor.
// "Contact sheet" swaps to an even grid. On phones, "All" becomes one swipeable row per category.
export default function WorkGrid({ cat = null }: { cat?: string | null }) {
  const router = useRouter();
  const [view, setView] = useState<View>("sheet");
  const [hover, setHover] = useState<Work | null>(null);
  const previewRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    try { const v = sessionStorage.getItem("topline-work-view-v2"); if (v === "sheet" || v === "index") setView(v); } catch {}
  }, []);
  const pick = (v: View) => { setView(v); try { sessionStorage.setItem("topline-work-view-v2", v); } catch {} };

  const cats = useMemo(() => categories.map((c) => ({ ...c, n: worksIn(c.slug).length })).filter((c) => c.n), []);
  const list = cat ? worksIn(cat) : works;
  const current = cat ? categories.find((c) => c.slug === cat) : null;

  // cursor-following preview
  const mx = useMotionValue(0), my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 260, damping: 30, mass: 0.6 });
  const y = useSpring(my, { stiffness: 260, damping: 30, mass: 0.6 });
  const move = (e: React.PointerEvent) => { mx.set(e.clientX); my.set(e.clientY); };

  const open = (e: React.MouseEvent, w: Work, img: HTMLImageElement | null | undefined) => {
    if (e.metaKey || e.ctrlKey || !img) return;
    e.preventDefault();
    zoomToPage(img, `/projects/${w.slug}`, router);
  };

  return (
    <section className="wk wrap">
      <header className="pg-head">
        <motion.h1 className="wk-h" key={cat ?? "all"} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
          {current ? current.label : "All projects"} <span className="wk-count">{list.length} {list.length === 1 ? "build" : "builds"}{current ? "" : ", Lagos and beyond"}</span>
        </motion.h1>
        <div className="wk-view" role="tablist" aria-label="Layout">
          {(["sheet", "index"] as View[]).map((v) => (
            <button key={v} role="tab" aria-selected={view === v} data-on={view === v || undefined} onClick={() => pick(v)}>
              {view === v && <motion.i layoutId="view-pill" className="pill-bg" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
              <span>{v === "index" ? "Rundown" : "Contact sheet"}</span>
            </button>
          ))}
        </div>
      </header>

      <nav className="wk-filters" aria-label="Categories">
        <div className="wk-filters-in">
          <Link href="/projects" scroll={false} data-on={!cat || undefined} aria-current={!cat ? "page" : undefined}>All projects<sup>{works.length}</sup></Link>
          {cats.map((c) => (
            <Link key={c.slug} href={`/projects/category/${c.slug}`} scroll={false} data-on={cat === c.slug || undefined} aria-current={cat === c.slug ? "page" : undefined}>
              {c.label}<sup>{c.n}</sup>
            </Link>
          ))}
        </div>
      </nav>

      {/* phones: one swipeable row per category on "All", a single column inside a category */}
      <div className="wk-mobile">
        {cat ? (
          <div className="wk-mcol">{list.map((w) => <Card key={w.slug} w={w} onOpen={open} />)}</div>
        ) : (
          cats.map((c) => <Row key={c.slug} title={c.label} slug={c.slug} items={worksIn(c.slug)} onOpen={open} />)
        )}
      </div>

      <div className="wk-desk">
      {view === "index" ? (
        <div className="wk-run" onPointerMove={move} onPointerLeave={() => setHover(null)}>
          <div className="wk-row wk-th" aria-hidden>
            <span>No.</span><span>Project</span><span>What we built</span><span>Category</span><span>Year</span>
          </div>
          <AnimatePresence mode="popLayout" initial>
            {list.map((w, i) => (
              <motion.div key={w.slug} layout initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: EASE, delay: Math.min(i, 12) * 0.035 }}>
                <Link href={`/projects/${w.slug}`} className="wk-row" data-dim={(hover && hover !== w) || undefined}
                  onPointerEnter={() => setHover(w)}
                  onClick={(e) => {
                    const own = (e.currentTarget as HTMLElement).querySelector<HTMLImageElement>(".wk-thumb img");
                    open(e, w, previewRef.current && hover === w && getComputedStyle(previewRef.current.parentElement!).opacity !== "0" ? previewRef.current : own);
                  }}>
                  <span className="wk-no">{w.no}</span>
                  <span className="wk-title">
                    <span className="wk-thumb"><img src={w.thumb} alt="" loading="lazy" /></span>
                    {w.title}
                  </span>
                  <span className="wk-what">{w.services}</span>
                  <span className="wk-cat">{w.tags[0]}</span>
                  <span className="wk-yr">{w.year || "—"}<i className="wk-arrow">→</i></span>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
          <motion.div className="wk-float" style={{ x, y }} animate={{ opacity: hover ? 1 : 0, scale: hover ? 1 : 0.85 }} transition={{ duration: 0.35, ease: EASE }} aria-hidden>
            <AnimatePresence initial={false}>
              {hover && (
                <motion.img ref={previewRef} key={hover.slug} src={hover.thumb} alt="" style={{ aspectRatio: hover.ratio }}
                  initial={{ clipPath: "inset(100% 0 0 0)" }} animate={{ clipPath: "inset(0% 0 0 0)" }} exit={{ opacity: 0, transition: { duration: 0.3 } }}
                  transition={{ duration: 0.55, ease: EASE }} />
              )}
            </AnimatePresence>
            {hover && <span className="wk-float-no">{hover.no}</span>}
          </motion.div>
        </div>
      ) : (
        <motion.div className="wk-sheet" layout>
          <AnimatePresence mode="popLayout">
            {list.map((w, i) => (
              <motion.article key={w.slug} layout initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.7, ease: EASE, delay: Math.min(i, 12) * 0.04 }}>
                <Link href={`/projects/${w.slug}`} onClick={(e) => open(e, w, (e.currentTarget as HTMLElement).querySelector("img"))}>
                  <div className="wk-cell"><img src={w.thumb} alt={w.title} loading="lazy" /><b>{w.no}</b></div>
                  <h2>{w.title}</h2>
                  <p>{w.services}</p>
                </Link>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      </div>
      <style>{css}</style>
    </section>
  );
}

type OpenFn = (e: React.MouseEvent, w: Work, img: HTMLImageElement | null | undefined) => void;

function Card({ w, onOpen }: { w: Work; onOpen: OpenFn }) {
  return (
    <Link href={`/projects/${w.slug}`} className="wk-card" onClick={(e) => onOpen(e, w, (e.currentTarget as HTMLElement).querySelector("img"))}>
      <span className="wk-cell"><img src={w.thumb} alt={w.title} loading="lazy" /><b>{w.no}</b></span>
      <strong>{w.title}</strong>
      <span>{w.services}</span>
    </Link>
  );
}

// A category as a horizontal, snap-scrolling row with arrow buttons for people who don't swipe.
function Row({ title, slug, items, onOpen }: { title: string; slug: string; items: Work[]; onOpen: OpenFn }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: items.length < 2 });
  const sync = () => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  };
  const go = (d: number) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: "smooth" });
  return (
    <section className="wk-mrow">
      <header>
        <Link href={`/projects/category/${slug}`} className="wk-mrow-h">{title}<sup>{items.length}</sup></Link>
        <span className="wk-mrow-nav">
          <button aria-label={`Previous in ${title}`} disabled={edge.start} onClick={() => go(-1)}>←</button>
          <button aria-label={`Next in ${title}`} disabled={edge.end} onClick={() => go(1)}>→</button>
        </span>
      </header>
      <div className="wk-mrow-track" ref={ref} onScroll={sync}>
        {items.map((w) => <Card key={w.slug} w={w} onOpen={onOpen} />)}
        <Link href={`/projects/category/${slug}`} className="wk-card wk-card-all"><span>See all {title}</span><i>→</i></Link>
      </div>
    </section>
  );
}

const css = `
.wk .pg-head{margin-bottom:18px}
.wk-h{font-size:clamp(30px,3.4vw,48px);font-weight:600;letter-spacing:-.045em;line-height:1}
.wk-h .wk-count{font-size:13px;letter-spacing:-.01em;vertical-align:middle}
.wk-count{margin-left:10px;font-weight:500;color:var(--ink-3)}
.wk-view{display:flex;padding:3px;background:var(--chip);border-radius:999px}
.wk-view button{position:relative;padding:7px 14px;white-space:nowrap;font-size:12px;font-weight:600;color:var(--ink-3);transition:color .3s}
.wk-view button[data-on]{color:var(--on-ink)}
.wk-view button span{position:relative}
.wk-view .pill-bg{position:absolute;inset:0;border-radius:999px;background:var(--ink)}
.wk-filters{position:sticky;top:78px;z-index:30;margin:0 calc(var(--gutter) * -1) 28px;padding:8px var(--gutter);background:color-mix(in srgb,var(--bg) 94%,transparent);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
.wk-filters-in{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;scroll-snap-type:x proximity}
.wk-filters-in::-webkit-scrollbar{display:none}
.wk-filters a{flex:none;scroll-snap-align:start;display:inline-flex;align-items:baseline;gap:4px;min-height:40px;padding:11px 16px;font-size:14px;font-weight:600;color:var(--ink-2);background:var(--chip);transition:background-color .3s,color .3s}
.wk-filters a:hover{color:var(--ink);background:#e9e4e4}
.wk-filters a[data-on]{background:var(--accent);color:var(--on-accent)}
.wk-filters sup{font-size:10px;color:var(--ink-3)}
.wk-filters a[data-on] sup{color:var(--on-accent)}

.wk-run{position:relative;border-top:1.5px solid var(--ink);margin-bottom:40px}
.wk-row{position:relative;display:grid;grid-template-columns:64px minmax(0,1.6fr) minmax(0,1fr) minmax(0,1fr) 90px;align-items:center;gap:16px;padding:0 4px;min-height:74px;border-bottom:1px solid var(--line);transition:opacity .4s,color .4s}
.wk-row::before{content:"";position:absolute;left:0;top:-1px;bottom:-1px;width:100%;background:var(--accent);transform:scaleY(0);transform-origin:50% 100%;transition:transform .5s var(--ease-out);z-index:-1}
.wk-th{min-height:38px;font-size:11px;font-weight:600;color:var(--ink-3);text-transform:uppercase;letter-spacing:.06em}
.wk-th::before{display:none}
a.wk-row[data-dim]{opacity:.32}
a.wk-row:hover{color:var(--on-accent)}
a.wk-row:hover::before{transform:none}
.wk-no{font-size:13px;font-weight:700;font-variant-numeric:tabular-nums}
.wk-title{display:flex;align-items:center;gap:14px;font-size:clamp(22px,2.4vw,34px);font-weight:600;letter-spacing:-.045em;line-height:1;transition:transform .6s var(--ease-out)}
a.wk-row:hover .wk-title{transform:translateX(10px)}
.wk-thumb{display:none;width:64px;flex:none;aspect-ratio:4/3;overflow:hidden;background:#ece9e4}
.wk-thumb img{width:100%;height:100%;object-fit:cover}
.wk-what,.wk-cat{font-size:13px;font-weight:500;color:inherit;opacity:.7}
.wk-yr{display:flex;justify-content:space-between;font-size:13px;font-weight:600;font-variant-numeric:tabular-nums}
.wk-arrow{font-style:normal;opacity:0;transform:translateX(-8px);transition:opacity .4s,transform .5s var(--ease-out)}
a.wk-row:hover .wk-arrow{opacity:1;transform:none}
.wk-float{position:fixed;left:0;top:0;z-index:20;width:300px;margin:-110px 0 0 28px;pointer-events:none}
.wk-float img{display:block;width:100%;object-fit:cover;box-shadow:0 0 0 6px var(--panel),0 28px 50px -18px rgba(0,0,0,.45)}
.wk-float img+img{position:absolute;left:0;top:0}
.wk-float-no{position:absolute;right:-6px;top:-6px;transform:translateY(-100%);padding:7px 8px;background:var(--accent);color:var(--on-accent);font-size:12px;font-weight:700}

.wk-sheet{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px 20px;margin-bottom:40px}
.wk-sheet a{display:block}
.wk-cell{position:relative;aspect-ratio:4/3;overflow:hidden;background:#ece9e4}
.wk-cell img{width:100%;height:100%;object-fit:cover;transition:transform 1.1s var(--ease-out)}
.wk-cell b{position:absolute;left:0;top:0;padding:6px 8px;background:var(--panel);color:#fff;font-size:11px;font-weight:700;transition:background .4s}
.wk-sheet article:hover .wk-cell img{transform:scale(1.04)}
.wk-sheet article:hover .wk-cell b{background:var(--accent);color:var(--on-accent)}
.wk-sheet h2{margin-top:10px;font-size:17px;font-weight:600;letter-spacing:-.035em;line-height:1.1}
.wk-sheet p{margin-top:3px;font-size:12px;color:var(--ink-3);font-weight:500}

.wk-mobile{display:none}
.wk-card{display:block;min-width:0}
.wk-card .wk-cell{display:block}
.wk-card strong{display:block;margin-top:10px;font-size:18px;font-weight:600;letter-spacing:-.035em;line-height:1.1}
.wk-card>span:last-child{display:block;margin-top:3px;font-size:13px;color:var(--ink-3);font-weight:500}
.wk-mcol{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:28px 16px;margin-bottom:48px}
.wk-mrow{margin-bottom:40px}
.wk-mrow header{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.wk-mrow-h{font-size:22px;font-weight:600;letter-spacing:-.04em}
.wk-mrow-h sup{font-size:11px;color:var(--ink-3);margin-left:3px}
.wk-mrow-nav{display:flex;gap:6px}
.wk-mrow-nav button{width:40px;height:40px;display:grid;place-items:center;background:var(--chip);font-size:16px;transition:background-color .3s,opacity .3s}
.wk-mrow-nav button:not(:disabled):hover{background:var(--accent);color:var(--on-accent)}
.wk-mrow-nav button:disabled{opacity:.35;cursor:default}
.wk-mrow-track{display:grid;grid-auto-flow:column;grid-auto-columns:78%;gap:14px;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;margin:0 calc(var(--gutter) * -1);padding:0 var(--gutter);scroll-padding:0 var(--gutter)}
.wk-mrow-track::-webkit-scrollbar{display:none}
.wk-mrow-track>*{scroll-snap-align:start}
.wk-card-all{display:flex!important;flex-direction:column;justify-content:center;align-items:center;gap:8px;aspect-ratio:4/3;background:var(--chip);font-weight:600;font-size:15px}
.wk-card-all i{font-style:normal;width:40px;height:40px;display:grid;place-items:center;background:var(--accent);color:var(--on-accent)}
@media (max-width:809px){.wk-mobile{display:block}.wk-desk,.wk-view{display:none}.wk-filters{top:70px}}
@media (min-width:600px) and (max-width:809px){.wk-mrow-track{grid-auto-columns:46%}}
@media (hover:none),(max-width:809px){.wk-float{display:none}.wk-thumb{display:block}a.wk-row[data-dim]{opacity:1}}
@media (max-width:1100px){.wk-sheet{grid-template-columns:repeat(3,minmax(0,1fr))}.wk-row{grid-template-columns:52px minmax(0,1.6fr) minmax(0,1fr) 80px}.wk-cat{display:none}.wk-th span:nth-child(4){display:none}}
@media (max-width:809px){.wk-sheet{grid-template-columns:repeat(2,minmax(0,1fr))}.wk-row{grid-template-columns:34px minmax(0,1fr) 54px;gap:10px;min-height:84px}.wk-what,.wk-th span:nth-child(3){display:none}.wk-title{font-size:20px}.wk .pg-head{flex-direction:row;align-items:center}.wk-count{display:block;margin:4px 0 0}}
`;
