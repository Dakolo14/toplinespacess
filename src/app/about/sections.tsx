"use client";
import { type CSSProperties, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform, useMotionValueEvent } from "framer-motion";
import { about, works } from "@/lib/content";
import { Fade, Lines } from "@/components/ui/Reveal";
import "./about.css";

const EASE = [0.22, 1, 0.36, 1] as const;

function Head({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="ab-head">
      <Fade className="ab-kick">{kicker}</Fade>
      <Lines as="h2" className="ab-title" lines={[title]} />
    </div>
  );
}

/* 1. Words hanging on strings, swaying with the pointer */
const SPOTS = [
  { x: 6, y: 0 }, { x: 35, y: 0 }, { x: 65, y: 0 },
  { x: 18, y: 1 }, { x: 52, y: 1 }, { x: 84, y: 1 },
];
export function Hanging() {
  return (
    <section className="ab-hang">
      {about.hangingWords.map((w, i) => <Tag key={w} word={w} i={i} />)}
      <div className="ab-intro"><Fade delay={0.9}><p>{about.intro}</p></Fade></div>
    </section>
  );
}
function Tag({ word, i }: { word: string; i: number }) {
  const s = SPOTS[i % SPOTS.length];
  const rot = useMotionValue(0);
  const spring = useSpring(rot, { stiffness: 60, damping: 6, mass: 1 });
  const last = useRef<number | null>(null);
  return (
    <motion.div
      className="ab-tag"
      style={{ left: `${s.x}%`, rotate: spring }}
      initial={{ y: "-120%" }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 70, damping: 9, delay: 0.15 + i * 0.09 }}
      onPointerMove={(e) => {
        if (last.current !== null) rot.set(Math.max(-14, Math.min(14, (e.clientX - last.current) * 1.4)));
        last.current = e.clientX;
      }}
      onPointerLeave={() => { last.current = null; rot.set(0); }}
    >
      <i className="ab-string" style={{ height: s.y ? 300 : 120 }} />
      <span className="ab-card" style={{ marginTop: s.y ? 300 : 120 }}>{word}</span>
    </motion.div>
  );
}

