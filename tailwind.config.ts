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
          primary: "#0F766E",
          primaryDark: "#134E4A",
          teal: "#15B5B0",
          accent: "#B45309",
          amber: "#D97706",
          bg: "#F5F2EC",
          text: "#292524",
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
