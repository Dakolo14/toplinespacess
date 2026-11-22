"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { categories, site, works, worksIn } from "@/lib/content";
import Roll from "./Roll";
import Logo from "./Logo";

const EASE_IO = [0.65, 0, 0.35, 1] as const;
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const LINKS: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
];

const isActive = (path: string, href: string) => (href === "/" ? path === "/" : path.startsWith(href));

export default function Nav() {
  const [open, setOpen] = useState(false);
  // The Work menu opens on CSS :hover / :focus-within, so it can never get stuck mid-animation.
  // `hush` only hides it right after a click until the pointer leaves.
  const [hush, setHush] = useState(false);
  const [peek, setPeek] = useState<string>(categories[0].slug);
  const path = usePathname();
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false); setHush(true);
      (document.activeElement as HTMLElement | null)?.blur();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  // lock the page behind the full-screen menu
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => { document.documentElement.style.overflow = ""; };
  }, [open]);

  const done = () => { setHush(true); (document.activeElement as HTMLElement | null)?.blur(); };
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
              <div key={l.href} className="nav-item" data-hush={hush || undefined} onPointerEnter={() => setHush(false)} onPointerLeave={() => setHush(false)}>
                <Link href={l.href} className="nav-link roll-host" data-on={isActive(path, l.href) || undefined} aria-haspopup="true" onClick={done}>
                  <Roll>{l.label}</Roll>
                  <svg className="nav-caret" viewBox="0 0 10 6" aria-hidden><path d="M1 1l4 4 4-4" /></svg>
                </Link>
                <div className="nav-drop">
                  <ul>
                    <li>
                      <Link href="/work" className="nav-cat" onPointerEnter={() => setPeek(categories[0].slug)} onClick={done}>
                        <span>All projects</span><sup>{works.length}</sup>
                      </Link>
                    </li>
                    {categories.map((c) => (
                      <li key={c.slug}>
                        <Link href={`/work/category/${c.slug}`} className="nav-cat" data-on={peek === c.slug || undefined}
                          onPointerEnter={() => setPeek(c.slug)} onFocus={() => setPeek(c.slug)} onClick={done}>
                          <span>{c.label}</span><sup>{worksIn(c.slug).length}</sup>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/work/category/${peek}`} className="nav-peek" onClick={done} tabIndex={-1}>
                    {categories.map((c) => {
                      const w = worksIn(c.slug)[0];
                      return w ? <img key={c.slug} src={w.thumb} alt="" data-on={peek === c.slug || undefined} loading="lazy" decoding="async" /> : null;
                    })}
                    <em>{peekWork?.title}</em>
                  </Link>
                </div>
              </div>
            ) : (
              <Link key={l.href} href={l.href} className="nav-link roll-host" data-on={isActive(path, l.href) || undefined}>
                <Roll>{l.label}</Roll>
              </Link>
            ),
          )}
        </nav>

        <div className="nav-end">
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
                        <Roll>{n.label}</Roll>
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

const css = `
.nav{position:fixed;z-index:1000;top:14px;left:50%;transform:translateX(-50%);width:min(1180px,calc(100% - 28px));height:56px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 10px 0 20px;background:color-mix(in srgb,var(--bg) 92%,transparent);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:inset 0 0 0 1px var(--line);transition:background .5s var(--ease-io),box-shadow .5s var(--ease-io)}
.nav[data-open]{background:var(--menu);box-shadow:inset 0 0 0 1px transparent}
.nav-logo{flex:none;font-size:21px;font-weight:600;letter-spacing:-.06em;line-height:1}

.nav-links{display:flex;align-items:center;gap:2px;height:100%}
.nav-item{position:relative;height:100%;display:flex;align-items:center}
.nav-link{position:relative;display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 12px;font-size:14px;font-weight:600;color:var(--ink-2);border-radius:999px;transition:color .3s,background-color .3s}
.nav-link:hover,.nav-link:focus-visible,.nav-item:hover:not([data-hush])>.nav-link{color:var(--ink);background:var(--chip)}
.nav-link[data-on]{color:var(--ink)}
.nav-link[data-on]::after{content:"";position:absolute;left:50%;bottom:3px;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:var(--accent)}
.nav-link:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.nav-caret{width:9px;height:6px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;transition:transform .4s var(--ease-out)}
.nav-item:hover:not([data-hush]) .nav-caret,.nav-item:focus-within .nav-caret{transform:rotate(180deg)}

.nav-drop{position:absolute;top:calc(100% - 4px);left:50%;margin-left:-250px;width:500px;display:grid;grid-template-columns:1fr 200px;gap:10px;padding:10px;background:var(--bg);box-shadow:0 0 0 1px var(--line),0 24px 50px -20px rgba(0,0,0,.25);opacity:0;visibility:hidden;transform:translateY(-8px);pointer-events:none;transition:opacity .22s ease,transform .3s var(--ease-out),visibility 0s linear .22s}
.nav-drop::before{content:"";position:absolute;left:0;right:0;top:-14px;height:14px}
.nav-item:hover:not([data-hush]) .nav-drop,.nav-item:focus-within:not([data-hush]) .nav-drop{opacity:1;visibility:visible;transform:none;pointer-events:auto;transition:opacity .22s ease,transform .3s var(--ease-out),visibility 0s}
.nav-drop ul{list-style:none;display:flex;flex-direction:column}
.nav-cat{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:10px 12px;font-size:15px;font-weight:600;letter-spacing:-.02em;color:var(--ink-2);transition:color .25s,background-color .25s,padding .35s var(--ease-out)}
.nav-cat sup{font-size:11px;color:var(--ink-4);font-weight:600}
.nav-cat:hover,.nav-cat[data-on],.nav-cat:focus-visible{color:var(--ink);background:var(--chip);padding-left:18px;outline:none}
.nav-cat:hover sup,.nav-cat[data-on] sup{color:var(--accent-deep)}
.nav-peek{position:relative;display:block;overflow:hidden;background:var(--panel);min-height:220px}
.nav-peek img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transform:scale(1.04);transition:opacity .35s ease,transform .5s var(--ease-out)}
.nav-peek img[data-on]{opacity:1;transform:none}
.nav-peek em{position:absolute;left:0;bottom:0;padding:6px 9px;background:var(--accent);color:var(--on-accent);font-style:normal;font-size:12px;font-weight:700}

.nav-end{flex:none;display:flex;align-items:center;gap:14px}
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

/* full-screen menu (tablets and phones) */
.menu{position:fixed;inset:0;z-index:999;background:var(--menu)}
.menu-bulge{position:absolute;left:-10%;right:-10%;top:100%;height:22vh;background:var(--menu);border-radius:0 0 50% 50%/0 0 100% 100%;transform-origin:50% 0}
.menu-scroll{position:absolute;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;display:flex;flex-direction:column;gap:36px;padding:110px max(20px,env(safe-area-inset-left)) max(28px,env(safe-area-inset-bottom))}
.menu-links{display:flex;flex-direction:column;font-size:clamp(44px,9vw,76px);font-weight:600;letter-spacing:-.045em;line-height:.98}
.menu-link{display:inline-flex;align-items:center;padding:.04em 0}
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

@media (max-width:1023px){
  .nav-links,.nav-cta{display:none}
  .nav-burger{display:grid}
  .nav{width:min(720px,calc(100% - 24px));padding:0 6px 0 18px}
}
@media (max-width:420px){.nav{top:10px;height:52px}}
`;
