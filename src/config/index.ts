import { isTest } from "@/lib/utils/consts";
import type { ModelKey, ReasoningEffort } from "@/lib/models";

export const config = {
  ui: {
    messageStreamThrottle: 500,
    copyStatusTimeout: 1_000,
    systemMessage:
      "You are a concise assistant. Use markdown for your responses.",
    systemMessageDebounce: 300,
  },
  storage: {
    localStorageQuota: 2.5 * 1_024 * 1_024,
  },
  models: {
    default: (isTest ? "claude-haiku-4-5" : "gpt-4.1") satisfies ModelKey,
    defaultReasoningEffort: "medium" satisfies ReasoningEffort,
  },
} as const;
