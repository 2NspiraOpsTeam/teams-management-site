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
          DEFAULT: "#D4A62A", highlight: "#E0B93F",
          muted: "#B98A1F", pale: "#F1E8D6", light: "#F0D58A",
        },
        "teams-offwhite": {
          50: "#fffffc",
          100: "#fffbf7",
          200: "#fffaf0",
          300: "#fff9f0",
          400: "#fff3e0",
          500: "#ffe0b2",
        },
        "teams-accent": { 500: "#D4A62A", 600: "#B98A1F" },
        "teams-charcoal": "#44484B",
        "teams-ink": "#2D3032",
        "teams-secondary": "#565B5F",
        "teams-cta-ink": "#111111",
        "teams-gold-on-dark": "#F0D58A",
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
