import React, { useId, useMemo } from "react";
import { motion } from "framer-motion";
import { buildView } from "./geometry.js";
import { lighten, darken, luminance } from "../lib/util.js";

const PEARL_A = "#8FE3F0", PEARL_B = "#B9A8FF";

function Wheel({ c, r, ids }) {
  const [x, y] = c;
  const spokes = [];
  for (let k = 0; k < 5; k++) {
    const a = (k * 72 * Math.PI) / 180;
    for (const off of [-0.17, 0.17]) {
      const a0 = a + off;
      const p = (rad, ang) => `${(x + Math.cos(ang) * rad).toFixed(1)} ${(y + Math.sin(ang) * rad).toFixed(1)}`;
      spokes.push(`M${p(r * 0.17, a0 - 0.12)}L${p(r * 0.66, a0 - 0.05)}L${p(r * 0.66, a0 + 0.05)}L${p(r * 0.17, a0 + 0.12)}Z`);
    }
  }
  return (
    <g pointerEvents="none">
      <circle cx={x} cy={y} r={r} fill="#0B0D10" />
      <circle cx={x} cy={y} r={r - 1} fill="none" stroke="#2A3038" strokeWidth="1.2" />
      <circle cx={x} cy={y} r={r * 0.86} fill="none" stroke="#161A1F" strokeWidth={r * 0.06} />
      <circle cx={x} cy={y} r={r * 0.7} fill={`url(#${ids.rim})`} />
      <circle cx={x} cy={y} r={r * 0.5} fill="#20252C" />
      <path d={`M${x - r * 0.33} ${y - r * 0.32}A${r * 0.46} ${r * 0.46} 0 0 1 ${x + r * 0.05} ${y - r * 0.46}`} stroke={PEARL_A} strokeOpacity=".55" strokeWidth={r * 0.1} strokeLinecap="round" fill="none" />
      <path d={spokes.join("")} fill={`url(#${ids.spoke})`} />
      <circle cx={x} cy={y} r={r * 0.69} fill="none" stroke="#C9D0D8" strokeOpacity=".55" strokeWidth="1.4" />
      <circle cx={x} cy={y} r={r * 0.15} fill="#2A3038" stroke="#9AA4AF" strokeOpacity=".7" />
    </g>
  );
}

const panelOverlay = (state) =>
  state === "selected" ? { opacity: 1 } : state === "hover" ? { opacity: 1 } : { opacity: 0 };

function Panel({ r, ids, state, interactive, onEnter, onMove, onLeave, onToggle, label, pressed }) {
  const clip = r.outside ? undefined : `url(#${ids.clip})`;
  const common = interactive
    ? {
        onPointerEnter: (e) => onEnter(r.id, e),
        onPointerMove: (e) => onMove(r.id, e),
        onPointerLeave: () => onLeave(r.id),
        onClick: () => onToggle(r.id),
        onFocus: (e) => onEnter(r.id, e, true),
        onBlur: () => onLeave(r.id),
        onKeyDown: (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggle(r.id); } },
        tabIndex: 0, role: "button", "aria-label": label, "aria-pressed": pressed, style: { cursor: "pointer", outline: "none" },
      }
    : {};
  const fillSel = `url(#${ids.pearl})`;
  const isSel = state === "selected", isHover = state === "hover";
  if (r.stroke) {
    return (
      <g clipPath={clip}>
        <path d={r.d} fill="none" stroke="rgba(0,0,0,.55)" strokeWidth={r.stroke + 3} />
        <path d={r.d} fill="none" stroke={`url(#${ids.paint})`} strokeWidth={r.stroke} pointerEvents={interactive ? "stroke" : "none"} {...common} />
        <motion.path d={r.d} fill="none" pointerEvents="none" strokeWidth={r.stroke}
          stroke={isSel ? fillSel : "#ffffff"} initial={false}
          animate={{ opacity: isSel ? 0.62 : isHover ? 0.2 : 0 }} transition={{ duration: 0.25 }}
          filter={isSel ? `url(#${ids.glow})` : undefined} />
      </g>
    );
  }
  return (
    <g clipPath={clip}>
      <path d={r.d} fill={`url(#${ids.paint})`} stroke="rgba(0,0,0,.6)" strokeWidth="1.6" strokeLinejoin="round" {...common} />
      <motion.path d={r.d} pointerEvents="none" fill={isSel ? fillSel : "#ffffff"} initial={false}
        animate={{ opacity: isSel ? 0.68 : isHover ? 0.18 : 0 }} transition={{ duration: 0.25 }}
        filter={isSel ? `url(#${ids.glow})` : undefined} />
      <motion.path d={r.d} pointerEvents="none" fill="none" stroke={isSel ? "#D8FAFF" : "#ffffff"} strokeWidth={isSel ? 2 : 1.4}
        initial={false} animate={{ opacity: isSel ? 0.95 : isHover ? 0.55 : 0 }} transition={{ duration: 0.25 }} />
    </g>
  );
}

