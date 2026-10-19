import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { ArrowRight, Loader2, ScanLine } from "lucide-react";
import { useI18n } from "../i18n.jsx";
import { formatPlate, isPlate, cx } from "../lib/util.js";
import { EUStars, ease } from "./ui.jsx";

/* European-style plate field with validation, an animated search button and a scanning state. */
export default function PlateInput({ onSearch, loading, error, autoFocus, size = "lg", id = "plate" }) {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  const [localErr, setLocalErr] = useState("");
  const [step, setStep] = useState(0);
  const shake = useAnimationControls();

  useEffect(() => {
    if (!loading) { setStep(0); return; }
    const a = setTimeout(() => setStep(1), 520), b = setTimeout(() => setStep(2), 1050);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [loading]);

  useEffect(() => { if (error) shake.start({ x: [0, -8, 7, -5, 3, 0], transition: { duration: 0.42 } }); }, [error, shake]);

  const submit = (e) => {
    e.preventDefault();
    const p = formatPlate(value);
    if (!isPlate(p)) { setLocalErr(t.plateInvalid); shake.start({ x: [0, -8, 7, -5, 3, 0], transition: { duration: 0.42 } }); return; }
    setLocalErr("");
    onSearch(p);
  };
  // allow parents to fill the field (demo chips)
  useEffect(() => {
    const h = (e) => { if (e.detail?.target === id) { setValue(e.detail.plate); setLocalErr(""); onSearch(e.detail.plate); } };
    window.addEventListener("verniz:plate", h);
    return () => window.removeEventListener("verniz:plate", h);
  }, [id, onSearch]);

  const msg = localErr || error;
  const scans = [t.scan1, t.scan2, t.scan3];
  const tall = size === "lg" ? "h-[76px] sm:h-[84px]" : "h-16";

  return (
    <form onSubmit={submit} noValidate className="w-full" aria-busy={loading}>
      <label htmlFor={id} className="sr-only">{t.plateLabel}</label>
      <motion.div animate={shake} className="flex w-full flex-col gap-3 sm:flex-row">
        <div className={cx("plate relative w-full min-w-0 sm:w-auto sm:flex-1", tall, msg && "ring-2 ring-bad/70")}>
          <span className="eu"><EUStars />P</span>
          <input id={id} name={id} value={value} disabled={loading} inputMode="text" maxLength={8} autoComplete="off" spellCheck="false" autoCapitalize="characters"
            placeholder={t.platePh} autoFocus={autoFocus} aria-invalid={!!msg} aria-describedby={msg ? id + "-err" : undefined}
            onChange={(e) => { setValue(formatPlate(e.target.value)); if (localErr) setLocalErr(""); }} />
          <span className="band" />
          <AnimatePresence>
            {loading && (
              <motion.span key="scan" className="pointer-events-none absolute inset-y-0 left-[46px] right-[20px] overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <motion.span className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-pearl-400/50 to-transparent mix-blend-multiply"
                  initial={{ x: "-30%" }} animate={{ x: ["-30%", "520%"] }} transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }} />
                <motion.span className="absolute inset-y-2 w-[2px] bg-pearl-500 shadow-[0_0_14px_3px_rgba(94,207,226,.8)]"
                  initial={{ left: "0%" }} animate={{ left: ["0%", "100%"] }} transition={{ duration: 1.1, ease: "easeInOut", repeat: Infinity }} />
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <motion.button type="submit" disabled={loading} whileHover={!loading ? { y: -1 } : undefined} whileTap={!loading ? { scale: 0.97 } : undefined}
          className={cx("group relative inline-flex shrink-0 items-center justify-center gap-3 overflow-hidden rounded-[14px] px-8 text-[15px] font-semibold text-ink-950 sm:min-w-[170px]", tall,
            "bg-gradient-to-r from-pearl-300 via-pearl-400 to-lilac-400 shadow-[0_18px_50px_-18px_rgba(143,227,240,.7)]")}>
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          <AnimatePresence mode="wait" initial={false}>
            {loading ? (
              <motion.span key="l" className="relative flex items-center gap-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />{t.searching}
              </motion.span>
            ) : (
              <motion.span key="s" className="relative flex items-center gap-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                {t.search}<ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
      <div className="mt-3 min-h-[22px]" aria-live="polite">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.p key={"s" + step} className="flex items-center gap-2 text-[13px] text-pearl-300" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25, ease }}>
              <ScanLine className="h-4 w-4" aria-hidden="true" />{scans[step]}…
            </motion.p>
          ) : msg ? (
            <motion.p key="e" id={id + "-err"} className="text-[13px] text-bad" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{msg}</motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </form>
  );
}

export const fillPlate = (target, plate) => window.dispatchEvent(new CustomEvent("verniz:plate", { detail: { target, plate } }));
