"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { categories, site, works, worksIn } from "@/lib/content";
import Roll from "./Roll";
import Logo from "./Logo";
import { NavIcon, type IconName } from "./NavIcon";

const EASE_IO = [0.65, 0, 0.35, 1] as const;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const LINKS: { label: string; href: string; icon: IconName }[] = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Work", href: "/work", icon: "work" },
  { label: "About", href: "/about", icon: "about" },
  { label: "Journal", href: "/journal", icon: "journal" },
  { label: "Contact", href: "/contact", icon: "contact" },
];

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState(false);
  const [peek, setPeek] = useState<string>(categories[0].slug);
  const path = usePathname();
  const closeT = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setOpen(false); setDrop(false); }, [path]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setDrop(false); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  // lock the page behind the full-screen menu
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [open]);

  // the Work menu stays open while the pointer travels from the link into the panel
  const showDrop = () => { if (closeT.current) clearTimeout(closeT.current); setDrop(true); };
  const hideDrop = () => { if (closeT.current) clearTimeout(closeT.current); closeT.current = setTimeout(() => setDrop(false), 180); };
  const peekWork = worksIn(peek)[0];
  if (path.startsWith("/keystatic")) return null; // the admin has its own chrome

  return (
    <>
      <header className="nav" data-open={open || undefined}>
        <Link href="/" className="nav-logo" aria-label={`${site.name} home`}>
          <Logo />
        </Link>

        <nav className="nav-links" aria-label="Main">
          {LINKS.map((l) =>
            l.href === "/work" ? (
              <div key={l.href} className="nav-item" onPointerEnter={showDrop} onPointerLeave={hideDrop}>
                <Link href={l.href} className="nav-link roll-host" data-on={isActive(path, l.href) || undefined}
                  aria-haspopup="true" aria-expanded={drop} onFocus={showDrop}>
                  <NavIcon name={l.icon} /><Roll>{l.label}</Roll>
                  <svg className="nav-caret" viewBox="0 0 10 6" aria-hidden><path d="M1 1l4 4 4-4" /></svg>
                </Link>
                <AnimatePresence>
                  {drop && (
                    <motion.div className="nav-drop" onPointerEnter={showDrop} onPointerLeave={hideDrop}
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.28, ease: EASE_OUT }}>
                      <ul>
                        <li>
                          <Link href="/work" className="nav-cat" onPointerEnter={() => setPeek(categories[0].slug)} onClick={() => setDrop(false)}>
                            <span>All projects</span><sup>{works.length}</sup>
                          </Link>
                        </li>
                        {categories.map((c) => (
                          <li key={c.slug}>
                            <Link href={`/work/category/${c.slug}`} className="nav-cat" data-on={peek === c.slug || undefined}
                              onPointerEnter={() => setPeek(c.slug)} onFocus={() => setPeek(c.slug)} onClick={() => setDrop(false)}>
                              <span>{c.label}</span><sup>{worksIn(c.slug).length}</sup>
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link href={`/work/category/${peek}`} className="nav-peek" onClick={() => setDrop(false)} tabIndex={-1}>
                        <AnimatePresence mode="popLayout" initial={false}>
                          {peekWork && (
                            <motion.img key={peekWork.slug} src={peekWork.thumb} alt=""
                              initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                              transition={{ duration: 0.4, ease: EASE_OUT }} />
                          )}
                        </AnimatePresence>
                        <em>{peekWork?.title}</em>
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link key={l.href} href={l.href} className="nav-link roll-host" data-on={isActive(path, l.href) || undefined}>
                <NavIcon name={l.icon} /><Roll>{l.label}</Roll>
              </Link>
            ),
          )}
        </nav>

        <div className="nav-end">
          <LagosTime />
          <Link href={site.bookCallHref} className="nav-cta roll-host"><Roll>Start a build</Roll></Link>
          <button className="nav-burger" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <i />
            <i />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="menu"
            initial={{ y: "-100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%", transition: { duration: 0.65, ease: EASE_IO, delay: 0.1 } }}
            transition={{ duration: 0.75, ease: EASE_IO }}
          >
            <motion.div className="menu-bulge" initial={{ scaleY: 1 }} animate={{ scaleY: 0 }}
              exit={{ scaleY: 1, transition: { duration: 0.65, ease: EASE_IO, delay: 0.1 } }} transition={{ duration: 0.8, ease: EASE_IO }} />
            <div className="menu-scroll">
              <nav className="menu-links" aria-label="Menu">
                {LINKS.map((n, i) => (
                  <span className="ln" key={n.href}>
                    <motion.span
                      initial={{ y: "110%" }}
                      animate={{ y: "0%", transition: { duration: 0.8, ease: EASE_OUT, delay: 0.3 + i * 0.05 } }}
                      exit={{ y: "-110%", transition: { duration: 0.4, ease: [0.55, 0, 0.45, 1], delay: i * 0.025 } }}
                    >
                      <Link href={n.href} className="roll-host menu-link" data-active={isActive(path, n.href) || undefined}>
                        <NavIcon name={n.icon} big /><Roll>{n.label}</Roll>
                      </Link>
                    </motion.span>
                  </span>
                ))}
              </nav>
              <motion.div className="menu-cats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.55, duration: 0.6, ease: EASE_OUT } }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
                <span className="menu-cats-h">Browse by category</span>
                <div>
                  {categories.map((c) => (
                    <Link key={c.slug} href={`/work/category/${c.slug}`} data-on={path === `/work/category/${c.slug}` || undefined}>
                      {c.label}<sup>{worksIn(c.slug).length}</sup>
                    </Link>
                  ))}
                </div>
              </motion.div>
              <motion.div className="menu-meta" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.6, duration: 0.6 } }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
                <a href={`mailto:${site.email}`}>{site.email}</a>
                <div className="menu-socials">
                  {site.socials.map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="roll-host"><Roll>{s.label}</Roll></a>
                  ))}
                </div>
              </motion.div>
            </div>
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
      <i />{site.city} <b suppressHydrationWarning>{t || "--:--"}</b>
    </span>
  );
}

