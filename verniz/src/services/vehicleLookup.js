import { DEMO_VEHICLES, guessBodyType, tierForMake } from "../data/vehicles.js";

/*
  Vehicle lookup.

  Demo mode (default): answers from DEMO_VEHICLES after a short, realistic delay.

  Live mode: set window.VERNIZ_CONFIG = { vehicleApiUrl: "https://your-backend/api/plate" }
  before the app script loads. The backend receives ?plate=AA-00-AA, calls the
  registration provider with its own secret key, caches the answer and returns
  JSON. normalizeVehicle() accepts our own shape or RegCheck-style fields
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

export function normalizeVehicle(raw, plate) {
  if (!raw) return null;
  const d = raw.data || raw.vehicle || raw;
  const make = d.make || d.CarMake?.CurrentTextValue || d.CarMake || "";
  const model = d.model || d.CarModel?.CurrentTextValue || d.CarModel || d.Description || "";
  if (!make && !model) return null;
  const year = Number(d.year || d.RegistrationYear || String(d.RegistrationDate || "").slice(-4)) || null;
  const colourName = d.color?.name || d.colour || d.Colour || d.Color || "";
  const key = String(typeof colourName === "string" ? colourName : colourName.en || "").trim().toLowerCase();
  const hex = d.color?.hex || COLOR_HEX[key] || "#8B9096";
  const name = typeof colourName === "object" ? colourName : { pt: colourName || "—", en: colourName || "—" };
  return {
    plate,
    make, model, year,
    bodyType: d.bodyType || guessBodyType(make, model),
    color: { name, hex, finish: d.color?.finish || "metallic" },
    fuel: d.fuel || d.FuelType || null,
    tier: d.tier || tierForMake(make),
    source: d.source || "api",
  };
}

export async function lookupVehicle(plate, { signal } = {}) {
  const url = config().vehicleApiUrl;
  if (url) {
    const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}plate=${encodeURIComponent(plate)}`, { signal, headers: { Accept: "application/json" } });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Lookup failed (${res.status})`);
    return normalizeVehicle(await res.json(), plate);
  }
  await wait(1500, signal);
  const hit = DEMO_VEHICLES[plate];
  return hit ? { ...hit, plate, source: "demo" } : null;
}
