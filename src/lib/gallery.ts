// Geometry for the walk-through gallery. Pure functions, no DOM.
// World axes: x right, y down (CSS), z toward the viewer. The room spans x ∈ [-X/2, X/2], z ∈ [-Z, 0];
// the entrance doors sit in the front wall at z = 0. Camera yaw 0 looks toward -z, +90 looks toward -x.

export type V3 = [number, number, number];
export type WallId = 0 | 1 | 2; // 0 = left, 1 = back, 2 = right

export type Item = { k: number; wall: WallId; u: number; w: number; h: number; cy: number; niche: boolean };
export type Door = { label: string; href: string; u: number; w: number; h: number };
export type Pose = { p: V3; yaw: number };
export type Stop = { s: number; pose: Pose; item?: number; end?: boolean };
type Seg =
  | { kind: "line"; a: number; b: number; from: Pose; to: Pose }
  | { kind: "turn"; a: number; b: number; from: Pose; to: Pose; c: V3; bulge: [number, number] };

export type Layout = {
  W: number; H: number; P: number; phone: boolean;
  d0: number; floorY: number; ceilY: number; railY: number;
  X: number; Z: number; frameT: number; gap: number;
  items: Item[]; doors: Door[]; doorsU: number; wallLen: [number, number, number];
  entrance: { w: number; top: number };
  stops: Stop[]; segs: Seg[]; sEnd: number; introPose: Pose;
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const smooth = (t: number) => t * t * (3 - 2 * t);

export function computeLayout(
  W: number,
  H: number,
  ratios: number[],
  doorDefs: { label: string; href: string }[],
): Layout {
  const phone = W < 810;
  const P = Math.max(W, H) * (phone ? 1.1 : 0.9);
  const d0 = P; // standing distance from a wall: frames render at natural CSS size
  const floorY = H * (phone ? 0.34 : 0.3);
  const ceilY = -H * 0.62;
  const railY = -H * 0.56;
  const gap = phone ? W * 0.3 : Math.max(300, W * 0.24);
  const frameT = Math.max(6, Math.min(12, W * 0.0072));

  const size = (r: number) => {
    if (phone) {
      let w = W - 48, h = w / r;
      if (h > H * 0.56) { h = H * 0.56; w = h * r; }
      return { w, h };
    }
    // works stand on posts, so they are smaller than wall-hung frames and leave the floor visible below
    if (r < 0.95) return { w: H * 0.54 * r, h: H * 0.54 };
    if (r < 1.05) return { w: H * 0.48, h: H * 0.48 };
    let w = Math.min(W * 0.5, H * 0.6 * r), h = w / r;
    if (h > H * 0.46) { h = H * 0.46; w = h * r; }
    return { w, h };
  };

  const n = ratios.length;
  const k0 = Math.max(1, Math.round(n / 3));
  const k2 = Math.max(0, Math.round(n / 3));
  const k1 = Math.max(0, n - k0 - k2);
  const groups: number[][] = [[], [], []];
  ratios.forEach((_, i) => groups[i < k0 ? 0 : i < k0 + k1 ? 1 : 2].push(i));

  const items: Item[] = [];
  const wallLen: [number, number, number] = [0, 0, 0];
  const cy = phone ? -H * 0.035 : -H * 0.08;
  const corner = d0 + gap;

  // left wall starts right after the entrance
  let u = Math.max(gap * 0.6, d0 * 0.45);
  groups.forEach((g, wi) => {
    const wall = wi as WallId;
    if (wi > 0) u = corner;
    let prevHalf = -1;
    g.forEach((k) => {
      const { w, h } = size(ratios[k]);
      if (prevHalf >= 0) u += prevHalf + gap + w / 2;
      else u += w / 2;
      items.push({ k, wall, u, w, h, cy, niche: wall === 1 && !phone });
      prevHalf = w / 2;
    });
    if (wi < 2) wallLen[wi] = u + (prevHalf >= 0 ? prevHalf : 0) + corner;
    else wallLen[2] = u + (prevHalf >= 0 ? prevHalf : 0);
  });

  // doors at the end of the right wall
  const doorW = phone ? W * 0.32 : Math.min(H * 0.34, W * 0.2);
  const doorH = Math.min(H * 0.6, doorW * 2.2);
  const doorGap = doorW * (phone ? 0.3 : 0.7);
  const doorsSpan = doorDefs.length ? doorW * 2 + doorGap : 0;
  const lastRight = items.filter((i) => i.wall === 2).pop();
  const doorsU = lastRight ? lastRight.u + lastRight.w / 2 + gap + doorsSpan / 2 : corner + doorsSpan / 2;
  wallLen[2] = doorsU + doorsSpan / 2 + Math.max(gap, d0 * 0.6);
  const doors: Door[] = doorDefs.map((d, i) => ({ ...d, u: doorsU + (i ? 1 : -1) * (doorW + doorGap) / 2, w: doorW, h: doorH }));

  const Z = Math.max(wallLen[0], wallLen[2]);
  wallLen[0] = Z; wallLen[2] = Z;
  const X = Math.max(wallLen[1], 2 * corner + 10);
  wallLen[1] = X;

  const pose = (wall: WallId, uu: number): Pose => {
    if (wall === 0) return { p: [-X / 2 + d0, 0, -uu], yaw: 90 };
    if (wall === 1) return { p: [-X / 2 + uu, 0, -Z + d0], yaw: 0 };
    return { p: [X / 2 - d0, 0, -Z + uu], yaw: -90 };
  };
  // right wall runs from the back (u = 0 at z = -Z) toward the front
  const targets: { wall: WallId; u: number; item?: number; end?: boolean }[] = items.map((it, i) => ({ wall: it.wall, u: it.u, item: i }));
  if (doors.length) targets.push({ wall: 2, u: doorsU, end: true });

  const stops: Stop[] = [];
  const segs: Seg[] = [];
  const span = (phone ? W : W * 0.56) + gap;
  let s = 0;
  targets.forEach((t, i) => {
    const ps = pose(t.wall, t.u);
    if (i > 0) {
      const prev = targets[i - 1];
      const from = pose(prev.wall, prev.u);
      if (prev.wall === t.wall) {
        const len = Math.abs(t.u - prev.u);
        segs.push({ kind: "line", a: s, b: s + len, from, to: ps });
        s += len;
      } else {
        const c: V3 = prev.wall === 0 ? [-X / 2 + d0, 0, -Z + d0] : [X / 2 - d0, 0, -Z + d0];
        const toCenter: [number, number] = prev.wall === 0 ? [Math.SQRT1_2, Math.SQRT1_2] : [-Math.SQRT1_2, Math.SQRT1_2];
        const b = Math.min(d0 * 0.55, Math.min(X, Z) * 0.18);
        const len = span * 1.5;
        segs.push({ kind: "turn", a: s, b: s + len, from, to: ps, c, bulge: [toCenter[0] * b, toCenter[1] * b] });
        s += len;
      }
    }
    stops.push({ s, pose: ps, item: t.item, end: t.end });
  });

  return {
    W, H, P, phone, d0, floorY, ceilY, railY, X, Z, frameT, gap,
    items, doors, doorsU, wallLen,
    entrance: { w: W * 1.04, top: -H * 0.51 },
    stops, segs, sEnd: s,
    introPose: { p: [0, 0, P], yaw: 0 },
  };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function poseAt(L: Layout, s: number): Pose {
  if (!L.segs.length) return L.stops[0]?.pose ?? L.introPose;
  s = clamp(s, 0, L.sEnd);
  const seg = L.segs.find((g) => s <= g.b) ?? L.segs[L.segs.length - 1];
  const t = clamp((s - seg.a) / Math.max(1e-6, seg.b - seg.a));
  if (seg.kind === "line") {
    return {
      p: [lerp(seg.from.p[0], seg.to.p[0], t), 0, lerp(seg.from.p[2], seg.to.p[2], t)],
      yaw: seg.from.yaw,
    };
  }
  const e = easeIO(t);
  const q = (a: number, c: number, b: number) => (1 - e) * (1 - e) * a + 2 * (1 - e) * e * c + e * e * b;
  const bump = Math.sin(Math.PI * e) ** 2;
  return {
    p: [
      q(seg.from.p[0], seg.c[0], seg.to.p[0]) + seg.bulge[0] * bump,
      0,
      q(seg.from.p[2], seg.c[2], seg.to.p[2]) + seg.bulge[1] * bump,
    ],
    yaw: lerp(seg.from.yaw, seg.to.yaw, smooth(clamp((t - 0.08) / 0.84))),
  };
}

// Entrance walk: from outside the doors to the first stop. m ∈ [0, 1].
export function enterPose(L: Layout, m: number): Pose {
  const a = L.introPose.p;
  const b = L.stops[0]?.pose.p ?? [0, 0, 0];
  const c: V3 = [0, 0, b[2]];
  const e = m;
  const q = (x: number, y: number, z: number) => (1 - e) * (1 - e) * x + 2 * (1 - e) * e * y + e * e * z;
  return {
    p: [q(a[0], c[0], b[0]), 0, q(a[2], c[2], b[2])],
    yaw: (L.stops[0]?.pose.yaw ?? 0) * smooth(clamp((m - 0.3) / 0.7)),
  };
}

export function nearestStop(L: Layout, s: number) {
  let best = 0;
  L.stops.forEach((st, i) => {
    if (Math.abs(st.s - s) < Math.abs(L.stops[best].s - s)) best = i;
  });
  return best;
}
