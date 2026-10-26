import type { NormalizedUsage } from "@/app/api/chat/normalizeUsage";
import type { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";

export type LiteLLMModelInfo = {
  input_cost_per_token: number;
  output_cost_per_token: number;

  cache_read_input_token_cost?: number;
  cache_creation_input_token_cost?: number;
  litellm_provider: string;
  max_input_tokens?: number;
  max_output_tokens?: number;
  supports_reasoning?: boolean;
  supports_vision?: boolean;
  supports_pdf_input?: boolean;
};

// OpenRouter models were dropped from the LiteLLM cost map, so they come from
// https://openrouter.ai/api/v1/models instead. All prices are strings in USD per token.
export type OpenRouterModelInfo = {
  architecture: {
    input_modalities: string[];
    output_modalities: string[];
  };
  id: string;
  pricing: {
    completion: string;
    prompt: string;

    input_cache_read?: string;
    input_cache_write?: string;
  };

  context_length?: number;
  supported_parameters?: string[];
};

export type Metadata = {
  usage: NormalizedUsage;
  cost: number;
  triggeredContentFilter: boolean;
};

export type SetMessages = ReturnType<
  typeof useChat<UIMessage<Metadata>>
>["setMessages"];
