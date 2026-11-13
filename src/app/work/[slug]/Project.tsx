"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Work } from "@/lib/content";
import { releaseZoom, zoomToPage } from "@/lib/zoom";
import { Fade, Lines } from "@/components/ui/Reveal";

const EASE = [0.22, 1, 0.36, 1] as const;
const FRAMES = 8;

export default function Project({ work, next }: { work: Work; next: Work }) {
  const router = useRouter();
  // slides: every photo, with the film (if any) second
  const slides: { src: string; video?: boolean }[] = work.images.map((src) => ({ src }));
  if (work.video) slides.splice(Math.min(1, slides.length), 0, { src: work.video, video: true });
  const [at, setAt] = useState(slides.length > 1 ? 0 : 2);
  useEffect(() => { releaseZoom(); }, []);
  const onVideo = slides.length > 1 && slides[at % slides.length]?.video;
  useEffect(() => {
    const id = setTimeout(() => setAt((a) => a + 1), onVideo ? 12000 : 3200);
    return () => clearTimeout(id);
  }, [at, onVideo]);
  const close = () => (window.history.length > 1 ? router.back() : router.push("/"));
  const pos = (i: number) => `${(i / (FRAMES - 1)) * 100}% ${50 + Math.sin(i) * 20}%`;
  const real = slides.length > 1; // real photo set: the strip steps through photos instead of panning one image
  const drawing = work.image.endsWith(".svg"); // placeholder elevation drawing until photos arrive
  const frames = real ? slides.length : FRAMES;
  const cur = slides[at % frames];

  return (
    <main className="pj">
      <button className="pj-x" onClick={close} aria-label="Close">
        <i /><i />
      </button>
      <div className="pj-text">
        <Lines as="h1" className="pj-title display" lines={[work.title]} />
        <Fade delay={0.15} className="pj-meta">
          <span className="pill pill-no">No. {work.no}</span> <span className="pill">{work.services}</span> for <span className="pill">{work.client}</span> in <span className="pill">{work.location}{work.year ? `, ${work.year}` : ""}</span>
        </Fade>
        <Fade delay={0.25}><p className="pj-lead">{work.blurb}</p></Fade>
        <Fade delay={0.3}><Link className="pj-link" href="/contact">Start a build like this</Link></Fade>
        <section className="pj-body">
          <Lines as="h2" lines={[work.body.heading]} />
          {work.body.paragraphs.map((p, i) => <Fade key={i} delay={0.05 * i}><p>{p}</p></Fade>)}
          {work.body.quote && (
            <Fade className="pj-quote">
              <blockquote>“{work.body.quote.text}”</blockquote>
              <cite>{work.body.quote.by}</cite>
            </Fade>
          )}
        </section>
        <div className="pj-next">
          <span className="label">Next</span>
          <Link href={`/work/${next.slug}`} className="pj-next-frame" onClick={(e) => {
            const img = (e.currentTarget as HTMLElement).querySelector("img");
            if (img) { e.preventDefault(); zoomToPage(img, `/work/${next.slug}`, router); }
          }}>
            <img src={next.image} alt="" />
            <i className="p l" /><i className="p r" /><em>{next.no}</em>
            <strong>{next.title}</strong>
          </Link>
        </div>
      </div>
      <div className="pj-media">
        <motion.div className="pj-screen" initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: EASE, delay: 0.2 }}>
          {real ? (
            <AnimatePresence initial={false}>
              <motion.div key={at % frames} className="pj-slide"
                initial={{ clipPath: "inset(0 0 0 100%)" }} animate={{ clipPath: "inset(0 0 0 0%)" }} exit={{ opacity: 1 }} transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}>
                {cur?.video ? <video src={cur.src} autoPlay muted loop playsInline /> : <img src={cur?.src} alt={work.title} />}
              </motion.div>
            </AnimatePresence>
          ) : (
            <img src={work.image} alt={work.title} data-drawing={drawing || undefined} style={drawing ? undefined : { objectPosition: pos(at % frames), transition: "object-position 2.4s cubic-bezier(.65,0,.35,1)" }} />
          )}
        </motion.div>
        <div className="pj-bar">
          <span>{real ? (cur?.video ? "Film" : `${(at % frames) + 1} of ${frames}`) : drawing ? "Set elevation, photos coming soon" : `0:${String((at % frames) * 2).padStart(2, "0")} / 0:${String(FRAMES * 2).padStart(2, "0")}`}</span>
          <span className="pj-ctrl">{work.location}</span>
        </div>
        {!drawing && <div className="pj-strip">
          {Array.from({ length: frames }).map((_, i) => (
            <button key={i} data-on={i === at % frames || undefined} onClick={() => setAt(i)}>
              {real && slides[i].video
                ? <span className="pj-film"><video src={slides[i].src} muted playsInline preload="metadata" /><b>▶</b></span>
                : <span style={real ? { backgroundImage: `url(${slides[i].src})`, backgroundSize: "cover", backgroundPosition: "center" } : { backgroundImage: `url(${work.image})`, backgroundPosition: pos(i) }} />}
              <em>{real ? (slides[i].video ? "Film" : String(i + 1).padStart(2, "0")) : `0:${String(i * 2).padStart(2, "0")}`}</em>
            </button>
          ))}
        </div>}
      </div>
      <style>{css}</style>
    </main>
  );
}

