/*
  Parametric vehicle illustrations.

  Every body type is described once, in metres, as a side profile plus a few
  widths. From that we derive five views (left, right, front, rear, top), each
  a list of independent panel regions and non-clickable decals (glass, lights,
  wheels). Panels are polygons clipped by the body silhouette, so neighbouring
  panels tile the body without gaps and each one is its own hit area.

  Side profile coordinates: x runs from the rear bumper (0) to the front (L),
  y is height above the ground.
*/

/* ------------------------------------------------------------------ types */

export const BODY_TYPES = {
  hatch: {
    L: 4.06, H: 1.45, W: 1.73, r: 0.32, xf: 3.24, xr: 0.66, sill: 0.21, doors: 4, rear: "tailgate",
    top: [
      [4.02, 0.24], [4.06, 0.40], [4.055, 0.55], [4.01, 0.70, "hoodFront", 1],
      [3.70, 0.79], [3.20, 0.86], [2.62, 0.93, "wsB", 1], [1.96, 1.38, "wsT"],
      [1.55, 1.445], [1.00, 1.44], [0.55, 1.40, "roofEnd", 1], [0.40, 1.26],
      [0.27, 1.02, "tailTop", 1], [0.10, 0.92], [0.04, 0.78], [0.025, 0.62, "rbTop"],
      [0.015, 0.40], [0.05, 0.24],
    ],
    beltF: 0.95, beltR: 1.00,
    windows: [
      [[2.52, 0.975], [2.00, 1.345], [1.86, 1.365], [1.86, 0.985]],
      [[1.76, 0.985], [1.76, 1.365], [1.02, 1.35], [0.80, 1.02]],
    ],
    bPillar: 1.81,
    doorF: [[2.86, -0.3], [2.86, 0.55], [2.66, 0.94]],
    doorR: [[1.06, -0.3], [1.06, 0.58], [0.74, 1.0]],
    cPillarDir: [-0.12, 0.40],
    fb: { x: 3.64, top: 0.56 }, rb: { x: 0.30, top: 0.56 },
    head: [[4.03, 0.69], [3.66, 0.765], [3.56, 0.70], [3.82, 0.615], [4.05, 0.60]],
    tail: [[0.33, 1.0], [0.08, 0.905], [0.035, 0.76], [0.20, 0.78], [0.40, 0.93]],
  },
  sedan: {
    L: 4.71, H: 1.44, W: 1.83, r: 0.34, xf: 3.90, xr: 1.05, sill: 0.20, doors: 4, rear: "trunk",
    top: [
      [4.67, 0.24], [4.71, 0.41], [4.705, 0.56], [4.65, 0.70, "hoodFront", 1],
      [4.25, 0.80], [3.60, 0.87], [2.92, 0.93, "wsB", 1], [2.18, 1.38, "wsT"],
      [1.75, 1.435], [1.35, 1.43], [1.05, 1.39, "roofEnd"], [0.62, 1.04, "deck", 1],
      [0.25, 1.015], [0.06, 0.99, "tailTop", 1], [0.02, 0.84], [0.012, 0.62, "rbTop"],
      [0.01, 0.40], [0.05, 0.24],
    ],
    beltF: 0.94, beltR: 1.0,
    windows: [
      [[2.80, 0.97], [2.22, 1.345], [2.05, 1.37], [2.05, 0.985]],
      [[1.95, 0.985], [1.95, 1.37], [1.24, 1.35], [1.00, 1.03]],
    ],
    bPillar: 2.00,
    doorF: [[3.17, -0.3], [3.17, 0.55], [2.97, 0.94]],
    doorR: [[1.46, -0.3], [1.46, 0.6], [1.06, 1.0]],
    cPillarDir: [-0.35, 0.45],
    fb: { x: 4.30, top: 0.55 }, rb: { x: 0.36, top: 0.57 },
    head: [[4.67, 0.69], [4.22, 0.775], [4.12, 0.71], [4.42, 0.62], [4.70, 0.60]],
    tail: [[0.50, 1.02], [0.06, 0.985], [0.02, 0.84], [0.24, 0.86], [0.52, 0.95]],
  },
  estate: {
    L: 4.59, H: 1.47, W: 1.80, r: 0.33, xf: 3.73, xr: 1.00, sill: 0.20, doors: 4, rear: "tailgate",
    top: [
      [4.55, 0.24], [4.59, 0.41], [4.585, 0.56], [4.53, 0.70, "hoodFront", 1],
      [4.15, 0.80], [3.55, 0.87], [2.98, 0.93, "wsB", 1], [2.28, 1.40, "wsT"],
      [1.80, 1.465], [0.90, 1.455], [0.32, 1.42, "roofEnd", 1], [0.20, 1.22],
      [0.11, 1.0, "tailTop", 1], [0.05, 0.86], [0.025, 0.62, "rbTop"],
      [0.015, 0.40], [0.05, 0.24],
    ],
    beltF: 0.95, beltR: 1.02,
    windows: [
      [[2.86, 0.975], [2.32, 1.365], [2.13, 1.39], [2.13, 0.985]],
      [[2.03, 0.985], [2.03, 1.39], [1.30, 1.39], [1.30, 0.995]],
      [[1.20, 0.995], [1.20, 1.385], [0.42, 1.365], [0.30, 1.03]],
    ],
    bPillar: 2.08, cPillar: 1.25,
    doorF: [[3.30, -0.3], [3.30, 0.55], [3.04, 0.94]],
    doorR: [[1.42, -0.3], [1.42, 0.6], [1.25, 1.0]],
    cPillarDir: [0, 1],
    fb: { x: 4.16, top: 0.55 }, rb: { x: 0.30, top: 0.57 },
    head: [[4.55, 0.69], [4.14, 0.77], [4.04, 0.705], [4.32, 0.615], [4.58, 0.60]],
    tail: [[0.24, 1.10], [0.10, 0.99], [0.045, 0.80], [0.16, 0.80], [0.27, 1.0]],
  },
  suv: {
    L: 4.38, H: 1.59, W: 1.84, r: 0.36, xf: 3.46, xr: 0.81, sill: 0.29, doors: 4, rear: "tailgate",
    top: [
      [4.34, 0.33], [4.38, 0.52], [4.375, 0.70], [4.31, 0.87, "hoodFront", 1],
      [3.95, 0.95], [3.40, 1.02], [2.84, 1.07, "wsB", 1], [2.20, 1.52, "wsT"],
      [1.75, 1.585], [0.90, 1.575], [0.42, 1.54, "roofEnd", 1], [0.30, 1.36],
      [0.19, 1.13, "tailTop", 1], [0.07, 1.0], [0.03, 0.80], [0.02, 0.70, "rbTop"],
      [0.012, 0.52], [0.05, 0.33],
    ],
    beltF: 1.09, beltR: 1.16,
    windows: [
      [[2.72, 1.115], [2.24, 1.475], [2.05, 1.50], [2.05, 1.125]],
      [[1.95, 1.125], [1.95, 1.50], [1.17, 1.495], [1.17, 1.14]],
      [[1.07, 1.14], [1.07, 1.49], [0.56, 1.47], [0.42, 1.18]],
    ],
    bPillar: 2.00, cPillar: 1.12,
    doorF: [[3.05, -0.3], [3.05, 0.65], [2.88, 1.08]],
    doorR: [[1.27, -0.3], [1.27, 0.70], [1.12, 1.16]],
    cPillarDir: [0, 1],
    fb: { x: 3.92, top: 0.66 }, rb: { x: 0.36, top: 0.70 },
    head: [[4.33, 0.86], [3.92, 0.935], [3.82, 0.875], [4.10, 0.79], [4.36, 0.775]],
    tail: [[0.30, 1.22], [0.13, 1.08], [0.06, 0.95], [0.20, 0.96], [0.36, 1.12]],
    cladding: true,
  },
  coupe: {
    L: 4.52, H: 1.17, W: 1.93, r: 0.35, xf: 3.55, xr: 0.93, sill: 0.15, doors: 2, rear: "engine",
    top: [
      [4.49, 0.16], [4.52, 0.27], [4.47, 0.40, "hoodFront", 1],
      [4.05, 0.55], [3.45, 0.68], [2.86, 0.79, "wsB", 1], [2.30, 1.10, "wsT"],
      [1.95, 1.17], [1.55, 1.15], [1.30, 1.11, "roofEnd"], [0.80, 0.97],
      [0.30, 0.90, "tailTop", 1], [0.10, 0.86], [0.03, 0.74], [0.015, 0.58, "rbTop"],
      [0.012, 0.36], [0.06, 0.16],
    ],
    beltF: 0.80, beltR: 0.92,
    windows: [[[2.74, 0.835], [2.30, 1.07], [1.66, 1.12], [1.28, 1.06], [1.62, 0.90]]],
    doorF: [[3.07, -0.3], [3.07, 0.45], [2.92, 0.80]],
    doorR: [[1.74, -0.3], [1.74, 0.55], [1.66, 0.88]],
    cPillarDir: [-0.5, 0.30],
    fb: { x: 4.02, top: 0.30 }, rb: { x: 0.38, top: 0.48 },
    head: [[4.46, 0.405], [4.02, 0.545], [3.92, 0.50], [4.22, 0.40], [4.50, 0.33]],
    tail: [[0.34, 0.90], [0.06, 0.855], [0.035, 0.74], [0.24, 0.78], [0.46, 0.86]],
    intake: true,
  },
};

