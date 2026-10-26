import { getLiteLLMModels, transformLiteLLMModel } from "./liteLLMModels";
import {
  getOpenRouterModels,
  transformOpenRouterModel,
} from "./openRouterModels";
import {
  internalModelSelection,
  modelSelection,
  OPENROUTER_PREFIX,
  type AnyModelKey,
  type ModelConfig,
} from "@/lib/models";
import type { LiteLLMModelInfo, OpenRouterModelInfo } from "@/types";

function isComplete<Key extends AnyModelKey>(
  modelIds: readonly Key[],
  models: Partial<Record<Key, ModelConfig>>,
): models is Record<Key, ModelConfig> {
  return modelIds.every((modelId) => models[modelId] !== undefined);
}

function selectModels<Key extends AnyModelKey>(
  modelIds: readonly Key[],
  liteLLMModels: Record<string, LiteLLMModelInfo>,
  openRouterModels: Record<string, OpenRouterModelInfo>,
) {
  const nextModels: Partial<Record<Key, ModelConfig>> = {};
  for (const modelId of modelIds) {
    if (modelId.startsWith(OPENROUTER_PREFIX)) {
      const openRouterInfo = openRouterModels[modelId];
      if (openRouterInfo) {
        nextModels[modelId] = transformOpenRouterModel(modelId, openRouterInfo);
      }
    } else {
      const liteLLMInfo = liteLLMModels[modelId];
      if (liteLLMInfo) {
        nextModels[modelId] = transformLiteLLMModel(modelId, liteLLMInfo);
      }
    }
  }

  if (!isComplete(modelIds, nextModels)) {
    throw new Error(
      `Model "${modelIds.find((modelId) => nextModels[modelId] === undefined)}" from whitelist is missing in fetched models.`,
    );
  }

  return nextModels;
}

async function fetchSelection<Key extends AnyModelKey>(
  modelIds: readonly Key[],
) {
  const [liteLLMModels, openRouterModels] = await Promise.all([
    getLiteLLMModels(),
    getOpenRouterModels(),
  ]);

  return selectModels(modelIds, liteLLMModels, openRouterModels);
}

export function fetchModels() {
  return fetchSelection(modelSelection);
}

export function fetchInternalModels() {
  return fetchSelection(internalModelSelection);
}
