import baseConfig from "@s-h-a-d-o-w/oxlint-config/oxfmt.js";
import { defineConfig } from "oxfmt";

export default defineConfig({
  ...baseConfig,
  ignorePatterns: [
    ...baseConfig.ignorePatterns,
    "public/**/*",
    "**/model_prices_and_context_window.json",
  ],
});
