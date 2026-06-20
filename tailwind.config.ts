import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0F2B5B",
        canvas: "#F5F7FA",
        ink: "#172033",
        success: "#16894A",
        warning: "#D97706",
        danger: "#C83737"
      },
      boxShadow: { card: "0 8px 24px rgba(15, 43, 91, 0.08)" },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"] }
    }
  },
  plugins: []
};

export default config;
