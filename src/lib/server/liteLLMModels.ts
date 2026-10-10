import { getModelsFromFilesystem } from "./getModelsFromFilesystem";
import {
  createCachedFetcher,
  fetchJson,
  perTokenToPerMillion,
  withFilesystemFallback,
} from "./modelFetching";
import { prettyNames, type ModelKey } from "@/lib/models";
import type { LiteLLMModelInfo } from "@/types";

const LITELLM_MODELS_URL =
  "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";

async function fetchRemoteLiteLLMModels() {
  // The upstream file is several MB, which exceeds the 2 MB limit of Next's data cache.
  return (await fetchJson(LITELLM_MODELS_URL)) as Record<
    string,
    LiteLLMModelInfo
  >;
}

const getRemoteLiteLLMModels = createCachedFetcher(fetchRemoteLiteLLMModels);

export function transformLiteLLMModel(name: ModelKey, info: LiteLLMModelInfo) {
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

export function getLiteLLMModels() {
  return withFilesystemFallback(
    getRemoteLiteLLMModels,
    getModelsFromFilesystem,
  );
}
