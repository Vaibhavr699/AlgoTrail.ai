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
        brand: {
          50: "#F1F6F2",
          100: "#DDEADF",
          200: "#B8D2BD",
          300: "#8AB494",
          400: "#5E9069",
          500: "#3A7048",
          600: "#2B5736",
          700: "#1D3F26",
          800: "#152E1B",
          900: "#0D1F12",
          DEFAULT: "#2B5736",
        },
        forest: {
          50: "#F1F6F2",
          100: "#DDEADF",
          200: "#B8D2BD",
          300: "#8AB494",
          400: "#5E9069",
          500: "#3A7048",
          600: "#2B5736",
          700: "#1D3F26",
          800: "#152E1B",
          900: "#0D1F12",
          ink: "#0E2017",
        },
        canvas: {
          DEFAULT: "#F2F2EE",
          card: "#FFFFFF",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#111827",
          page: "#F9FAFB",
          pageDark: "#0A0F1E",
        },
        line: {
          DEFAULT: "#E5E7EB",
          dark: "#1F2937",
        },
        difficulty: {
          easy: "#10B981",
          medium: "#F59E0B",
          hard: "#EF4444",
        },
        success: "#10B981",
        warning: "#F59E0B",
        info: "#3B82F6",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "8px",
        md: "6px",
        sm: "4px",
        "2xl": "20px",
        "3xl": "28px",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        "marquee": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "float-y": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "marquee": "marquee 40s linear infinite",
        "float-y": "float-y 5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
