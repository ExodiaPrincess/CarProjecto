import React, { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ChevronLeft, ChevronRight, MousePointerClick, Check, Plus, RotateCcw, Rotate3d } from "lucide-react";
import CarSVG from "./CarSVG.jsx";
import Car3D, { has3D } from "./Car3D.jsx";
import { panelsFor, bodyMeta, bestViewFor } from "./panels.js";
import { useI18n, panelName } from "../i18n.jsx";
import { eur, cx } from "../lib/util.js";
import { ease } from "../components/ui.jsx";

const ALL_VIEWS = ["3d", "front", "left", "rear", "right", "top"];
export const viewOrder = () => (has3D() ? ALL_VIEWS : ALL_VIEWS.slice(1));
export const defaultView = () => viewOrder()[0];

function ViewTabs({ view, setView, order }) {
  const { t } = useI18n();
  return (
    <LayoutGroup id="views">
      <div role="tablist" aria-label="Vistas" className="inline-flex max-w-full overflow-x-auto rounded-full border border-white/10 bg-ink-950/60 p-1 backdrop-blur">
        {order.map((v) => (
          <button key={v} role="tab" aria-selected={view === v} onClick={() => setView(v)}
            className={cx("relative h-9 shrink-0 rounded-full px-3.5 text-[13px] transition-colors sm:px-4", view === v ? "text-ink-950" : "text-fog-300 hover:text-fog-50")}>
            {view === v && <motion.span layoutId="view-pill" className="absolute inset-0 rounded-full bg-fog-50" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
            <span className="relative flex items-center gap-1.5">{v === "3d" && <Rotate3d className="h-3.5 w-3.5" aria-hidden="true" />}{t.views[v]}</span>
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}

export default function CarDiagram({ vehicle, selection, onToggle, priceOf, view, setView, onReset }) {
  const { t, lang } = useI18n();
  const meta = bodyMeta(vehicle.bodyType);
  const name = useCallback((id) => panelName(lang, id, meta), [lang, meta]);
  const [hover, setHover] = useState(null);
  const [tip, setTip] = useState(null); // {id, x, y}
  const stageRef = useRef(null);
  const dirRef = useRef(1);
  const swipe = useRef(null);
  const panels = useMemo(() => panelsFor(vehicle.bodyType), [vehicle.bodyType]);
  const VIEW_ORDER = useMemo(viewOrder, []);
  const [focus, setFocus] = useState(null);
  const is3d = view === "3d";

  const go = (v) => {
    const a = VIEW_ORDER.indexOf(view), b = VIEW_ORDER.indexOf(v);
    dirRef.current = b >= a ? 1 : -1;
    setView(v);
  };
  const step = (d) => go(VIEW_ORDER[(VIEW_ORDER.indexOf(view) + d + VIEW_ORDER.length) % VIEW_ORDER.length]);

  const place = (id, e, focus) => {
    const box = stageRef.current?.getBoundingClientRect();
    if (!box) return;
    let x, y;
    if (focus || e.clientX == null) {
      const r = e.target.getBoundingClientRect?.();
      x = r ? r.left + r.width / 2 - box.left : box.width / 2;
      y = r ? r.top - box.top : 40;
    } else { x = e.clientX - box.left; y = e.clientY - box.top; }
    setTip({ id, x, y });
  };
  const onEnter = (id, e, focus) => { setHover(id); if (e.pointerType !== "touch") place(id, e, focus); };
  const onMove = (id, e) => { if (e.pointerType !== "touch") place(id, e); };
  const onLeave = (id) => { setHover((h) => (h === id ? null : h)); setTip((tp) => (tp?.id === id ? null : tp)); };
  const toggle = (id) => {
    onToggle(id);
  };
  const stateOf = (id) => (selection.has(id) ? "selected" : hover === id ? "hover" : undefined);

  const groups = ["front", "left", "right", "rear", "top"];
  const dir = dirRef.current;
  const variants = {
    enter: (d) => ({ opacity: 0, x: 70 * d, scale: 0.96, filter: "blur(10px)" }),
    center: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" },
    exit: (d) => ({ opacity: 0, x: -70 * d, scale: 1.02, filter: "blur(10px)" }),
  };

  return (
    <div className="flex min-w-0 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ViewTabs view={view} setView={go} order={VIEW_ORDER} />
        <p className="hidden items-center gap-2 text-[12.5px] text-fog-400 md:flex"><MousePointerClick className="h-4 w-4 text-pearl-400" aria-hidden="true" />{t.chooseLede}</p>
      </div>

      <div ref={stageRef} className="relative mt-4 overflow-hidden rounded-[24px] border border-white/[.06] bg-[radial-gradient(70%_60%_at_50%_62%,rgba(143,227,240,.09),transparent_70%),linear-gradient(180deg,#0D1217,#06080B)]"
        onKeyDown={(e) => { if (e.target === e.currentTarget) { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); } }}
        onTouchStart={(e) => { if (is3d) return; const p = e.touches[0]; swipe.current = { x: p.clientX, y: p.clientY }; }}
        onTouchEnd={(e) => { const s0 = swipe.current, p = e.changedTouches[0]; swipe.current = null; if (!s0) return; const dx = p.clientX - s0.x, dy = p.clientY - s0.y; if (Math.abs(dx) > 60 && Math.abs(dy) < 45) step(dx < 0 ? 1 : -1); }}>
        <div className="floor-grid pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-60 [transform:perspective(520px)_rotateX(60deg)] [transform-origin:bottom]" />
        <div className={cx("relative grid w-full place-items-center px-3 sm:px-8", is3d ? "aspect-[4/3] sm:aspect-[1000/520]" : "aspect-[1000/520]")}>
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            {is3d ? (
              <motion.div key="3d" custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.6, ease }} className="absolute inset-0">
                <Car3D type={vehicle.bodyType} color={vehicle.color.hex} selection={selection} hover={hover} interactive focusId={focus}
                  onToggle={toggle} onEnter={onEnter} onMove={onMove} onLeave={onLeave} label={`${vehicle.make} ${vehicle.model}, 3D`} />
              </motion.div>
            ) : (
            <motion.div key={view} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.6, ease }}
              className={cx("col-start-1 row-start-1 w-full", view === "front" || view === "rear" ? "max-w-[76%] sm:max-w-[70%]" : "max-w-full")}>
              <CarSVG type={vehicle.bodyType} view={view} color={vehicle.color.hex} plate={vehicle.plate} interactive
                stateOf={stateOf} onEnter={onEnter} onMove={onMove} onLeave={onLeave} onToggle={toggle} labelOf={name}
                className="w-full overflow-visible" title={`${vehicle.make} ${vehicle.model}, ${t.views[view]}`} />
            </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button onClick={() => step(-1)} aria-label="Vista anterior" className="absolute left-3 top-1/2 hidden sm:grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-ink-950/60 text-fog-200 backdrop-blur transition hover:border-white/25 hover:text-fog-50"><ChevronLeft className="h-5 w-5" /></button>
        <button onClick={() => step(1)} aria-label="Vista seguinte" className="absolute right-3 top-1/2 hidden sm:grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-ink-950/60 text-fog-200 backdrop-blur transition hover:border-white/25 hover:text-fog-50"><ChevronRight className="h-5 w-5" /></button>

        {is3d
          ? <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-2 text-[12px] text-fog-400"><Rotate3d className="h-4 w-4 text-pearl-400" aria-hidden="true" />{t.drag3dTap}</div>
          : <div className="pointer-events-none absolute bottom-3 left-4 font-wide text-[10px] uppercase tracking-[.3em] text-fog-500">{t.views[view]}</div>}
        <div className="pointer-events-none absolute bottom-3 right-4 text-[12px] text-fog-400 tnum">{t.panelsCount(selection.size)}</div>

        <AnimatePresence>
          {tip && (
            <motion.div key="tip" className="pointer-events-none absolute z-20" style={{ left: 0, top: 0 }}
              initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1, x: tip.x, y: tip.y }} exit={{ opacity: 0, scale: 0.94 }}
              transition={{ opacity: { duration: 0.15 }, scale: { duration: 0.15 }, x: { type: "spring", stiffness: 700, damping: 45 }, y: { type: "spring", stiffness: 700, damping: 45 } }}>
              <div className="-translate-x-1/2 -translate-y-[calc(100%+14px)] whitespace-nowrap rounded-xl border border-white/10 bg-ink-900/90 px-3 py-2 shadow-2xl backdrop-blur-xl">
                <p className="flex items-center gap-2 text-[13px] font-medium text-fog-50">
                  {selection.has(tip.id) && <Check className="h-3.5 w-3.5 text-pearl-300" aria-hidden="true" />}{name(tip.id)}
                </p>
                <p className="mt-0.5 text-[11.5px] text-fog-400">
                  <span className="tnum text-pearl-300">{eur(priceOf(tip.id), lang)}</span> · {selection.has(tip.id) ? t.clickToRemove : t.clickToSelect}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] uppercase tracking-[.16em] text-fog-500">{t.allPanels}</p>
          {selection.size > 0 && (
            <button onClick={onReset} className="flex items-center gap-1.5 text-[12.5px] text-fog-400 transition-colors hover:text-fog-50"><RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />{t.reset}</button>
          )}
        </div>
        <div className="mt-3 grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => (
            <div key={g} className="min-w-0">
              <p className="mb-2 text-[12.5px] text-fog-400">{t.groups[g]}</p>
              <div className="flex flex-wrap gap-1.5">
                {panels.filter((p) => p.group === g).map((p) => {
                  const on = selection.has(p.id);
                  return (
                    <motion.button key={p.id} type="button" whileTap={{ scale: 0.95 }} aria-pressed={on}
                      onClick={() => { onToggle(p.id); if (!on) { if (is3d) setFocus({ id: p.id }); else go(bestViewFor(p.id)); } }}
                      onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)}
                      className={cx("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12.5px] transition-colors",
                        on ? "border-pearl-400/50 bg-pearl-400/[.12] text-pearl-200" : "border-white/10 text-fog-300 hover:border-white/25 hover:text-fog-50")}>
                      {on ? <Check className="h-3 w-3" aria-hidden="true" /> : <Plus className="h-3 w-3 opacity-60" aria-hidden="true" />}
                      {name(p.id)}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
