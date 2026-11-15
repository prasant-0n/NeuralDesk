/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
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
          950: "#020617",
        },
        primary: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          light: "#818cf8",
          dark: "#3730a3",
        },
        canvas: {
          bg: "#020617",
          card: "#0b1120",
          subtle: "#0f172a",
          border: "#1e293b",
          hover: "#334155",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-amber": "glowAmber 1.5s ease-in-out infinite alternate",
        "glow-indigo": "glowIndigo 1.5s ease-in-out infinite alternate",
        "glow-emerald": "glowEmerald 1.5s ease-in-out infinite alternate",
        "glow-rose": "glowRose 1.5s ease-in-out infinite alternate",
      },
      keyframes: {
        glowAmber: {
          "0%": { boxShadow: "0 0 5px rgba(245, 158, 11, 0.4), inset 0 0 5px rgba(245, 158, 11, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(245, 158, 11, 0.9), inset 0 0 10px rgba(245, 158, 11, 0.4)" },
        },
        glowIndigo: {
          "0%": { boxShadow: "0 0 5px rgba(99, 102, 241, 0.4), inset 0 0 5px rgba(99, 102, 241, 0.2)" },
          "100%": { boxShadow: "0 0 22px rgba(99, 102, 241, 0.9), inset 0 0 10px rgba(99, 102, 241, 0.4)" },
        },
        glowEmerald: {
          "0%": { boxShadow: "0 0 5px rgba(16, 185, 129, 0.4), inset 0 0 5px rgba(16, 185, 129, 0.2)" },
          "100%": { boxShadow: "0 0 18px rgba(16, 185, 129, 0.8), inset 0 0 8px rgba(16, 185, 129, 0.3)" },
        },
        glowRose: {
          "0%": { boxShadow: "0 0 5px rgba(244, 63, 94, 0.4), inset 0 0 5px rgba(244, 63, 94, 0.2)" },
          "100%": { boxShadow: "0 0 18px rgba(244, 63, 94, 0.8), inset 0 0 8px rgba(244, 63, 94, 0.3)" },
        },
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
