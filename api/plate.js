/*
  GET /api/plate?plate=AA-00-AA  →  { make, model, year, fuel, imageUrl, ... }

  Calls RegCheck's Portugal lookup with the account name in the REGCHECK_USERNAME
  environment variable (Vercel → Settings → Environment Variables). The name never
  reaches the browser. Answers are cached at Vercel's edge for a year, so the same
  plate is only paid for once per region.
*/
const { PLATE_RE, parseVehicle } = require("./_regcheck.js");

const YEAR = "public, max-age=3600, s-maxage=31536000, stale-while-revalidate=86400";

module.exports = async (req, res) => {
  const plate = String((req.query && req.query.plate) || "").toUpperCase().replace(/\s+/g, "").trim();
  if (!PLATE_RE.test(plate)) return res.status(400).json({ error: "bad_plate" });

  const user = process.env.REGCHECK_USERNAME;
  if (!user) return res.status(501).json({ error: "not_configured" });

  const url = "https://www.regcheck.org.uk/api/reg.asmx/CheckPortugal?RegistrationNumber="
    + encodeURIComponent(plate) + "&username=" + encodeURIComponent(user);
  let text = "", status = 0;
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(15000) });
    status = r.status;
    text = await r.text();
  } catch {
    return res.status(502).json({ error: "upstream_unreachable" });
  }

  const vehicle = status === 200 ? parseVehicle(text) : null;
  if (vehicle) {
    res.setHeader("Cache-Control", YEAR);
    return res.status(200).json(vehicle);
  }
  if (/credit/i.test(text)) return res.status(402).json({ error: "no_credit" });
  if (status === 200 || /no vehicle|not found|invalid|no data|could not/i.test(text)) {
    res.setHeader("Cache-Control", "public, s-maxage=86400");
    return res.status(404).json({ error: "not_found" });
  }
  console.error("RegCheck error", status, text.slice(0, 300));
  return res.status(502).json({ error: "upstream_error" });
};
