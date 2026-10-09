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
          50: "#F8F7F3", 100: "#F1F0EC", 200: "#E4E2DD",
          300: "#D1D0CA", 400: "#767A7D", 500: "#5B5F63",
          600: "#505458", 700: "#45494D", 800: "#383B3E",
          900: "#2F3133", 950: "#292B2D",
        },
        "teams-gold": {
          DEFAULT: "#C89A3D", highlight: "#D2AA5B",
          muted: "#B68B35", pale: "#F1E8D6",
        },
        "teams-offwhite": {
          50: "#fffffc",
          100: "#fffbf7",
          200: "#fffaf0",
          300: "#fff9f0",
          400: "#fff3e0",
          500: "#ffe0b2",
        },
        "teams-accent": { 500: "#B68B35", 600: "#906D29" },
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
