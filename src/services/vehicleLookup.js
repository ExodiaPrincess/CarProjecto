import { DEMO_VEHICLES, guessBodyType, tierForMake } from "../data/vehicles.js";

/*
  Vehicle lookup.

  Demo mode (default): answers from DEMO_VEHICLES after a short, realistic delay.

  Live mode: on a real web address the site asks its own /api/plate (a Vercel function
  in api/plate.js that calls RegCheck). Override with
  window.VERNIZ_CONFIG = { vehicleApiUrl: "https://your-backend/api/plate" }.
  The backend receives ?plate=AA-00-AA, calls the registration provider with its own
  secret key, caches the answer and returns JSON. Demo plates always answer from
  DEMO_VEHICLES, so they never spend credits. normalizeVehicle() accepts our own shape or RegCheck-style fields
  (CarMake / CarModel / RegistrationYear / Colour). Never put a provider API key
  in the front end.
*/

const config = () => (typeof window !== "undefined" && window.VERNIZ_CONFIG) || {};
const wait = (ms, signal) => new Promise((res, rej) => {
  const t = setTimeout(res, ms);
  signal?.addEventListener("abort", () => { clearTimeout(t); rej(new DOMException("Aborted", "AbortError")); });
});

const COLOR_HEX = {
  white: "#E7E9EA", branco: "#E7E9EA", silver: "#B9BEC4", prata: "#B9BEC4", grey: "#8B9096", gray: "#8B9096", cinza: "#8B9096",
  black: "#1A1D23", preto: "#1A1D23", blue: "#2B4C82", azul: "#2B4C82", red: "#9E1B22", vermelho: "#9E1B22",
  green: "#2F5A45", verde: "#2F5A45", yellow: "#E9B500", amarelo: "#E9B500", orange: "#D2691E", laranja: "#D2691E", brown: "#5B4334", castanho: "#5B4334", beige: "#C8B898", bege: "#C8B898",
};

const FUEL = { diesel: "diesel", gasoleo: "diesel", "gasóleo": "diesel", gasolina: "petrol", petrol: "petrol", gasoline: "petrol",
  electrico: "electric", "elétrico": "electric", "eléctrico": "electric", electric: "electric", hibrido: "hybrid", "híbrido": "hybrid", hybrid: "hybrid" };
const fuelKey = (f) => {
  const k = String(f || "").trim().toLowerCase();
  if (!k) return null;
  if (FUEL[k]) return FUEL[k];
  const hit = Object.keys(FUEL).find((w) => k.includes(w));
  return hit ? FUEL[hit] : null;
};
// "RENAULT" → "Renault", "CLIO SW" → "Clio SW"; short codes (BMW, SW, GTI, IV) stay as they are
const nice = (s) => String(s || "").trim().split(/\s+/).map((w) => (w.length <= 3 || /\d/.test(w) ? w : w[0].toUpperCase() + w.slice(1).toLowerCase())).join(" ");

export function normalizeVehicle(raw, plate) {
  if (!raw) return null;
  const d = raw.data || raw.vehicle || raw;
  const rawMake = d.make || d.CarMake?.CurrentTextValue || d.CarMake || "";
  const rawModel = d.model || d.CarModel?.CurrentTextValue || d.CarModel || d.Description || "";
  if (!rawMake && !rawModel) return null;
  const make = nice(rawMake), model = nice(rawModel);
  const year = Number(d.year || d.RegistrationYear || String(d.RegistrationDate || "").slice(-4)) || null;
  const colourName = d.color?.name || d.colour || d.Colour || d.Color || "";
  const key = String(typeof colourName === "string" ? colourName : colourName.en || "").trim().toLowerCase();
  const known = !!(d.color?.hex || COLOR_HEX[key]);
  const hex = d.color?.hex || COLOR_HEX[key] || "#8B9096";
  const name = typeof colourName === "object" ? colourName
    : colourName ? { pt: nice(colourName), en: nice(colourName) } : { pt: "Por indicar", en: "Not set" };
  return {
    plate,
    make, model, year,
    bodyType: d.bodyType || guessBodyType(make, model),
    color: { name, hex, finish: d.color?.finish || "metallic" },
    colorUnknown: !known,
    fuel: fuelKey(d.fuel || d.FuelType?.CurrentTextValue || d.FuelType),
    tier: d.tier || tierForMake(make),
    imageUrl: d.imageUrl || null,
    source: d.source || "api",
  };
}

const apiUrl = () => {
  const c = config().vehicleApiUrl;
  if (c) return c;
  if (typeof location === "undefined" || !/^https?:$/.test(location.protocol)) return null;
  if (/(^|\.)claude\.(ai|site)$|claudeusercontent/.test(location.hostname)) return null; // previews have no API
  return "/api/plate";
};

export async function lookupVehicle(plate, { signal } = {}) {
  const demo = DEMO_VEHICLES[plate];
  const url = !demo && apiUrl();
  if (url) {
    const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}plate=${encodeURIComponent(plate)}`, { signal, headers: { Accept: "application/json" } });
    const json = /json/.test(res.headers.get("content-type") || "");
    // not found, not set up yet, or no such endpoint: let the customer describe the car
    if (!json || [400, 404, 405, 501].includes(res.status)) return null;
    if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
    return normalizeVehicle(await res.json(), plate);
  }
  await wait(1500, signal);
  return demo ? { ...demo, plate, source: "demo" } : null;
}
