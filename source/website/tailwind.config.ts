import { type Config } from "tailwindcss";
import daisyui from "daisyui";
import typography from "@tailwindcss/typography";
import safeArea from "tailwindcss-safe-area";
import { type Dictionary } from "../shared/types/Dictionary";

const config: Config = {
  mode: "jit",
  purge: ["./public/**/*.html", "./src/**/*.{astro,js,jsx,ts,tsx,vue}"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      xxl: "1536px",
      ...(() => {
        const output: Dictionary<string> = {};
        const cardSize = 372;
        const startSize = cardSize * 2;
        const outerPad = 8;

        for (let i = 0; i < 6; i++) {
          const breakpoint = `mcb-${i + 2}`;
          output[breakpoint] = `${startSize + cardSize * i + outerPad * 2}px`;
        }

        return output;
      })()
    },
    colors: {
      "header-input-bg": "var(--header-input-bg)",
      "header-input-placeholder": "var(--header-input-placeholder)",
      "header-input-text": "var(--header-input-text)",
      "header-footer-bg": "var(--header-footer-bg)",
      "header-text": "var(--header-text)",
      "card-body-bg": "var(--card-body-bg)",
      "card-body-text": "var(--card-body-text)",
      "card-header-bg": "var(--card-header-bg)",
      "github-corner-fill": "var(--github-corner-fill)",
      "github-corner-color": "var(--github-corner-color)",
      "input-bg": "var(--input-bg)",
      "input-placeholder": "var(--input-placeholder)",
      "input-text": "var(--input-text)",
      "dropdown-menu-bg": "var(--dropdown-menu-bg)",
      "dropdown-menu-text": "var(--dropdown-menu-text)",
      "dropdown-menu-hover": "var(--dropdown-menu-hover)",
      "dropzone-bg": "var(--dropzone-bg)",
      "dropzone-border": "var(--dropzone-border)",
      "dropzone-text": "var(--dropzone-text)",
      transparent: "rgba(0,0,0,0)",
      "white-alpha-10": "rgba(255, 255, 255, 0.1)",
      "white-alpha-20": "rgba(255, 255, 255, 0.2)",
      "white-alpha-30": "rgba(255, 255, 255, 0.3)",
      "white-alpha-40": "rgba(255, 255, 255, 0.4)",
      "white-alpha-50": "rgba(255, 255, 255, 0.5)",
      "white-alpha-60": "rgba(255, 255, 255, 0.6)",
      "white-alpha-70": "rgba(255, 255, 255, 0.7)",
      "white-alpha-80": "rgba(255, 255, 255, 0.8)",
      "white-alpha-90": "rgba(255, 255, 255, 0.9)",
      "black-alpha-10": "rgba(0, 0, 0, 0.1)",
      "black-alpha-20": "rgba(0, 0, 0, 0.2)",
      "black-alpha-30": "rgba(0, 0, 0, 0.3)",
      "black-alpha-40": "rgba(0, 0, 0, 0.4)",
      "black-alpha-50": "rgba(0, 0, 0, 0.5)",
      "black-alpha-60": "rgba(0, 0, 0, 0.6)",
      "black-alpha-70": "rgba(0, 0, 0, 0.7)",
      "black-alpha-80": "rgba(0, 0, 0, 0.8)",
      "black-alpha-90": "rgba(0, 0, 0, 0.9)",
      black: "#000",
      white: "#fff"
    },
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        pixelguy: "url('/images/pixelguy.jpg')"
      }
    }
  },
  plugins: [daisyui, typography, safeArea],
  daisyui: {
    themes: ["business"]
  }
};

export default config;
