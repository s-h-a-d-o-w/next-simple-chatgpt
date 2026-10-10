import { getLiteLLMModels, transformLiteLLMModel } from "./liteLLMModels";
import {
  getOpenRouterModels,
  transformOpenRouterModel,
} from "./openRouterModels";
import { modelSelection, OPENROUTER_PREFIX, type Models } from "@/lib/models";
import type { LiteLLMModelInfo, OpenRouterModelInfo } from "@/types";

function isModels(models: Partial<Models>): models is Models {
  return modelSelection.every((model) => models[model] !== undefined);
}

function selectModels(
  liteLLMModels: Record<string, LiteLLMModelInfo>,
  openRouterModels: Record<string, OpenRouterModelInfo>,
) {
  const nextModels: Partial<Models> = {};
  for (const modelId of modelSelection) {
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

  if (!isModels(nextModels)) {
    throw new Error(
      `Model "${modelSelection.find((model) => nextModels[model] === undefined)}" from whitelist is missing in fetched models.`,
    );
  }

  return nextModels;
}

export async function fetchModels() {
  const [liteLLMModels, openRouterModels] = await Promise.all([
    getLiteLLMModels(),
    getOpenRouterModels(),
  ]);

  return selectModels(liteLLMModels, openRouterModels);
}
