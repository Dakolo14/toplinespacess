"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { site } from "@/lib/content";
import Roll from "./Roll";
import Logo from "./Logo";

const EASE_IO = [0.65, 0, 0.35, 1] as const;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export default function Nav() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  return (
    <>
      <header className="nav" data-open={open || undefined}>
        <Link href="/" className="nav-logo" aria-label={`${site.name} home`}>
          <Logo />
        </Link>
        <LagosTime />
        <button className="nav-burger" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <i />
          <i />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="menu"
            initial={{ y: "-100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%", transition: { duration: 0.75, ease: EASE_IO, delay: 0.15 } }}
            transition={{ duration: 0.85, ease: EASE_IO }}
          >
            {/* curved leading edge that flattens as the panel lands */}
            <motion.div
              className="menu-bulge"
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0 }}
              exit={{ scaleY: 1, transition: { duration: 0.75, ease: EASE_IO, delay: 0.15 } }}
              transition={{ duration: 0.9, ease: EASE_IO }}
            />
            <motion.div className="menu-meta menu-tl" {...fade(0.45)}>
              {site.name}
              {site.addressLines.map((l) => (
                <div key={l}>{l}</div>
              ))}
            </motion.div>
            <motion.div className="menu-meta menu-tr" {...fade(0.5)}>
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <div>{site.hours}</div>
            </motion.div>
            <nav className="menu-links">
              {site.nav.map((n, i) => (
                <span className="ln" key={n.href}>
                  <motion.span
                    initial={{ y: "110%" }}
                    animate={{ y: "0%", transition: { duration: 0.9, ease: EASE_OUT, delay: 0.35 + i * 0.06 } }}
                    exit={{ y: "-110%", transition: { duration: 0.45, ease: [0.55, 0, 0.45, 1], delay: i * 0.03 } }}
                  >
                    <Link href={n.href} className="roll-host" data-active={path.startsWith(n.href) || undefined}>
                      <Roll>{n.label}</Roll>
                    </Link>
                  </motion.span>
                </span>
              ))}
            </nav>
            <motion.div className="menu-meta menu-bl" {...fade(0.6)}>
              {site.socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="roll-host">
                  <Roll>{s.label}</Roll>
                </a>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{css}</style>
    </>
  );
}

// Small live clock: the studio's time in Lagos (WAT).
function LagosTime() {
  const [t, setT] = useState("");
  useEffect(() => {
    const f = () => setT(new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: site.timeZone }).format(new Date()));
    f();
    const id = setInterval(f, 15000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="nav-time" aria-label={`Time in ${site.city}`}>
      <i />{site.city} <b suppressHydrationWarning>{t || "--:--"}</b> WAT
    </span>
  );
}

function fade(delay: number) {
  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT, delay } },
    exit: { opacity: 0, transition: { duration: 0.25 } },
  };
}

const css = `
.nav{position:fixed;z-index:1000;top:16px;left:50%;transform:translateX(-50%);width:min(720px,calc(100% - 32px));height:54px;display:flex;align-items:center;justify-content:space-between;padding:0 18px 0 19px;background:var(--bg);box-shadow:inset 0 0 0 1px var(--line);transition:background .5s var(--ease-io),box-shadow .5s var(--ease-io)}
.nav[data-open]{background:#e4e0e0;box-shadow:inset 0 0 0 1px transparent}
.nav-logo{font-size:22px;font-weight:600;letter-spacing:-.06em;line-height:1}
.nav-time{position:absolute;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500;color:var(--ink-3);white-space:nowrap}
.nav-time b{color:var(--ink);font-weight:600;font-variant-numeric:tabular-nums}
.nav-time i{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:nav-pulse 2.4s ease-in-out infinite}
@keyframes nav-pulse{50%{opacity:.25}}
@media (max-width:420px){.nav-time{display:none}}
.nav-burger{width:36px;height:36px;display:grid;place-items:center;position:relative;margin-right:-8px}
.nav-burger i{position:absolute;left:10px;width:16px;height:2px;background:var(--ink);transition:transform .5s var(--ease-out)}
.nav-burger i:first-child{transform:translateY(-3.5px)}
.nav-burger i:last-child{transform:translateY(3.5px)}
.nav-burger:hover i:first-child{transform:translateY(-4.5px)}
.nav-burger:hover i:last-child{transform:translateY(4.5px)}
.nav[data-open] .nav-burger i:first-child{transform:rotate(45deg)}
.nav[data-open] .nav-burger i:last-child{transform:rotate(-45deg)}
.menu{position:fixed;inset:0;z-index:999;background:var(--menu);display:grid;place-items:center}
.menu-bulge{position:absolute;left:-10%;right:-10%;top:100%;height:22vh;background:var(--menu);border-radius:0 0 50% 50%/0 0 100% 100%;transform-origin:50% 0}
.menu-links{display:flex;flex-direction:column;align-items:center;font-size:clamp(48px,4.9vw,70px);font-weight:600;letter-spacing:-.045em;line-height:.92}
.menu-links a{display:block}
.menu-links .roll>span{padding-bottom:.04em}
.menu-meta{position:absolute;font-size:13px;line-height:1.3;color:var(--ink-2)}
.menu-tl{left:20px;top:96px}
.menu-tr{right:20px;top:96px;text-align:right}
.menu-tr a{color:var(--ink)}
.menu-bl{left:20px;bottom:20px;display:flex;gap:16px;color:var(--ink)}
@media (max-width:809px){.menu-tl,.menu-tr{top:86px}.menu-tr{display:none}}
`;
