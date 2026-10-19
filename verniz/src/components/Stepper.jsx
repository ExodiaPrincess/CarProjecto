import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useI18n } from "../i18n.jsx";
import { cx } from "../lib/util.js";

/* current: 0 plate · 1 vehicle · 2 panels & estimate · 3 request */
export default function Stepper({ current, onGo }) {
  const { t } = useI18n();
  const n = t.steps.length;
  return (
    <div className="wrap pt-6">
      <ol className="relative grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
        <div className="absolute left-0 right-0 top-[15px] h-px bg-white/10" aria-hidden="true" />
        <motion.div className="absolute left-0 top-[15px] h-px bg-gradient-to-r from-pearl-300 to-lilac-400" aria-hidden="true"
          initial={false} animate={{ width: `${(Math.min(current, n - 1) / (n - 1)) * 100}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
        {t.steps.map((label, i) => {
          const done = i < current, active = i === current;
          const can = done && onGo;
          return (
            <li key={label} className={cx("relative flex flex-col", i === 0 ? "items-start" : i === n - 1 ? "items-end" : "items-center")}>
              <button type="button" disabled={!can} onClick={() => can && onGo(i)} aria-current={active ? "step" : undefined}
                className={cx("group flex flex-col gap-2", i === 0 ? "items-start" : i === n - 1 ? "items-end" : "items-center", can && "cursor-pointer")}>
                <span className={cx("relative grid h-[31px] w-[31px] place-items-center rounded-full border text-[12px] font-semibold transition-colors duration-500",
                  done ? "border-transparent bg-pearl-400 text-ink-950" : active ? "border-pearl-400 bg-ink-950 text-pearl-300" : "border-white/15 bg-ink-950 text-fog-500")}>
                  {done ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" /> : i + 1}
                  {active && <motion.span layoutId="step-glow" className="absolute inset-[-5px] rounded-full ring-1 ring-pearl-400/40" />}
                </span>
                <span className={cx("hidden text-[12.5px] sm:block", active ? "text-fog-50" : done ? "text-fog-300 group-hover:text-fog-50" : "text-fog-500")}>{label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
