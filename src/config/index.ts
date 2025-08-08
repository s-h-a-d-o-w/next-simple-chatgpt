// Input/output costs are per million tokens
export const models = {
  "gpt-5": {
    name: "GPT-5",
    input: 1.25,
    output: 10,
    supportsAttachments: true,
    provider: "openai",
  },
  "gpt-4.1": {
    name: "GPT-4.1",
    input: 2,
    output: 8,
    supportsAttachments: true,
    provider: "openai",
  },
  "o4-mini": {
    name: "o4 mini",
    input: 1.1,
    output: 4.4,
    supportsAttachments: true,
    provider: "openai",
  },
  "claude-opus-4-0": {
    name: "Claude Opus 4.0",
    input: 15,
    output: 75,
    supportsAttachments: true,
    provider: "anthropic",
  },
  "claude-sonnet-4-0": {
    name: "Claude Sonnet 4.0",
    input: 3,
    output: 15,
    supportsAttachments: true,
    provider: "anthropic",
  },
} as const;
export type ModelKey = keyof typeof models;

export const config = {
  ui: {
    messageStreamThrottle: 500,
    copyStatusTimeout: 1000,
    systemMessage:
      "You are a concise assistant. Use markdown for your responses.",
    systemMessageDebounce: 300,
  },
  storage: {
    // Actual maximum, as imposed by browsers, is around 5 MB.
    localStorageQuota: 2.5 * 1024 * 1024,
  },
  models: {
    default: "gpt-5",
  },
} as const;