function Decal({ d, ids }) {
  const clip = `url(#${ids.clip})`;
  switch (d.kind) {
    case "glassStrip":
      return <path d={d.d} fill="none" stroke={`url(#${ids.glass})`} strokeWidth={d.stroke} clipPath={clip} pointerEvents="none" />;
    case "window":
    case "sideglass":
      return (
        <g pointerEvents="none" clipPath={clip}>
          <path d={d.d} fill={`url(#${ids.glass})`} stroke="#05070A" strokeWidth="1.2" />
          <path d={d.d} fill={`url(#${ids.glassShine})`} />
        </g>
      );
    case "windscreen":
      return (
        <g pointerEvents={d.block ? "all" : "none"} clipPath={clip}>
          <path d={d.d} fill={`url(#${ids.glass})`} stroke="#05070A" strokeWidth="1.4" />
          <path d={d.d} fill={`url(#${ids.glassShine})`} />
        </g>
      );
    case "stalk":
      return <path d={d.d} fill="#0A0C0F" pointerEvents="none" />;
    case "pillar":
      return <path d={d.d} fill="#07090C" clipPath={clip} pointerEvents="none" />;
    case "light":
      return <path d={d.d} fill={`url(#${d.tone === "tail" ? ids.tail : ids.head})`} stroke="#05070A" strokeWidth="1" clipPath={clip} pointerEvents="none" />;
    case "drl":
      return <path d={d.d} fill="#F4FCFF" clipPath={clip} pointerEvents="none" style={{ filter: "drop-shadow(0 0 3px rgba(143,227,240,.9))" }} />;
    case "drlTail":
      return <path d={d.d} fill="#FF4D4D" opacity=".9" clipPath={clip} pointerEvents="none" style={{ filter: "drop-shadow(0 0 3px rgba(255,60,60,.8))" }} />;
    case "fog":
      return <path d={d.d} fill="#2E353D" stroke="#05070A" clipPath={clip} pointerEvents="none" />;
    case "grille":
    case "trim":
    case "louvre":
      return <path d={d.d} fill="#0A0C0F" stroke="rgba(255,255,255,.06)" clipPath={clip} pointerEvents="none" />;
    case "handle":
      return <path d={d.d} fill="rgba(0,0,0,.45)" stroke="rgba(255,255,255,.18)" strokeWidth=".8" clipPath={clip} pointerEvents="none" />;
    case "crease":
      return <path d={d.d} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="1.2" clipPath={clip} pointerEvents="none" />;
    default:
      return null;
  }
}

function Plate({ box, text }) {
  const [[x, y], w, h] = box;
  return (
    <g pointerEvents="none">
      <rect x={x} y={y} width={w} height={h} rx={h * 0.12} fill="#F4F5F2" stroke="#1C1F24" strokeWidth="1" />
      <rect x={x} y={y} width={w * 0.1} height={h} rx={h * 0.12} fill="#1F3F96" />
      <rect x={x + w * 0.93} y={y} width={w * 0.07} height={h} fill="#E6B800" />
      {text && (
        <text x={x + w * 0.52} y={y + h * 0.76} textAnchor="middle" fontFamily="Saira, sans-serif" fontWeight="700" fontSize={h * 0.74} fill="#111" letterSpacing={h * 0.04}>
          {text}
        </text>
      )}
    </g>
  );
}

