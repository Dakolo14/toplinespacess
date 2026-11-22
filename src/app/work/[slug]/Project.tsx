"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { categoryLabel, type Work } from "@/lib/content";
import { releaseZoom, zoomToPage } from "@/lib/zoom";
import { Fade, Lines } from "@/components/ui/Reveal";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Project({ work, prev, next }: { work: Work; prev: Work; next: Work }) {
  const router = useRouter();
  useEffect(() => { releaseZoom(); }, []);

  // every photo, with the film (if any) second
  const slides: { src: string; video?: boolean }[] = work.images.map((src) => ({ src }));
  if (work.video) slides.splice(Math.min(1, slides.length), 0, { src: work.video, video: true });
  const drawing = work.image.endsWith(".svg"); // placeholder elevation drawing until photos arrive
  const close = () => (window.history.length > 1 ? router.back() : router.push("/work"));

  const zoom = (e: React.MouseEvent, href: string) => {
    if (e.metaKey || e.ctrlKey) return;
    const img = (e.currentTarget as HTMLElement).querySelector("img");
    if (img) { e.preventDefault(); zoomToPage(img, href, router); }
  };

  return (
    <main className="pj">
      <button className="pj-x" onClick={close} aria-label="Close project">
        <i /><i />
      </button>

      <div className="pj-grid">
        <div className="pj-text">
          <Fade className="pj-crumbs" y={8}>
            <Link href="/work">Work</Link><i>/</i>
            <Link href={`/work/category/${work.category}`}>{categoryLabel(work.category)}</Link>
          </Fade>
          <Lines as="h1" className="pj-title display" lines={[work.title]} />
          <Fade delay={0.12}>
            <dl className="pj-facts">
              <div><dt>What we built</dt><dd>{work.services}</dd></div>
              <div><dt>Client</dt><dd>{work.client}</dd></div>
              <div><dt>Where</dt><dd>{work.location}</dd></div>
              {work.year && <div><dt>Year</dt><dd>{work.year}</dd></div>}
            </dl>
          </Fade>
          <Fade delay={0.2}><p className="pj-lead">{work.blurb}</p></Fade>
          <section className="pj-body">
            <Lines as="h2" lines={[work.body.heading]} />
            {work.body.paragraphs.map((p, i) => <Fade key={i} delay={0.04 * i}><p>{p}</p></Fade>)}
            {work.body.quote && (
              <Fade className="pj-quote">
                <blockquote>“{work.body.quote.text}”</blockquote>
                {work.body.quote.by && <cite>{work.body.quote.by}</cite>}
              </Fade>
            )}
          </section>
          <Fade><Link className="pj-cta" href="/contact">Start a build like this <i>→</i></Link></Fade>
        </div>

        <div className="pj-media">
          {drawing ? (
            <div className="pj-drawing"><img src={work.image} alt={work.title} /><span>Set elevation. Photos coming soon.</span></div>
          ) : (
            <Carousel slides={slides} title={work.title} />
          )}
        </div>
      </div>

      {/* clear break before the next project: its own band, full width */}
      <nav className="pj-more" aria-label="More projects">
        <div className="pj-more-head">
          <span>Keep looking</span>
          <Link href={`/work/category/${work.category}`}>More {categoryLabel(work.category)} →</Link>
        </div>
        <Link href={`/work/${next.slug}`} className="pj-next" onClick={(e) => zoom(e, `/work/${next.slug}`)}>
          <span className="pj-next-img"><img src={next.thumb} alt="" loading="lazy" /></span>
          <span className="pj-next-txt">
            <em>Next project</em>
            <strong>{next.title}</strong>
            <small>{categoryLabel(next.category)} · {next.services}</small>
            <b className="pj-next-go" aria-hidden>→</b>
          </span>
        </Link>
        <Link href={`/work/${prev.slug}`} className="pj-prev">← Previous: {prev.title}</Link>
      </nav>
      <style>{css}</style>
    </main>
  );
}

