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