export const VIEWS = ["left", "front", "top", "rear", "right"];

/* ---------------------------------------------------------------- helpers */

const f = (n) => Math.round(n * 10) / 10;
const pt = (p) => `${f(p[0])} ${f(p[1])}`;
export const polyPath = (pts) => "M" + pts.map(pt).join("L") + "Z";
const lineTo = (pts) => pts.map((p) => "L" + pt(p)).join("");

/* Rounded polygon: corners trimmed with quadratic curves. */
export function roundPoly(pts, rad) {
  const n = pts.length;
  let d = "";
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
    const v1 = [p0[0] - p1[0], p0[1] - p1[1]], v2 = [p2[0] - p1[0], p2[1] - p1[1]];
    const l1 = Math.hypot(...v1), l2 = Math.hypot(...v2);
    const k = Math.min(rad, l1 / 2.2, l2 / 2.2);
    const a = [p1[0] + (v1[0] / l1) * k, p1[1] + (v1[1] / l1) * k];
    const b = [p1[0] + (v2[0] / l2) * k, p1[1] + (v2[1] / l2) * k];
    d += (i === 0 ? "M" : "L") + pt(a) + "Q" + pt(p1) + " " + pt(b);
  }
  return d + "Z";
}

/* Catmull-Rom chain -> cubic segments. Points flagged sharp (index 3) keep a corner. */
function cubicSegments(P) {
  const segs = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p1 = P[i], p2 = P[i + 1];
    const p0 = i === 0 || p1[3] ? p1 : P[i - 1];
    const p3 = i + 2 >= P.length || p2[3] ? p2 : P[i + 2];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    segs.push([c1, c2, p2]);
  }
  return segs;
}
const segPath = (P, segs, i0, i1) =>
  "M" + pt(P[i0]) + segs.slice(i0, i1).map(([a, b, c]) => "C" + pt(a) + " " + pt(b) + " " + pt(c)).join("");

