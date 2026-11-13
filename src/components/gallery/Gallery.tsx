"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { computeLayout, easeIO, enterPose, nearestStop, poseAt, type Layout, type Pose, type WallId } from "@/lib/gallery";
import { galleryWorks, site, type Work } from "@/lib/content";
import { zoomToPage } from "@/lib/zoom";
import "./gallery.css";

type Phase = "intro" | "entering" | "inside" | "leaving";
const DOORS = [
  { label: "All work", href: "/work" },
  { label: "About us", href: "/about" },
];
const KEY_IN = "topline-gallery-inside";
const KEY_AT = "topline-gallery-stop";
const ENTER_MS = 3200;
const LEAVE_MS = 2400;
const px = (n: number) => `${n.toFixed(2)}px`;

function wallXform(L: Layout, wall: WallId, u: number, y: number, out = 0) {
  if (wall === 0) return `translate3d(${px(-L.X / 2 + out)},${px(y)},${px(-u)}) rotateY(90deg)`;
  if (wall === 1) return `translate3d(${px(-L.X / 2 + u)},${px(y)},${px(-L.Z + out)}) rotateY(0deg)`;
  return `translate3d(${px(L.X / 2 - out)},${px(y)},${px(-L.Z + u)}) rotateY(-90deg)`;
}

type Hole = { x0: number; x1: number; y0: number; y1: number };
// Split a wall rectangle into pieces around rectangular holes (niches, doorways).
function wallPieces(len: number, h: number, holes: Hole[]) {
  const out: Hole[] = [];
  const hs = [...holes].sort((a, b) => a.x0 - b.x0);
  let x = 0;
  for (const o of hs) {
    if (o.x0 > x) out.push({ x0: x, x1: o.x0, y0: 0, y1: h });
    if (o.y0 > 0) out.push({ x0: o.x0, x1: o.x1, y0: 0, y1: o.y0 });
    if (o.y1 < h) out.push({ x0: o.x0, x1: o.x1, y0: o.y1, y1: h });
    x = o.x1;
  }
  if (x < len) out.push({ x0: x, x1: len, y0: 0, y1: h });
  return out;
}

