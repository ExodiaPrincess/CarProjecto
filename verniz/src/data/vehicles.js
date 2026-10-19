/* Demo registration records. Replace with the live lookup in services/vehicleLookup.js. */
export const DEMO_VEHICLES = {
  "73-SX-98": { make: "Renault", model: "Clio IV", year: 2017, bodyType: "hatch", color: { name: { pt: "Cinza Platina", en: "Platinum Grey" }, hex: "#8B9096", finish: "metallic" }, fuel: "diesel", tier: "standard" },
  "AB-12-CD": { make: "BMW", model: "Série 3 Berlina", year: 2021, bodyType: "sedan", color: { name: { pt: "Preto Safira", en: "Sapphire Black" }, hex: "#1A1D23", finish: "metallic" }, fuel: "petrol", tier: "premium" },
  "45-RT-21": { make: "Nissan", model: "Qashqai", year: 2018, bodyType: "suv", color: { name: { pt: "Branco Pérola", en: "Pearl White" }, hex: "#E7E9EA", finish: "pearl" }, fuel: "petrol", tier: "standard" },
  "AE-77-ZX": { make: "Peugeot", model: "308 SW", year: 2022, bodyType: "estate", color: { name: { pt: "Azul Magnético", en: "Magnetic Blue" }, hex: "#2B4C82", finish: "metallic" }, fuel: "hybrid", tier: "standard" },
  "BT-05-EV": { make: "Tesla", model: "Model 3", year: 2023, bodyType: "sedan", color: { name: { pt: "Vermelho Multicamada", en: "Multi-Coat Red" }, hex: "#9E1B22", finish: "pearl" }, fuel: "electric", tier: "premium" },
  "AL-22-HN": { make: "Lamborghini", model: "Huracán EVO", year: 2022, bodyType: "coupe", color: { name: { pt: "Amarelo Giallo", en: "Giallo Yellow" }, hex: "#E9B500", finish: "pearl" }, fuel: "petrol", tier: "luxury" },
};

export const DEMO_PLATES = Object.keys(DEMO_VEHICLES);

export const BODY_TYPE_LIST = ["hatch", "sedan", "estate", "suv", "coupe"];

export const PAINT_SWATCHES = [
  { hex: "#E7E9EA", name: { pt: "Branco", en: "White" } },
  { hex: "#B9BEC4", name: { pt: "Prata", en: "Silver" } },
  { hex: "#8B9096", name: { pt: "Cinza", en: "Grey" } },
  { hex: "#1A1D23", name: { pt: "Preto", en: "Black" } },
  { hex: "#2B4C82", name: { pt: "Azul", en: "Blue" } },
  { hex: "#9E1B22", name: { pt: "Vermelho", en: "Red" } },
  { hex: "#2F5A45", name: { pt: "Verde", en: "Green" } },
  { hex: "#E9B500", name: { pt: "Amarelo", en: "Yellow" } },
];

/* Brand → price tier, used when a record has no tier (manual entry or live API). */
const PREMIUM = ["audi", "bmw", "mercedes", "mercedes-benz", "volvo", "lexus", "tesla", "porsche", "land rover", "jaguar", "mini", "polestar", "genesis"];
const LUXURY = ["lamborghini", "ferrari", "mclaren", "bentley", "rolls-royce", "aston martin", "maserati", "bugatti", "lotus"];
export function tierForMake(make = "") {
  const m = make.trim().toLowerCase();
  if (LUXURY.includes(m)) return "luxury";
  if (PREMIUM.includes(m)) return "premium";
  return "standard";
}

/* Guess a body type from the model name when the registry does not say. */
const RULES = [
  ["coupe", /hurac[aá]n|aventador|revuelto|\b911\b|cayman|boxster|\br8\b|amg gt|corvette|supra|mx-5|\bz4\b|\bi8\b|a110|\btt\b|f-type|vantage|roma|portofino|296|488|f8|sf90|coup[eé]/i],
  ["estate", /\b(sw|break|touring|estate|variant|avant|sports ?tourer|wagon|kombi|carrinha|shooting brake)\b/i],
  ["suv", /qashqai|juke|captur|kadjar|austral|arkana|tucson|kona|sportage|\b(2|3|5)008\b|\bx[1-7]\b|\bq[2-8]\b|tiguan|t-roc|t-cross|kuga|puma|cx-[3-9]|rav4|c-hr|duster|ateca|arona|karoq|kodiaq|xc[469]0|model y|niro|stonic|aircross|mokka|grandland|range rover|macan|cayenne|urus|purosangue|\bsuv\b/i],
  ["sedan", /s[ée]rie [3579]|berlina|sedan|saloon|\ba[3-8]\b|classe [cesa]|passat|octavia|model 3|model s|mondeo|insignia|\b508\b|giulia|camry|accord|panamera/i],
];
export function guessBodyType(make, model) {
  const s = `${make} ${model}`;
  for (const [t, re] of RULES) if (re.test(s)) return t;
  return "hatch";
}
