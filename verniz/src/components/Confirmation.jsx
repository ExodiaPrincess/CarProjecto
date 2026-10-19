import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Home, RefreshCw } from "lucide-react";
import { useI18n, panelName } from "../i18n.jsx";
import { bodyMeta } from "../car/panels.js";
import { eur } from "../lib/util.js";
import { Button, MiniPlate, ease } from "./ui.jsx";

export default function Confirmation({ vehicle, est, contact, onRestart, onHome }) {
  const { t, lang } = useI18n();
  const meta = bodyMeta(vehicle.bodyType);
  const ref = useMemo(() => {
    const d = new Date();
    return `VZ-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${Math.floor(1000 + Math.random() * 9000)}`;
  }, []);
  return (
    <div className="relative mx-auto max-w-[760px]">
      <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4, ease }}
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(closest-side,rgba(143,227,240,.22),transparent)] blur-2xl" />
      <div className="glass relative rounded-[32px] px-6 py-10 text-center sm:px-12 sm:py-14">
        <motion.svg viewBox="0 0 96 96" className="mx-auto h-24 w-24" initial="hidden" animate="show" aria-hidden="true">
          <defs><linearGradient id="ok-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#D4F7FB" /><stop offset=".5" stopColor="#8FE3F0" /><stop offset="1" stopColor="#B9A8FF" /></linearGradient></defs>
          <motion.circle cx="48" cy="48" r="44" fill="none" stroke="url(#ok-g)" strokeWidth="2.5"
            variants={{ hidden: { pathLength: 0, opacity: 0 }, show: { pathLength: 1, opacity: 1, transition: { duration: 0.9, ease } } }} />
          <motion.path d="M30 49 L43 62 L67 36" fill="none" stroke="url(#ok-g)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
            variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.5, delay: 0.75, ease } } }} />
        </motion.svg>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6, ease }} className="mt-6 font-display text-[36px] font-light text-fog-50 sm:text-[44px]">{t.doneTitle}</motion.h1>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.6, ease }} className="mx-auto mt-3 max-w-[48ch] text-[15.5px] leading-relaxed text-fog-300">{t.doneLede(contact.name.split(" ")[0])}</motion.p>

        <motion.dl initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, duration: 0.6, ease }}
          className="mx-auto mt-8 grid max-w-[560px] gap-px overflow-hidden rounded-2xl border border-white/[.07] bg-white/[.06] text-left sm:grid-cols-3">
          <div className="bg-ink-900 p-4"><dt className="text-[11px] uppercase tracking-[.14em] text-fog-500">{t.reference}</dt><dd className="mt-1 whitespace-nowrap font-display text-[15px] tracking-[.02em] text-fog-50 tnum">{ref}</dd></div>
          <div className="bg-ink-900 p-4"><dt className="text-[11px] uppercase tracking-[.14em] text-fog-500">{t.registration}</dt><dd className="mt-1.5"><MiniPlate plate={vehicle.plate} className="h-6" /></dd></div>
          <div className="bg-ink-900 p-4"><dt className="text-[11px] uppercase tracking-[.14em] text-fog-500">{t.estimatedTotal}</dt><dd className="mt-1 font-display text-[17px] text-fog-50 tnum">{eur(est.total, lang)}</dd></div>
        </motion.dl>
        <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 0.6 }} className="mx-auto mt-5 flex max-w-[560px] flex-wrap justify-center gap-1.5">
          {est.lines.map((l) => <li key={l.id} className="rounded-full border border-white/10 px-3 py-1 text-[12.5px] text-fog-300">{panelName(lang, l.id, meta)} · {t.services[l.service]}</li>)}
        </motion.ul>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.45, duration: 0.6 }} className="mt-9 flex flex-wrap justify-center gap-3">
          <Button variant="primary" size="lg" icon={RefreshCw} onClick={onRestart}>{t.startOver}</Button>
          <Button variant="outline" size="lg" icon={Home} onClick={onHome}>{t.home}</Button>
        </motion.div>
        <p className="mt-6 text-[12px] text-fog-500">{t.prototypeNote}</p>
      </div>
    </div>
  );
}