/* 2. Expertise: pinned list that rolls through each service as you scroll */
export function Expertise() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const n = about.expertise.length;
  const [at, setAt] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => setAt(Math.min(n - 1, Math.max(0, Math.floor(v * n * 0.999)))));
  const e = about.expertise[at];
  return (
    <section className="ab-exp" ref={ref} style={{ height: `${n * 70 + 60}vh` }}>
      <div className="ab-exp-pin wrap">
        <Head kicker="What we bring to the table" title="Expertise" />
        <div className="ab-exp-body">
          <div className="ab-exp-list">
            {about.expertise.map((x, i) => {
              const d = i - at;
              return (
                <motion.div key={x.title} className="ab-exp-item"
                  animate={{ y: d * 54 + (d > 0 ? 6 : 0), opacity: d < 0 ? 0 : Math.max(0, 1 - d * 0.42), scale: d === 0 ? 1 : 0.86 - Math.abs(d) * 0.04, rotateX: d < 0 ? 70 : d * -18, filter: d === 0 ? "blur(0px)" : `blur(${Math.min(3, Math.abs(d))}px)` }}
                  transition={{ duration: 0.8, ease: EASE }}>
                  <sup>{String(i + 1).padStart(2, "0")}</sup>{x.title}
                </motion.div>
              );
            })}
          </div>
          <div className="ab-exp-detail">
            <AnimatePresence mode="wait">
              <motion.div key={at} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.5, ease: EASE }}>
                <div className="ab-exp-num">{String(at + 1).padStart(2, "0")}</div>
                <p className="ab-exp-text">{e.text}</p>
                <p className="ab-exp-tags">{e.tags}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <div className="ab-exp-bars">
          {about.expertise.map((_, i) => (
            <span key={i}><motion.i animate={{ scaleX: i <= at ? 1 : 0 }} transition={{ duration: 0.7, ease: EASE }} /></span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 3. Approach: the old habit gets struck through, the new one rises in */
export function Approach() {
  return (
    <section className="ab-sec wrap">
      <Head kicker="How we think" title="Our approach" />
      <div className="ab-appr">
        {about.approach.map((a, i) => (
          <motion.div key={a.now} className="ab-appr-row" initial="h" whileInView="v" viewport={{ once: true, margin: "-20% 0px" }}>
            <span className="ab-old">
              {a.old}
              <motion.i variants={{ h: { scaleX: 0 }, v: { scaleX: 1, transition: { duration: 0.7, ease: EASE, delay: 0.2 + i * 0.05 } } }} />
            </span>
            <motion.div variants={{ h: { opacity: 0, x: -12 }, v: { opacity: 1, x: 0, transition: { duration: 0.8, ease: EASE, delay: 0.6 } } }}>
              <strong>{a.now}</strong>
              <p>{a.text}</p>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* 4. Testimonials: card with tabbed client marks */
export function Testimonials() {
  const [at, setAt] = useState(0);
  const n = about.testimonials.length;
  useEffect(() => {
    const id = setInterval(() => setAt((a) => (a + 1) % n), 7000);
    return () => clearInterval(id);
  }, [at, n]);
  const t = about.testimonials[at];
  return (
    <section className="ab-sec wrap">
      <Head kicker="What clients say" title="In their words" />
      <Fade className="ab-tst">
        <div className="ab-tst-photo">
          <AnimatePresence mode="popLayout">
            <motion.img key={at} src={about.team[at % about.team.length].img} alt="" initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: EASE }} />
          </AnimatePresence>
        </div>
        <div className="ab-tst-main">
          <AnimatePresence mode="wait">
            <motion.div key={at} className="ab-tst-q" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.6, ease: EASE }}>
              <span className="ab-logo">✦ {t.logo}</span>
              <blockquote>“{t.quote}”</blockquote>
            </motion.div>
          </AnimatePresence>
          <div className="ab-tst-foot">
            <span><b>{t.name}</b> {t.role}</span>
            <span className="ab-arrows">
              <button aria-label="Previous" onClick={() => setAt((at - 1 + n) % n)}>←</button>
              <button aria-label="Next" onClick={() => setAt((at + 1) % n)}>→</button>
            </span>
          </div>
        </div>
        <div className="ab-tst-tabs">
          {about.testimonials.map((x, i) => (
            <button key={i} data-on={i === at || undefined} onClick={() => setAt(i)}>
              {i === at && <motion.i layoutId="tst-bar" className="bar" key={`b${at}`} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 7, ease: "linear" }} />}
              ✦ {x.logo}
            </button>
          ))}
        </div>
      </Fade>
    </section>
  );
}

/* 5. Clients as books on a shelf */
export function Clients() {
  return (
    <section className="ab-sec wrap">
      <Head kicker="Brands we have made things for" title="Worked with" />
      <div className="ab-shelf">
        {about.clients.map((c, i) => (
          <motion.div key={i} className="ab-book" style={{ "--h": c.h, background: c.tone } as CSSProperties}
            initial={{ y: 60, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 120, damping: 14, delay: i * 0.06 }}
            whileHover={{ y: -18, rotate: i % 2 ? 2 : -2 }}>
            <span className="yr">{c.year}</span>
            <span className="nm">{c.name}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* 6. Story: odometer year + scrubbable timeline */
function Digit({ d }: { d: number }) {
  return (
    <span className="odo">
      <motion.span animate={{ y: `${-d * 10}%` }} transition={{ duration: 1.1, ease: [0.65, 0, 0.35, 1] }}>
        {Array.from({ length: 10 }).map((_, i) => <span key={i}>{i}</span>)}
      </motion.span>
    </span>
  );
}
export function Story() {
  const [at, setAt] = useState(0);
  const s = about.story[at];
  const min = about.story[0].year, max = about.story[about.story.length - 1].year + 1;
  const pct = (y: number) => ((y - min) / (max - min)) * 100;
  return (
    <section className="ab-sec wrap">
      <Head kicker="How the studio grew" title={`Our story since ${min}`} />
      <div className="ab-story">
        <div className="ab-year">{String(s.year).split("").map((c, i) => <Digit key={i} d={Number(c)} />)}</div>
        <AnimatePresence mode="wait">
          <motion.div key={at} className="ab-story-txt" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.5, ease: EASE }}>
            <h3>{s.title}</h3>
            <span>{s.year}, {s.where}</span>
            <p>{s.text}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="ab-tl">
        <div className="ab-tl-axis">
          {about.story.map((x, i) => (
            <button key={i} className="ab-tl-ev" style={{ left: `${pct(x.year)}%` }} onClick={() => setAt(i)} data-on={i === at || undefined}>
              <em>{x.title}</em>
            </button>
          ))}
          {Array.from({ length: (max - min) * 4 + 1 }).map((_, i) => <i key={i} className="tick" style={{ left: `${(i / ((max - min) * 4)) * 100}%`, height: i % 4 ? 6 : 12 }} />)}
          {Array.from({ length: max - min + 1 }).map((_, i) => <b key={i} style={{ left: `${(i / (max - min)) * 100}%` }}>{min + i}</b>)}
          <motion.div className="ab-tl-mark" animate={{ left: `${pct(s.year)}%` }} transition={{ duration: 1, ease: [0.65, 0, 0.35, 1] }} />
        </div>
        <div className="ab-tl-btns">
          <button disabled={at === 0} onClick={() => setAt(at - 1)}>Earlier</button>
          <button disabled={at === about.story.length - 1} onClick={() => setAt(at + 1)}>Later</button>
        </div>
      </div>
    </section>
  );
}

/* 7. Team frames hanging from hooks */
export function Bench() {
  return (
    <section className="ab-sec wrap ab-bench">
      <Fade className="ab-bench-intro"><p>{about.benchIntro}</p></Fade>
      <div className="ab-bench-row">
        <Lines as="h2" className="ab-title" lines={["At the bench"]} />
        <div className="ab-team">
          {about.team.map((m, i) => (
            <motion.figure key={i} className="ab-member" initial={{ y: -40, opacity: 0, rotate: -3 }} whileInView={{ y: 0, opacity: 1, rotate: 0 }}
              viewport={{ once: true }} transition={{ type: "spring", stiffness: 60, damping: 8, delay: i * 0.12 }} whileHover={{ rotate: i % 2 ? 1.6 : -1.6 }}>
              <span className="hook" />
              <div className="pic"><img src={m.img} alt={m.name} /></div>
              <figcaption>
                <b>{m.name}</b>
                <span>{m.role}</span>
                <span className="lnk">{m.links.map((l) => <a key={l} href="#">{l}</a>)}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 8. Awards: pointing at a row floats the work it was for */
export function Awards() {
  const [hover, setHover] = useState(-1);
  const x = useMotionValue(0), y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 30 }), sy = useSpring(y, { stiffness: 300, damping: 30 });
  const half = useRef(0);
  useEffect(() => { half.current = window.innerWidth / 2; }, []);
  const rot = useTransform(sx, (v) => (half.current ? Math.max(-8, Math.min(8, (v - half.current) / 60)) : 0));
  return (
    <section className="ab-sec wrap ab-split" onPointerMove={(e) => { x.set(e.clientX); y.set(e.clientY); }}>
      <div><Fade className="ab-kick">Point at a prize to see the work it was for.</Fade><Lines as="h2" className="ab-title" lines={["Awards"]} /></div>
      <ul className="ab-awards" onPointerLeave={() => setHover(-1)}>
        {about.awards.map((a, i) => (
          <Fade key={i} delay={i * 0.04}>
            <li onPointerEnter={() => setHover(i)} data-dim={hover >= 0 && hover !== i ? "" : undefined}>
              <span>{a.name}</span>
              <span className="meta">{a.level}{a.gold && <i className="gold" />} <b>{a.year}</b></span>
            </li>
          </Fade>
        ))}
      </ul>
      <motion.div className="ab-float" style={{ x: sx, y: sy, rotate: rot }}>
        <AnimatePresence>
          {hover >= 0 && (
            <motion.img key={hover} src={works[about.awards[hover].work].image} alt="" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.35, ease: EASE }} />
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

/* 9. FAQ: questions left, answer swaps in on the right */
export function Faq() {
  const [at, setAt] = useState(0);
  return (
    <section className="ab-sec wrap ab-split">
      <div><Fade className="ab-kick">What people ask before they write</Fade><Lines as="h2" className="ab-title" lines={["Frequently asked questions"]} /></div>
      <div className="ab-faq">
        {about.faq.map((f, i) => (
          <button key={i} className="ab-faq-row" data-on={i === at || undefined} onClick={() => setAt(i)} onPointerEnter={() => setAt(i)}>
            <span className="q">{f.q}</span>
            <span className="a">
              <AnimatePresence mode="wait" initial={false}>
                {i === at ? (
                  <motion.span key="a" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}>{f.a}</motion.span>
                ) : (
                  <motion.span key="d" className="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>—</motion.span>
                )}
              </AnimatePresence>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
