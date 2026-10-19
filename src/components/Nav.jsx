import React from "react";
import { motion } from "framer-motion";
import { useI18n } from "../i18n.jsx";
import { Logo, MiniPlate } from "./ui.jsx";
import { cx } from "../lib/util.js";

export default function Nav({ onHome, onQuote, plate, inFlow }) {
  const { t, lang, setLang } = useI18n();
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  return (
    <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky z-50 border-b border-white/[.06] bg-ink-950/70 backdrop-blur-xl" style={{ top: "env(safe-area-inset-top, 0px)" }}>
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Logo onClick={onHome} />
        {!inFlow && (
          <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
            {[["how", t.navHow], ["atelier", t.navAtelier]].map(([id, label]) => (
              <button key={id} onClick={() => go(id)} className="rounded-full px-4 py-2 text-[13.5px] text-fog-300 transition-colors hover:bg-white/[.05] hover:text-fog-50">{label}</button>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-2">
          {inFlow && plate && <MiniPlate plate={plate} className="hidden sm:inline-flex" />}
          <button onClick={() => setLang(lang === "pt" ? "en" : "pt")} aria-label={lang === "pt" ? "Switch to English" : "Mudar para português"}
            className="h-9 rounded-full border border-white/10 px-3 font-wide text-[10.5px] tracking-[.2em] text-fog-300 transition-colors hover:border-white/25 hover:text-fog-50">
            {t.lang}
          </button>
          {!inFlow && (
            <button onClick={onQuote} className={cx("hidden h-9 rounded-full bg-fog-50 px-4 text-[13px] font-medium text-ink-950 transition-colors hover:bg-white sm:inline-flex sm:items-center")}>
              {t.navQuote}
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