const lerp = (a, b, t) => a + (b - a) * t;
const ext = (p, d, k) => [p[0] + d[0] * k, p[1] + d[1] * k];
const norm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };

/* -------------------------------------------------------------- side view */

export function sideView(type) {
  const T = BODY_TYPES[type];
  const VW = 1000, VH = 440, ground = 408;
  const s = Math.min(840 / T.L, 300 / T.H);
  const ox = (VW - T.L * s) / 2;
  const M = ([x, y]) => [ox + x * s, ground - y * s];

  // top outline, front-bottom → rear-bottom
  const P = T.top.map(([x, y, tag, sharp]) => [...M([x, y]), sharp, tag]);
  const tagIx = {};
  P.forEach((p, i) => { if (p[3]) tagIx[p[3]] = i; });
  const segs = cubicSegments(P.map((p) => [p[0], p[1], 0, p[2]]));
  const topChain = segPath(P, segs, 0, P.length - 1);

  // bottom with wheel arches, rear → front
  const ra = T.r + 0.06, sill = T.sill;
  const arch = (xw) => {
    const dy = Math.max(0, T.r - sill), dx = Math.sqrt(Math.max(0, ra * ra - dy * dy));
    const a = M([xw - dx, sill]), b = M([xw + dx, sill]);
    return `L${pt(a)}A${f(ra * s)} ${f(ra * s)} 0 1 1 ${pt(b)}`;
  };
  const front0 = P[0];
  const body = topChain + arch(T.xr) + arch(T.xf) + `L${pt(front0)}Z`;

  // seams (in metres, extended far beyond the body)
  const up = (poly, dir) => { const last = poly[poly.length - 1]; return [...poly, ext(last, norm(dir), 3)]; };
  const wsB = T.top.find((p) => p[2] === "wsB"), wsT = T.top.find((p) => p[2] === "wsT");
  const aDir = norm([wsT[0] - wsB[0], wsT[1] - wsB[1]]);
  const doorFLine = up(T.doorF, aDir).map(M);
  const bLine = T.bPillar != null ? [[T.bPillar + 0.02, -0.3], [T.bPillar - 0.02, 3]].map(M) : null;
  const doorRLine = up(T.doorR, T.cPillarDir).map(M);
  const BIG = 2000;
  const left = [-BIG, ground + 200], leftTop = [-BIG, -BIG];
  const right = [BIG, ground + 200], rightTop = [BIG, -BIG];

  const regions = [];
  regions.push({ id: "quarter", d: polyPath([left, leftTop, ...doorRLine.slice().reverse()]) });
  if (T.doors === 4) {
    regions.push({ id: "doorR", d: polyPath([...doorRLine, ...bLine.slice().reverse()]) });
    regions.push({ id: "doorF", d: polyPath([...bLine, ...doorFLine.slice().reverse()]) });
  } else {
    regions.push({ id: "doorF", d: polyPath([...doorRLine, ...doorFLine.slice().reverse()]) });
  }
  regions.push({ id: "wing", d: polyPath([...doorFLine, rightTop, right]) });
  const fbTop = M([T.fb.x + 0.06, T.fb.top]);
  regions.push({ id: "bumperF", d: polyPath([M([T.fb.x, -0.3]), M([T.fb.x, T.sill + 0.02]), fbTop, [BIG, fbTop[1]], right]) });
  const rbTop = M([T.rb.x - 0.06, T.rb.top]);
  regions.push({ id: "bumperR", d: polyPath([left, [-BIG, rbTop[1]], rbTop, M([T.rb.x, T.sill + 0.02]), M([T.rb.x, -0.3])]) });

  // edge strips along the top outline (stroke-based, clipped to the body)
  const strip = 0.075 * s * 2;
  const rearEnd = tagIx.rbTop;
  regions.push({ id: "bonnet", d: segPath(P, segs, tagIx.hoodFront, tagIx.wsB), stroke: strip });
  regions.push({ id: "roof", d: segPath(P, segs, tagIx.wsT, tagIx.roofEnd), stroke: strip });
  const bootStart = T.rear === "trunk" ? tagIx.deck : T.rear === "engine" ? tagIx.roofEnd + 1 : tagIx.roofEnd;
  regions.push({ id: "boot", d: segPath(P, segs, bootStart, rearEnd), stroke: strip });

  // decals
  const decals = [];
  decals.push({ kind: "glassStrip", d: segPath(P, segs, tagIx.wsB, tagIx.wsT), stroke: strip * 0.9 });
  if (T.rear === "trunk") decals.push({ kind: "glassStrip", d: segPath(P, segs, tagIx.roofEnd, tagIx.deck), stroke: strip * 0.9 });
  if (T.rear === "tailgate") decals.push({ kind: "glassStrip", d: segPath(P, segs, tagIx.roofEnd, tagIx.tailTop), stroke: strip * 0.62 });
  T.windows.forEach((w) => decals.push({ kind: "window", d: roundPoly(w.map(M), 0.05 * s) }));
  decals.push({ kind: "light", d: roundPoly(T.head.map(M), 0.03 * s), tone: "head" });
  decals.push({ kind: "light", d: roundPoly(T.tail.map(M), 0.03 * s), tone: "tail" });
  if (T.cladding) {
    const cl = (x0, x1) => polyPath([M([x0, T.sill - 0.05]), M([x1, T.sill - 0.05]), M([x1, T.sill + 0.12]), M([x0, T.sill + 0.12])]);
    decals.push({ kind: "trim", d: cl(T.xr + ra, T.xf - ra) });
  }
  if (T.intake) {
    decals.push({ kind: "trim", d: roundPoly([M([1.68, 0.30]), M([1.62, 0.64]), M([1.42, 0.58]), M([1.44, 0.30])], 0.03 * s) });
  }
  // door handles
  const beltAt = (x) => lerp(T.beltR, T.beltF, Math.min(1, Math.max(0, (x - 0.3) / (wsB[0] - 0.3))));
  const handles = T.doors === 4
    ? [T.bPillar + 0.2, T.doorR[2][0] + 0.2]
    : [T.doorR[0][0] + 0.22];
  handles.forEach((hx) => {
    const hy = beltAt(hx) - 0.12;
    decals.push({ kind: "handle", d: roundPoly([M([hx - 0.13, hy + 0.02]), M([hx + 0.13, hy + 0.02]), M([hx + 0.13, hy - 0.02]), M([hx - 0.13, hy - 0.02])], 0.02 * s) });
  });
  // character line
  const cl0 = M([T.xf - 0.1, T.beltF - 0.13]), cl1 = M([T.xr + 0.05, T.beltR - 0.15]);
  decals.push({ kind: "crease", d: `M${pt(cl0)}C${pt([lerp(cl0[0], cl1[0], 0.3), cl0[1] - 3])} ${pt([lerp(cl0[0], cl1[0], 0.7), cl1[1] - 2])} ${pt(cl1)}` });
  // B / C pillar blackout
  if (T.bPillar != null) {
    const w0 = T.windows[0], w1 = T.windows[1];
    decals.push({ kind: "pillar", d: polyPath([M([w0[3][0], w0[3][1] - 0.01]), M([w0[2][0], w0[2][1] + 0.005]), M([w1[1][0], w1[1][1] + 0.005]), M([w1[0][0], w1[0][1] - 0.01])]) });
  }

  // mirror
  const mx = wsB[0] - 0.13, my = T.beltF + 0.075;
  const mirror = roundPoly([M([mx - 0.12, my - 0.05]), M([mx + 0.10, my - 0.065]), M([mx + 0.13, my + 0.03]), M([mx + 0.02, my + 0.075]), M([mx - 0.12, my + 0.06])], 0.04 * s);
  regions.push({ id: "mirror", d: mirror, outside: true });

  const wheels = [T.xr, T.xf].map((xw) => ({ c: M([xw, T.r]), r: T.r * s, arch: ra * s }));

  return {
    vb: [0, 0, VW, VH], body, regions, decals, wheels, ground,
    paintBox: [M([0, T.H])[1], M([0, 0.1])[1]],
    shadow: { cx: VW / 2, cy: ground + 2, rx: (T.L * s) / 2 + 40, ry: 16 },
  };
}

