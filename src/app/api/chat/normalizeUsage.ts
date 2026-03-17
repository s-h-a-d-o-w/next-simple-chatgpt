import type { LanguageModelUsage } from "ai";

export interface NormalizedUsage {
  inputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  outputTokens: number;
}

export function normalizeUsage({
  outputTokens = 0,
  inputTokenDetails: {
    cacheReadTokens = 0,
    cacheWriteTokens = 0,
    noCacheTokens = 0,
  },
}: LanguageModelUsage): NormalizedUsage {
  return {
    // Because Anthropic splits out write tokens, we can't use the overall inputTokens number
    inputTokens: noCacheTokens,
    outputTokens,
    // OpenAI on the other hand doesn't have special billing for writing to cache, so this will always be 0 for OpenAI.
    cacheWriteTokens,
    cacheReadTokens,
  };
}
