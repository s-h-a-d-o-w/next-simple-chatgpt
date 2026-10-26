import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LiteLLMModelInfo, OpenRouterModelInfo } from "@/types";
import {
  allModelIds,
  internalModelSelection,
  modelSelection,
  OPENROUTER_PREFIX,
  prettyNames,
  type AnyModelKey,
} from "../models";

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

const liteLLMModel: LiteLLMModelInfo = {
  input_cost_per_token: 0.000002,
  output_cost_per_token: 0.000008,
  litellm_provider: "openai",
  supports_vision: true,
};

const remoteModels: Record<string, LiteLLMModelInfo> = Object.fromEntries(
  allModelIds
    .filter((id) => !id.startsWith(OPENROUTER_PREFIX))
    .map((id) => [id, { ...liteLLMModel }]),
);

const openRouterModel: OpenRouterModelInfo = {
  architecture: {
    input_modalities: ["text", "image"],
    output_modalities: ["text"],
  },
  id: "test/model",
  pricing: {
    completion: "0.0000032",
    prompt: "0.000001",
    input_cache_read: "0.0000002",
    input_cache_write: "0",
  },
  supported_parameters: ["reasoning", "tools"],
  reasoning: {
    supported_efforts: ["max", "xhigh", "low", "none"],
  },
};

const openRouterModelIds = allModelIds.filter((id) =>
  id.startsWith(OPENROUTER_PREFIX),
);
const remoteOpenRouterModels: Record<string, OpenRouterModelInfo> =
  Object.fromEntries(
    openRouterModelIds.map((id) => [
      id,
      { ...openRouterModel, id: id.slice(OPENROUTER_PREFIX.length) },
    ]),
  );

function expectedModel(id: AnyModelKey) {
  const isOpenRouter = id.startsWith(OPENROUTER_PREFIX);

  return {
    cacheRead: isOpenRouter ? 0.2 : undefined,
    cacheWrite: undefined,
    input: isOpenRouter ? 1 : 2,
    name: prettyNames[id],
    output: isOpenRouter ? 3.2 : 8,
    provider: isOpenRouter ? "openrouter" : "openai",
    supportsAttachments: true,
    supportsReasoning: isOpenRouter,
    ...(isOpenRouter && {
      supportedReasoningEfforts: ["low", "extra high", "max"],
    }),
  };
}

function stubFetch() {
  const fetchMock = vi.fn<typeof fetch>().mockImplementation((input) => {
    const url = input instanceof Request ? input.url : input.toString();

    return Promise.resolve(
      url.startsWith("https://openrouter.ai/api/v1/model/")
        ? Response.json({
            data: remoteOpenRouterModels[
              `${OPENROUTER_PREFIX}${url.slice("https://openrouter.ai/api/v1/model/".length)}`
            ],
          })
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

  it.each(modelSelection)("transforms remote model data for %s", async (id) => {
    const fetchMock = stubFetch();

    const { fetchModels } = await import("./models");
    const models = await fetchModels();

    expect(models[id]).toStrictEqual(expectedModel(id));
    expect(fetchMock).toHaveBeenCalledTimes(1 + openRouterModelIds.length);
    for (const openRouterId of openRouterModelIds) {
      expect(fetchMock).toHaveBeenCalledWith(
        `https://openrouter.ai/api/v1/model/${openRouterId.slice(OPENROUTER_PREFIX.length)}`,
        expect.any(Object),
      );
    }
    expect(Object.keys(models)).toStrictEqual([...modelSelection]);
    expect(getModelsFromFilesystem).not.toHaveBeenCalled();
    expect(getOpenRouterModelsFromFilesystem).not.toHaveBeenCalled();
  });

  it("fetches remote model data only once while the cache is valid", async () => {
    const fetchMock = stubFetch();

    const { fetchModels } = await import("./models");
    await Promise.all([fetchModels(), fetchModels()]);
    await fetchModels();

    expect(fetchMock).toHaveBeenCalledTimes(1 + openRouterModelIds.length);
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
    expect(models).toStrictEqual(
      Object.fromEntries(modelSelection.map((id) => [id, expectedModel(id)])),
    );
    expect(consoleError).toHaveBeenCalledTimes(2);
    expect(consoleError).toHaveBeenCalledWith(
      "Failed to fetch model data:",
      requestError,
    );
  });

  it.each(modelSelection)(
    "rejects when the selected model %s is missing",
    async (missingId) => {
      vi.stubGlobal(
        "fetch",
        vi.fn<typeof fetch>().mockRejectedValue(new Error("offline")),
      );
      vi.spyOn(console, "error").mockReturnValue(undefined);
      getModelsFromFilesystem.mockResolvedValue(
        Object.fromEntries(
          Object.entries(remoteModels).filter(([id]) => id !== missingId),
        ),
      );
      getOpenRouterModelsFromFilesystem.mockResolvedValue(
        Object.fromEntries(
          Object.entries(remoteOpenRouterModels).filter(
            ([id]) => id !== missingId,
          ),
        ),
      );

      const { fetchModels } = await import("./models");

      await expect(fetchModels()).rejects.toThrow(
        `Model "${missingId}" from whitelist is missing in fetched models.`,
      );
    },
  );

  it("returns only internal models and shares the remote cache", async () => {
    const fetchMock = stubFetch();

    const { fetchInternalModels, fetchModels } = await import("./models");
    const [models, internalModels] = await Promise.all([
      fetchModels(),
      fetchInternalModels(),
    ]);

    expect(Object.keys(internalModels)).toStrictEqual([
      ...internalModelSelection,
    ]);
    expect(internalModels).toStrictEqual(
      Object.fromEntries(
        internalModelSelection.map((id) => [id, expectedModel(id)]),
      ),
    );
    for (const id of internalModelSelection) {
      expect(models).not.toHaveProperty(id);
    }
    expect(fetchMock).toHaveBeenCalledTimes(1 + openRouterModelIds.length);
  });
});