const css = `
.nav{position:fixed;z-index:1000;top:14px;left:50%;transform:translateX(-50%);width:min(1180px,calc(100% - 28px));height:56px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 10px 0 20px;background:color-mix(in srgb,var(--bg) 92%,transparent);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:inset 0 0 0 1px var(--line);transition:background .5s var(--ease-io),box-shadow .5s var(--ease-io)}
.nav[data-open]{background:var(--menu);box-shadow:inset 0 0 0 1px transparent}
.nav-logo{flex:none;font-size:21px;font-weight:600;letter-spacing:-.06em;line-height:1}

.nav-links{display:flex;align-items:center;gap:2px;height:100%}
.nav-item{position:relative;height:100%;display:flex;align-items:center}
.nav-link{position:relative;display:inline-flex;align-items:center;gap:7px;height:40px;padding:0 12px;font-size:14px;font-weight:600;color:var(--ink-2);border-radius:999px;transition:color .3s,background-color .3s}
.nav-link:hover,.nav-link:focus-visible,.nav-item:hover>.nav-link{color:var(--ink);background:var(--chip)}
.nav-link[data-on]{color:var(--ink)}
.nav-link[data-on]::after{content:"";position:absolute;left:50%;bottom:3px;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:var(--accent)}
.nav-link:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.nav-caret{width:9px;height:6px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;transition:transform .4s var(--ease-out)}
.nav-item:hover .nav-caret,.nav-link[aria-expanded=true] .nav-caret{transform:rotate(180deg)}

.nav-drop{position:absolute;top:calc(100% - 4px);left:50%;margin-left:-250px;width:500px;display:grid;grid-template-columns:1fr 200px;gap:10px;padding:10px;background:var(--bg);box-shadow:0 0 0 1px var(--line),0 24px 50px -20px rgba(0,0,0,.25)}
.nav-drop ul{list-style:none;display:flex;flex-direction:column}
.nav-cat{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:10px 12px;font-size:15px;font-weight:600;letter-spacing:-.02em;color:var(--ink-2);transition:color .25s,background-color .25s,padding .35s var(--ease-out)}
.nav-cat sup{font-size:11px;color:var(--ink-4);font-weight:600}
.nav-cat:hover,.nav-cat[data-on],.nav-cat:focus-visible{color:var(--ink);background:var(--chip);padding-left:18px;outline:none}
.nav-cat:hover sup,.nav-cat[data-on] sup{color:var(--accent-deep)}
.nav-peek{position:relative;display:block;overflow:hidden;background:var(--panel);min-height:220px}
.nav-peek img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.nav-peek em{position:absolute;left:0;bottom:0;padding:6px 9px;background:var(--accent);color:var(--on-accent);font-style:normal;font-size:12px;font-weight:700}

.nav-end{flex:none;display:flex;align-items:center;gap:14px}
.nav-time{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:500;color:var(--ink-3);white-space:nowrap}
.nav-time b{color:var(--ink);font-weight:600;font-variant-numeric:tabular-nums}
.nav-time i{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:nav-pulse 2.4s ease-in-out infinite}
@keyframes nav-pulse{50%{opacity:.25}}
.nav-cta{display:inline-flex;align-items:center;height:40px;padding:0 18px;background:var(--accent);color:var(--on-accent);font-size:14px;font-weight:600;transition:background-color .3s,color .3s}
.nav-cta:hover,.nav-cta:focus-visible{background:var(--ink);color:#fff;outline:none}

.nav-burger{display:none;width:44px;height:44px;place-items:center;position:relative}
.nav-burger i{position:absolute;left:14px;width:16px;height:2px;background:var(--ink);transition:transform .5s var(--ease-out)}
.nav-burger i:first-child{transform:translateY(-3.5px)}
.nav-burger i:last-child{transform:translateY(3.5px)}
.nav-burger:hover i:first-child{transform:translateY(-4.5px)}
.nav-burger:hover i:last-child{transform:translateY(4.5px)}
.nav[data-open] .nav-burger i:first-child{transform:rotate(45deg)}
.nav[data-open] .nav-burger i:last-child{transform:rotate(-45deg)}

/* icons: each one moves in its own way on hover */
.ni{flex:none;width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;overflow:visible}
.ni *{transition:transform .5s cubic-bezier(.34,1.56,.64,1),stroke-dashoffset .6s var(--ease-out);transform-box:fill-box;transform-origin:center}
.ni-big{width:.62em;height:.62em;stroke-width:1.4}
.roll-host:hover .ni-home .roof,.roll-host:focus-visible .ni-home .roof{transform:translateY(-2.5px)}
.roll-host:hover .ni-home .door,.roll-host:focus-visible .ni-home .door{transform:scaleY(.4);transform-origin:50% 100%}
.roll-host:hover .ni-work .a,.roll-host:focus-visible .ni-work .a{transform:translate(-1.5px,-1.5px)}
.roll-host:hover .ni-work .b,.roll-host:focus-visible .ni-work .b{transform:translate(1.5px,-1.5px)}
.roll-host:hover .ni-work .c,.roll-host:focus-visible .ni-work .c{transform:translate(-1.5px,1.5px)}
.roll-host:hover .ni-work .d,.roll-host:focus-visible .ni-work .d{transform:translate(1.5px,1.5px) rotate(45deg)}
.roll-host:hover .ni-about .head,.roll-host:focus-visible .ni-about .head{transform:translateY(-1.5px) rotate(-12deg)}
.roll-host:hover .ni-about .body,.roll-host:focus-visible .ni-about .body{transform:scaleX(1.12)}
.roll-host:hover .ni-journal .page,.roll-host:focus-visible .ni-journal .page{transform:skewY(-8deg) translateY(-1px)}
.roll-host:hover .ni-journal .lines,.roll-host:focus-visible .ni-journal .lines{stroke-dashoffset:0}
.ni-journal .lines{stroke-dasharray:8;stroke-dashoffset:8}
.roll-host:hover .ni-contact .flap,.roll-host:focus-visible .ni-contact .flap{transform:translateY(-2px) scaleY(-1)}
.roll-host:hover .ni-contact .env,.roll-host:focus-visible .ni-contact .env{transform:rotate(-6deg)}

/* full-screen menu (tablets and phones) */
.menu{position:fixed;inset:0;z-index:999;background:var(--menu)}
.menu-bulge{position:absolute;left:-10%;right:-10%;top:100%;height:22vh;background:var(--menu);border-radius:0 0 50% 50%/0 0 100% 100%;transform-origin:50% 0}
.menu-scroll{position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;display:flex;flex-direction:column;gap:36px;padding:110px max(20px,env(safe-area-inset-left)) max(28px,env(safe-area-inset-bottom))}
.menu-links{display:flex;flex-direction:column;font-size:clamp(44px,9vw,76px);font-weight:600;letter-spacing:-.045em;line-height:.98}
.menu-link{display:inline-flex;align-items:center;gap:.22em;padding:.04em 0}
.menu-link[data-active]{color:var(--accent-deep)}
.menu-links .roll>span{padding-bottom:.04em}
.menu-cats-h{display:block;margin-bottom:12px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-3)}
.menu-cats>div{display:flex;flex-wrap:wrap;gap:8px}
.menu-cats a{display:inline-flex;align-items:baseline;gap:4px;min-height:44px;padding:12px 16px;background:var(--bg);font-size:15px;font-weight:600;box-shadow:inset 0 0 0 1px var(--line);transition:background-color .25s,color .25s}
.menu-cats a sup{font-size:10px;color:var(--ink-3)}
.menu-cats a:hover,.menu-cats a[data-on]{background:var(--accent);color:var(--on-accent)}
.menu-cats a:hover sup,.menu-cats a[data-on] sup{color:var(--on-accent)}
.menu-meta{margin-top:auto;display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;font-size:14px;color:var(--ink-2)}
.menu-socials{display:flex;gap:16px;color:var(--ink)}

@media (max-width:1180px){.nav-time{display:none}}
@media (max-width:1023px){
  .nav-links,.nav-cta{display:none}
  .nav-burger{display:grid}
  .nav{width:min(720px,calc(100% - 24px));padding:0 6px 0 18px}
}
@media (max-width:420px){.nav{top:10px;height:52px}}
`;
