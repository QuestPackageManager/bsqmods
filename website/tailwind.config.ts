import { type Config } from "tailwindcss";
import daisyui from "daisyui"
import typography from "@tailwindcss/typography"

const config: Config = {
  mode: 'jit',
  purge: ['./public/**/*.html', './src/**/*.{astro,js,jsx,ts,tsx,vue}'],
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    screens: {
      'sm': '640px',
      'md': '885px',
      'lg': '1150px',
      'xl': '1470px',
      'xxl': '1760px',
      'xxxl': '2330px',
    },
    colors: {
      "dark-header-footer": "rgba(0, 0, 17, 0.698)",
      "dark-card": "rgba(4, 11, 47, 0.698)",
      "transparent": "rgba(0,0,0,0)",
      "white-alpha-10": "rgba(255, 255, 255, 0.1)",
      "white-alpha-20": "rgba(255, 255, 255, 0.2)",
      "white-alpha-30": "rgba(255, 255, 255, 0.3)",
      "white-alpha-40": "rgba(255, 255, 255, 0.4)",
      "white-alpha-50": "rgba(255, 255, 255, 0.5)",
      "white-alpha-60": "rgba(255, 255, 255, 0.6)",
      "white-alpha-70": "rgba(255, 255, 255, 0.7)",
      "white-alpha-80": "rgba(255, 255, 255, 0.8)",
      "white-alpha-90": "rgba(255, 255, 255, 0.9)",
      "white-alpha-100": "#fff",
      "black-alpha-10": "rgba(0, 0, 0, 0.1)",
      "black-alpha-20": "rgba(0, 0, 0, 0.2)",
      "black-alpha-30": "rgba(0, 0, 0, 0.3)",
      "black-alpha-40": "rgba(0, 0, 0, 0.4)",
      "black-alpha-50": "rgba(0, 0, 0, 0.5)",
      "black-alpha-60": "rgba(0, 0, 0, 0.6)",
      "black-alpha-70": "rgba(0, 0, 0, 0.7)",
      "black-alpha-80": "rgba(0, 0, 0, 0.8)",
      "black-alpha-90": "rgba(0, 0, 0, 0.9)",
      "black-alpha-100": "#000",
      "black": "#000",
      "white": "#fff"
    },
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    daisyui,
    typography,
  ],
  daisyui: {
    themes: ["business"]
  }
};

export default config;
