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
        // Neutral aliases preserve existing component utilities while removing navy.
        slate: {
          50: "#FAFAF8", 100: "#F6F4EF", 200: "#E7E4DC",
          300: "#D1CEC7", 400: "#76736E", 500: "#5B5955",
          600: "#44423F", 700: "#2D2C2A", 800: "#171717",
          900: "#111111", 950: "#0A0A0A",
        },
        "teams-gold": {
          DEFAULT: "#C99A3D", highlight: "#D9B45A",
          muted: "#A97C2E", pale: "#E8D6A5",
        },
        "teams-offwhite": {
          50: "#fffffc",
          100: "#fffbf7",
          200: "#fffaf0",
          300: "#fff9f0",
          400: "#fff3e0",
          500: "#ffe0b2",
        },
        "teams-accent": { 500: "#A97C2E", 600: "#825E21" },
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
