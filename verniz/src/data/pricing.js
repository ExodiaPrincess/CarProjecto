/*
  Estimate model. All prices are indicative, in EUR, VAT included.
  A confirmed quote is only issued after the workshop inspects the car or photos.
*/
export const PANEL_BASE = {
  bumperF: 260, bumperR: 250, bonnet: 340, boot: 310, roof: 380,
  wing: 220, doorF: 290, doorR: 270, door2: 340, quarter: 300, mirror: 90,
};
export const SERVICES = {
  paint: { factor: 1.0 },     // full respray of the panel
  scratch: { factor: 0.6 },   // local repair, blend and clear coat
  dent: { factor: 1.45 },     // panel beating + respray
};
export const FINISH = { solid: 1.0, metallic: 1.12, pearl: 1.3 };
export const BODY_SIZE = { hatch: 1.0, sedan: 1.05, estate: 1.08, suv: 1.15, coupe: 1.12 };
export const TIER = { standard: 1.0, premium: 1.15, luxury: 1.5 };
export const MULTI = { minPanels: 4, pct: 0.08 };
export const SPREAD = 0.1;

export function panelBaseKey(id, doors) {
  if (id.startsWith("door")) return doors === 2 ? "door2" : id.startsWith("doorF") ? "doorF" : "doorR";
  if (id.startsWith("wing")) return "wing";
  if (id.startsWith("quarter")) return "quarter";
  if (id.startsWith("mirror")) return "mirror";
  return id;
}

export function computeEstimate(selection, vehicle, finish, doors) {
  const size = BODY_SIZE[vehicle?.bodyType] ?? 1;
  const tier = TIER[vehicle?.tier] ?? 1;
  const fin = FINISH[finish] ?? 1;
  const mult = size * tier * fin;
  const lines = selection.map(({ id, service }) => {
    const base = PANEL_BASE[panelBaseKey(id, doors)];
    return { id, service, price: Math.round(base * SERVICES[service].factor * mult) };
  });
  const subtotal = lines.reduce((a, l) => a + l.price, 0);
  const discount = lines.length >= MULTI.minPanels ? Math.round(subtotal * MULTI.pct) : 0;
  const total = subtotal - discount;
  const r5 = (x) => Math.round(x / 5) * 5;
  return { lines, size, tier, fin, subtotal, discount, total, low: r5(total * (1 - SPREAD)), high: r5(total * (1 + SPREAD)) };
}
