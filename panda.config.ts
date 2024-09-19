import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  include: ["./src/**/*.{js,jsx,ts,tsx}", "./pages/**/*.{js,jsx,ts,tsx}"],
  // exclude: [],

  theme: {
    extend: {
      tokens: {
        fontSizes: {
          xs: { value: "10rem" },
          sm: { value: "12rem" },
          md: { value: "14rem" },
          lg: { value: "16rem" },
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
