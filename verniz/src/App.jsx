import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useI18n } from "./i18n.jsx";
import { lookupVehicle } from "./services/vehicleLookup.js";
import { computeEstimate } from "./data/pricing.js";
import { panelsFor, bodyMeta } from "./car/panels.js";
import { isPlate, formatPlate, eur } from "./lib/util.js";
import Nav from "./components/Nav.jsx";
import Landing from "./components/Landing.jsx";
import Stepper from "./components/Stepper.jsx";
import { VehicleCard, ManualVehicle } from "./components/VehicleStep.jsx";
import CarDiagram, { defaultView } from "./car/CarDiagram.jsx";
import QuotePanel from "./components/QuotePanel.jsx";
import RequestStep from "./components/RequestStep.jsx";
import Confirmation from "./components/Confirmation.jsx";
import PlateInput from "./components/PlateInput.jsx";
import { AnimatedNumber, Button, ease } from "./components/ui.jsx";

const STAGE_INDEX = { landing: 0, vehicle: 1, configure: 2, request: 3, done: 4 };

export default function App() {
  const { t, lang } = useI18n();
  const [stage, setStage] = useState("landing");
  const [plate, setPlate] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selection, setSelection] = useState(() => new Map());
  const [finish, setFinish] = useState("metallic");
  const [view, setView] = useState(defaultView);
  const [contact, setContact] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [stage]);

  const search = useCallback(async (p) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true); setError("");
    try {
      const v = await lookupVehicle(p, { signal: ctrl.signal });
      setPlate(p);
      if (v) { setVehicle(v); setNotFound(false); setFinish(v.color.finish || "metallic"); }
      else { setVehicle(null); setNotFound(true); }
      setSelection(new Map()); setView(defaultView());
      setStage("vehicle");
    } catch (e) {
      if (e.name !== "AbortError") setError(t.lookupError);
    } finally {
      if (abortRef.current === ctrl) setLoading(false);
    }
  }, [t]);

  // a link ending in a plate (…#73-SX-98) opens that car directly
  useEffect(() => {
    const p = formatPlate(decodeURIComponent(location.hash.slice(1)));
    if (isPlate(p)) search(p);
  }, []); // eslint-disable-line

  const meta = vehicle ? bodyMeta(vehicle.bodyType) : { doors: 4 };
  const selArray = useMemo(() => {
    if (!vehicle) return [];
    const order = panelsFor(vehicle.bodyType).map((p) => p.id);
    return [...selection.entries()].map(([id, service]) => ({ id, service })).sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
  }, [selection, vehicle]);
  const est = useMemo(() => computeEstimate(selArray, vehicle, finish, meta.doors), [selArray, vehicle, finish, meta.doors]);
  const priceOf = useCallback((id) => computeEstimate([{ id, service: selection.get(id) || "paint" }], vehicle, finish, meta.doors).lines[0].price, [selection, vehicle, finish, meta.doors]);

  const toggle = (id) => setSelection((m) => { const n = new Map(m); if (n.has(id)) n.delete(id); else n.set(id, "paint"); return n; });
  const setService = (id, s) => setSelection((m) => { const n = new Map(m); n.set(id, s); return n; });
  const remove = (id) => setSelection((m) => { const n = new Map(m); n.delete(id); return n; });
  const reset = () => setSelection(new Map());
  const goHome = () => { abortRef.current?.abort(); setLoading(false); setStage("landing"); };
  const restart = () => { setSelection(new Map()); setContact(null); setVehicle(null); setStage("landing"); };

  const stepIndex = STAGE_INDEX[stage];
  const goStep = (i) => { if (i === 0) goHome(); if (i === 1) setStage("vehicle"); if (i === 2 && vehicle) setStage("configure"); };

  return (
    <div className="min-h-full">
      <Nav onHome={goHome} onQuote={() => document.getElementById("hero-plate")?.focus()} plate={stage !== "landing" ? plate : null} inFlow={stage !== "landing"} />
      <AnimatePresence mode="wait">
        {stage === "landing" ? (
          <motion.main key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -12, filter: "blur(6px)" }} transition={{ duration: 0.45, ease }}>
            <Landing onSearch={search} loading={loading} error={error} />
          </motion.main>
        ) : (
          <motion.main key="flow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="studio relative min-h-[calc(100vh-64px)] pb-28 lg:pb-16">
            {stage !== "done" && <Stepper current={stepIndex} onGo={goStep} />}
            <AnimatePresence mode="wait">
              <motion.section key={stage} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16, filter: "blur(6px)" }} transition={{ duration: 0.55, ease }}
                className="wrap pt-8 md:pt-10">
                {stage === "vehicle" && (vehicle && !notFound ? (
                  <VehicleCard vehicle={vehicle} onConfirm={() => setStage("configure")} onBack={goHome} />
                ) : (
                  <ManualVehicle plate={plate} onConfirm={(v) => { setVehicle(v); setNotFound(false); setFinish(v.color.finish); setStage("configure"); }} onBack={goHome} />
                ))}

                {stage === "configure" && vehicle && (
                  <div>
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div>
                        <h1 className="font-display text-[30px] font-light leading-tight tracking-[-.01em] text-fog-50 sm:text-[38px]">{t.chooseTitle}</h1>
                        <p className="mt-1 text-[14px] text-fog-400 md:hidden">{t.chooseLede}</p>
                      </div>
                      <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => setStage("vehicle")}>{t.back}</Button>
                    </div>
                    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,8fr)_minmax(340px,4fr)] lg:gap-8">
                      <CarDiagram vehicle={vehicle} selection={selection} onToggle={toggle} priceOf={priceOf} view={view} setView={setView} onReset={reset} />
                      <div id="quote-panel" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
                        <QuotePanel vehicle={vehicle} selection={selection} est={est} setService={setService} remove={remove} reset={reset}
                          finish={finish} setFinish={setFinish} onRequest={() => setStage("request")} />
                      </div>
                    </div>
                    {/* phone: running total */}
                    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/85 backdrop-blur-xl lg:hidden"
                      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)", paddingLeft: "max(16px, env(safe-area-inset-left, 0px))", paddingRight: "max(16px, env(safe-area-inset-right, 0px))" }}>
                      <div className="flex items-center justify-between gap-3 py-3">
                        <button onClick={() => document.getElementById("quote-panel")?.scrollIntoView({ behavior: "smooth" })} className="min-w-0 text-left">
                          <span className="block text-[11px] uppercase tracking-[.14em] text-fog-500">{t.total} · {t.panelsCount(selection.size)}</span>
                          <AnimatedNumber value={est.total} format={(v) => eur(v, lang)} className="font-display text-[24px] font-light text-fog-50" />
                        </button>
                        <Button variant="pearl" iconRight={ArrowRight} disabled={!selection.size} onClick={() => setStage("request")}>{t.next}</Button>
                      </div>
                    </div>
                  </div>
                )}

                {stage === "request" && vehicle && (
                  <RequestStep vehicle={vehicle} est={est} onBack={() => setStage("configure")} initial={contact}
                    onSubmitted={(c) => { setContact(c); setStage("done"); }} />
                )}

                {stage === "done" && vehicle && contact && (
                  <div className="pt-6"><Confirmation vehicle={vehicle} est={est} contact={contact} onRestart={restart} onHome={restart} /></div>
                )}
              </motion.section>
            </AnimatePresence>
          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
