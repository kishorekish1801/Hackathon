import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#081A2E",
          900: "#0B2340",
          800: "#123258",
          700: "#1B4272",
          600: "#28578F",
        },
        teal: {
          50: "#EBFAFA",
          100: "#D2F2F2",
          300: "#7FD6D6",
          400: "#43BFC0",
          500: "#0E9C9E",
          600: "#0B7F82",
          700: "#0A6668",
        },
        surface: {
          DEFAULT: "#F5F8FA",
          raised: "#FFFFFF",
          sunken: "#EAF1F4",
          line: "#DCE6EA",
        },
        status: {
          low: "#3F8F5D",
          "low-bg": "#E9F5EE",
          medium: "#B8860F",
          "medium-bg": "#FBF3DD",
          high: "#C46A2E",
          "high-bg": "#FBEBDD",
          critical: "#BC3A34",
          "critical-bg": "#FBE7E5",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(11, 35, 64, 0.06), 0 8px 24px -12px rgba(11, 35, 64, 0.15)",
        raised: "0 2px 6px rgba(11, 35, 64, 0.08), 0 16px 40px -16px rgba(11, 35, 64, 0.22)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      maxWidth: {
        content: "72rem",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
