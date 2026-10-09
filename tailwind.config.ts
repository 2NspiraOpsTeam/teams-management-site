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
          50: "#F7F4EE", 100: "#EAE7E2", 200: "#E0DDD7",
          300: "#D1D0CA", 400: "#6F7478", 500: "#565B5F",
          600: "#565B5F", 700: "#45494D", 800: "#383B3E",
          900: "#44484B", 950: "#3C4043",
        },
        "teams-gold": {
          DEFAULT: "#B58A3A", highlight: "#9F742B",
          muted: "#9F742B", pale: "#F1E8D6", light: "#D8BD83",
        },
        "teams-offwhite": {
          50: "#fffffc",
          100: "#fffbf7",
          200: "#fffaf0",
          300: "#fff9f0",
          400: "#fff3e0",
          500: "#ffe0b2",
        },
        "teams-accent": { 500: "#B58A3A", 600: "#9F742B" },
        "teams-charcoal": "#44484B",
        "teams-ink": "#2D3032",
        "teams-secondary": "#565B5F",
        "teams-cta-ink": "#111111",
        "teams-gold-on-dark": "#D8BD83",
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