/* ------------------------------------------------------- front / rear view */

function endView(type, which) {
  const T = BODY_TYPES[type];
  const VW = 640, VH = 440, ground = 408;
  const s = Math.min(470 / T.W, 300 / T.H);
  const cx = VW / 2;
  const M = ([x, y]) => [cx + x * s, ground - y * s];
  const hw = T.W / 2;
  const tag = (t) => T.top.find((p) => p[2] === t);
  const hoodF = tag("hoodFront")[1], wsBH = tag("wsB")[1], H = T.H;
  const belt = which === "front" ? T.beltF : T.beltR;
  const tailTop = tag("tailTop")[1], rbTop = T.rb.top, fbTop = T.fb.top;
  const ghBase = hw - 0.11, ghTop = hw * (type === "coupe" ? 0.62 : type === "suv" || type === "estate" ? 0.80 : 0.72);
  const roofHalf = ghTop - 0.04;
  const sill = T.sill;

  // outline: right half, bottom → roof, then mirrored
  const shoulderY = Math.max(belt, which === "front" ? hoodF + 0.06 : rbTop + 0.2);
  const half = [
    [hw * 0.9, sill - 0.02], [hw * 0.985, sill + 0.1], [hw, shoulderY - 0.25], [hw * 0.995, shoulderY - 0.06],
    [hw - 0.05, shoulderY + 0.005], [ghBase, shoulderY + 0.02], [ghTop, H - 0.06], [roofHalf, H - 0.008], [0, H],
  ];
  const outlinePts = [...half, ...half.slice(0, -1).reverse().map(([x, y]) => [-x, y])].map(M);
  const body = roundPoly(outlinePts, 0.06 * s);

  const regions = [];
  const decals = [];
  const sideId = (sx) => (which === "front" ? (sx > 0 ? "L" : "R") : sx < 0 ? "L" : "R"); // front view: car's left on the right
  const inner = hw - 0.19;
  const BIG = 3;

  // roof / greenhouse frame
  if (which === "front") {
    regions.push({ id: "roof", d: polyPath([[-BIG, shoulderY + 0.005], [BIG, shoulderY + 0.005], [BIG, BIG], [-BIG, BIG]].map(M)) });
    const glass = [[-(ghBase - 0.07), wsBH + 0.02], [ghBase - 0.07, wsBH + 0.02], [ghTop - 0.05, H - 0.1], [-(ghTop - 0.05), H - 0.1]];
    decals.push({ kind: "windscreen", d: roundPoly(glass.map(M), 0.05 * s), block: true });
    // bonnet
    regions.push({ id: "bonnet", d: polyPath([[-inner, hoodF], [inner, hoodF], [inner - 0.02, shoulderY + 0.01], [-(inner - 0.02), shoulderY + 0.01]].map(M)) });
    // wings
    for (const sx of [-1, 1]) {
      regions.push({ id: "wing" + sideId(sx), d: polyPath([[sx * inner, fbTop], [sx * BIG, fbTop], [sx * BIG, shoulderY + 0.01], [sx * (inner - 0.02), shoulderY + 0.01], [sx * inner, hoodF]].map(M)) });
    }
    // bumper
    regions.push({ id: "bumperF", d: polyPath([[-BIG, -0.5], [BIG, -0.5], [BIG, fbTop], [inner, fbTop], [inner, hoodF], [-inner, hoodF], [-inner, fbTop], [-BIG, fbTop]].map(M)) });
    // lights, grille, intake, plate
    for (const sx of [-1, 1]) {
      const y0 = fbTop + 0.035, y1 = hoodF - 0.015;
      const hl = [[sx * hw * 0.36, y0 + 0.02], [sx * hw * 0.93, y0], [sx * hw * 0.975, y1], [sx * hw * 0.40, y1 - 0.01]];
      decals.push({ kind: "light", tone: "head", d: roundPoly(hl.map(M), 0.025 * s) });
      decals.push({ kind: "drl", d: polyPath([[sx * hw * 0.46, y1 - 0.03], [sx * hw * 0.93, y1 - 0.025], [sx * hw * 0.93, y1 - 0.04], [sx * hw * 0.46, y1 - 0.045]].map(M)) });
      decals.push({ kind: "fog", d: roundPoly([[sx * hw * 0.72, sill + 0.13], [sx * hw * 0.9, sill + 0.13], [sx * hw * 0.9, sill + 0.18], [sx * hw * 0.72, sill + 0.18]].map(M), 0.02 * s) });
    }
    const gy0 = fbTop + 0.02, gy1 = hoodF - 0.04;
    decals.push({ kind: "grille", d: roundPoly([[-hw * 0.32, gy0], [hw * 0.32, gy0], [hw * 0.30, gy1], [-hw * 0.30, gy1]].map(M), 0.03 * s) });
    decals.push({ kind: "grille", d: roundPoly([[-hw * 0.66, sill + 0.03], [hw * 0.66, sill + 0.03], [hw * 0.58, sill + 0.11], [-hw * 0.58, sill + 0.11]].map(M), 0.03 * s) });
    const py = (sill + fbTop) / 2 + 0.03;
    decals.push({ kind: "plate", d: roundPoly([[-0.26, py - 0.055], [0.26, py - 0.055], [0.26, py + 0.055], [-0.26, py + 0.055]].map(M), 0.01 * s), box: [M([-0.26, py + 0.055]), 0.52 * s, 0.11 * s] });
  } else {
    // rear: roof strip, C-pillars belong to the quarters
    const roofLine = H - 0.075;
    regions.push({ id: "roof", d: polyPath([[-BIG, roofLine], [BIG, roofLine], [BIG, BIG], [-BIG, BIG]].map(M)) });
    const tgTop = T.rear === "trunk" || T.rear === "engine" ? tailTop : roofLine;
    for (const sx of [-1, 1]) {
      regions.push({ id: "quarter" + sideId(sx), d: polyPath([[sx * inner, rbTop], [sx * BIG, rbTop], [sx * BIG, roofLine], [sx * (roofHalf - 0.06), roofLine], [sx * inner, shoulderY]].map(M)) });
    }
    if (T.rear === "tailgate") {
      regions.push({ id: "boot", d: polyPath([[-inner, rbTop], [inner, rbTop], [inner, shoulderY], [roofHalf - 0.06, roofLine], [-(roofHalf - 0.06), roofLine], [-inner, shoulderY]].map(M)) });
      const g = [[-(inner - 0.06), shoulderY + 0.06], [inner - 0.06, shoulderY + 0.06], [roofHalf - 0.12, roofLine - 0.05], [-(roofHalf - 0.12), roofLine - 0.05]];
      decals.push({ kind: "windscreen", d: roundPoly(g.map(M), 0.05 * s), block: false });
    } else {
      regions.push({ id: "boot", d: polyPath([[-inner, rbTop], [inner, rbTop], [inner, tgTop], [-inner, tgTop]].map(M)) });
      // rear glass sits in the roof region
      const g = [[-(inner - 0.04), tgTop + 0.04], [inner - 0.04, tgTop + 0.04], [roofHalf - 0.1, roofLine - 0.04], [-(roofHalf - 0.1), roofLine - 0.04]];
      decals.push({ kind: "windscreen", d: roundPoly(g.map(M), 0.05 * s), block: true });
    }
    regions.push({ id: "bumperR", d: polyPath([[-BIG, -0.5], [BIG, -0.5], [BIG, rbTop], [-BIG, rbTop]].map(M)) });
    for (const sx of [-1, 1]) {
      const y0 = rbTop + 0.07, y1 = rbTop + 0.2;
      const tl = [[sx * hw * 0.5, y0 + 0.01], [sx * hw * 0.98, y0 - 0.01], [sx * hw * 0.97, y1], [sx * hw * 0.55, y1 - 0.02]];
      decals.push({ kind: "light", tone: "tail", d: roundPoly(tl.map(M), 0.025 * s) });
    }
    decals.push({ kind: "drlTail", d: polyPath([[-hw * 0.52, rbTop + 0.165], [hw * 0.52, rbTop + 0.165], [hw * 0.52, rbTop + 0.152], [-hw * 0.52, rbTop + 0.152]].map(M)) });
    const py = T.rear === "tailgate" ? rbTop + 0.1 : (sill + rbTop) / 2 + 0.06;
    decals.push({ kind: "plate", d: roundPoly([[-0.26, py - 0.055], [0.26, py - 0.055], [0.26, py + 0.055], [-0.26, py + 0.055]].map(M), 0.01 * s), box: [M([-0.26, py + 0.055]), 0.52 * s, 0.11 * s] });
    decals.push({ kind: "grille", d: roundPoly([[-hw * 0.7, sill + 0.03], [hw * 0.7, sill + 0.03], [hw * 0.64, sill + 0.09], [-hw * 0.64, sill + 0.09]].map(M), 0.02 * s) });
  }

  // mirrors
  for (const sx of [-1, 1]) {
    const my = T.beltF + 0.075, x0 = sx * (ghBase - 0.02), x1 = sx * (hw + 0.17);
    decals.push({ kind: "stalk", d: polyPath([[x0, my - 0.03], [sx * (hw + 0.04), my - 0.035], [sx * (hw + 0.04), my + 0.005], [x0, my + 0.0]].map(M)) });
    regions.push({
      id: "mirror" + sideId(sx), outside: true,
      d: roundPoly([[sx * (hw - 0.01), my - 0.06], [x1, my - 0.05], [x1 + sx * 0.01, my + 0.06], [sx * (hw - 0.01), my + 0.07]].map(M), 0.035 * s),
    });
  }

  // tyres
  const tyres = [-1, 1].map((sx) => {
    const x0 = sx * (hw - 0.03), x1 = sx * (hw - 0.27);
    return roundPoly([[x0, 0], [x1, 0], [x1, sill + 0.2], [x0, sill + 0.2]].map(M), 0.05 * s);
  });

  return {
    vb: [0, 0, VW, VH], body, regions, decals, tyres, ground,
    paintBox: [M([0, H])[1], M([0, 0.1])[1]],
    shadow: { cx, cy: ground + 2, rx: hw * s + 30, ry: 14 },
  };
}
export const frontView = (t) => endView(t, "front");
export const rearView = (t) => endView(t, "rear");

