import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";

const MODELS_URL =
  "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";
const targetPath = path.resolve(
  "src/lib/server/model_prices_and_context_window.json",
);
const testPath = "src/app/api/chat/billing/getCost.test.ts";

const response = await fetch(MODELS_URL, {
  cache: "no-store",
  signal: AbortSignal.timeout(60_000),
});
if (!response.ok) {
  throw new Error(`Failed to fetch model prices: HTTP ${response.status}`);
}

const data = await response.text();
writeFileSync(targetPath, data);
console.log(
  `Wrote ${Object.keys(JSON.parse(data) as Record<string, unknown>).length.toString()} models to ${targetPath}`,
);

execFileSync("pnpm", ["vitest", "run", "--update", testPath], {
  stdio: "inherit",
  env: { ...process.env, NEXT_PUBLIC_TEST: "true" },
});
