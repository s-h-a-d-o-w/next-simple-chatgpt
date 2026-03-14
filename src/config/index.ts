import { isTest } from "@/lib/utils/consts";
import type { ModelKey } from "@/lib/server/models";

export const config = {
  ui: {
    messageStreamThrottle: 500,
    copyStatusTimeout: 1000,
    systemMessage:
      "You are a concise assistant. Use markdown for your responses.",
    systemMessageDebounce: 300,
  },
  storage: {
    localStorageQuota: 2.5 * 1024 * 1024,
  },
  models: {
    default: (isTest ? "claude-haiku-4-5" : "gpt-4.1") satisfies ModelKey,
  },
} as const;
