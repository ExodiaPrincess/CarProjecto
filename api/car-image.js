/*
  GET /api/car-image?src=<RegCheck ImageUrl>
  RegCheck's photo links are plain http, which an https site can't show, so they are
  fetched here and passed through. Only RegCheck's own hosts are allowed.
*/
const { isAllowedImage } = require("./_regcheck.js");

module.exports = async (req, res) => {
  const src = String((req.query && req.query.src) || "");
  if (!isAllowedImage(src)) return res.status(400).json({ error: "bad_src" });
  try {
    const r = await fetch(src, { signal: AbortSignal.timeout(10000), redirect: "follow" });
    const type = r.headers.get("content-type") || "";
    if (!r.ok || !type.startsWith("image/")) return res.status(404).json({ error: "no_image" });
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 5 * 1024 * 1024) return res.status(413).json({ error: "too_large" });
    res.setHeader("Content-Type", type);
    res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=31536000, immutable");
    return res.status(200).send(buf);
  } catch {
    return res.status(502).json({ error: "upstream_unreachable" });
  }
};
