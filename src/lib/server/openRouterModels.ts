import { getOpenRouterModelsFromFilesystem } from "./getModelsFromFilesystem";
import {
  createCachedFetcher,
  fetchJson,
  perTokenToPerMillion,
  withFilesystemFallback,
} from "./modelFetching";
import { OPENROUTER_PREFIX, prettyNames, type ModelKey } from "@/lib/models";
import type { OpenRouterModelInfo } from "@/types";

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";

// OpenRouter reports prices as strings and uses "0"/"-1" for free or variable pricing.
function parsePricePerMillion(costPerToken: string | undefined) {
  const parsed = Number(costPerToken);
  return costPerToken !== undefined && parsed > 0
    ? perTokenToPerMillion(parsed)
    : undefined;
}

async function fetchRemoteOpenRouterModels() {
  const { data } = (await fetchJson(OPENROUTER_MODELS_URL)) as {
    data: OpenRouterModelInfo[];
  };

  return Object.fromEntries(
    data.map((model) => [`${OPENROUTER_PREFIX}${model.id}`, model]),
  );
}

const getRemoteOpenRouterModels = createCachedFetcher(
  fetchRemoteOpenRouterModels,
);

export function transformOpenRouterModel(
  name: ModelKey,
  info: OpenRouterModelInfo,
) {
  const { architecture, pricing, supported_parameters } = info;

  return {
    name: prettyNames[name],
    provider: "openrouter",
    input: parsePricePerMillion(pricing.prompt) ?? 0,
    output: parsePricePerMillion(pricing.completion) ?? 0,
    supportsAttachments: architecture.input_modalities.includes("image"),
    supportsReasoning: supported_parameters?.includes("reasoning") ?? false,
    cacheRead: parsePricePerMillion(pricing.input_cache_read),
    cacheWrite: parsePricePerMillion(pricing.input_cache_write),
  };
}

export function getOpenRouterModels() {
  return withFilesystemFallback(
    getRemoteOpenRouterModels,
    getOpenRouterModelsFromFilesystem,
  );
}
