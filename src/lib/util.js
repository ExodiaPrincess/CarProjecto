/* Portuguese plates: three pairs, e.g. AA-00-AA, 00-AA-00, AA-00-00, 00-00-AA. */
export const PLATE_RE = /^(\d{2}-\d{2}-[A-Z]{2}|\d{2}-[A-Z]{2}-\d{2}|[A-Z]{2}-\d{2}-\d{2}|[A-Z]{2}-\d{2}-[A-Z]{2})$/;
export const formatPlate = (v) => (v.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6).match(/.{1,2}/g) || []).join("-");
export const isPlate = (p) => PLATE_RE.test(p);

export const eur = (n, lang = "pt") =>
  new Intl.NumberFormat(lang === "en" ? "en-IE" : "pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

/* colour helpers for paint shading */
const hexToRgb = (h) => { const n = parseInt(h.replace("#", ""), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgbToHex = ([r, g, b]) => "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
export const mix = (a, b, t) => { const A = hexToRgb(a), B = hexToRgb(b); return rgbToHex(A.map((v, i) => v + (B[i] - v) * t)); };
export const lighten = (h, t) => mix(h, "#ffffff", t);
export const darken = (h, t) => mix(h, "#000000", t);
export const luminance = (h) => { const [r, g, b] = hexToRgb(h); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };

export const cx = (...a) => a.filter(Boolean).join(" ");