/*
  One view of the vehicle. Interactive when handlers are given.
  state(id) → "selected" | "hover" | undefined
*/
export default function CarSVG({
  type = "hatch", view = "right", color = "#8B9096", plate,
  interactive = false, stateOf = () => undefined, onEnter, onMove, onLeave, onToggle, labelOf = (id) => id,
  sweep = false, className, title,
}) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ids = useMemo(() => Object.fromEntries(["clip", "paint", "pearl", "glow", "glass", "glassShine", "head", "tail", "rim", "spoke", "shadow", "sweep"].map((k) => [k, `${k}-${raw}`])), [raw]);
  const g = useMemo(() => buildView(type, view), [type, view]);
  const [vx, vy, vw, vh] = g.vb;
  const dark = luminance(color) < 0.18;
  const stops = g.top
    ? [[0, darken(color, 0.35)], [0.22, color], [0.5, lighten(color, dark ? 0.3 : 0.22)], [0.78, color], [1, darken(color, 0.35)]]
    : [[0, lighten(color, dark ? 0.42 : 0.36)], [0.3, lighten(color, dark ? 0.18 : 0.1)], [0.47, color], [0.505, lighten(color, dark ? 0.32 : 0.24)], [0.54, darken(color, 0.06)], [0.8, darken(color, 0.34)], [1, darken(color, 0.56)]];
  const transform = g.mirrored ? `translate(${vw} 0) scale(-1 1)` : undefined;
  const outside = g.regions.filter((r) => r.outside), inside = g.regions.filter((r) => !r.outside);

  return (
    <svg viewBox={`${vx} ${vy} ${vw} ${vh}`} className={className} role={interactive ? "group" : "img"} aria-label={title}>
      <defs>
        <clipPath id={ids.clip}><path d={g.body} /></clipPath>
        <linearGradient id={ids.paint} gradientUnits="userSpaceOnUse" x1="0" y1={g.paintBox[0]} x2="0" y2={g.paintBox[1]}>
          {stops.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}
        </linearGradient>
        <linearGradient id={ids.pearl} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={PEARL_A} /><stop offset="1" stopColor={PEARL_B} />
        </linearGradient>
        <filter id={ids.glow} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id={ids.glass} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4A5768" /><stop offset=".45" stopColor="#1A222C" /><stop offset="1" stopColor="#080B0F" />
        </linearGradient>
        <linearGradient id={ids.glassShine} x1="0" y1="0" x2="1" y2="1">
          <stop offset=".28" stopColor="#fff" stopOpacity="0" /><stop offset=".36" stopColor="#fff" stopOpacity=".14" />
          <stop offset=".46" stopColor="#fff" stopOpacity="0" /><stop offset=".55" stopColor="#fff" stopOpacity=".06" /><stop offset=".6" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={ids.head} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2F6FA" /><stop offset=".55" stopColor="#AEB8C3" /><stop offset="1" stopColor="#5B6570" />
        </linearGradient>
        <linearGradient id={ids.tail} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF5A57" /><stop offset=".6" stopColor="#B3141A" /><stop offset="1" stopColor="#5E070B" />
        </linearGradient>
        <radialGradient id={ids.rim} cx=".5" cy=".4" r=".6">
          <stop offset="0" stopColor="#2C333B" /><stop offset="1" stopColor="#0E1115" />
        </radialGradient>
        <linearGradient id={ids.spoke} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E7ECF1" /><stop offset="1" stopColor="#7D8792" />
        </linearGradient>
        <radialGradient id={ids.shadow} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#000" stopOpacity=".75" /><stop offset=".6" stopColor="#000" stopOpacity=".35" /><stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={ids.sweep} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".28" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <ellipse cx={g.shadow.cx} cy={g.shadow.cy} rx={g.shadow.rx} ry={g.shadow.ry} fill={`url(#${ids.shadow})`} />
      <g transform={transform}>
        {g.wheels?.map((w, i) => <circle key={"a" + i} cx={w.c[0]} cy={w.c[1]} r={w.arch} fill="#050608" />)}
        {g.tyres?.map((d, i) => <path key={"t" + i} d={d} fill="#0B0D10" stroke="#20252C" />)}
        <path d={g.body} fill={`url(#${ids.paint})`} />
        {inside.map((r) => (
          <Panel key={r.id} r={r} ids={ids} state={stateOf(r.id)} interactive={interactive}
            onEnter={onEnter} onMove={onMove} onLeave={onLeave} onToggle={onToggle} label={labelOf(r.id)} pressed={stateOf(r.id) === "selected"} />
        ))}
        {g.decals.map((d, i) => (d.kind === "plate" ? null : <Decal key={i} d={d} ids={ids} />))}
        {g.wheels?.map((w, i) => <Wheel key={"w" + i} c={w.c} r={w.r} ids={ids} />)}
        <path d={g.body} fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="1.2" pointerEvents="none" />
        {sweep && (
          <g clipPath={`url(#${ids.clip})`} pointerEvents="none" style={{ mixBlendMode: "screen" }}>
            <motion.rect y={vy} height={vh} width={vw * 0.22} fill={`url(#${ids.sweep})`}
              initial={{ x: -vw * 0.3 }} animate={{ x: vw * 1.1 }}
              transition={{ duration: 3.2, ease: [0.45, 0, 0.2, 1], repeat: Infinity, repeatDelay: 2.6 }} />
          </g>
        )}
        {outside.map((r) => (
          <Panel key={r.id} r={r} ids={ids} state={stateOf(r.id)} interactive={interactive}
            onEnter={onEnter} onMove={onMove} onLeave={onLeave} onToggle={onToggle} label={labelOf(r.id)} pressed={stateOf(r.id) === "selected"} />
        ))}
      </g>
      {g.decals.filter((d) => d.kind === "plate").map((d, i) => <Plate key={"p" + i} box={d.box} text={plate} />)}
    </svg>
  );
}
