/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        aura: {
          bg: "#0B0D17",
          card: "rgba(18, 22, 39, 0.75)",
          border: "rgba(139, 92, 246, 0.15)",
          primary: "#8B5CF6", // Violet
          secondary: "#6366F1", // Indigo
          accent: "#EC4899", // Pink
          warning: "#F59E0B",
          critical: "#EF4444",
          success: "#10B981",
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "wave": "waveform 1.2s ease-in-out infinite",
      },
      keyframes: {
        waveform: {
          "0%, 100%": { height: "6px" },
          "50%": { height: "24px" },
        },
      },
    },
  },
  plugins: [],
};
