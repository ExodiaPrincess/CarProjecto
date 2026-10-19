/* Shared helpers for the RegCheck (regcheck.org.uk / matricula.co.pt) Portugal lookup. */
const PLATE_RE = /^(\d{2}-\d{2}-[A-Z]{2}|\d{2}-[A-Z]{2}-\d{2}|[A-Z]{2}-\d{2}-\d{2}|[A-Z]{2}-\d{2}-[A-Z]{2})$/;
const IMAGE_HOSTS = ["regcheck.org.uk", "matricula.co.pt", "carregistrationapi.com"];

const decode = (s) => s
  .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&amp;/g, "&");
const val = (x) => (x && typeof x === "object" ? x.CurrentTextValue ?? x.CurrentValue ?? "" : x ?? "");

/** RegCheck answers XML with the vehicle as JSON inside <vehicleJson>. Returns our own shape, or null. */
function parseVehicle(xml) {
  const m = /<vehicleJson>([\s\S]*?)<\/vehicleJson>/i.exec(xml || "");
  if (!m || !m[1].trim()) return null;
  let d;
  try { d = JSON.parse(decode(m[1])); } catch { return null; }
  const make = String(val(d.CarMake) || val(d.MakeDescription) || "").trim();
  const model = String(val(d.CarModel) || val(d.ModelDescription) || "").trim();
  if (!make && !model) return null;
  const image = String(d.ImageUrl || "").trim();
  return {
    make, model,
    description: d.Description || "",
    year: Number(d.RegistrationYear) || Number(String(d.RegistrationDate || "").slice(-4)) || null,
    fuel: String(val(d.FuelType) || "").trim() || null,
    engineSize: Number(val(d.EngineSize)) || null,
    colour: String(val(d.Colour) || val(d.Color) || "").trim() || null,
    imageUrl: image && isAllowedImage(image) ? `/api/car-image?src=${encodeURIComponent(image)}` : null,
    source: "api",
  };
}

function isAllowedImage(src) {
  try {
    const u = new URL(src);
    return /^https?:$/.test(u.protocol) && IMAGE_HOSTS.some((h) => u.hostname === h || u.hostname.endsWith("." + h));
  } catch { return false; }
}

module.exports = { PLATE_RE, parseVehicle, isAllowedImage };
