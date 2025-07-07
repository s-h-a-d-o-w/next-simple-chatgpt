import { defineConfig, defineGlobalStyles } from "@pandacss/dev";

const globalCss = defineGlobalStyles({
  h1: {
    fontSize: "4xl",
    mt: "28rem",
  },
  h2: {
    fontSize: "3xl",
    mt: "20rem",
  },
  h3: {
    fontSize: "2xl",
    mt: "16rem",
  },
  h4: {
    fontSize: "xl",
    mt: "12rem",
  },
  h5: {
    fontSize: "lg",
    mt: "8rem",
  },
  h6: {
    fontSize: "md",
    mt: "4rem",
  },

  // markdown styles
  "li > p": {
    display: "inline",
  },
  "ol, ul": {
    marginBottom: "24rem",
  },
  li: {
    listStylePosition: "outside",
    marginLeft: "16rem",
  },
  "ol > li": {
    listStyleType: "decimal",
  },
  "ul > li": {
    listStyleType: "disc",
  },
});

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  globalCss,

  include: ["./src/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],
  // exclude: [],

  theme: {
    extend: {
      breakpoints: {
        xs: "380px",
      },
      tokens: {
        fontSizes: {
          "2xs": { value: "8rem" },
          xs: { value: "10rem" },
          sm: { value: "12rem" },
          md: { value: "14rem" },
          lg: { value: "16rem" },
          xl: { value: "18rem" },
          "2xl": { value: "20rem" },
          "3xl": { value: "24rem" },
          "4xl": { value: "36rem" },
        },
        colors: {
          brand: {
            100: {
              value: "#ed75f5",
            },
            500: {
              value: "#d35cdb",
            },
            900: {
              value: "#933793",
            },
          },
          gray: {
            50: { value: "oklch(0.985 0.0024 247.92)" },
            100: { value: "oklch(0.967 0.0024 247.92)" },
            200: { value: "oklch(0.928 0.0024 247.92)" },
            300: { value: "oklch(0.872 0.0024 247.92)" },
            400: { value: "oklch(0.707 0.0024 247.92)" },
            500: { value: "oklch(0.551 0.0024 247.92)" },
            600: { value: "oklch(0.446 0.0024 247.92)" },
            700: { value: "oklch(0.373 0.0024 247.92)" },
            800: { value: "oklch(0.25 0.0024 247.92)" },
            900: { value: "oklch(0.21 0.0024 247.92)" },
            950: { value: "oklch(0.13 0.0024 247.92)" },
          },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: "styled-system",

  // The JSX framework to use
  jsxFramework: "react",
});
