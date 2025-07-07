export const isServer = typeof window === "undefined";
export const isDev = process.env["NODE_ENV"] !== "production";
export const isClientDebug =
  !isServer && window.location.href.includes("debug");

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
