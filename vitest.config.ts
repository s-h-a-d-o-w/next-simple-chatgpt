import { defineConfig } from "vitest/config";
import dotenv from "dotenv";
import { resolve } from "node:path";

// Load .env.local for tests that need API keys
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  test: {
    globals: true,
    exclude: ["node_modules/**", "tests/**"],
  },
});
