export const modelSelection = [
  "gpt-4.1",
  "claude-opus-5",
  "claude-haiku-4-5",
  "gpt-5.6-sol",
  "openrouter/z-ai/glm-5",
] as const;

export type ModelKey = (typeof modelSelection)[number];

export const reasoningEfforts = [
  "low",
  "medium",
  "high",
  "extra high",
  "max",
] as const;
export type ReasoningEffort = (typeof reasoningEfforts)[number];

export function isReasoningEffort(value: unknown): value is ReasoningEffort {
  return reasoningEfforts.includes(value as ReasoningEffort);
}

export type ModelConfig = {
  name: ModelKey; // Maybe we'll have beautified names here later.
  input: number;
  output: number;
  provider: string;

  cacheRead?: number;
  cacheWrite?: number;
  extraBody?: Record<string, unknown>;
  supportsAttachments: boolean;
  supportsReasoning: boolean;
  reasoningEffort?: ReasoningEffort;
};

export type Models = Record<ModelKey, ModelConfig>;