/* --------------------------------------------------------------- top view */

export function topView(type) {
  const T = BODY_TYPES[type];
  const VW = 1000, VH = 480, cy = 240;
  const s = Math.min(840 / T.L, 330 / T.W);
  const ox = (VW - T.L * s) / 2;
  const M = ([x, z]) => [ox + x * s, cy - z * s]; // car's left (z>0) at the top
  const hw = T.W / 2, L = T.L;
  const tag = (t) => T.top.find((p) => p[2] === t)[0];
  const wsB = tag("wsB"), wsT = tag("wsT"), roofEnd = tag("roofEnd");
  const tailTop = tag("tailTop"), deck = T.rear === "trunk" ? tag("deck") : null;

  const rf = type === "coupe" ? 0.55 : 0.42, rr = 0.36;
  const outline = [
    [L - rf, hw], [L - 0.04, hw - rf * 0.55], [L, hw * 0.5], [L, -hw * 0.5], [L - 0.04, -hw + rf * 0.55], [L - rf, -hw],
    [rr, -hw], [0.03, -hw + rr * 0.6], [0, -hw * 0.5], [0, hw * 0.5], [0.03, hw - rr * 0.6], [rr, hw],
  ];
  const body = roundPoly(outline.map(M), 0.22 * s);

  const shoulder = hw - 0.17;
  const roofHalf = hw * (type === "coupe" ? 0.6 : 0.74);
  const BIG = 9;
  const fbX = L - 0.24, rbX = 0.22;
  const regions = [];
  const sideX = { doorF: T.doorF[2][0] + 0.02, b: T.bPillar ?? null, doorR: T.doorR[2][0] + 0.04 };

  regions.push({ id: "bonnet", d: polyPath([[wsB - 0.04, -shoulder], [fbX, -shoulder], [fbX, shoulder], [wsB - 0.04, shoulder]].map(M)) });
  regions.push({ id: "roof", d: roundPoly([[roofEnd, -roofHalf], [wsT, -roofHalf], [wsT, roofHalf], [roofEnd, roofHalf]].map(M), 0.08 * s) });
  const bootFront = T.rear === "trunk" ? deck : T.rear === "engine" ? roofEnd - 0.05 : roofEnd;
  regions.push({ id: "boot", d: polyPath([[rbX, -shoulder], [bootFront, -shoulder], [bootFront, shoulder], [rbX, shoulder]].map(M)) });
  for (const [sz, sd] of [[1, "L"], [-1, "R"]]) {
    const band = (x0, x1) => polyPath([[x0, sz * shoulder], [x1, sz * shoulder], [x1, sz * BIG], [x0, sz * BIG]].map(M));
    regions.push({ id: "wing" + sd, d: band(sideX.doorF, fbX) });
    if (T.doors === 4) {
      regions.push({ id: "doorF" + sd, d: band(sideX.b, sideX.doorF) });
      regions.push({ id: "doorR" + sd, d: band(sideX.doorR, sideX.b) });
    } else {
      regions.push({ id: "doorF" + sd, d: band(sideX.doorR, sideX.doorF) });
    }
    regions.push({ id: "quarter" + sd, d: band(rbX, sideX.doorR) });
  }
  regions.push({ id: "bumperF", d: polyPath([[fbX, -BIG], [L + 1, -BIG], [L + 1, BIG], [fbX, BIG]].map(M)) });
  regions.push({ id: "bumperR", d: polyPath([[-1, -BIG], [rbX, -BIG], [rbX, BIG], [-1, BIG]].map(M)) });

  const decals = [];
  // windscreen
  decals.push({ kind: "windscreen", block: true, d: roundPoly([[wsT + 0.02, -roofHalf + 0.02], [wsB - 0.06, -shoulder + 0.02], [wsB - 0.06, shoulder - 0.02], [wsT + 0.02, roofHalf - 0.02]].map(M), 0.06 * s) });
  // side glass seen from above
  for (const sz of [1, -1]) {
    decals.push({ kind: "sideglass", d: polyPath([[roofEnd + 0.05, sz * roofHalf], [wsT - 0.02, sz * roofHalf], [wsB - 0.1, sz * (shoulder - 0.01)], [roofEnd - 0.05, sz * (shoulder - 0.01)]].map(M)) });
  }
  // rear glass
  if (T.rear === "tailgate") decals.push({ kind: "windscreen", block: false, d: roundPoly([[tailTop + 0.02, -shoulder + 0.05], [roofEnd - 0.02, -roofHalf + 0.03], [roofEnd - 0.02, roofHalf - 0.03], [tailTop + 0.02, shoulder - 0.05]].map(M), 0.05 * s) });
  if (T.rear === "trunk") decals.push({ kind: "windscreen", block: true, d: roundPoly([[deck + 0.02, -shoulder + 0.06], [roofEnd - 0.01, -roofHalf + 0.03], [roofEnd - 0.01, roofHalf - 0.03], [deck + 0.02, shoulder - 0.06]].map(M), 0.05 * s) });
  if (T.rear === "engine") {
    for (let i = 0; i < 4; i++) {
      const x = roofEnd - 0.2 - i * 0.16;
      decals.push({ kind: "louvre", d: polyPath([[x, -roofHalf * 0.7], [x + 0.06, -roofHalf * 0.7], [x + 0.06, roofHalf * 0.7], [x, roofHalf * 0.7]].map(M)) });
    }
  }
  // lights at the corners
  for (const sz of [1, -1]) {
    decals.push({ kind: "light", tone: "head", d: polyPath([[L - 0.03, sz * hw * 0.55], [L - 0.2, sz * hw * 0.93], [L - 0.27, sz * hw * 0.9], [L - 0.1, sz * hw * 0.5]].map(M)) });
    decals.push({ kind: "light", tone: "tail", d: polyPath([[0.03, sz * hw * 0.58], [0.16, sz * hw * 0.95], [0.22, sz * hw * 0.92], [0.09, sz * hw * 0.56]].map(M)) });
  }
  // mirrors
  for (const [sz, sd] of [[1, "L"], [-1, "R"]]) {
    const mx = wsB - 0.12;
    regions.push({ id: "mirror" + sd, outside: true, d: roundPoly([[mx - 0.1, sz * (hw - 0.04)], [mx + 0.08, sz * (hw - 0.04)], [mx + 0.03, sz * (hw + 0.17)], [mx - 0.12, sz * (hw + 0.15)]].map(M), 0.035 * s) });
  }
  return {
    vb: [0, 0, VW, VH], body, regions, decals,
    paintBox: [M([0, hw])[1], M([0, -hw])[1]], top: true,
    shadow: { cx: VW / 2, cy: cy + 4, rx: (L * s) / 2 + 26, ry: hw * s + 22 },
  };
}

/* Left view is the right view mirrored, with side panels relabelled. */
export function buildView(type, view) {
  if (view === "front") return frontView(type);
  if (view === "rear") return rearView(type);
  if (view === "top") return topView(type);
  const v = sideView(type);
  const sd = view === "left" ? "L" : "R";
  const sided = new Set(["quarter", "doorR", "doorF", "wing", "mirror"]);
  return { ...v, mirrored: view === "left", regions: v.regions.map((r) => (sided.has(r.id) ? { ...r, id: r.id + sd } : r)) };
}
