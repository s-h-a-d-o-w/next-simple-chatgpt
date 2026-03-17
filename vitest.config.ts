import { defineConfig } from "vitest/config";
import dotenv from "dotenv";
import { resolve, join } from "node:path";
import { toDirname } from "./src/lib/server/toDirname.ts";

// Load .env.local for tests that need API keys
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

export default defineConfig({
  resolve: {
    alias: {
      "@": join(toDirname(import.meta.url), "src"),
    },
  },
  test: {
    globals: true,
    exclude: ["node_modules/**", "tests/**"],
  },
});
