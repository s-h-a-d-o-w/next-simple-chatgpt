import { defineConfig } from "oxfmt";

export default defineConfig({
  printWidth: 80,

  ignorePatterns: [
    // Don't fight package managers and build tools
    "node_modules/**/*",
    "dist/**/*",
    "build/**/*",
    ".next/**/*",
    ".turbo/**/*",
    ".yarn/**/*",
    ".pnp.cjs",
    "pnpm-lock.yaml",
    "yarn.lock",
    "package-lock.json",

    // Don't fight IDEs and editors
    ".idea/**/*",
    ".vscode/**/*",

    // Don't fight OSes
    ".DS_Store",

    // Don't fight version control systems
    ".git/**/*",

    // Don't fight the workspace
    "pnpm-workspace.yaml",
    "public/**/*",
    "**/model_prices_and_context_window.json",
  ],
});
