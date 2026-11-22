"use client";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { site } from "@/lib/content";
import Roll from "./Roll";
import { Lines } from "./ui/Reveal";

export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const lift = useTransform(scrollYProgress, [0.3, 1], ["38%", "0%"]);
  const tilt = useTransform(scrollYProgress, [0.3, 1], [28, 0]);
  return (
    <footer className="ft" ref={ref}>
      <div className="ft-top wrap">
        <Lines as="h2" className="ft-h display" lines={["Tell us what", "you’re making."]} />
        <div className="ft-side">
          <div className="ft-chips">
            <Link href={site.bookCallHref} className="chip-hang roll-host"><Roll>Book a call</Roll><span className="arr">→</span></Link>
            <a href={`mailto:${site.email}`} className="chip-hang roll-host"><Roll>{site.email}</Roll><span className="arr">→</span></a>
          </div>
          <nav className="ft-nav">
            {site.nav.map((n) => (
              <Link key={n.href} href={n.href} className="roll-host"><Roll>{n.label}</Roll></Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="ft-stage" aria-hidden>
        <div className="ft-clip">
        <motion.div className="ft-word" style={{ y: lift, rotateX: tilt }}>
          {site.wordmark.split("").map((c, i) => (
            <motion.span key={i} initial={{ y: "40%", opacity: 0 }} whileInView={{ y: "0%", opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}>
              {c === " " ? "\u00a0" : c}
            </motion.span>
          ))}
        </motion.div>
        </div>
        <div className="ft-floor" />
      </div>
      <div className="ft-bot wrap">
        <div className="ft-soc">
          {site.socials.slice(0, 3).map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="roll-host"><Roll>{s.label}</Roll></a>
          ))}
        </div>
        <div className="ft-legal">
          <span>© {site.name}</span>
        </div>
      </div>
      <style>{css}</style>
    </footer>
  );
}

const css = `
.ft{padding-top:160px;overflow:hidden}
.ft-top{display:flex;justify-content:space-between;align-items:flex-end;gap:40px}
.ft-h{font-size:clamp(44px,5vw,70px)}
.ft-side{display:flex;flex-direction:column;align-items:flex-end;gap:28px;padding-bottom:8px}
.ft-chips{display:flex;gap:10px}
.chip-hang{position:relative;display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 13px;background:var(--chip);font-size:14px;font-weight:500;transition:background .4s}
.chip-hang::before,.chip-hang::after{content:"";position:absolute;top:-3px;width:22px;height:3px;background:#2a2a2a;border-radius:2px 2px 0 0;transform-origin:50% 100%;transition:transform .5s var(--ease-out)}
.chip-hang::before{left:12px}.chip-hang::after{right:12px}
.chip-hang:hover{background:#e9e4e4}
.chip-hang:hover::before{transform:rotate(-8deg)}.chip-hang:hover::after{transform:rotate(8deg)}
.chip-hang .arr{transition:transform .5s var(--ease-out)}
.chip-hang:hover .arr{transform:translateX(3px)}
.ft-nav{display:flex;gap:22px;font-size:14px;font-weight:500}
.ft-stage{position:relative;margin-top:120px;perspective:900px;perspective-origin:50% 0%}
.ft-clip{overflow:hidden;padding-top:.1em;perspective:900px;perspective-origin:50% 0}
.ft-word{display:flex;justify-content:center;white-space:pre;padding:0 var(--gutter);font-size:12.4vw;font-weight:600;letter-spacing:-.06em;line-height:.76;color:#e6e6e6;transform-origin:50% 100%;user-select:none}
.ft-word span{display:block}
.ft-floor{height:60px;background:linear-gradient(#f4f3f1,transparent);border-top:1px solid #ecebe8;box-shadow:0 -10px 40px -10px rgba(0,0,0,.06) inset;margin-top:-2px;-webkit-mask:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);mask:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}
.ft-bot{display:flex;justify-content:space-between;align-items:center;padding-top:28px;padding-bottom:28px;font-size:14px;font-weight:500}
.ft-soc{display:flex;gap:22px}
.ft-legal{display:flex;gap:22px}
@media (max-width:809px){.ft-top{flex-direction:column;align-items:flex-start}.ft-side{align-items:flex-start}.ft-bot{flex-direction:column;align-items:flex-start;gap:12px}.ft-legal{flex-direction:column;gap:4px}}
`;
