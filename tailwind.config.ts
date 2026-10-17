import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: "#166534",
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        deep: "#14532D",
        fresh: "#22C55E",
        mint: "#ECFDF5",
        darktext: "#16352A",
        night: {
          DEFAULT: "#0B1F17",
          card: "#0f2b20",
          border: "#1a4233",
          hover: "#14392b",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px -10px rgba(22, 101, 52, 0.08)",
        "soft-lg": "0 20px 40px -15px rgba(22, 101, 52, 0.12)",
        glow: "0 0 25px rgba(34, 197, 94, 0.35)",
      },
      animation: {
        "float-slow": "float 6s ease-in-out infinite",
        "sway-slow": "sway 5s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-12px) rotate(3deg)" },
        },
        sway: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
