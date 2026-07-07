import { getModelsFromFilesystem } from "./getModelsFromFilesystem";
import type { LiteLLMModelInfo } from "@/types";

const REVALIDATE_SECONDS = 6 * 60 * 60; // 6 hours
const LITELLM_MODELS_URL =
  "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";
type RemoteModelsCache = {
  expiresAt: number;
  promise: Promise<Record<string, LiteLLMModelInfo>>;
};

let remoteModelsCache: RemoteModelsCache | undefined = undefined;

const modelSelection = [
  "gpt-4.1",
  "claude-opus-4-8",
  "claude-haiku-4-5",
  "gpt-5.4",
  "openrouter/z-ai/glm-5",
] as const;

// How we want to use certain models by default.
const modelDefaults: Partial<Record<ModelKey, Partial<ModelConfig>>> = {
  "gpt-5.4": {
    reasoningEffort: "low",
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
  const response = await fetch(LITELLM_MODELS_URL, {
    cache: "no-store",
    signal: AbortSignal.timeout(30000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return (await response.json()) as Record<string, LiteLLMModelInfo>;
}

function getRemoteModels() {
  const now = Date.now();

  if (!remoteModelsCache || remoteModelsCache.expiresAt <= now) {
    const promise = fetchRemoteModels().catch((error: unknown) => {
      remoteModelsCache = undefined;
      throw error;
    });

    if (!remoteModelsCache) {
      remoteModelsCache = {
        expiresAt: now + REVALIDATE_SECONDS * 1000,
        promise,
      };
    } else {
      promise
        .then((data) => {
          remoteModelsCache = {
            expiresAt: now + REVALIDATE_SECONDS * 1000,
            promise: Promise.resolve(data),
          };
        })
        .catch((error: unknown) => {
          remoteModelsCache = undefined;
          throw error;
        });
    }
  }

  return remoteModelsCache.promise;
}

export async function fetchModels() {
  let data: Record<string, LiteLLMModelInfo>;

  try {
    data = await getRemoteModels();
  } catch (error) {
    console.error("Failed to fetch model data:", error);

    data = await getModelsFromFilesystem();
  }

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
