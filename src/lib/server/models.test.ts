import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LiteLLMModelInfo } from "@/types";

const { getModelsFromFilesystem } = vi.hoisted(() => ({
  getModelsFromFilesystem:
    vi.fn<() => Promise<Record<string, LiteLLMModelInfo>>>(),
}));

vi.mock(import("./getModelsFromFilesystem"), () => ({
  getModelsFromFilesystem,
}));

const remoteModels: Record<string, LiteLLMModelInfo> = {
  "gpt-4.1": {
    input_cost_per_token: 0.000002,
    output_cost_per_token: 0.000008,
    litellm_provider: "openai",
    supports_vision: true,
  },
  "claude-opus-5": {
    input_cost_per_token: 0.000015,
    output_cost_per_token: 0.000075,
    litellm_provider: "anthropic",
  },
  "claude-haiku-4-5": {
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.000005,
    cache_read_input_token_cost: 0.0000001,
    cache_creation_input_token_cost: 0.00000125,
    litellm_provider: "anthropic",
  },
  "gpt-5.6-sol": {
    input_cost_per_token: 0.00000175,
    output_cost_per_token: 0.000014,
    litellm_provider: "openai",
    supports_reasoning: true,
  },
  "openrouter/z-ai/glm-5": {
    input_cost_per_token: 0.000001,
    output_cost_per_token: 0.0000032,
    litellm_provider: "openrouter",
  },
};

describe("fetchModels", () => {
  beforeEach(() => {
    vi.resetModules();
    getModelsFromFilesystem.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("transforms remote model data and applies model defaults", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(remoteModels));
    vi.stubGlobal("fetch", fetchMock);

    const { fetchModels } = await import("./models");
    const models = await fetchModels();

    expect(models["gpt-4.1"]).toStrictEqual({
      cacheRead: undefined,
      cacheWrite: undefined,
      input: 2,
      name: "GPT 4.1",
      output: 8,
      provider: "openai",
      supportsAttachments: true,
      supportsReasoning: false,
    });
    expect(models["claude-haiku-4-5"]).toMatchObject({
      cacheRead: 0.1,
      cacheWrite: 1.25,
      supportsAttachments: false,
    });
    expect(models["gpt-5.6-sol"].supportsReasoning).toBe(true);
    expect(models["openrouter/z-ai/glm-5"].extraBody).toStrictEqual({
      reasoning: { enabled: true },
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(getModelsFromFilesystem).not.toHaveBeenCalled();
  });

  it("fetches remote model data only once while the cache is valid", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(Response.json(remoteModels));
    vi.stubGlobal("fetch", fetchMock);

    const { fetchModels } = await import("./models");
    await Promise.all([fetchModels(), fetchModels()]);
    await fetchModels();

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("uses filesystem model data when the remote request fails", async () => {
    const requestError = new Error("network unavailable");
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockRejectedValue(requestError),
    );
    getModelsFromFilesystem.mockResolvedValue(remoteModels);
    const consoleError = vi.spyOn(console, "error").mockReturnValue(undefined);

    const { fetchModels } = await import("./models");
    const models = await fetchModels();

    expect(getModelsFromFilesystem).toHaveBeenCalledOnce();
    expect(models["gpt-4.1"].input).toBe(2);
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to fetch model data:",
      requestError,
    );
  });
});
