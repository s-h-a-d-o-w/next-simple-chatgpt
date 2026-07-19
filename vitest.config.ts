import { defineConfig } from "vitest/config";
import dotenv from "dotenv";
import path from "node:path";
import { toDirname } from "./src/lib/server/toDirname.ts";

// Load .env.local for tests that need API keys
dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), quiet: true });

export default defineConfig({
  resolve: {
    alias: {
      "@": path.join(toDirname(import.meta.url), "src"),
    },
  },
  test: {
    globals: true,
    exclude: ["node_modules/**", "tests/**"],
  },
});
