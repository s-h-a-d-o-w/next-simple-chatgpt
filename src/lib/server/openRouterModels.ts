import { getOpenRouterModelsFromFilesystem } from "./getModelsFromFilesystem";
import {
  createCachedFetcher,
  fetchJson,
  perTokenToPerMillion,
  withFilesystemFallback,
} from "./modelFetching";
import {
  allModelIds,
  OPENROUTER_PREFIX,
  prettyNames,
  type AnyModelKey,
} from "@/lib/models";
import type { OpenRouterModelInfo } from "@/types";

const OPENROUTER_MODEL_URL = "https://openrouter.ai/api/v1/model";

// OpenRouter reports prices as strings and uses "0"/"-1" for free or variable pricing.
function parsePricePerMillion(costPerToken: string | undefined) {
  const parsed = Number(costPerToken);
  return costPerToken !== undefined && parsed > 0
    ? perTokenToPerMillion(parsed)
    : undefined;
}

async function fetchRemoteOpenRouterModels() {
  const models = await Promise.all(
    allModelIds
      .filter((name) => name.startsWith(OPENROUTER_PREFIX))
      .map(async (name) => {
        const id = name.slice(OPENROUTER_PREFIX.length);
        const { data } = (await fetchJson(`${OPENROUTER_MODEL_URL}/${id}`)) as {
          data: OpenRouterModelInfo;
        };

        return [name, data] as const;
      }),
  );

  return Object.fromEntries(models);
}

const getRemoteOpenRouterModels = createCachedFetcher(
  fetchRemoteOpenRouterModels,
);

export function transformOpenRouterModel(
  name: AnyModelKey,
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
