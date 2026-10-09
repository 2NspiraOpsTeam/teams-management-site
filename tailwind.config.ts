import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Shared warm-neutral palette for public and admin UI.
        slate: {
          50: "#F7F5F1", 100: "#EFEDEA", 200: "#E2DFDA",
          300: "#D1D0CA", 400: "#6B6F73", 500: "#5A5E62",
          600: "#5A5E62", 700: "#45494D", 800: "#383B3E",
          900: "#4A4D50", 950: "#424548",
        },
        "teams-gold": {
          DEFAULT: "#B98A2E", highlight: "#A87922",
          muted: "#A87922", pale: "#F1E8D6", light: "#D6B56C",
        },
        "teams-offwhite": {
          50: "#fffffc",
          100: "#fffbf7",
          200: "#fffaf0",
          300: "#fff9f0",
          400: "#fff3e0",
          500: "#ffe0b2",
        },
        "teams-accent": { 500: "#B98A2E", 600: "#A87922" },
        "teams-charcoal": "#4A4D50",
        "teams-ink": "#2F3133",
        "teams-secondary": "#5A5E62",
        "teams-cta-ink": "#17191A",
        "teams-gold-on-dark": "#E4C88D",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        serif: [
          "Georgia",
          "Cambria",
          "Times New Roman",
          "serif", // Test serif headings
        ],
      },
      spacing: {
        // 8px foundation
        "8": "2rem",
        "16": "4rem",
        "24": "6rem",
        "32": "8rem",
      },
    },
  },
  plugins: [],
};

export default config;
