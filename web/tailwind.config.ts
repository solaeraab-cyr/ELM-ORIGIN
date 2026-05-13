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
        // Brand — Elm Origin Navy
        brand: {
          50:  "#EEF0FF",
          100: "#D6DCFF",
          200: "#B8C4F4",
          300: "#7B8FE8",
          400: "#3D52CC",
          500: "#2236B0",
          600: "#1B2B8E",
          700: "#142070",
          800: "#0D1757",
        },
        // Mint (success)
        mint: {
          100: "#D1FAE5",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
          700: "#047857",
        },
        // Gold / Amber (Pro only)
        gold: {
          100: "#FEF3C7",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#B45309",
          700: "#92400E",
        },
        amber: {
          100: "#FEF3C7",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#B45309",
        },
        // Danger
        danger: {
          100: "#FFE4E6",
          500: "#E11D48",
          600: "#BE123C",
        },
        // Surfaces
        "bg-base":     "#F8F9FF",
        "bg-surface":  "#FFFFFF",
        "bg-elevated": "#FFFFFF",
        "bg-hover":    "#EEF0FF",
        "bg-subtle":   "#EEF0FF",
        "bg-sidebar":  "#F0F2FF",
      },
      backgroundImage: {
        "gradient-brand":      "linear-gradient(135deg, #0D1757 0%, #3D52CC 100%)",
        "gradient-brand-warm": "linear-gradient(135deg, #1B2B8E 0%, #F59E0B 100%)",
        "gradient-ai":         "linear-gradient(135deg, #10B981 0%, #3D52CC 100%)",
      },
      fontFamily: {
        display:  ["var(--font-fraunces)", "serif"],
        sans:     ["var(--font-inter)", "system-ui", "sans-serif"],
        body:     ["var(--font-instrument)", "system-ui", "sans-serif"],
        mono:     ["var(--font-jetbrains)", "monospace"],
      },
      borderRadius: {
        "xs": "4px",
        "sm": "8px",
        "md": "12px",
        "lg": "16px",
        "xl": "20px",
        "2xl": "28px",
      },
      boxShadow: {
        "xs":    "0 1px 3px rgba(13,23,87,0.08)",
        "sm":    "0 2px 8px rgba(13,23,87,0.10)",
        "md":    "0 4px 20px rgba(13,23,87,0.12)",
        "lg":    "0 12px 36px rgba(13,23,87,0.14)",
        "xl":    "0 20px 60px rgba(13,23,87,0.18)",
        "brand": "0 8px 28px rgba(27,43,142,0.30), 0 2px 8px rgba(13,23,87,0.18)",
        "ai":    "0 8px 28px rgba(16,185,129,0.18), 0 2px 8px rgba(16,185,129,0.10)",
        "gold":  "0 8px 28px rgba(245,158,11,0.30)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "spring":   "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "in-expo":  "cubic-bezier(0.7, 0, 0.84, 0)",
        "smooth":   "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
