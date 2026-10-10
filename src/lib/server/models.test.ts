import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LiteLLMModelInfo, OpenRouterModelInfo } from "@/types";

const { getModelsFromFilesystem, getOpenRouterModelsFromFilesystem } =
  vi.hoisted(() => ({
    getModelsFromFilesystem:
      vi.fn<() => Promise<Record<string, LiteLLMModelInfo>>>(),
    getOpenRouterModelsFromFilesystem:
      vi.fn<() => Promise<Record<string, OpenRouterModelInfo>>>(),
  }));

vi.mock(import("./getModelsFromFilesystem"), () => ({
  getModelsFromFilesystem,
  getOpenRouterModelsFromFilesystem,
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
};

const glm5: OpenRouterModelInfo = {
  architecture: {
    input_modalities: ["text", "image"],
    output_modalities: ["text"],
  },
  id: "z-ai/glm-5",
  pricing: {
    completion: "0.0000032",
    prompt: "0.000001",
    input_cache_read: "0.0000002",
    input_cache_write: "0",
  },
  supported_parameters: ["reasoning", "tools"],
};

const remoteOpenRouterModels: Record<string, OpenRouterModelInfo> = {
  "openrouter/z-ai/glm-5": glm5,
};

function stubFetch() {
  const fetchMock = vi.fn<typeof fetch>().mockImplementation((input) => {
    const url = input instanceof Request ? input.url : input.toString();

    return Promise.resolve(
      url.includes("openrouter.ai")
        ? Response.json({ data: [glm5] })
        : Response.json(remoteModels),
    );
  });
  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

describe("fetchModels", () => {
  beforeEach(() => {
    vi.resetModules();
    getModelsFromFilesystem.mockReset();
    getOpenRouterModelsFromFilesystem.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("transforms remote model data", async () => {
    const fetchMock = stubFetch();

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
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getModelsFromFilesystem).not.toHaveBeenCalled();
    expect(getOpenRouterModelsFromFilesystem).not.toHaveBeenCalled();
  });

  it("transforms remote OpenRouter model data", async () => {
    stubFetch();

    const { fetchModels } = await import("./models");
    const models = await fetchModels();

    expect(models["openrouter/z-ai/glm-5"]).toStrictEqual({
      cacheRead: 0.2,
      cacheWrite: undefined,
      input: 1,
      name: "GLM-5",
      output: 3.2,
      provider: "openrouter",
      supportsAttachments: true,
      supportsReasoning: true,
    });
  });

  it("fetches remote model data only once while the cache is valid", async () => {
    const fetchMock = stubFetch();

    const { fetchModels } = await import("./models");
    await Promise.all([fetchModels(), fetchModels()]);
    await fetchModels();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("uses filesystem model data when the remote request fails", async () => {
    const requestError = new Error("network unavailable");
    vi.stubGlobal(
      "fetch",
      vi.fn<typeof fetch>().mockRejectedValue(requestError),
    );
    getModelsFromFilesystem.mockResolvedValue(remoteModels);
    getOpenRouterModelsFromFilesystem.mockResolvedValue(remoteOpenRouterModels);
    const consoleError = vi.spyOn(console, "error").mockReturnValue(undefined);

    const { fetchModels } = await import("./models");
    const models = await fetchModels();

    expect(getModelsFromFilesystem).toHaveBeenCalledOnce();
    expect(getOpenRouterModelsFromFilesystem).toHaveBeenCalledOnce();
    expect(models["gpt-4.1"].input).toBe(2);
    expect(models["openrouter/z-ai/glm-5"].input).toBe(1);
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to fetch model data:",
      requestError,
    );
  });
});
