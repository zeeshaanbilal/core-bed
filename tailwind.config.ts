import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        sand: "#f4f2ed",
        ivory: "#ffffff",
        ink: "#3f3a39",
        bronze: "#97b96e",
        slate: "#6f6a67",
        mist: "#e8e3da",
        navy: "#2f2a28",
        sky: "#7ea35a"
      },
      fontFamily: {
        serif: ["Avenir Next", "Trebuchet MS", "Arial", "sans-serif"],
        sans: ["Avenir Next", "Trebuchet MS", "Arial", "sans-serif"]
      },
      boxShadow: {
        soft: "0 24px 70px rgba(47, 42, 40, 0.12)"
      },
      backgroundImage: {
        mesh: "radial-gradient(circle at top left, rgba(151, 185, 110, 0.12), transparent 36%), radial-gradient(circle at bottom right, rgba(63, 58, 57, 0.05), transparent 28%)"
      }
    }
  },
  plugins: []
};

export default config;
