import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gauge, Layers, Receipt, Send, Pipette, Fan, ShieldCheck } from "lucide-react";
import { useI18n } from "../i18n.jsx";
import { DEMO_PLATES } from "../data/vehicles.js";
import { HERO_PHOTOS } from "../data/heroPhotos.js";
import PlateInput, { fillPlate } from "./PlateInput.jsx";
import { Eyebrow, Reveal, ease, reducedMotion } from "./ui.jsx";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } };
const rise = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } };

const SLIDE_MS = 6500;

function HeroPhotos() {
  const { t, lang } = useI18n();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const still = reducedMotion();
  useEffect(() => {
    HERO_PHOTOS.slice(1).forEach((p) => { const im = new Image(); im.src = p.src; });
  }, []);
  useEffect(() => {
    if (still || paused) return;
    const h = setTimeout(() => setI((n) => (n + 1) % HERO_PHOTOS.length), SLIDE_MS);
    return () => clearTimeout(h);
  }, [i, paused, still]);
  const p = HERO_PHOTOS[i];
  return (
    <>
      <div className="hero-photo pointer-events-none absolute inset-x-0 top-0 h-[min(50vh,430px)] overflow-hidden lg:inset-y-0 lg:left-auto lg:h-auto lg:w-[64%]" aria-hidden="true">
        <AnimatePresence initial={false}>
          <motion.img key={p.src} src={p.src} alt="" decoding="async" draggable="false"
            className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: p.pos }}
            initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1.02 }} exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.4, ease: "easeInOut" }, scale: { duration: still ? 0 : SLIDE_MS / 1000 + 1.6, ease: "linear" } }} />
        </AnimatePresence>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,8,11,.35),transparent_30%,transparent_60%,rgba(6,8,11,.85))]" />
      </div>
      <div className="absolute bottom-5 right-[max(16px,env(safe-area-inset-right))] z-10 hidden items-center gap-4 sm:flex lg:right-8"
        onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <AnimatePresence mode="wait">
          <motion.p key={p.by + i} className="text-[11.5px] text-fog-400" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.4 }}>
            {t.photoBy}: <span className="text-fog-200">{p.by}</span> / Unsplash
          </motion.p>
        </AnimatePresence>
        <div className="flex items-center gap-1.5">
          {HERO_PHOTOS.map((ph, n) => (
            <button key={ph.src} type="button" onClick={() => setI(n)} aria-label={t.photoN(n + 1)} aria-current={n === i}
              className="group relative h-6 w-9 rounded-full">
              <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/15 transition-colors group-hover:bg-white/30">
                {n === i && (
                  <motion.span key={i + (paused ? "p" : "")} className="absolute inset-y-0 left-0 rounded-full bg-pearl-300"
                    initial={{ width: still || paused ? "100%" : "0%" }} animate={{ width: "100%" }} transition={{ duration: still || paused ? 0 : SLIDE_MS / 1000, ease: "linear" }} />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
      <span className="sr-only" aria-live="off">{p.alt[lang]}</span>
    </>
  );
}

export default function Landing({ onSearch, loading, error }) {
  const { t } = useI18n();
  const howIcons = [Gauge, Layers, Receipt, Send];
  const atIcons = [Pipette, Fan, ShieldCheck];
  return (
    <div>
      <section id="hero" className="studio grain relative overflow-hidden">
        <HeroPhotos />
        <div className="hero-scrim pointer-events-none absolute inset-0" />
        <div className="wrap relative flex lg:min-h-[min(820px,calc(100svh-64px))] items-end pb-16 pt-[min(30vh,260px)] md:pb-20 lg:items-center lg:pt-16">
          <motion.div variants={stagger} initial="hidden" animate="show" className="relative z-10 w-full min-w-0 lg:max-w-[600px]">
            <motion.div variants={rise}><Eyebrow>{t.heroEyebrow}</Eyebrow></motion.div>
            <motion.h1 variants={rise} className="mt-5 font-display text-[44px] font-light leading-[1.02] tracking-[-.02em] text-fog-50 [text-shadow:0_2px_30px_rgba(0,0,0,.5)] sm:text-[60px] lg:text-[68px]">
              {t.heroTitle1}<br /><span className="pearl-text font-normal">{t.heroTitle2}</span>
            </motion.h1>
            <motion.p variants={rise} className="mt-6 max-w-[46ch] text-[16.5px] leading-relaxed text-fog-200">{t.heroLede}</motion.p>
            <motion.div variants={rise} className="mt-9 max-w-[560px]" id="quote">
              <PlateInput id="hero-plate" onSearch={onSearch} loading={loading} error={error} />
            </motion.div>
            <motion.div variants={rise} className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px] text-fog-300">
              <span>{t.tryDemo}</span>
              {DEMO_PLATES.slice(0, 6).map((p) => (
                <button key={p} type="button" disabled={loading} onClick={() => fillPlate("hero-plate", p)}
                  className="rounded-md border border-white/15 bg-ink-950/40 px-2 py-1 font-display text-[12.5px] tracking-[.08em] text-fog-100 backdrop-blur transition-colors hover:border-pearl-400/50 hover:text-pearl-200 disabled:opacity-40">
                  {p}
                </button>
              ))}
            </motion.div>
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
