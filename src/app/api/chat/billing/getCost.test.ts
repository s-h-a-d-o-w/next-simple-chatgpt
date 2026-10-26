import { describe, expect, it } from "vitest";
import { getCost } from "./getCost";
import { fetchModels } from "@/lib/server/models";
import { config } from "@/config";

const models = await fetchModels();

describe(getCost, () => {
  it("handles usage without cached tokens", () => {
    const result = getCost(models[config.models.default], {
      inputTokens: 1_359,
      outputTokens: 15,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
    });

    expect(result).toMatchInlineSnapshot(`0.01`);
  });

  it("handles usage with cached tokens", () => {
    const result = getCost(models[config.models.default], {
      inputTokens: 1_380,
      outputTokens: 33,
      cacheReadTokens: 128_000,
      cacheWriteTokens: 0,
    });

    expect(result).toMatchInlineSnapshot(`0.02`);
  });

  it("handles usage with cache writes", () => {
    const result = getCost(models[config.models.default], {
      inputTokens: 3,
      outputTokens: 153,
      cacheReadTokens: 0,
      cacheWriteTokens: 100_900,
    });

    expect(result).toMatchInlineSnapshot(`0.13`);
  });
});
