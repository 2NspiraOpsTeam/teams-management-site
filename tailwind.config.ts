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
        // Teams Management Design System - Phase 1
        "teams-slate": {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155", // Deep slate/navy - primary brand color
          800: "#1e293b",
          900: "#0f172a",
        },
        "teams-offwhite": {
          50: "#fffffc",
          100: "#fffbf7",
          200: "#fffaf0",
          300: "#fff9f0",
          400: "#fff3e0",
          500: "#ffe0b2",
        },
        "teams-accent": {
          500: "#d4a574", // Warm restrained accent (terracotta/bronze)
          600: "#b88f5e",
        },
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
