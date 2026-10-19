import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, Car, Droplet, Fuel, Image as ImageIcon, Rotate3d, SearchX } from "lucide-react";
import { useI18n } from "../i18n.jsx";
import CarSVG from "../car/CarSVG.jsx";
import Car3D, { has3D } from "../car/Car3D.jsx";
import { BODY_TYPE_LIST, PAINT_SWATCHES, tierForMake } from "../data/vehicles.js";
import { Badge, Button, MiniPlate, ease } from "./ui.jsx";
import { cx } from "../lib/util.js";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } } };
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } };

function Stage({ vehicle }) {
  const { t } = useI18n();
  const three = has3D();
  const [photoOk, setPhotoOk] = useState(!!vehicle.imageUrl);
  const [show3d, setShow3d] = useState(false);
  useEffect(() => { setPhotoOk(!!vehicle.imageUrl); setShow3d(false); }, [vehicle.imageUrl]);
  const photo = photoOk && !show3d;
  return (
    <div className="relative overflow-hidden rounded-[22px] border border-white/[.06] bg-[radial-gradient(80%_70%_at_50%_70%,rgba(143,227,240,.10),transparent_70%),linear-gradient(180deg,#0E1318,#07090C)]">
      <div className="floor-grid pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-70 [transform:perspective(500px)_rotateX(60deg)] [transform-origin:bottom]" />
      {photo ? (
        <motion.div key="photo" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease }} className="relative grid aspect-[4/3] w-full place-items-center p-4 sm:aspect-[16/10] sm:p-8">
          <img src={vehicle.imageUrl} alt={`${vehicle.make} ${vehicle.model}`} onError={() => setPhotoOk(false)}
            className="max-h-full max-w-full rounded-xl object-contain shadow-[0_30px_60px_-20px_rgba(0,0,0,.8)]" />
        </motion.div>
      ) : three ? (
        <motion.div key="3d" initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease }} className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
          <Car3D type={vehicle.bodyType} color={vehicle.color.hex} label={`${vehicle.make} ${vehicle.model}, 3D`} />
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div key={vehicle.bodyType + vehicle.color.hex} initial={{ opacity: 0, x: 60, filter: "blur(8px)" }} animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -60, filter: "blur(8px)" }} transition={{ duration: 0.9, ease }} className="relative px-4 pb-2 pt-8 sm:px-10">
            <CarSVG type={vehicle.bodyType} view="right" color={vehicle.color.hex} sweep className="w-full drop-shadow-[0_24px_30px_rgba(0,0,0,.6)]" title={`${vehicle.make} ${vehicle.model}`} />
          </motion.div>
        </AnimatePresence>
      )}
      {(photo || three) && (
        <div className="relative flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 pb-3.5 text-[12px] text-fog-400 sm:absolute sm:inset-x-4 sm:bottom-3 sm:p-0">
          {photo
            ? <span className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-pearl-400" aria-hidden="true" />{t.modelPhoto}</span>
            : <span className="pointer-events-none flex items-center gap-2"><Rotate3d className="h-4 w-4 text-pearl-400" aria-hidden="true" />{t.drag3d}</span>}
          {photoOk && three ? (
            <button type="button" onClick={() => setShow3d((v) => !v)} className="rounded-full border border-white/10 bg-ink-950/60 px-3 py-1 text-fog-200 backdrop-blur transition-colors hover:border-pearl-400/50 hover:text-pearl-200">
              {show3d ? t.seePhoto : t.see3d}
            </button>
          ) : <span className="pointer-events-none">{t.model3d(t.bodyTypes[vehicle.bodyType])}</span>}
        </div>
      )}
    </div>
  );
}

