/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 950: "#05070A", 900: "#090C10", 850: "#0D1116", 800: "#11161C", 750: "#161C23", 700: "#1C232B", 600: "#28313B", 500: "#3A4550" },
        fog: { 50: "#F3F6F9", 100: "#E6EBF0", 200: "#C9D1D9", 300: "#A9B4BF", 400: "#8793A0", 500: "#66717D" },
        pearl: { 200: "#D4F7FB", 300: "#B7F0F7", 400: "#8FE3F0", 500: "#5ECFE2", 600: "#33A9BF" },
        lilac: { 300: "#D3C8FF", 400: "#B9A8FF" },
        ok: "#7BE0B3", bad: "#FF8E86",
      },
      fontFamily: {
        wide: ["Michroma", "Saira", "system-ui", "sans-serif"],
        display: ["Saira", "Hanken Grotesk", "system-ui", "sans-serif"],
        sans: ["Hanken Grotesk", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      letterSpacing: { widest2: ".28em" },
      boxShadow: {
        glass: "inset 0 1px 0 rgba(255,255,255,.07), 0 40px 120px -50px rgba(0,0,0,.9)",
        pearl: "0 0 0 1px rgba(143,227,240,.35), 0 10px 40px -10px rgba(143,227,240,.45)",
      },
    },
  },
  plugins: [],
};
