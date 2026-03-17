import { describe, expect, it } from "vitest";
import { getCost } from "./getCost";
import { fetchModels } from "@/lib/server/models";

const models = await fetchModels();

describe(getCost.name, () => {
  it("handles usage without cached tokens", () => {
    const result = getCost(models["gpt-5.4"], {
      inputTokens: 1359,
      outputTokens: 15,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
    });

    expect(result).toMatchInlineSnapshot(`0.01`);
  });

  it("handles usage with cached tokens", () => {
    const result = getCost(models["gpt-5.4"], {
      inputTokens: 1380,
      outputTokens: 33,
      cacheReadTokens: 128000,
      cacheWriteTokens: 0,
    });

    expect(result).toMatchInlineSnapshot(`0.04`);
  });

  it("handles usage with cache writes", () => {
    const result = getCost(models["claude-haiku-4-5"], {
      inputTokens: 3,
      outputTokens: 153,
      cacheReadTokens: 0,
      cacheWriteTokens: 1900,
    });

    expect(result).toMatchInlineSnapshot(`0.01`);
  });
});