/* RegCheck's Portugal data has no colour or body style: let the customer set them. */
function Adjust({ vehicle, onChange }) {
  const { t, lang } = useI18n();
  return (
    <motion.div variants={item} className="mt-8 rounded-2xl border border-white/[.08] bg-white/[.02] p-4">
      <p className="text-[13.5px] font-medium text-fog-100">{t.adjustTitle}</p>
      <p className="mt-1 text-[12.5px] leading-relaxed text-fog-400">{t.adjustLede}</p>
      <p className="mt-4 text-[11.5px] uppercase tracking-[.14em] text-fog-500">{t.body}</p>
      <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label={t.body}>
        {BODY_TYPE_LIST.map((b) => (
          <button key={b} type="button" role="radio" aria-checked={vehicle.bodyType === b} onClick={() => onChange((v) => ({ ...v, bodyType: b }))}
            className={cx("rounded-full border px-3 py-1.5 text-[12.5px] transition-colors", vehicle.bodyType === b ? "border-pearl-400/50 bg-pearl-400/[.12] text-pearl-200" : "border-white/10 text-fog-300 hover:border-white/25 hover:text-fog-50")}>
            {t.bodyTypes[b]}
          </button>
        ))}
      </div>
      <p className="mt-4 text-[11.5px] uppercase tracking-[.14em] text-fog-500">{t.color}</p>
      <div className="mt-2 flex flex-wrap gap-2.5">
        {PAINT_SWATCHES.map((s) => (
          <button key={s.hex} type="button" onClick={() => onChange((v) => ({ ...v, color: { ...v.color, hex: s.hex, name: s.name }, colorUnknown: false, colorPicked: true }))}
            aria-label={s.name[lang]} aria-pressed={vehicle.color.hex === s.hex && !vehicle.colorUnknown} title={s.name[lang]}
            className={cx("h-8 w-8 rounded-full ring-offset-2 ring-offset-ink-900 transition", vehicle.color.hex === s.hex && !vehicle.colorUnknown ? "ring-2 ring-pearl-400" : "ring-1 ring-white/20 hover:ring-white/50")}
            style={{ background: `radial-gradient(circle at 32% 30%, #ffffff70, transparent 45%), ${s.hex}` }} />
        ))}
      </div>
    </motion.div>
  );
}

function Spec({ icon: Icon, label, children }) {
  return (
    <motion.div variants={item} className="min-w-0 border-t border-white/[.07] pt-4">
      <dt className="flex items-center gap-2 text-[12px] uppercase tracking-[.14em] text-fog-500"><Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}</dt>
      <dd className="mt-1.5 text-[16px] text-fog-50">{children}</dd>
    </motion.div>
  );
}