const css = `
.pj{position:relative;min-height:100vh;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:40px;padding:96px var(--gutter) 40px;background:var(--bg)}
.pj-x{position:fixed;right:24px;top:24px;width:40px;height:40px;z-index:1001;display:grid;place-items:center}
.pj-x i{position:absolute;width:16px;height:2px;background:var(--ink);transform:rotate(45deg);transition:transform .5s var(--ease-out)}
.pj-x i+i{transform:rotate(-45deg)}
.pj-x:hover i{transform:rotate(135deg)}.pj-x:hover i+i{transform:rotate(45deg)}
.pj-text{max-width:430px}
.pj-title{font-size:clamp(48px,4.6vw,66px);margin-bottom:16px}
.pj-meta{font-size:13px;color:var(--ink-2);display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.pill{display:inline-block;padding:4px 8px;background:var(--chip);color:var(--ink);font-weight:600}
.pj-lead{margin-top:22px;font-size:14px;font-weight:500;line-height:1.35}
.pj-link{position:relative;display:inline-block;margin-top:18px;padding-left:14px;font-size:13px;font-weight:600}
.pj-link::before{content:"";position:absolute;left:0;top:50%;width:6px;height:6px;margin-top:-3px;border-radius:50%;background:var(--accent)}
.pj-link::after{content:"";position:absolute;left:14px;right:0;bottom:-3px;height:1.5px;background:var(--ink);transform-origin:0 50%;transition:transform .6s var(--ease-out)}
.pj-link:hover::after{transform:scaleX(0);transform-origin:100% 50%}
.pj-body{margin-top:56px}
.pj-body h2{font-size:24px;font-weight:600;letter-spacing:-.04em;margin-bottom:14px}
.pj-body p{font-size:13px;line-height:1.4;color:var(--ink-2);font-weight:500;margin-bottom:12px}
.pj-quote{margin:26px 0 8px;padding-left:20px;border-left:1px solid var(--line)}
.pj-quote blockquote{font-size:22px;font-weight:500;letter-spacing:-.035em;line-height:1.15;color:#555}
.pj-quote cite{display:block;margin-top:10px;font-style:normal;font-size:12px;color:var(--ink-4)}
.pj-next{margin-top:80px;display:flex;flex-direction:column;align-items:center;gap:8px;padding-right:20%}
.pj-next-frame{position:relative;display:block;width:150px;margin-top:30px}
.pj-next-frame img{width:100%;aspect-ratio:4/3;object-fit:cover;box-shadow:0 0 0 5px var(--panel),0 16px 30px -10px rgba(0,0,0,.4);transition:transform .8s var(--ease-out)}
.pj-next-frame .p{position:absolute;top:calc(150px*.75 + 5px);height:46px;width:4px;background:var(--panel)}
.pj-next-frame .p.l{left:16%}.pj-next-frame .p.r{right:16%}
.pj-next-frame em{position:absolute;right:-5px;top:-5px;transform:translateY(-100%);padding:5px 6px;background:var(--accent);color:#fff;font-style:normal;font-size:11px;font-weight:700}
.pj-next-frame strong{display:block;margin-top:58px;text-align:center;font-size:13px;font-weight:600}
.pj-next-frame:hover img{transform:rotate(-2deg)}
.pj-media{position:sticky;top:96px;align-self:start}
.pj-screen{position:relative;aspect-ratio:4/3;max-height:calc(100vh - 230px);margin:0 auto;overflow:hidden;background:#111;box-shadow:0 0 0 8px var(--panel)}
.pj-screen img[data-drawing]{transform:none;object-fit:contain;background:#efebe3}
.pill-no{background:var(--accent);color:#fff}
.pj-screen img{width:100%;height:100%;object-fit:cover;transform:scale(1.25)}
.pj-bar{display:flex;justify-content:space-between;margin:10px auto 8px;font-size:11px;color:var(--ink-3);max-width:100%}
.pj-ctrl b{font-weight:400;margin-left:12px}
.pj-strip{display:grid;grid-template-columns:repeat(auto-fill,minmax(52px,1fr));gap:6px 4px}
.pj-slide{position:absolute;inset:0;background:#111}
.pj-slide img,.pj-slide video{width:100%;height:100%;object-fit:contain;transform:none!important}
.pj-film{overflow:hidden;background:#111!important}
.pj-film video{width:100%;height:100%;object-fit:cover}
.pj-film b{position:absolute;inset:0;display:grid;place-items:center;color:#fff;font-size:12px}
.pj-strip button{display:flex;flex-direction:column;gap:4px;font-size:10px;color:var(--ink-4);align-items:center}
.pj-strip span{display:block;width:100%;aspect-ratio:3/4;background-size:400%;filter:grayscale(1) brightness(1.1);opacity:.6;transition:filter .5s,opacity .5s,transform .5s var(--ease-out);position:relative}
.pj-strip button:hover span{opacity:1}
.pj-strip button[data-on] span{filter:none;opacity:1;transform:translateY(-4px)}
.pj-strip button[data-on] em{color:var(--ink)}
.pj-strip em{font-style:normal}
@media (max-width:900px){.pj{grid-template-columns:1fr}.pj-media{position:relative;top:0;order:-1}.pj-screen{aspect-ratio:4/3}}
`;
