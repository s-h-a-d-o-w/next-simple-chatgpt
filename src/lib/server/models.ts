import { unstable_rethrow } from "next/navigation";
import { getModelsFromFilesystem } from "./getModelsFromFilesystem";
import {
  modelSelection,
  prettyNames,
  type ModelConfig,
  type ModelKey,
  type Models,
} from "@/lib/models";
import type { LiteLLMModelInfo } from "@/types";

const LITELLM_MODELS_URL =
  "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";
const CACHE_TTL_MS = 6 * 60 * 60 * 1_000;

let remoteModelsCache:
  | { expiresAt: number; promise: Promise<Record<string, LiteLLMModelInfo>> }
  | undefined = undefined;

// Models that need config beyond UI.
const modelDefaults: Partial<Record<ModelKey, Partial<ModelConfig>>> = {
  "openrouter/z-ai/glm-5": {
    extraBody: {
      reasoning: {
        enabled: true,
      },
    },
  },
};

function perTokenToPerMillion(costPerToken: number) {
  const result = costPerToken * 1_000_000;
  return Math.round(result * 100) / 100;
}

function transformLiteLLMModel(name: ModelKey, info: LiteLLMModelInfo) {
  return {
    name: prettyNames[name],
    provider: info.litellm_provider,
    input: perTokenToPerMillion(info.input_cost_per_token),
    output: perTokenToPerMillion(info.output_cost_per_token),
    supportsAttachments: info.supports_vision ?? false,
    supportsReasoning: info.supports_reasoning ?? false,
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

function getRemoteModels() {
  if (!remoteModelsCache || remoteModelsCache.expiresAt <= Date.now()) {
    const promise = fetchRemoteModels().catch((error: unknown) => {
      remoteModelsCache = undefined;
      throw error;
    });

    remoteModelsCache = { expiresAt: Date.now() + CACHE_TTL_MS, promise };
  }

  return remoteModelsCache.promise;
}

function selectModels(data: Record<string, LiteLLMModelInfo>) {
  const nextModels: Partial<Models> = {};
  for (const modelId of modelSelection) {
    const liteLLMInfo = data[modelId];
    if (liteLLMInfo) {
      nextModels[modelId] = transformLiteLLMModel(modelId, liteLLMInfo);
      const defaultConfig = modelDefaults[modelId];
      if (defaultConfig) {
        nextModels[modelId] = {
          ...nextModels[modelId],
          ...defaultConfig,
        };
      }
    }
  }

  if (!isModels(nextModels)) {
    throw new Error(
      `Model "${modelSelection.find((model) => nextModels[model] === undefined)}" from whitelist is missing in fetched models.`,
    );
  }

  return nextModels;
}

export async function fetchModels() {
  try {
    return selectModels(await getRemoteModels());
  } catch (error) {
    // Next.js signals dynamic rendering/redirects via thrown errors.
    unstable_rethrow(error);

    console.error("Failed to fetch model data:", error);

    return selectModels(await getModelsFromFilesystem());
  }
}
