import sharedConfig from "./base.config.ts";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [sharedConfig],
  env: {
    node: true,
    browser: true,
  },
});
