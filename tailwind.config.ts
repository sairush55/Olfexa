import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#15803d", // botanical dark green
          600: "#166534",
          700: "#14532d",
          800: "#052e16",
          900: "#021a0c",
        },
        slate: {
          850: "#111b27",
          950: "#070c14",
        },
        accent: {
          amber: "#d97706",
          rose: "#e11d48",
          emerald: "#059669",
          cyan: "#0891b2",
        }
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        widest: ".18em",
        tighter: "-0.04em",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.04), 0 1px 3px 0 rgba(0, 0, 0, 0.06)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)",
        elevated: "0 20px 40px -15px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
