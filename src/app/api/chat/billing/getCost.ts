import type { ModelConfig } from "@/lib/server/models";
import type { NormalizedUsage } from "../normalizeUsage";

export function getCost(
  modelConfig: ModelConfig,
  {
    inputTokens,
    outputTokens,
    cacheReadTokens,
    cacheWriteTokens,
  }: NormalizedUsage,
) {
  const inputCost = inputTokens * (modelConfig.input / 1000000);
  // Anthropic usage object counts fewer output tokens than the official logs. The count in the overall usage is correct.
  const outputCost = outputTokens * (modelConfig.output / 1000000);

  const cacheReadCost =
    cacheReadTokens * ((modelConfig.cacheRead ?? 0) / 1000000);
  const cacheWriteCost =
    cacheWriteTokens * ((modelConfig.cacheWrite ?? 0) / 1000000);

  const total = inputCost + outputCost + cacheReadCost + cacheWriteCost;
  return Math.ceil(total * 100) / 100;
}
