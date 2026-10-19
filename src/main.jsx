import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import { I18nProvider } from "./i18n.jsx";
import App from "./App.jsx";

const readLang = () => {
  try { const s = localStorage.getItem("verniz-lang"); if (s === "pt" || s === "en") return s; } catch (e) { /* storage unavailable */ }
  return (navigator.language || "pt").toLowerCase().startsWith("pt") ? "pt" : "pt";
};

function Root() {
  const [lang, setLang] = useState(readLang);
  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-PT" : "en";
    try { localStorage.setItem("verniz-lang", lang); } catch (e) { /* ignore */ }
  }, [lang]);
  return (
    <MotionConfig reducedMotion="user">
      <I18nProvider lang={lang} setLang={setLang}>
        <App />
      </I18nProvider>
    </MotionConfig>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
