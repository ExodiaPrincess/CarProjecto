import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gauge, Layers, Receipt, Send, Pipette, Fan, ShieldCheck } from "lucide-react";
import { useI18n } from "../i18n.jsx";
import { DEMO_VEHICLES, DEMO_PLATES } from "../data/vehicles.js";
import CarSVG from "../car/CarSVG.jsx";
import PlateInput, { fillPlate } from "./PlateInput.jsx";
import { Eyebrow, Reveal, ease, reducedMotion, MiniPlate } from "./ui.jsx";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } };
const rise = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } };

function HeroCar() {
  const { t, lang } = useI18n();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reducedMotion()) return;
    const h = setInterval(() => setI((n) => (n + 1) % DEMO_PLATES.length), 5200);
    return () => clearInterval(h);
  }, []);
  const plate = DEMO_PLATES[i];
  const v = DEMO_VEHICLES[plate];
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-[-10%] bottom-[8%] top-[18%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(143,227,240,.16),transparent)] blur-2xl" />
      <div className="floor-grid pointer-events-none absolute inset-x-0 bottom-0 h-[55%] [transform:perspective(600px)_rotateX(58deg)] [transform-origin:bottom]" />
      <div className="relative aspect-[1000/440] w-full">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={plate} className="absolute inset-0"
            initial={{ opacity: 0, x: 90, filter: "blur(10px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }} exit={{ opacity: 0, x: -90, filter: "blur(10px)" }}
            transition={{ duration: 1.1, ease }}>
            <CarSVG type={v.bodyType} view="right" color={v.color.hex} sweep className="h-full w-full drop-shadow-[0_30px_40px_rgba(0,0,0,.6)]" title={t.heroCaption} />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="relative mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13px] text-fog-300">
        <AnimatePresence mode="wait">
          <motion.div key={plate} className="flex items-center gap-3" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.4 }}>
            <MiniPlate plate={plate} />
            <span><span className="text-fog-100">{v.make} {v.model}</span> · {v.color.name[lang]}</span>
            <button onClick={() => fillPlate("hero-plate", plate)} className="rounded-full px-2 py-1 text-pearl-300 underline decoration-pearl-400/40 underline-offset-4 transition-colors hover:text-pearl-200">
              {lang === "pt" ? "Usar esta" : "Use this"}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Landing({ onSearch, loading, error }) {
  const { t } = useI18n();
  const howIcons = [Gauge, Layers, Receipt, Send];
  const atIcons = [Pipette, Fan, ShieldCheck];
  return (
    <div>
      <section id="hero" className="studio grain relative overflow-hidden">
        <div className="wrap relative grid items-center gap-10 pb-14 pt-10 md:pb-20 md:pt-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-6">
          <motion.div variants={stagger} initial="hidden" animate="show" className="relative z-10 min-w-0">
            <motion.div variants={rise}><Eyebrow>{t.heroEyebrow}</Eyebrow></motion.div>
            <motion.h1 variants={rise} className="mt-5 font-display text-[44px] font-light leading-[1.02] tracking-[-.02em] text-fog-50 sm:text-[60px] lg:text-[68px]">
              {t.heroTitle1}<br /><span className="pearl-text font-normal">{t.heroTitle2}</span>
            </motion.h1>
            <motion.p variants={rise} className="mt-6 max-w-[46ch] text-[16.5px] leading-relaxed text-fog-300">{t.heroLede}</motion.p>
            <motion.div variants={rise} className="mt-9 max-w-[560px]" id="quote">
              <PlateInput id="hero-plate" onSearch={onSearch} loading={loading} error={error} />
            </motion.div>
            <motion.div variants={rise} className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px] text-fog-400">
              <span>{t.tryDemo}</span>
              {DEMO_PLATES.slice(0, 5).map((p) => (
                <button key={p} type="button" disabled={loading} onClick={() => fillPlate("hero-plate", p)}
                  className="rounded-md border border-white/10 px-2 py-1 font-display text-[12.5px] tracking-[.08em] text-fog-200 transition-colors hover:border-pearl-400/50 hover:text-pearl-200 disabled:opacity-40">
                  {p}
                </button>
              ))}
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease, delay: 0.25 }} className="relative min-w-0 lg:-mr-10">
            <HeroCar />
          </motion.div>
        </div>
      </section>

      <section id="how" className="relative border-t border-white/[.06] bg-ink-950">
        <div className="wrap py-20 md:py-28">
          <Reveal><Eyebrow>{t.navHow}</Eyebrow></Reveal>
          <Reveal delay={0.05}><h2 className="mt-4 max-w-[22ch] font-display text-[32px] font-light leading-tight tracking-[-.01em] text-fog-50 md:text-[42px]">{t.howTitle}</h2></Reveal>
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.how.map(([title, body], i) => {
              const Icon = howIcons[i];
              return (
                <Reveal key={title} delay={0.08 * i}>
                  <li className="group glass relative h-full rounded-2xl p-6 transition-colors hover:border-white/15">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[13px] tracking-[.2em] text-fog-500">0{i + 1}</span>
                      <Icon className="h-5 w-5 text-pearl-400 transition-transform duration-500 group-hover:-translate-y-0.5" aria-hidden="true" />
                    </div>
                    <h3 className="mt-8 font-display text-[22px] font-normal text-fog-50">{title}</h3>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-fog-400">{body}</p>
                  </li>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </section>

      <section id="atelier" className="relative overflow-hidden border-t border-white/[.06]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_85%_10%,rgba(185,168,255,.08),transparent_70%)]" />
        <div className="wrap relative grid gap-12 py-20 md:py-28 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
          <div>
            <Reveal><Eyebrow>{t.navAtelier}</Eyebrow></Reveal>
            <Reveal delay={0.05}><h2 className="mt-4 font-display text-[32px] font-light leading-tight tracking-[-.01em] text-fog-50 md:text-[42px]">{t.atelierTitle}</h2></Reveal>
          </div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[.07] bg-white/[.06] md:grid-cols-3">
            {t.atelier.map(([title, body], i) => {
              const Icon = atIcons[i];
              return (
                <Reveal key={title} delay={0.08 * i} className="bg-ink-900">
                  <div className="h-full p-7">
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[.03]"><Icon className="h-[18px] w-[18px] text-pearl-300" aria-hidden="true" /></span>
                    <h3 className="mt-6 font-display text-[19px] font-normal text-fog-50">{title}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-fog-400">{body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[.06]">
        <div className="wrap flex flex-col gap-3 py-8 text-[12.5px] text-fog-500 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-wide tracking-[.3em] text-fog-400">VERNIZ</span>
          <span>{t.footerNote}</span>
        </div>
      </footer>
    </div>
  );
}
