import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ImagePlus, Loader2, Send, X } from "lucide-react";
import { useI18n, panelName } from "../i18n.jsx";
import { bodyMeta } from "../car/panels.js";
import CarSVG from "../car/CarSVG.jsx";
import { eur, cx } from "../lib/util.js";
import { Badge, Button, MiniPlate, ease } from "./ui.jsx";

const inputCls = "w-full rounded-xl border bg-white/[.03] px-4 text-[15px] text-fog-50 placeholder:text-fog-500 transition-colors focus:bg-white/[.05] focus:outline-none";
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } };

function Field({ id, label, error, hint, children }) {
  return (
    <motion.div variants={item}>
      <label htmlFor={id} className="flex items-baseline justify-between text-[12px] uppercase tracking-[.14em] text-fog-500">{label}{hint && <span className="normal-case tracking-normal text-fog-500">{hint}</span>}</label>
      <div className="mt-2">{children}</div>
      <AnimatePresence>{error && <motion.p id={id + "-err"} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-1.5 text-[12.5px] text-bad">{error}</motion.p>}</AnimatePresence>
    </motion.div>
  );
}

export function Summary({ vehicle, est }) {
  const { t, lang } = useI18n();
  const meta = bodyMeta(vehicle.bodyType);
  return (
    <div className="glass rounded-[24px] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3"><h2 className="font-display text-[20px] font-normal text-fog-50">{t.summary}</h2><Badge>{t.estimateBadge}</Badge></div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/[.06] bg-[radial-gradient(70%_70%_at_50%_70%,rgba(143,227,240,.08),transparent),#080B0F] px-4 pt-3">
        <CarSVG type={vehicle.bodyType} view="right" color={vehicle.color.hex} stateOf={(id) => (est.lines.some((l) => l.id === id + "R" || l.id === id) ? "selected" : undefined)} className="w-full" title={vehicle.model} />
      </div>
      <p className="mt-4 flex items-center gap-2 text-[13.5px] text-fog-200"><MiniPlate plate={vehicle.plate} className="h-6" />{vehicle.make} {vehicle.model}{vehicle.year ? ` · ${vehicle.year}` : ""}</p>
      <ul className="mt-4 divide-y divide-white/[.06] border-y border-white/[.06]">
        {est.lines.map((l) => (
          <li key={l.id} className="flex items-baseline justify-between gap-3 py-2.5 text-[13.5px]">
            <span className="min-w-0 text-fog-200">{panelName(lang, l.id, meta)} <span className="text-fog-500">· {t.services[l.service]}</span></span>
            <span className="tnum shrink-0 text-fog-100">{eur(l.price, lang)}</span>
          </li>
        ))}
        {est.discount > 0 && <li className="flex justify-between py-2.5 text-[13px] text-ok"><span>{t.adjMulti}</span><span className="tnum">−{eur(est.discount, lang)}</span></li>}
      </ul>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div><p className="text-[12px] uppercase tracking-[.14em] text-fog-500">{t.total}</p><p className="mt-1 font-display text-[34px] font-light leading-none text-fog-50 tnum">{eur(est.total, lang)}</p></div>
        <p className="text-right text-[12.5px] text-fog-400">{t.range}<br /><span className="tnum text-fog-200">{eur(est.low, lang)} – {eur(est.high, lang)}</span></p>
      </div>
      <p className="mt-4 text-[12px] leading-relaxed text-fog-500">{t.disclaimer}</p>
    </div>
  );
}

export default function RequestStep({ vehicle, est, onBack, onSubmitted, initial }) {
  const { t } = useI18n();
  const [f, setF] = useState(initial || { name: "", phone: "", email: "", notes: "" });
  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [drag, setDrag] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => () => photos.forEach((p) => URL.revokeObjectURL(p.url)), []); // eslint-disable-line

  const addFiles = (list) => {
    const imgs = Array.from(list || []).filter((file) => /^image\//.test(file.type));
    setPhotos((cur) => [...cur, ...imgs.map((file) => ({ id: Math.random().toString(36).slice(2), name: file.name, url: URL.createObjectURL(file) }))].slice(0, 6));
  };
  const removePhoto = (id) => setPhotos((cur) => { const p = cur.find((x) => x.id === id); if (p) URL.revokeObjectURL(p.url); return cur.filter((x) => x.id !== id); });

  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = t.errName;
    const digits = f.phone.replace(/[^\d+]/g, "");
    if (!/^(\+?\d{9,15})$/.test(digits)) e.phone = t.errPhone;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = t.errEmail;
    return e;
  };
  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) { document.getElementById(Object.keys(e)[0])?.focus(); return; }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1400)); // prototype: no backend yet
    onSubmitted({ ...f, photos: photos.length });
  };
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); if (errors[k]) setErrors({ ...errors, [k]: undefined }); };
  const border = (k) => (errors[k] ? "border-bad/70" : "border-white/10 focus:border-pearl-400/60");

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8">
      <motion.form variants={stagger} initial="hidden" animate="show" onSubmit={submit} noValidate className="glass flex flex-col gap-5 rounded-[28px] p-5 sm:p-8">
        <motion.div variants={item}>
          <h2 className="font-display text-[30px] font-light leading-tight text-fog-50 sm:text-[36px]">{t.formTitle}</h2>
          <p className="mt-2 max-w-[56ch] text-[15px] leading-relaxed text-fog-300">{t.formLede}</p>
        </motion.div>
        <Field id="name" label={t.name} error={errors.name}>
          <input id="name" autoComplete="name" className={cx(inputCls, "h-12", border("name"))} value={f.name} onChange={set("name")} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="phone" label={t.phone} error={errors.phone}>
            <input id="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="912 345 678" className={cx(inputCls, "h-12", border("phone"))} value={f.phone} onChange={set("phone")} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-err" : undefined} />
          </Field>
          <Field id="email" label={t.email} error={errors.email}>
            <input id="email" type="email" autoComplete="email" placeholder="nome@exemplo.pt" className={cx(inputCls, "h-12", border("email"))} value={f.email} onChange={set("email")} aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-err" : undefined} />
          </Field>
        </div>
        <Field id="notes" label={t.notes}>
          <textarea id="notes" rows={4} placeholder={t.notesPh} className={cx(inputCls, "resize-y py-3 leading-relaxed", border("notes"))} value={f.notes} onChange={set("notes")} />
        </Field>
        <Field id="photos" label={t.photos} hint={t.photosOptional}>
          <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
            className={cx("relative rounded-2xl border border-dashed p-5 transition-colors", drag ? "border-pearl-400 bg-pearl-400/[.06]" : "border-white/15 hover:border-white/30")}>
            <input ref={fileRef} id="photos" type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            <button type="button" onClick={() => fileRef.current?.click()} className="flex w-full flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/[.05]"><ImagePlus className="h-5 w-5 text-pearl-300" aria-hidden="true" /></span>
              <span><span className="block text-[14px] text-fog-100">{t.dropHere}</span><span className="block text-[12.5px] text-fog-400">{t.orBrowse} · {t.photosHint}</span></span>
            </button>
            {photos.length > 0 && (
              <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
                <AnimatePresence initial={false}>
                  {photos.map((p) => (
                    <motion.li key={p.id} layout initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} className="group relative aspect-square overflow-hidden rounded-xl border border-white/10">
                      <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removePhoto(p.id)} aria-label={`${t.remove}: ${p.name}`} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink-950/80 text-fog-100 opacity-90 transition hover:bg-ink-950"><X className="h-3.5 w-3.5" /></button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </Field>
        <motion.div variants={item} className="mt-2 flex flex-wrap items-center gap-3">
          <motion.button type="submit" disabled={sending} whileHover={!sending ? { y: -1 } : undefined} whileTap={!sending ? { scale: 0.97 } : undefined}
            className="group relative inline-flex h-14 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-pearl-300 via-pearl-400 to-lilac-400 px-7 text-[15px] font-semibold text-ink-950 disabled:opacity-80">
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            {sending ? <Loader2 className="relative h-5 w-5 animate-spin" aria-hidden="true" /> : <Send className="relative h-[18px] w-[18px]" aria-hidden="true" />}
            <span className="relative">{sending ? t.sending + "…" : t.submit}</span>
          </motion.button>
          <Button type="button" variant="ghost" size="lg" icon={ArrowLeft} onClick={onBack} disabled={sending}>{t.back}</Button>
        </motion.div>
      </motion.form>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease, delay: 0.15 }} className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <Summary vehicle={vehicle} est={est} />
      </motion.div>
    </div>
  );
}