export default function Gallery() {
  const router = useRouter();
  const [size, setSize] = useState<{ W: number; H: number } | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [ready, setReady] = useState(false);
  const ajarRef = useRef(false);
  const works = galleryWorks;

  const viewRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const leafL = useRef<HTMLDivElement>(null);
  const leafR = useRef<HTMLDivElement>(null);
  const lightsRef = useRef<HTMLDivElement>(null);
  const st = useRef({
    phase: "intro" as Phase,
    s: 0,
    target: 0,
    t0: 0,
    lastInput: 0,
    over: 0,
    active: -2,
    mx: 0,
    my: 0,
    lx: 0,
    ly: 0,
    ajar: 0,
    hoverDoor: -1,
    anchor: -1,
  });

  useEffect(() => {
    const on = () => setSize({ W: window.innerWidth, H: window.innerHeight });
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  const L = useMemo(
    () => (size ? computeLayout(size.W, size.H, works.map((w) => w.ratio), DOORS) : null),
    [size, works],
  );

  // restore "already inside" when coming back from a project page
  useEffect(() => {
    if (!L) return;
    let inside = false;
    try {
      inside = sessionStorage.getItem(KEY_IN) === "1";
      const at = parseInt(sessionStorage.getItem(KEY_AT) || "0", 10);
      if (inside && L.stops[at]) st.current.s = st.current.target = L.stops[at].s;
    } catch {}
    if (inside) {
      st.current.phase = "inside";
      setPhase("inside");
    }
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L !== null]);

  const enter = () => {
    const s = st.current;
    if (s.phase !== "intro" || !L) return;
    s.phase = "entering";
    s.t0 = performance.now();
    s.s = s.target = 0;
    setPhase("entering");
    try { sessionStorage.setItem(KEY_IN, "1"); } catch {}
  };
  const leave = () => {
    const s = st.current;
    if (s.phase !== "inside") return;
    s.phase = "leaving";
    s.t0 = performance.now();
    setPhase("leaving");
    try { sessionStorage.removeItem(KEY_IN); sessionStorage.removeItem(KEY_AT); } catch {}
  };

  // main loop
  useEffect(() => {
    if (!L) return;
    const s = st.current;
    const view = viewRef.current!;
    const world = worldRef.current!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    const workEls = Array.from(view.querySelectorAll<HTMLElement>("[data-item]"));
    const signEls = Array.from(view.querySelectorAll<HTMLElement>("[data-sign]"));
    const doorLeaves = Array.from(view.querySelectorAll<HTMLElement>("[data-door-leaf]"));
    const videos = Array.from(view.querySelectorAll<HTMLVideoElement>("video[data-item-video]"));

    const setCam = (pose: Pose, bob = 0) => {
      const yaw = pose.yaw + s.lx * 1.6;
      const pitch = s.ly * -1.1;
      world.style.transform = `translateZ(${px(L.P)}) rotateX(${pitch.toFixed(3)}deg) rotateY(${(-yaw).toFixed(3)}deg) translate3d(${px(-pose.p[0])},${px(-pose.p[1] + bob)},${px(-pose.p[2])})`;
    };
    const setDoors = (deg: number) => {
      if (leafL.current) leafL.current.style.transform = `rotateY(${deg.toFixed(2)}deg)`;
      if (leafR.current) leafR.current.style.transform = `rotateY(${(-deg).toFixed(2)}deg)`;
    };
    const setActive = (i: number) => {
      if (i === s.active) return;
      s.active = i;
      const stop = L.stops[i];
      workEls.forEach((el) => el.classList.toggle("on", stop?.item !== undefined && Number(el.dataset.item) === stop.item));
      signEls.forEach((el) => el.classList.toggle("on", !!stop?.end));
      videos.forEach((v) => {
        if (stop?.item !== undefined && Number(v.dataset.itemVideo) === stop.item) v.play().catch(() => {});
        else v.pause();
      });
      try { if (i >= 0) sessionStorage.setItem(KEY_AT, String(i)); } catch {}
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const k = 1 - Math.exp(-dt * 6);
      s.lx += (s.mx - s.lx) * (1 - Math.exp(-dt * 2.5));
      s.ly += (s.my - s.ly) * (1 - Math.exp(-dt * 2.5));

      if (s.phase === "intro") {
        s.ajar += ((ajarRef.current ? 4 : 0) - s.ajar) * k;
        setDoors(s.ajar);
        setCam(L.introPose);
        setActive(-1);
      } else if (s.phase === "entering" || s.phase === "leaving") {
        const dur = reduce ? 600 : s.phase === "entering" ? ENTER_MS : LEAVE_MS;
        let t = Math.min(1, (now - s.t0) / dur);
        if (s.phase === "leaving") t = 1 - t;
        const doorT = easeIO(Math.min(1, t / 0.42));
        setDoors(Math.max(s.ajar * (1 - doorT), 102 * doorT));
        const m = easeIO(Math.min(1, Math.max(0, (t - 0.16) / 0.84)));
        const pose = enterPose(L, m);
        const bob = reduce || L.phone ? 0 : -Math.abs(Math.sin(m * Math.PI * 5)) * L.H * 0.006 * Math.sin(Math.PI * m);
        setCam(pose, bob);
        if (lightsRef.current) lightsRef.current.style.opacity = String(Math.max(0, (t - 0.4) / 0.6));
        if (s.phase === "entering" && t >= 1) {
          s.phase = "inside";
          setPhase("inside");
        } else if (s.phase === "leaving" && t <= 0) {
          s.phase = "intro";
          s.ajar = 0;
          setPhase("intro");
        }
        setActive(s.phase === "inside" ? 0 : -1);
      } else {
        // inside: ease toward the target and snap to the nearest stop after input settles
        if (now - s.lastInput > 240) {
          // settle on a stop: once you have pushed a little past the stop you started from,
          // carry on to the next one in that direction instead of springing back
          let i = nearestStop(L, s.target);
          if (s.anchor >= 0) {
            const a = L.stops[s.anchor].s;
            if (i === s.anchor && Math.abs(s.target - a) > 50) i = Math.max(0, Math.min(L.stops.length - 1, s.anchor + Math.sign(s.target - a)));
          }
          s.target += (L.stops[i].s - s.target) * (1 - Math.exp(-dt * 7));
          if (Math.abs(L.stops[i].s - s.target) < 2 || now - s.lastInput > 1000) { s.target = L.stops[i].s; s.anchor = -1; }
        }
        s.s += (s.target - s.s) * (1 - Math.exp(-dt * 4.2));
        if (Math.abs(s.target - s.s) < 0.05) s.s = s.target;
        setCam(poseAt(L, s.s));
        setDoors(102);
        if (lightsRef.current) lightsRef.current.style.opacity = "1";
        const i = nearestStop(L, s.s);
        const near = Math.abs(L.stops[i].s - s.s) < (L.W * 0.56 + L.gap) * 0.32;
        setActive(near ? i : -1);
        // end doors swing ajar when standing in front of them, wider on hover
        doorLeaves.forEach((el) => {
          const di = Number(el.dataset.doorLeaf);
          const side = Number(el.dataset.side);
          const base = near && L.stops[i].end ? 14 : 0;
          const want = base + (s.hoverDoor === di ? 22 : 0);
          const cur = Number(el.dataset.ang || 0);
          const nx = cur + (want - cur) * k;
          el.dataset.ang = String(nx);
          el.style.transform = `rotateY(${(side * nx).toFixed(2)}deg)`;
        });
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const nudge = (d: number) => {
      if (s.anchor < 0) s.anchor = nearestStop(L, s.target);
      s.lastInput = performance.now();
      s.target = Math.max(0, Math.min(L.sEnd, s.target + d));
    };
    const onWheel = (e: WheelEvent) => {
      if (s.phase === "intro") {
        if (e.deltaY > 30) enter();
        return;
      }
      if (s.phase !== "inside") return;
      e.preventDefault();
      const d = e.deltaY * (e.deltaMode === 1 ? 16 : 1) * 1.15;
      if (s.target <= 0.5 && d < 0) {
        s.over += -d;
        if (s.over > 260) { s.over = 0; leave(); }
        return;
      }
      s.over = 0;
      nudge(d);
    };
    let ty = 0;
    const onTouchStart = (e: TouchEvent) => { ty = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      if (s.phase !== "inside") return;
      e.preventDefault();
      const y = e.touches[0].clientY;
      nudge((ty - y) * 2.4);
      ty = y;
    };
    const step = (dir: number) => {
      const i = nearestStop(L, s.target);
      const j = Math.max(0, Math.min(L.stops.length - 1, i + dir));
      s.lastInput = 0;
      s.anchor = -1;
      s.target = L.stops[j].s;
    };
    const onKey = (e: KeyboardEvent) => {
      if (s.phase === "intro" && (e.key === "Enter" || e.key === "ArrowDown")) return enter();
      if (s.phase !== "inside") return;
      if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key)) { e.preventDefault(); step(1); }
      if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        if (nearestStop(L, s.target) === 0) leave();
        else step(-1);
      }
      if (e.key === "Home") s.target = 0;
      if (e.key === "End") s.target = L.sEnd;
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      s.mx = (e.clientX / L.W - 0.5) * 2;
      s.my = (e.clientY / L.H - 0.5) * 2;
    };
    view.addEventListener("wheel", onWheel, { passive: false });
    view.addEventListener("touchstart", onTouchStart, { passive: true });
    view.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(raf);
      view.removeEventListener("wheel", onWheel);
      view.removeEventListener("touchstart", onTouchStart);
      view.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointermove", onMove);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L]);

  const openWork = (w: Work, el: HTMLElement | null) => {
    const img = el?.querySelector("img");
    if (img) zoomToPage(img, `/work/${w.slug}`, router);
    else router.push(`/work/${w.slug}`);
  };

  return (
    <div className="g-root" ref={viewRef} data-phase={phase} data-ready={ready || undefined} data-phone={L?.phone || undefined}>
      <div className="g-view" style={L ? { perspective: px(L.P) } : undefined}>
      {L && (
        <div className="g-world" ref={worldRef}>
          <Room L={L} works={works} leafL={leafL} leafR={leafR} lightsRef={lightsRef} onOpen={openWork}
            onDoorHover={(i) => (st.current.hoverDoor = i)} onDoor={(href) => router.push(href)} />
        </div>
      )}
      </div>

      <div className="g-intro" aria-hidden={phase !== "intro"}>
        <button
          className="g-cta"
          onClick={enter}
          onPointerEnter={() => { ajarRef.current = true; }}
          onPointerLeave={() => { ajarRef.current = false; }}
          onFocus={() => { ajarRef.current = true; }}
          onBlur={() => { ajarRef.current = false; }}
        >
          <span className="g-cta-in">{site.intro.cta}</span>
        </button>
        <p className="g-blurb">{site.intro.blurb}</p>
      </div>
      <div className="g-hit" onClick={enter} onPointerEnter={() => { ajarRef.current = true; }} onPointerLeave={() => { ajarRef.current = false; }} />
    </div>
  );
}

function Room({
  L, works, leafL, leafR, lightsRef, onOpen, onDoorHover, onDoor,
}: {
  L: Layout;
  works: Work[];
  leafL: React.RefObject<HTMLDivElement | null>;
  leafR: React.RefObject<HTMLDivElement | null>;
  lightsRef: React.RefObject<HTMLDivElement | null>;
  onOpen: (w: Work, el: HTMLElement | null) => void;
  onDoorHover: (i: number) => void;
  onDoor: (href: string) => void;
}) {
  const wallH = L.floorY - L.ceilY;
  const holes: Hole[][] = [[], [], []];
  const nicheDepth = L.d0 * 0.32;
  const niche = (it: Layout["items"][number]) => ({ w: it.w * 1.55, h: Math.min(it.h * 1.5, wallH * 0.86) });
  L.items.forEach((it) => {
    if (!it.niche) return;
    const n = niche(it);
    const cy = it.cy - L.ceilY;
    holes[it.wall].push({ x0: it.u - n.w / 2, x1: it.u + n.w / 2, y0: cy - n.h / 2, y1: cy + n.h / 2 });
  });
  L.doors.forEach((d) => holes[2].push({ x0: d.u - d.w / 2, x1: d.u + d.w / 2, y0: wallH - d.h, y1: wallH }));

  const wallBg = (i: number) => {
    const base = ["#f1f0ed", "#f3f2ef", "#efeeeb"][i];
    if (L.phone) return base;
    return `linear-gradient(90deg, rgba(0,0,0,.06), transparent 3%, transparent 97%, rgba(0,0,0,.06)), linear-gradient(rgba(255,255,255,.5), transparent 38%, transparent 80%, rgba(170,160,145,.16)), ${base}`;
  };

  // seams between hanging positions
  const seams = (wall: WallId) => {
    const its = L.items.filter((i) => i.wall === wall);
    const xs: number[] = [];
    its.forEach((a, i) => {
      const b = its[i + 1];
      if (b) xs.push((a.u + a.w / 2 + b.u - b.w / 2) / 2);
    });
    return xs;
  };

  const ent = L.entrance;
  const doorH = L.floorY - ent.top;

  return (
    <>
      {/* floor */}
      <div className="g-plane g-floor" style={{
        width: px(L.X + L.P * 2), height: px(L.Z + L.P * 0.9),
        transform: `translate3d(${px(-L.X / 2 - L.P)},${px(L.floorY)},${px(-L.Z)}) rotateX(90deg)`,
        backgroundSize: `100% 100%, ${px(L.H * 0.36)} ${px(L.H * 0.36)}, ${px(L.H * 0.36)} ${px(L.H * 0.36)}, auto`,
      }} />
      {/* ceiling */}
      <div className="g-plane g-ceil" style={{
        width: px(L.X), height: px(L.Z),
        transform: `translate3d(${px(-L.X / 2)},${px(L.ceilY)},0px) rotateX(-90deg)`,
      }}>
        <div className="g-lights" ref={lightsRef} style={{ backgroundSize: `${px(L.gap + L.W * 0.3)} 100%` }} />
      </div>

      {/* walls */}
      {([0, 1, 2] as WallId[]).map((wi) => (
        <div key={wi} className="g-wall" style={{ transform: wallXform(L, wi, 0, L.ceilY) }}>
          {wallPieces(L.wallLen[wi], wallH, holes[wi]).map((p, i) => (
            <div key={i} className="g-wall-piece" style={{
              left: px(p.x0), top: px(p.y0), width: px(p.x1 - p.x0 + 0.6), height: px(p.y1 - p.y0 + 0.6),
              background: wallBg(wi), backgroundSize: `${px(L.wallLen[wi])} ${px(wallH)}`, backgroundPosition: `${px(-p.x0)} ${px(-p.y0)}`,
            }} />
          ))}
          <div className="g-drift" style={{ width: px(L.wallLen[wi]), height: px(wallH), animationDuration: `${70 + wi * 9}s` }} />
          <div className="g-rail" style={{ top: px(L.railY - L.ceilY), width: px(L.wallLen[wi]) }} />
          <div className="g-skirt" style={{ top: px(wallH - 5), width: px(L.wallLen[wi]) }} />
          {seams(wi).map((x) => <div key={x} className="g-seam" style={{ left: px(x - 2), height: px(wallH) }} />)}
        </div>
      ))}

      {/* artworks */}
      {L.items.map((it, idx) => {
        const w = works[it.k];
        const n = niche(it);
        const depth = it.niche ? nicheDepth : 0;
        const top = it.cy - it.h / 2;
                return (
          <div key={w.slug} className="g-wall" data-item={idx} style={{ transform: wallXform(L, it.wall, it.u, 0, -depth) }}>
            {it.niche && (
              <>
                <div className="g-niche-back" style={{ left: px(-n.w / 2), top: px(it.cy - n.h / 2), width: px(n.w), height: px(n.h) }} />
                {/* niche sides */}
                <div className="g-niche-side l" style={{ left: px(-n.w / 2), top: px(it.cy - n.h / 2), width: px(depth), height: px(n.h) }} />
                <div className="g-niche-side r" style={{ left: px(n.w / 2 - depth), top: px(it.cy - n.h / 2), width: px(depth), height: px(n.h) }} />
                <div className="g-niche-side t" style={{ left: px(-n.w / 2), top: px(it.cy - n.h / 2), width: px(n.w), height: px(depth) }} />
                <div className="g-niche-side b" style={{ left: px(-n.w / 2), top: px(it.cy + n.h / 2 - depth), width: px(n.w), height: px(depth) }} />
              </>
            )}
            <div className="g-halo" style={{ left: px(-it.w * 0.95), top: px(it.cy - it.h * 1.05), width: px(it.w * 1.9), height: px(it.h * 2.1) }} />
            {/* free-standing exhibition stand: two posts down to the floor (works in a niche sit on a ledge) */}
            {!it.niche && [0.14, 0.86].map((f) => (
              <div key={f} className="g-post" style={{ left: px(-it.w / 2 + it.w * f - 3), top: px(top + it.h), height: px(L.floorY - top - it.h) }} />
            ))}
            {!it.niche && <div className="g-foot" style={{ left: px(-it.w * 0.46), width: px(it.w * 0.92), top: px(L.floorY - 6) }} />}
            {it.niche && <div className="g-ledge" style={{ left: px(-n.w / 2 + depth), width: px(n.w - depth * 2), top: px(top + it.h + L.frameT) }} />}
            <div className="g-shadow" style={{ left: px(-it.w / 2), top: px(top), width: px(it.w), height: px(it.h) }} />
            <button
              className="g-frame"
              aria-label={`Open ${w.title}`}
              style={{ left: px(-it.w / 2), top: px(top), width: px(it.w), height: px(it.h), boxShadow: `0 0 0 ${px(L.frameT)} var(--panel)` }}
              onClick={(e) => onOpen(w, e.currentTarget)}
            >
              <img src={w.image} alt="" draggable={false} decoding="async" />
              {!L.phone && w.video && <video data-item-video={idx} src={w.video} muted loop playsInline preload="none" />}
            </button>
            {/* number tab clipped to the top corner of the panel */}
            <div className="g-tab" style={{ left: px(it.w / 2 - L.frameT - 2), top: px(top - L.frameT) }}>{w.no}</div>
            <div className="g-cap" style={{ left: px(-it.w / 2 - L.frameT), top: px(top + it.h + L.frameT + 12), width: px(it.w + L.frameT * 2) }}>
              <span className="ln"><span style={{ transitionDelay: "0.08s" }}>{w.title}</span></span>
              <span className="ln g-cap-sub"><span style={{ transitionDelay: "0.14s" }}>{w.services}{w.year ? `, ${w.year}` : ""}</span></span>
            </div>
          </div>
        );
      })}
      {/* floor light pools in front of each work */}
      {L.items.map((it, idx) => (
        <div key={idx} className="g-wall" style={{ transform: wallXform(L, it.wall, it.u, L.floorY - 1, it.niche ? -nicheDepth : 0) }}>
          <div className="g-pool" data-item={idx} style={{ left: px(-it.w * 0.9), width: px(it.w * 1.8), height: px(L.P * 0.45) }} />
        </div>
      ))}

      {/* end doors */}
      {L.doors.map((d, i) => {
        const top = L.floorY - d.h;
        return (
          <div key={d.href} className="g-wall" style={{ transform: wallXform(L, 2, d.u, 0, 0) }}>
            <div className="g-sign" data-sign style={{ left: px(-d.w), width: px(d.w * 2), top: px(top - d.w * 0.3), fontSize: px(d.w * 0.17) }}>
              <span className="b"><span className="t">{d.label}</span><span className="tb" /></span>
            </div>
            <div className="g-door-beyond" style={{ left: px(-d.w / 2), top: px(top), width: px(d.w), height: px(d.h), transform: `translateZ(${px(-L.d0 * 0.1)})` }} />
            {[-1, 1].map((side) => (
              <div key={side} className="g-door-leaf" data-door-leaf={i} data-side={side * -1}
                style={{ left: px(side < 0 ? -d.w / 2 : 0), top: px(top), width: px(d.w / 2), height: px(d.h), transformOrigin: side < 0 ? "0 50%" : "100% 50%" }}>
                <i className="panel" /><i className="handle" style={{ [side < 0 ? "right" : "left"]: "9%" }} />
              </div>
            ))}
            <a
              href={d.href}
              className="g-door-hit"
              aria-label={d.label}
              style={{ left: px(-d.w / 2), top: px(top), width: px(d.w), height: px(d.h) }}
              onPointerEnter={() => onDoorHover(i)}
              onPointerLeave={() => onDoorHover(-1)}
              onClick={(e) => { e.preventDefault(); onDoor(d.href); }}
            />
          </div>
        );
      })}

      {/* front facade with the entrance doors */}
      <div className="g-wall" style={{ transform: `translate3d(0px,0px,0px)` }}>
        {wallPieces(L.X, L.floorY - L.ceilY, [{ x0: L.X / 2 - ent.w / 2, x1: L.X / 2 + ent.w / 2, y0: ent.top - L.ceilY, y1: L.floorY - L.ceilY }]).map((p, i) => (
          <div key={i} className="g-facade" style={{ left: px(p.x0 - L.X / 2), top: px(p.y0 + L.ceilY), width: px(p.x1 - p.x0 + 0.6), height: px(p.y1 - p.y0 + 0.6) }} />
        ))}
        <div className="g-leaf l" ref={leafL} style={{ left: px(-ent.w / 2), top: px(ent.top), width: px(ent.w / 2), height: px(doorH) }}>
          <Headline L={L} side={-1} />
        </div>
        <div className="g-leaf r" ref={leafR} style={{ left: 0, top: px(ent.top), width: px(ent.w / 2), height: px(doorH) }}>
          <Headline L={L} side={1} />
        </div>
      </div>
    </>
  );
}

function Headline({ L, side }: { L: Layout; side: number }) {
  const ent = L.entrance;
  const fs = Math.min(L.W * (L.phone ? 0.105 : 0.0486), 96);
  return (
    <div className="g-head" style={{
      width: px(ent.w), left: px(side < 0 ? 0 : -ent.w / 2), top: px(-L.H * 0.1 - ent.top), fontSize: px(fs),
    }}>
      {site.intro.headline.map((l, i) => (
        <span className="ln" key={l}><span style={{ transitionDelay: `${0.25 + i * 0.07}s` }}>{l}</span></span>
      ))}
    </div>
  );
}
