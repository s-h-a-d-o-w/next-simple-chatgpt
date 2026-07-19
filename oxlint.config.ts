import sharedConfig from "@s-h-a-d-o-w/oxlint-config/oxlint.js";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [sharedConfig],
  rules: {
    "import/extensions": "off",
  },
  env: {
    node: true,
    browser: true,
  },
});
