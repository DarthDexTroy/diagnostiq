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
        "axxess-blue": "#007BFF",
        "vital-green": "#28A745",
        "warning-amber": "#FFC107",
        "glass-grey": "#F8F9FA",
      },
      keyframes: {
        orbPulse: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(0, 123, 255, 0.5)" },
          "50%": { boxShadow: "0 0 0 14px rgba(0, 123, 255, 0)" },
        },
        dividerPulse: {
          "0%, 100%": { opacity: "0.7" },
          "50%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bubbleRise: {
          "0%": { opacity: "0", transform: "translateY(12px) scale(0.85)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        jargonBounce: {
          "0%": { opacity: "0", transform: "translateX(-10px) scale(0.95)" },
          "60%": { transform: "translateX(2px) scale(1.04)" },
          "100%": { opacity: "1", transform: "translateX(0) scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        globeSpin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "orb-pulse": "orbPulse 2s ease-in-out infinite",
        "divider-pulse": "dividerPulse 1.2s ease-in-out infinite",
        "fade-in-up": "fadeInUp 0.4s ease-out forwards",
        "bubble-rise": "bubbleRise 0.6s ease-out forwards",
        "jargon-bounce": "jargonBounce 0.5s ease-out forwards",
        shimmer: "shimmer 1.5s linear infinite",
        "globe-spin": "globeSpin 0.6s ease-out",
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
