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
        // Required palette
        forest: {
          DEFAULT: "#174B35",
          50: "#F4F7F5",
          100: "#E3ECE6",
          200: "#C6D9CE",
          300: "#9FBFA8",
          400: "#5A8E6F",
          500: "#2A6A4E",
          600: "#1E5A3F",
          700: "#174B35", // Primary Forest Green
          800: "#123B2A",
          900: "#0E2B1E",
          950: "#081912",
        },
        sage: {
          DEFAULT: "#A8BFA3",
          50: "#F7F9F6",
          100: "#EEF3EC",
          200: "#DCE5D9",
          300: "#C5D5C1",
          400: "#A8BFA3", // Primary Sage Green
          500: "#8EA988",
          600: "#738E6D",
          700: "#5A7055",
          800: "#42523F",
          900: "#2D372B",
        },
        cream: {
          DEFAULT: "#F5F3EA",
          50: "#FCFAF6",
          100: "#F5F3EA", // Primary Warm Cream
          200: "#EBE7D8",
          300: "#DFD8C2",
          400: "#D1C7A8",
          500: "#BEB18F",
        },
        limeaccent: {
          DEFAULT: "#C4DC78",
          50: "#FAFDF3",
          100: "#F3FAE5",
          200: "#E5F4C7",
          300: "#D6EEA5",
          400: "#C4DC78", // Lime Accent
          500: "#ADC759",
          600: "#8FA93F",
          700: "#70872D",
          800: "#53641F",
        },
        terracotta: {
          DEFAULT: "#C47B55",
          50: "#FAF4F0",
          100: "#F5E7DF",
          200: "#E9CDBC",
          300: "#DBAE97",
          400: "#CE8E71",
          500: "#C47B55", // Terracotta
          600: "#AA613C",
          700: "#8B4C2C",
          800: "#6B381F",
        },
        charcoal: {
          DEFAULT: "#202A24",
          50: "#F4F5F4",
          100: "#E3E6E4",
          200: "#C4CBC6",
          300: "#9FAAA1",
          400: "#6B7B6E",
          500: "#455448",
          600: "#303B33",
          700: "#202A24", // Charcoal
          800: "#171F1A",
          900: "#101612",
          950: "#0B0E0C",
        },
        night: {
          DEFAULT: "#101820", // Main background: #101820
          secondary: "#17252B", // Secondary background: #17252B
          card: "#1C302F", // Card background: #1C302F
          border: "#273F3E", // Subtle dark green-grey border: #273F3E
          hover: "#223837", // Card hover: #223837
        },
        emeraldaccent: {
          DEFAULT: "#35B98A", // Primary dark accent: #35B98A
          400: "#55C6B0", // Secondary dark accent: #55C6B0
          500: "#35B98A",
          600: "#2B9E75",
        },
        darktext: {
          DEFAULT: "#E8EFEA", // Main text: #E8EFEA
          muted: "#A6B8B0", // Muted text: #A6B8B0
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        heading: ["var(--font-sora)", "Sora", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "sans-serif"],
        inter: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        sora: ["var(--font-sora)", "Sora", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(32, 42, 36, 0.05), 0 2px 6px -1px rgba(32, 42, 36, 0.03)",
        "soft-md": "0 10px 25px -4px rgba(23, 75, 53, 0.08), 0 4px 10px -2px rgba(23, 75, 53, 0.04)",
        "soft-lg": "0 20px 40px -8px rgba(23, 75, 53, 0.10), 0 8px 16px -4px rgba(23, 75, 53, 0.04)",
        "dark-card": "0 4px 24px -2px rgba(0, 0, 0, 0.40), 0 1px 3px 0 rgba(0, 0, 0, 0.25)",
        "dark-soft": "0 4px 20px -2px rgba(0, 0, 0, 0.35)",
        glow: "0 0 20px rgba(53, 185, 138, 0.18)",
        "forest-glow": "0 0 25px rgba(23, 75, 53, 0.20)",
      },
      animation: {
        "float-slow": "float 6s ease-in-out infinite",
        "sway-slow": "sway 5s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "leaf-drift": "drift 8s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(2deg)" },
        },
        sway: {
          "0%, 100%": { transform: "rotate(-1.5deg)" },
          "50%": { transform: "rotate(1.5deg)" },
        },
        drift: {
          "0%": { transform: "translate(0, 0) rotate(0deg)", opacity: "0" },
          "20%": { opacity: "0.8" },
          "80%": { opacity: "0.8" },
          "100%": { transform: "translate(60px, -90px) rotate(180deg)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