export function VehicleCard({ vehicle, onConfirm, onBack, onChange }) {
  const { t, lang } = useI18n();
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="glass grid gap-8 rounded-[28px] p-4 sm:p-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10 lg:p-8">
      <motion.div variants={item} className="min-w-0"><Stage vehicle={vehicle} /></motion.div>
      <div className="flex min-w-0 flex-col">
        <motion.div variants={item} className="flex flex-wrap items-center gap-2">
          <Badge><BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />{t.found}</Badge>
          <Badge tone="muted">{vehicle.source === "demo" ? t.demoSource : vehicle.source === "manual" ? t.manualSource : t.apiSource}</Badge>
        </motion.div>
        <motion.p variants={item} className="mt-6 font-wide text-[11px] uppercase tracking-[.3em] text-fog-400">{vehicle.make}</motion.p>
        <motion.h2 variants={item} className="mt-2 font-display text-[40px] font-light leading-[1.05] tracking-[-.015em] text-fog-50 sm:text-[48px]">{vehicle.model}</motion.h2>
        <motion.div variants={item} className="mt-4"><MiniPlate plate={vehicle.plate} className="h-8 scale-110 origin-left" /></motion.div>
        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5">
          <Spec icon={CalendarDays} label={t.year}>{vehicle.year || "—"}</Spec>
          <Spec icon={Car} label={t.body}>{t.bodyTypes[vehicle.bodyType]}</Spec>
          <Spec icon={Droplet} label={t.color}>
            <span className="flex items-center gap-2.5">
              <span className="h-4 w-4 shrink-0 rounded-full ring-1 ring-white/25" style={{ background: `radial-gradient(circle at 30% 30%, #fff8, transparent 45%), ${vehicle.color.hex}` }} />
              <span className="min-w-0">{vehicle.color.name[lang]}<span className="block text-[12.5px] text-fog-400">{t.finishes[vehicle.color.finish]}</span></span>
            </span>
          </Spec>
          <Spec icon={Fuel} label={lang === "pt" ? "Combustível" : "Fuel"}>{vehicle.fuel ? t.fuels[vehicle.fuel] : "—"}</Spec>
        </dl>
        {vehicle.source === "api" && onChange && (vehicle.colorUnknown || vehicle.colorPicked) && <Adjust vehicle={vehicle} onChange={onChange} />}
        <motion.div variants={item} className="mt-auto pt-10">
          <p className="text-[14px] text-fog-300">{t.isThisYours}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="pearl" size="lg" iconRight={ArrowRight} onClick={onConfirm}>{t.yesContinue}</Button>
            <Button variant="ghost" size="lg" icon={ArrowLeft} onClick={onBack}>{t.notMine}</Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

const Field = ({ label, children, htmlFor }) => (
  <label htmlFor={htmlFor} className="block">
    <span className="text-[12px] uppercase tracking-[.14em] text-fog-500">{label}</span>
    <span className="mt-2 block">{children}</span>
  </label>
);
const inputCls = "h-12 w-full rounded-xl border border-white/10 bg-white/[.03] px-4 text-[15px] text-fog-50 placeholder:text-fog-500 transition-colors focus:border-pearl-400/60 focus:bg-white/[.05] focus:outline-none";

export function ManualVehicle({ plate, onConfirm, onBack }) {
  const { t, lang } = useI18n();
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [bodyType, setBody] = useState("hatch");
  const [sw, setSw] = useState(PAINT_SWATCHES[2]);
  const vehicle = {
    plate, make: make.trim() || (lang === "pt" ? "Viatura" : "Vehicle"), model: model.trim() || t.bodyTypes[bodyType], year: Number(year) || null,
    bodyType, color: { name: sw.name, hex: sw.hex, finish: "metallic" }, tier: tierForMake(make), source: "manual", fuel: null,
  };
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="glass grid gap-8 rounded-[28px] p-4 sm:p-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10 lg:p-8">
      <motion.div variants={item} className="min-w-0 order-2 lg:order-1">
        <Stage vehicle={vehicle} />
        <div className="mt-4 grid grid-cols-5 gap-2" role="radiogroup" aria-label={t.body}>
          {BODY_TYPE_LIST.map((b) => (
            <button key={b} type="button" role="radio" aria-checked={bodyType === b} onClick={() => setBody(b)}
              className={cx("group rounded-xl border px-1 pb-2 pt-1 text-center transition-colors", bodyType === b ? "border-pearl-400/60 bg-pearl-400/[.07]" : "border-white/10 hover:border-white/25")}>
              <CarSVG type={b} view="right" color={bodyType === b ? "#B7C2CC" : "#55606B"} className="w-full" title={t.bodyTypes[b]} />
              <span className={cx("block truncate text-[11.5px]", bodyType === b ? "text-pearl-200" : "text-fog-400")}>{t.bodyTypes[b]}</span>
            </button>
          ))}
        </div>
      </motion.div>
      <div className="order-1 flex min-w-0 flex-col lg:order-2">
        <motion.div variants={item}><Badge tone="muted"><SearchX className="h-3.5 w-3.5" aria-hidden="true" />{t.notFound}</Badge></motion.div>
        <motion.div variants={item} className="mt-4"><MiniPlate plate={plate} /></motion.div>
        <motion.p variants={item} className="mt-4 max-w-[44ch] text-[15px] leading-relaxed text-fog-300">{t.notFoundLede}</motion.p>
        <motion.div variants={item} className="mt-6 grid grid-cols-2 gap-4">
          <Field label={t.make} htmlFor="m-make"><input id="m-make" className={inputCls} value={make} onChange={(e) => setMake(e.target.value)} placeholder="Volkswagen" /></Field>
          <Field label={t.model} htmlFor="m-model"><input id="m-model" className={inputCls} value={model} onChange={(e) => setModel(e.target.value)} placeholder="Golf" /></Field>
          <Field label={t.year} htmlFor="m-year"><input id="m-year" className={inputCls} inputMode="numeric" maxLength={4} value={year} onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))} placeholder="2019" /></Field>
        </motion.div>
        <motion.fieldset variants={item} className="mt-5">
          <legend className="text-[12px] uppercase tracking-[.14em] text-fog-500">{t.color}</legend>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {PAINT_SWATCHES.map((s) => (
              <button key={s.hex} type="button" onClick={() => setSw(s)} aria-label={s.name[lang]} aria-pressed={sw.hex === s.hex}
                className={cx("h-9 w-9 rounded-full ring-offset-2 ring-offset-ink-900 transition", sw.hex === s.hex ? "ring-2 ring-pearl-400" : "ring-1 ring-white/20 hover:ring-white/50")}
                style={{ background: `radial-gradient(circle at 32% 30%, #ffffff70, transparent 45%), ${s.hex}` }} />
            ))}
          </div>
        </motion.fieldset>
        <motion.div variants={item} className="mt-auto flex flex-wrap gap-3 pt-8">
          <Button variant="pearl" size="lg" iconRight={ArrowRight} onClick={() => onConfirm(vehicle)}>{t.manualContinue}</Button>
          <Button variant="ghost" size="lg" icon={ArrowLeft} onClick={onBack}>{t.newSearch}</Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
