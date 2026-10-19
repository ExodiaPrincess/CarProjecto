import React, { useEffect, useRef } from "react";
import { motion, animate } from "framer-motion";
import { cx } from "../lib/util.js";

export const ease = [0.22, 1, 0.36, 1];
export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function Logo({ className, onClick }) {
  return (
    <button type="button" onClick={onClick} className={cx("group flex items-center gap-3 rounded-lg", className)} aria-label="Verniz">
      <span className="relative grid h-8 w-8 place-items-center rounded-[9px] border border-white/10 bg-gradient-to-br from-white/10 to-white/[.02]">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
          <defs><linearGradient id="lg-logo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#D4F7FB" /><stop offset=".5" stopColor="#8FE3F0" /><stop offset="1" stopColor="#B9A8FF" /></linearGradient></defs>
          <path d="M3 6.5 L12 19 L21 6.5" fill="none" stroke="url(#lg-logo)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7.5 6.5 L12 12.8 L16.5 6.5" fill="none" stroke="url(#lg-logo)" strokeOpacity=".55" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="font-wide text-[13px] tracking-[.32em] text-fog-50">VERNIZ</span>
    </button>
  );
}

export function Button({ variant = "primary", size = "md", className, children, icon: Icon, iconRight: IconR, loading, ...rest }) {
  const base = "relative inline-flex select-none items-center justify-center gap-2 overflow-hidden rounded-full font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const sizes = { sm: "h-9 px-4 text-[13px]", md: "h-11 px-5 text-[14px]", lg: "h-14 px-7 text-[15px]" };
  const variants = {
    primary: "bg-fog-50 text-ink-950 hover:bg-white",
    pearl: "text-ink-950 bg-gradient-to-r from-pearl-300 via-pearl-400 to-lilac-400",
    ghost: "text-fog-200 hover:text-fog-50 hover:bg-white/[.06]",
    outline: "border border-white/15 text-fog-100 hover:border-white/30 hover:bg-white/[.04]",
  };
  return (
    <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={cx(base, sizes[size], variants[variant], "group", className)} {...rest}>
      {Icon && <Icon className="h-4 w-4" aria-hidden="true" />}
      <span className="relative">{children}</span>
      {IconR && <IconR className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />}
    </motion.button>
  );
}

export const Eyebrow = ({ children, className }) => (
  <p className={cx("font-wide text-[10.5px] uppercase tracking-[.3em] text-fog-400", className)}>{children}</p>
);

export const Badge = ({ children, tone = "pearl", className }) => (
  <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[.12em]",
    tone === "pearl" ? "bg-pearl-400/10 text-pearl-300 ring-1 ring-inset ring-pearl-400/25" : "bg-white/[.06] text-fog-300 ring-1 ring-inset ring-white/10", className)}>
    {children}
  </span>
);

/* Count-up for prices. Writes straight to the DOM so React doesn't re-render per frame. */
export function AnimatedNumber({ value, format = (v) => String(v), className }) {
  const ref = useRef(null);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current;
    prev.current = value;
    if (reducedMotion() || from === value) { if (ref.current) ref.current.textContent = format(value); return; }
    const c = animate(from, value, { duration: 0.7, ease, onUpdate: (v) => { if (ref.current) ref.current.textContent = format(Math.round(v)); } });
    return () => c.stop();
  }, [value]); // eslint-disable-line
  return <span ref={ref} className={cx("tnum", className)}>{format(value)}</span>;
}

export const Reveal = ({ children, delay = 0, className, y = 18 }) => (
  <motion.div className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, ease, delay }}>
    {children}
  </motion.div>
);

export const EUStars = ({ size = 22 }) => (
  <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden="true">
    <g fill="var(--eu-star)">
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return <circle key={i} cx={10 + Math.cos(a) * 7} cy={10 + Math.sin(a) * 7} r="1.05" />;
      })}
    </g>
  </svg>
);

export function MiniPlate({ plate, className }) {
  return (
    <span className={cx("inline-flex h-7 shrink-0 items-stretch overflow-hidden whitespace-nowrap rounded-[5px] bg-[var(--plate)] text-[var(--plate-ink)] shadow-[inset_0_0_0_1.5px_#15181D]", className)}>
      <span className="flex w-5 flex-col items-center justify-center bg-[var(--eu)] text-[8px] font-semibold text-white"><EUStars size={10} />P</span>
      <span className="flex items-center px-2 font-display text-[14px] font-semibold tracking-[.08em]">{plate}</span>
      <span className="w-2 bg-[var(--plate-band)]" />
    </span>
  );
}
