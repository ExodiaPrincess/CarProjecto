import { build } from "esbuild";
import { execSync } from "child_process";
import fs from "fs";

const entry = process.argv[2] || "src/main.jsx";
const out = process.argv[3] || "dist/verniz";
const local = process.argv.includes("--local");     // test build: libraries from node_modules
fs.mkdirSync("dist", { recursive: true });

execSync(`npx tailwindcss -c tailwind.config.cjs -i src/styles.css -o dist/app.css --minify`, { stdio: "pipe" });
const css = fs.readFileSync("dist/app.css", "utf8");

const GLOBALS = { react: "React", "react-dom": "ReactDOM", "react-dom/client": "ReactDOM", "framer-motion": "Motion" };
const globalsPlugin = {
  name: "globals",
  setup(b) {
    b.onResolve({ filter: /^(react|react-dom|react-dom\/client|framer-motion)$/ }, (a) => ({ path: a.path, namespace: "g" }));
    b.onLoad({ filter: /.*/, namespace: "g" }, (a) => ({ contents: `module.exports = window.${GLOBALS[a.path]};`, loader: "js" }));
  },
};
const res = await build({
  entryPoints: [entry], bundle: true, minify: true, format: "iife", target: "es2019", write: false,
  jsx: "transform", jsxFactory: "React.createElement", jsxFragment: "React.Fragment",
  plugins: [globalsPlugin], legalComments: "none", loader: { ".js": "jsx" },
});
const js = res.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

const LIBS = local
  ? ["../node_modules/react/umd/react.production.min.js", "../node_modules/react-dom/umd/react-dom.production.min.js", "../node_modules/framer-motion/dist/framer-motion.js"]
  : [
      "https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js",
      "https://cdn.jsdelivr.net/npm/framer-motion@11.11.17/dist/framer-motion.js",
    ];
const FONTS = "https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600&family=Michroma&family=Saira:wght@300;400;500;600;700&display=swap";
const head = `<title>Verniz</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="Verniz: orçamento de pintura e chapa automóvel a partir da matrícula.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>${css}</style>`;
const bodyHtml = `<div id="root"></div>
${LIBS.map((u) => `<script src="${u}"></script>`).join("\n")}
<script>${js}</script>`;

// artifact page (the host adds doctype/head/body) and a full standalone document
fs.writeFileSync(out + ".html", head + "\n" + bodyHtml + "\n");
fs.writeFileSync(out + "-standalone.html", `<!doctype html>\n<html lang="pt">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head}\n</head>\n<body>\n${bodyHtml}\n</body>\n</html>\n`);
console.log("built", out, Math.round((head.length + bodyHtml.length) / 1024) + " KB");