// Swipe on touch, arrows and keys everywhere. Native scroll-snap does the physics.
function Carousel({ slides, title }: { slides: { src: string; video?: boolean }[]; title: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [at, setAt] = useState(0);
  const n = slides.length;

  const goTo = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    const j = Math.max(0, Math.min(n - 1, i));
    el.scrollTo({ left: j * el.clientWidth, behavior: "smooth" });
  }, [n]);

  const onScroll = () => {
    const el = track.current;
    if (el) setAt(Math.round(el.scrollLeft / el.clientWidth));
  };

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea")) return;
      if (e.key === "ArrowRight") goTo(at + 1);
      if (e.key === "ArrowLeft") goTo(at - 1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [at, goTo]);

  return (
    <motion.div className="pj-car" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}>
      <div className="pj-screen">
        <div className="pj-track" ref={track} onScroll={onScroll} tabIndex={0} aria-label={`${title} photos`} aria-roledescription="carousel">
          {slides.map((s, i) => (
            <div key={s.src} className="pj-slide" aria-label={`${i + 1} of ${n}`}>
              {s.video
                ? <video src={s.src} autoPlay muted loop playsInline preload="metadata" />
                : <img src={s.src} alt={`${title}, photo ${i + 1}`} loading={i < 2 ? "eager" : "lazy"} draggable={false} />}
            </div>
          ))}
        </div>
        {n > 1 && (
          <>
            <button className="pj-arrow l" onClick={() => goTo(at - 1)} disabled={at === 0} aria-label="Previous photo">←</button>
            <button className="pj-arrow r" onClick={() => goTo(at + 1)} disabled={at === n - 1} aria-label="Next photo">→</button>
          </>
        )}
      </div>
      <div className="pj-bar">
        <span className="pj-count"><b>{String(at + 1).padStart(2, "0")}</b> / {String(n).padStart(2, "0")}</span>
        {n > 1 && <span className="pj-hint">Swipe or use ← → keys</span>}
      </div>
      {n > 1 && (
        <div className="pj-strip">
          {slides.map((s, i) => (
            <button key={s.src} data-on={i === at || undefined} onClick={() => goTo(i)} aria-label={`Show photo ${i + 1}`}>
              {s.video
                ? <span className="pj-film"><video src={s.src} muted playsInline preload="metadata" /><b>▶</b></span>
                : <span style={{ backgroundImage: `url(${s.src})` }} />}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}

const css = `
.pj{position:relative;min-height:100vh;padding-top:104px;background:var(--bg)}
.pj-x{position:fixed;right:20px;top:84px;width:44px;height:44px;z-index:40;display:grid;place-items:center;background:var(--bg);box-shadow:inset 0 0 0 1px var(--line);transition:background-color .3s}
.pj-x:hover{background:var(--accent)}
.pj-x i{position:absolute;width:16px;height:2px;background:var(--ink);transform:rotate(45deg);transition:transform .5s var(--ease-out)}
.pj-x i+i{transform:rotate(-45deg)}
.pj-x:hover i{transform:rotate(135deg)}.pj-x:hover i+i{transform:rotate(45deg)}

/* one spacing rhythm for the whole page: 8 / 16 / 24 / 40 / 64 / 96 */
.pj-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);gap:64px;padding:0 var(--gutter);max-width:1440px;margin:0 auto}
.pj-text{max-width:460px;padding-bottom:24px}
.pj-crumbs{display:flex;gap:8px;align-items:center;margin-bottom:16px;font-size:13px;font-weight:600;color:var(--ink-3)}
.pj-crumbs a{transition:color .25s}.pj-crumbs a:hover{color:var(--accent-deep)}
.pj-crumbs a:last-child{color:var(--ink)}
.pj-crumbs i{font-style:normal;color:var(--ink-4)}
.pj-title{font-size:clamp(44px,5vw,72px);margin-bottom:24px}
.pj-facts{display:grid;grid-template-columns:1fr 1fr;gap:16px 24px;padding:16px 0;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.pj-facts dt{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:var(--ink-3);margin-bottom:4px}
.pj-facts dd{font-size:14px;font-weight:600}
.pj-lead{margin-top:24px;font-size:17px;font-weight:500;line-height:1.4;letter-spacing:-.015em}
.pj-body{margin-top:40px}
.pj-body h2{font-size:22px;font-weight:600;letter-spacing:-.04em;margin-bottom:16px}
.pj-body p{font-size:15px;line-height:1.55;color:var(--ink-2);font-weight:500;margin-bottom:16px}
.pj-quote{margin:24px 0 8px;padding-left:16px;border-left:2px solid var(--accent)}
.pj-quote blockquote{font-size:22px;font-weight:500;letter-spacing:-.035em;line-height:1.2;color:#444}
.pj-quote cite{display:block;margin-top:8px;font-style:normal;font-size:12px;color:var(--ink-3)}
.pj-cta{display:inline-flex;align-items:center;gap:10px;margin-top:24px;height:48px;padding:0 22px;background:var(--accent);color:var(--on-accent);font-size:15px;font-weight:600;transition:background-color .3s,color .3s}
.pj-cta i{font-style:normal;transition:transform .5s var(--ease-out)}
.pj-cta:hover{background:var(--ink);color:#fff}.pj-cta:hover i{transform:translateX(4px)}

.pj-media{position:sticky;top:96px;align-self:start;min-width:0}
.pj-screen{position:relative;background:#111;box-shadow:0 0 0 8px var(--panel)}
.pj-track{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;aspect-ratio:4/3;max-height:calc(100vh - 250px);outline:none}
.pj-track::-webkit-scrollbar{display:none}
.pj-slide{flex:0 0 100%;scroll-snap-align:center;scroll-snap-stop:always;display:grid;place-items:center;background:#111}
.pj-slide img,.pj-slide video{width:100%;height:100%;object-fit:contain;user-select:none}
.pj-arrow{position:absolute;top:50%;width:48px;height:48px;margin-top:-24px;display:grid;place-items:center;background:var(--bg);font-size:18px;box-shadow:0 8px 20px -8px rgba(0,0,0,.4);transition:opacity .3s,background-color .3s,transform .4s var(--ease-out)}
.pj-arrow.l{left:12px}.pj-arrow.r{right:12px}
.pj-arrow:hover:not(:disabled){background:var(--accent)}
.pj-arrow.l:hover:not(:disabled){transform:translateX(-2px)}.pj-arrow.r:hover:not(:disabled){transform:translateX(2px)}
.pj-arrow:disabled{opacity:0;pointer-events:none}
.pj-bar{display:flex;justify-content:space-between;align-items:center;margin:16px 0 8px;font-size:12px;color:var(--ink-3)}
.pj-count{font-variant-numeric:tabular-nums}.pj-count b{color:var(--ink);font-weight:700}
.pj-strip{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:4px 0}
.pj-strip::-webkit-scrollbar{display:none}
.pj-strip button{flex:0 0 64px;padding:0}
.pj-strip span{display:block;position:relative;aspect-ratio:4/3;background-size:cover;background-position:center;opacity:.5;transition:opacity .3s,box-shadow .3s}
.pj-strip button:hover span{opacity:.85}
.pj-strip button[data-on] span{opacity:1;box-shadow:0 0 0 2px var(--accent)}
.pj-film{overflow:hidden;background:#111!important}
.pj-film video{width:100%;height:100%;object-fit:cover}
.pj-film b{position:absolute;inset:0;display:grid;place-items:center;color:#fff;font-size:12px}
.pj-drawing{background:#efebe3;box-shadow:0 0 0 8px var(--panel)}
.pj-drawing img{width:100%;aspect-ratio:4/3;object-fit:contain}
.pj-drawing span{display:block;padding:10px 12px;font-size:12px;color:var(--ink-3);background:var(--bg)}

.pj-more{margin-top:96px;padding:40px var(--gutter) 64px;background:var(--chip);border-top:1.5px solid var(--ink)}
.pj-more-head{display:flex;justify-content:space-between;align-items:baseline;gap:16px;max-width:1440px;margin:0 auto 24px;font-size:13px;font-weight:600;color:var(--ink-3)}
.pj-more-head a{color:var(--ink);transition:color .25s}.pj-more-head a:hover{color:var(--accent-deep)}
.pj-next{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:40px;align-items:center;max-width:1440px;margin:0 auto}
.pj-next-img{display:block;overflow:hidden;aspect-ratio:16/9;background:#ddd}
.pj-next-img img{width:100%;height:100%;object-fit:cover;transition:transform 1.1s var(--ease-out)}
.pj-next:hover .pj-next-img img{transform:scale(1.04)}
.pj-next-txt{display:flex;flex-direction:column;gap:8px}
.pj-next-txt em{font-style:normal;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--accent-deep)}
.pj-next-txt strong{font-size:clamp(36px,4.4vw,64px);font-weight:600;letter-spacing:-.045em;line-height:.95}
.pj-next-txt small{font-size:14px;color:var(--ink-2);font-weight:500}
.pj-next-go{margin-top:16px;width:56px;height:56px;display:grid;place-items:center;background:var(--accent);color:var(--on-accent);font-size:20px;transition:transform .5s var(--ease-out),background-color .3s,color .3s}
.pj-next:hover .pj-next-go{transform:translateX(8px);background:var(--ink);color:#fff}
.pj-prev{display:block;max-width:1440px;margin:32px auto 0;font-size:13px;font-weight:600;color:var(--ink-2);transition:color .25s}
.pj-prev:hover{color:var(--ink)}

@media (max-width:1023px){
  .pj-grid{grid-template-columns:1fr;gap:40px}
  .pj-media{position:relative;top:0;order:-1}
  .pj-text{max-width:640px}
  .pj-track{max-height:none}
}
@media (max-width:809px){
  .pj{padding-top:84px}
  .pj-x{top:auto;bottom:max(16px,env(safe-area-inset-bottom));right:16px;box-shadow:0 8px 24px -8px rgba(0,0,0,.35)}
  .pj-arrow{width:40px;height:40px;margin-top:-20px}
  .pj-hint{display:none}
  .pj-next{grid-template-columns:1fr;gap:20px}
  .pj-more{margin-top:64px;padding:32px var(--gutter) 48px}
  .pj-facts{grid-template-columns:1fr 1fr}
}
@media (hover:none){.pj-arrow{opacity:.92}}
`;
