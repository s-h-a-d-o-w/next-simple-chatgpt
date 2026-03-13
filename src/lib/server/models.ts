import { isTest } from "@/lib/utils/consts";
import { getModelsFromFilesystem } from "./getModelsFromFilesystem";
import type { LiteLLMModelInfo } from "../types";

const REVALIDATE_SECONDS = 6 * 60 * 60; // 6 hours
const LITELLM_MODELS_URL =
  "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";
const modelWhitelist = [
  "gpt-4.1",
  "claude-opus-4-5",
  "claude-haiku-4-5",
  "gpt-5.4",
  "openrouter/z-ai/glm-5",
] as const;

// How we want to use certain models by default.
const modelAugments: Partial<Record<ModelKey, Partial<ModelConfig>>> = {
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

export type ModelKey = (typeof modelWhitelist)[number];

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
    supportsAttachments:
      info.supports_vision ?? info.supports_pdf_input ?? false,
    cacheRead: info.cache_read_input_token_cost
      ? perTokenToPerMillion(info.cache_read_input_token_cost)
      : undefined,
    cacheWrite: info.cache_creation_input_token_cost
      ? perTokenToPerMillion(info.cache_creation_input_token_cost)
      : undefined,
  };
}

function isModels(models: Partial<Models>): models is Models {
  return modelWhitelist.every((model) => models[model] !== undefined);
}

export async function fetchModels() {
  let data: Record<string, LiteLLMModelInfo> | undefined = undefined;

  try {
    if (isTest) {
      data = await getModelsFromFilesystem();
    } else {
      const response = await fetch(LITELLM_MODELS_URL, {
        signal: AbortSignal.timeout(30000),
        next: { revalidate: REVALIDATE_SECONDS },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      data = (await response.json()) as Record<string, LiteLLMModelInfo>;
    }
  } catch (error) {
    console.error("Failed to fetch model data:", error);

    data = await getModelsFromFilesystem();
  }

  const nextModels: Partial<Models> = {};
  for (const modelId of modelWhitelist) {
    const liteLLMInfo = data[modelId];
    if (liteLLMInfo) {
      nextModels[modelId] = transformLiteLLMModel(modelId, liteLLMInfo);
    }
  }

  if (!isModels(nextModels)) {
    throw new Error(
      `Model "${modelWhitelist.find((model) => nextModels[model] === undefined)}" from whitelist is missing in fetched models.`,
    );
  }

  // Augment the models with the modelAugments.
  for (const modelId of modelWhitelist) {
    const augment = modelAugments[modelId];
    if (augment) {
      nextModels[modelId] = {
        ...nextModels[modelId],
        ...augment,
      };
    }
  }

  return nextModels;
}
