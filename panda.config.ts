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
});

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  globalCss,

  include: ["./src/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],
  // exclude: [],

  theme: {
    extend: {
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
        shadows: {
          lg: { value: "rgb(38, 57, 77) 0px 20px 30px -10px" },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: "styled-system",

  // The JSX framework to use
  jsxFramework: "react",
});
