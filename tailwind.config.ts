import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0a0a0a",
        surface: "#111111",
        "surface-2": "#1a1a1a",
        line: "#2a2a2a",
        ink: {
          50: "#f0f0f0",
          200: "#c8c8c8",
          400: "#888888",
          600: "#444444",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        "glow-white": "0 0 20px rgba(255,255,255,0.15), 0 0 60px rgba(255,255,255,0.05)",
        "glow-sm": "0 0 12px rgba(255,255,255,0.1)",
        glass: "0 8px 32px rgba(0,0,0,0.8)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
        "radial-fade":
          "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.06), transparent 60%)",
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
        float: "float 6s ease-in-out infinite",
        blink: "blink 1s steps(1) infinite",
        "scan": "scan 3s linear infinite",
        "grain": "grain 0.5s steps(1) infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-12px)" },
        },
        blink: {
          "0%, 50%": { opacity: "1" },
          "51%, 100%": { opacity: "0" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "10%": { transform: "translate(-5%, -10%)" },
          "30%": { transform: "translate(3%, -15%)" },
          "50%": { transform: "translate(12%, 9%)" },
          "70%": { transform: "translate(-4%, 7%)" },
          "90%": { transform: "translate(-6%, 3%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
