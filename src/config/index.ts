export const models = {
  "gpt-4.1": {
    name: "GPT-4.1",
    input: 2,
    output: 8,
    supportsAttachments: true,
  },
  "gpt-4-turbo": {
    name: "GPT-4 Turbo",
    input: 10,
    output: 30,
    supportsAttachments: true,
  },
  "o4-mini": {
    name: "o4 mini",
    input: 1.1,
    output: 4.4,
    supportsAttachments: true,
  },
  "o3-mini": {
    name: "o3 mini",
    input: 1.1,
    output: 4.4,
    supportsAttachments: false,
  },
} as const;
export type ModelKey = keyof typeof models;

export const config = {
  api: {
    maxDuration: 60,
  },
  ui: {
    messageStreamThrottle: 500,
    copyStatusTimeout: 1000,
    systemMessage:
      "You are a concise assistant. Use markdown for your responses.",
  },
  storage: {
    // Actual maximum, as imposed by browsers, is around 5 MB.
    localStorageQuota: 2.5 * 1024 * 1024,
  },
  models: {
    default: "gpt-4.1",
  },
} as const;
