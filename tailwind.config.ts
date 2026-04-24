import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        paper: {
          DEFAULT: "#F8F5EE",
          50: "#FCFAF4",
          100: "#F8F5EE",
          200: "#EFEAE0",
        },
        ink: {
          DEFAULT: "#0F1319",
          muted: "#6B7280",
        },
      },
      boxShadow: {
        card: "0 1px 0 rgba(15, 19, 25, 0.03)",
        cardHover: "0 2px 12px rgba(15, 19, 25, 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
