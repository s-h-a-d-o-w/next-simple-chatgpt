export type ModelConfig = {
  name: string;
  input: number;
  output: number;
  provider: string;

  cacheRead?: number;
  cacheWrite?: number;
  supportsAttachments: boolean;
  supportsReasoning: boolean;
  supportedReasoningEfforts?: ReasoningEffort[];
  reasoningEffort?: ReasoningEffort;
};
export type Models = Record<ModelKey, ModelConfig>;

export const OPENROUTER_PREFIX = "openrouter/";

export const modelSelection = [
  "gpt-4.1",
  "openrouter/anthropic/claude-opus-5.5",
  "openrouter/anthropic/claude-haiku-4.5",
  "gpt-6.1-sol",
  "openrouter/moonshotai/kimi-k3.1-pro",
  "openrouter/z-ai/glm-5.3-flash",
  "openrouter/deepseek/deepseek-v4.1-flash-1017",
] as const;

export const prettyNames: Record<AnyModelKey, string> = {
  "gpt-4.1": "GPT 4.1",
  "openrouter/anthropic/claude-opus-5.5": "Claude Opus 5.5",
  "openrouter/anthropic/claude-haiku-4.5": "Claude Haiku 4.5",
  "gpt-6.1-sol": "GPT 6.1 Sol",
  "openrouter/deepseek/deepseek-v4.1-flash-1017": "DeepSeek V4.1 Flash 1017",
  "openrouter/z-ai/glm-5.3-flash": "GLM-5.3 Flash",
  "openrouter/moonshotai/kimi-k3.1-pro": "Kimi K3.1 Pro",

  // INDEXER
  "openrouter/openai/gpt-oss-safeguard-20b": "GPT OSS Safeguard 20B",
};

// Only used by server-side features, never offered to users.
export const internalModelSelection = [
  "openrouter/openai/gpt-oss-safeguard-20b",
] as const;

export const allModelIds = [
  ...modelSelection,
  ...internalModelSelection,
] as const;

export type ModelKey = (typeof modelSelection)[number];
type InternalModelKey = (typeof internalModelSelection)[number];
export type AnyModelKey = ModelKey | InternalModelKey;

// openrouter accepts these overall:
// [
//   "max",
//   "xhigh",
//   "high",
//   "medium",
//   "low",
//   "minimal",
//   "none"
// ]
// But various models only support what's listed on their page. Other values are mapped to the closest supported value.
// The following are supported by anthropic and openai natively:
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

// https://openrouter.ai/docs/guides/best-practices/reasoning-tokens#reasoning-effort-level
export const openRouterReasoningEfforts = {
  low: "low",
  medium: "medium",
  high: "high",
  "extra high": "xhigh",
  max: "max",
} satisfies Record<ReasoningEffort, string>;
