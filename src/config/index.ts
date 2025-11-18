import { isTest } from "@/utils/consts";

// Input/output costs are per million tokens
export const models = {
  "moonshotai/kimi-k2-thinking": {
    name: "Kimi K2 Thinking (OR)",
    input: 0.6,
    output: 2.5,
    supportsAttachments: false,
    provider: "openrouter",
    extraBody: {
      reasoning: {
        enabled: true,
      },
      provider: {
        only: ["fireworks"],
      },
    },
  },
  "gpt-4.1": {
    name: "GPT-4.1",
    input: 2,
    output: 8,
    supportsAttachments: true,
    provider: "openai",
  },
  "claude-sonnet-4-5": {
    name: "Claude Sonnet 4.5",
    input: 3,
    output: 15,
    supportsAttachments: true,
    provider: "anthropic",
  },
  "claude-3-5-haiku-latest": {
    name: "Claude 3.5 Haiku",
    input: 0.8,
    output: 4,
    supportsAttachments: true,
    provider: "anthropic",
  },
  "gpt-5": {
    name: "GPT-5",
    input: 1.25,
    output: 10,
    supportsAttachments: true,
    provider: "openai",
    // Bizarrely, the latency seems to go down as the reasoning effort goes up. 🤷
    reasoningEffort: "high",
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
    default: isTest ? "claude-3-5-haiku-latest" : "gpt-4.1",
  },
} as const;
