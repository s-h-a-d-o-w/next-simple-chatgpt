import type { NormalizedUsage } from "@/app/api/chat/normalizeUsage";
import type { TextStreamPart, ToolSet } from "ai";

type FinishStepPart = Extract<TextStreamPart<ToolSet>, { type: "finish-step" }>;

export type AnthropicUsage = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  service_tier: string;
  cache_creation: {
    ephemeral_1h_input_tokens: number;
    ephemeral_5m_input_tokens: number;
  };
};

export type LiteLLMModelInfo = {
  input_cost_per_token: number;
  output_cost_per_token: number;

  cache_read_input_token_cost?: number;
  cache_creation_input_token_cost?: number;
  litellm_provider: string;
  max_input_tokens?: number;
  max_output_tokens?: number;
  supports_vision?: boolean;
  supports_pdf_input?: boolean;
};

export type Metadata = {
  usage: NormalizedUsage;
  cost: number;
  rawPart: FinishStepPart;
};
