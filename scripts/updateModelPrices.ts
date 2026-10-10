import { writeFileSync } from "node:fs";
import path from "node:path";
import { modelSelection, OPENROUTER_PREFIX } from "../src/lib/models.ts";
import type { LiteLLMModelInfo, OpenRouterModelInfo } from "../src/types.ts";

const LITELLM_MODELS_URL =
  "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";
const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";

async function fetchText(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
  }

  return response.text();
}

async function writeSnapshot({
  label,
  ownsModel,
  targetPath,
  toEntries,
  url,
}: {
  label: string;
  ownsModel: (model: string) => boolean;
  targetPath: string;
  toEntries: (data: unknown) => readonly (readonly [string, unknown])[];
  url: string;
}) {
  const filteredModels = Object.fromEntries(
    toEntries(JSON.parse(await fetchText(url))).filter(([key]) =>
      (modelSelection as readonly string[]).includes(key),
    ),
  );

  const missingModels = modelSelection.filter(
    (model) => ownsModel(model) && filteredModels[model] === undefined,
  );
  if (missingModels.length > 0) {
    throw new Error(
      `${label} is missing whitelisted models: ${missingModels.join(", ")}`,
    );
  }

  writeFileSync(
    targetPath,
    `${JSON.stringify(filteredModels, undefined, 2)}\n`,
  );
  console.log(
    `Wrote ${Object.keys(filteredModels).length.toString()} models to ${targetPath}`,
  );
}

await writeSnapshot({
  label: "LiteLLM",
  ownsModel: (model) => !model.startsWith(OPENROUTER_PREFIX),
  targetPath: path.resolve(
    "src/lib/server/model_prices_and_context_window.json",
  ),
  toEntries: (data) => Object.entries(data as Record<string, LiteLLMModelInfo>),
  url: LITELLM_MODELS_URL,
});

await writeSnapshot({
  label: "OpenRouter",
  ownsModel: (model) => model.startsWith(OPENROUTER_PREFIX),
  targetPath: path.resolve("src/lib/server/openrouter_models.json"),
  toEntries: (data) =>
    (data as { data: OpenRouterModelInfo[] }).data.map(
      (model) => [`${OPENROUTER_PREFIX}${model.id}`, model] as const,
    ),
  url: OPENROUTER_MODELS_URL,
});
