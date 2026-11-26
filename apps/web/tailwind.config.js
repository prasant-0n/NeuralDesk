/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: {
          deep: "#07080d",
          page: "#0b0d14",
          card: "#11141c",
          raised: "#1a1e28",
          hairline: "rgba(238, 240, 245, 0.08)",
          text: {
            primary: "#eef0f5",
            secondary: "#a3a9b8",
            muted: "#7a8296",
          },
        },
        charcoal: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          850: "#141c2e",
          900: "#0f172a",
          925: "#0b1120",
          950: "#0b0d14",
        },
        primary: {
          DEFAULT: "#4f46e5",
          hover: "#4338ca",
          light: "#6366f1",
          dark: "#3730a3",
        },
        canvas: {
          bg: "#0b0d14",
          card: "#11141c",
          subtle: "#07080d",
          border: "rgba(238, 240, 245, 0.08)",
          hover: "#1a1e28",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      borderRadius: {
        sm: "0.25rem", // 4px
        DEFAULT: "0.375rem", // 6px
        md: "0.5rem", // 8px
        lg: "0.625rem", // 10px
        xl: "0.75rem", // 12px
        "2xl": "1rem", // 16px
      },
      transitionTimingFunction: {
        craft: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
