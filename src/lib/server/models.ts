import { unstable_rethrow } from "next/navigation";
import { getModelsFromFilesystem } from "./getModelsFromFilesystem";
import type { LiteLLMModelInfo } from "@/types";

const LITELLM_MODELS_URL =
  "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";

const modelSelection = [
  "gpt-4.1",
  "claude-opus-5",
  "claude-haiku-4-5",
  "gpt-5.6-sol",
  "openrouter/z-ai/glm-5",
] as const;

// How we want to use certain models by default.
const modelDefaults: Partial<Record<ModelKey, Partial<ModelConfig>>> = {
  "gpt-5.6-sol": {
    reasoningEffort: "medium",
  },
  "openrouter/z-ai/glm-5": {
    extraBody: {
      reasoning: {
        enabled: true,
      },
    },
  },
};

export type ModelConfig = {
  name: ModelKey; // Maybe we'll have beautified names here later.
  input: number;
  output: number;
  provider: string;

  cacheRead?: number;
  cacheWrite?: number;
  extraBody?: Record<string, unknown>;
  supportsAttachments: boolean;
  reasoningEffort?: "low" | "medium" | "high";
};

export type ModelKey = (typeof modelSelection)[number];

export type Models = Record<ModelKey, ModelConfig>;

function perTokenToPerMillion(costPerToken: number) {
  const result = costPerToken * 1_000_000;
  return Math.round(result * 100) / 100;
}

function transformLiteLLMModel(name: ModelKey, info: LiteLLMModelInfo) {
  return {
    name,
    provider: info.litellm_provider,
    input: perTokenToPerMillion(info.input_cost_per_token),
    output: perTokenToPerMillion(info.output_cost_per_token),
    supportsAttachments: info.supports_vision ?? false,
    cacheRead: info.cache_read_input_token_cost
      ? perTokenToPerMillion(info.cache_read_input_token_cost)
      : undefined,
    cacheWrite: info.cache_creation_input_token_cost
      ? perTokenToPerMillion(info.cache_creation_input_token_cost)
      : undefined,
  };
}

function isModels(models: Partial<Models>): models is Models {
  return modelSelection.every((model) => models[model] !== undefined);
}

async function fetchRemoteModels() {
  // The upstream file is several MB, which exceeds the 2 MB limit of Next's data cache.
  const response = await fetch(LITELLM_MODELS_URL, {
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as Record<string, LiteLLMModelInfo>;
}

function selectModels(data: Record<string, LiteLLMModelInfo>) {
  const nextModels: Partial<Models> = {};
  for (const modelId of modelSelection) {
    const liteLLMInfo = data[modelId];
    if (liteLLMInfo) {
      nextModels[modelId] = transformLiteLLMModel(modelId, liteLLMInfo);
    }
  }

  if (!isModels(nextModels)) {
    throw new Error(
      `Model "${modelSelection.find((model) => nextModels[model] === undefined)}" from whitelist is missing in fetched models.`,
    );
  }

  for (const modelId of modelSelection) {
    const defaultConfig = modelDefaults[modelId];
    if (defaultConfig) {
      nextModels[modelId] = {
        ...nextModels[modelId],
        ...defaultConfig,
      };
    }
  }

  return nextModels;
}

export async function fetchModels() {
  try {
    return selectModels(await fetchRemoteModels());
  } catch (error) {
    // Next.js signals dynamic rendering/redirects via thrown errors.
    unstable_rethrow(error);

    console.error("Failed to fetch model data:", error);

    return selectModels(await getModelsFromFilesystem());
  }
}
