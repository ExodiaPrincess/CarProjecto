import React from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ArrowRight, Info, Layers, X } from "lucide-react";
import { useI18n, panelName } from "../i18n.jsx";
import { bodyMeta } from "../car/panels.js";
import { eur, cx } from "../lib/util.js";
import { AnimatedNumber, Badge, Button, MiniPlate, ease } from "./ui.jsx";
import { MULTI } from "../data/pricing.js";

const SERVICES = ["paint", "scratch", "dent"];
const FINISHES = ["solid", "metallic", "pearl"];

function Segmented({ value, options, onChange, label, size = "sm", layoutId }) {
  return (
    <div role="radiogroup" aria-label={label} className={cx("inline-flex rounded-full border border-white/10 bg-ink-950/50 p-0.5", size === "md" && "w-full")}>
      {options.map(([k, text]) => (
        <button key={k} type="button" role="radio" aria-checked={value === k} onClick={() => onChange(k)}
          className={cx("relative rounded-full transition-colors", size === "md" ? "h-9 flex-1 px-3 text-[13px]" : "h-7 px-2.5 text-[11.5px]", value === k ? "text-ink-950" : "text-fog-400 hover:text-fog-100")}>
          {value === k && <motion.span layoutId={layoutId} className="absolute inset-0 rounded-full bg-gradient-to-r from-pearl-300 to-pearl-400" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
          <span className="relative">{text}</span>
        </button>
      ))}
    </div>
  );
}

export default function QuotePanel({ vehicle, selection, est, setService, remove, reset, finish, setFinish, onRequest, compact }) {
  const { t, lang } = useI18n();
  const meta = bodyMeta(vehicle.bodyType);
  const fmt = (v) => eur(v, lang);
  const x = (n) => "×" + n.toLocaleString(lang === "pt" ? "pt-PT" : "en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const lines = est.lines;

  return (
    <div className="glass flex flex-col rounded-[24px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-[22px] font-normal text-fog-50">{t.estimate}</h2>
          <p className="mt-1 flex items-center gap-2 text-[12.5px] text-fog-400"><MiniPlate plate={vehicle.plate} className="h-6 scale-90 origin-left" /><span className="truncate">{vehicle.make} {vehicle.model}</span></p>
        </div>
        <Badge className="shrink-0">{t.estimateBadge}</Badge>
      </div>

      <div className="mt-5 border-t border-white/[.07]">
        <LayoutGroup id="quote-lines">
          <motion.ul layout className="divide-y divide-white/[.06]">
            <AnimatePresence initial={false}>
              {lines.map((l) => (
                <motion.li key={l.id} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35, ease }} className="overflow-hidden">
                  <div className="flex items-start gap-3 py-3.5">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-pearl-300 to-lilac-400 shadow-[0_0_10px_rgba(143,227,240,.8)]" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-[14px] text-fog-50">{panelName(lang, l.id, meta)}</p>
                        <AnimatedNumber value={l.price} format={fmt} className="shrink-0 text-[14px] text-fog-100" />
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <Segmented value={l.service} onChange={(s) => setService(l.id, s)} label={panelName(lang, l.id, meta)} layoutId={"svc-" + l.id}
                          options={SERVICES.map((s) => [s, t.services[s]])} />
                        <button type="button" onClick={() => remove(l.id)} aria-label={`${t.remove}: ${panelName(lang, l.id, meta)}`}
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-fog-500 transition-colors hover:bg-white/[.06] hover:text-fog-50"><X className="h-4 w-4" /></button>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        </LayoutGroup>
        <AnimatePresence initial={false}>
          {lines.length === 0 && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-4 py-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-dashed border-white/15"><Layers className="h-5 w-5 text-fog-400" aria-hidden="true" /></span>
              <div><p className="text-[14px] text-fog-100">{t.emptyTitle}</p><p className="text-[13px] text-fog-400">{t.emptyLede}</p></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!compact && (
        <div className="mt-2 border-t border-white/[.07] pt-4">
          <p className="mb-2 text-[12px] uppercase tracking-[.14em] text-fog-500">{t.paintFinish}</p>
          <Segmented size="md" value={finish} onChange={setFinish} label={t.paintFinish} layoutId="finish" options={FINISHES.map((f) => [f, t.finishes[f]])} />
        </div>
      )}

      <dl className="mt-4 space-y-1.5 text-[12.5px] text-fog-400">
        <div className="flex justify-between gap-3"><dt>{t.adjSize} · {t.bodyTypes[vehicle.bodyType]}</dt><dd className="tnum text-fog-200">{x(est.size)}</dd></div>
        {est.tier !== 1 && <div className="flex justify-between gap-3"><dt>{t.adjTier}</dt><dd className="tnum text-fog-200">{x(est.tier)}</dd></div>}
        <div className="flex justify-between gap-3"><dt>{t.adjFinish} · {t.finishes[finish]}</dt><dd className="tnum text-fog-200">{x(est.fin)}</dd></div>
        <AnimatePresence>
          {est.discount > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex justify-between gap-3 text-ok">
              <dt>{t.adjMulti}</dt><dd className="tnum">−<AnimatedNumber value={est.discount} format={fmt} /></dd>
            </motion.div>
          )}
        </AnimatePresence>
      </dl>

      <div className="relative mt-5 overflow-hidden rounded-2xl border border-white/[.08] bg-[linear-gradient(135deg,rgba(143,227,240,.10),rgba(185,168,255,.06)_60%,transparent)] p-5">
        <p className="text-[12px] uppercase tracking-[.16em] text-fog-400">{t.total}</p>
        <div className="mt-1 flex items-baseline gap-3">
          <AnimatedNumber value={est.total} format={fmt} className="font-display text-[44px] font-light leading-none tracking-[-.02em] text-fog-50" />
        </div>
        <p className="mt-2 text-[13px] text-fog-300">
          {t.range}: <AnimatedNumber value={est.low} format={fmt} className="text-fog-100" /> – <AnimatedNumber value={est.high} format={fmt} className="text-fog-100" />
        </p>
        {lines.length > 0 && lines.length < MULTI.minPanels && (
          <p className="mt-1 text-[12px] text-fog-500">{lang === "pt" ? `Mais ${MULTI.minPanels - lines.length} e ganha ${Math.round(MULTI.pct * 100)}% de desconto.` : `${MULTI.minPanels - lines.length} more for ${Math.round(MULTI.pct * 100)}% off.`}</p>
        )}
      </div>

      <p className="mt-4 flex gap-2 text-[12px] leading-relaxed text-fog-500"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />{t.disclaimer}</p>

      <div className="mt-5 flex flex-col gap-2">
        <Button variant="pearl" size="lg" iconRight={ArrowRight} disabled={!lines.length} onClick={onRequest} className="w-full">{t.requestQuote}</Button>
        {lines.length > 0 && <Button variant="ghost" size="md" onClick={reset} className="w-full">{t.reset}</Button>}
      </div>
    </div>
  );
}
