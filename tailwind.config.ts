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
        brand: {
          navy: "#093774",
          coral: "#FF6859",
          growth: "#15B5B0",
          cream: "#FFF3E6",
          dark: "#2C335D",
        },
      },
      fontFamily: {
        sans: ["Be Vietnam Pro", "system-ui", "sans-serif"],
        lora: ["Lora", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
