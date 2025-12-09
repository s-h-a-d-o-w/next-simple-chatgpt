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
    input: 3,
    output: 12,
    cacheRead: 0.75,
    supportsAttachments: true,
    provider: "openai",
  },
  "claude-opus-4-5": {
    name: "Claude Opus 4.5",
    input: 5,
    output: 25,
    cacheRead: 0.5,
    cacheWrite: 6.25,
    supportsAttachments: true,
    provider: "anthropic",
  },
  "claude-sonnet-4-5": {
    name: "Claude Sonnet 4.5",
    // Higher pricing >200K tokens but... not doing that for now.
    input: 3,
    output: 15,
    cacheRead: 0.3,
    cacheWrite: 3.75,
    supportsAttachments: true,
    provider: "anthropic",
  },
  "claude-haiku-4-5": {
    name: "Claude Haiku 4.5",
    input: 1,
    output: 5,
    cacheRead: 0.1,
    cacheWrite: 1.25,
    supportsAttachments: true,
    provider: "anthropic",
  },
  "gpt-5.1": {
    name: "GPT-5.1",
    input: 1.25,
    output: 10,
    cacheRead: 0.125,
    supportsAttachments: true,
    provider: "openai",
    reasoningEffort: "low",
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
    default: isTest ? "claude-haiku-4-5" : "gpt-4.1",
  },
} as const;
