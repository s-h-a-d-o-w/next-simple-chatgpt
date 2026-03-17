import { authGuard } from "@/lib/server/authGuard";
import { fetchModels, type ModelKey } from "@/lib/server/models";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { type UIMessage, convertToModelMessages, streamText } from "ai";
import { NextRequest } from "next/server";
import { createDownload } from "ai";
import { merge } from "lodash-es";

export type ChatRequest = {
  model: ModelKey;
  messages: UIMessage[];
};

// Workaround for https://github.com/vercel/ai/issues/13103
const singleDownload = createDownload();

export const maxDuration = 60;
const DEV_TIMEOUT = maxDuration * 1000 + 1000; // 1 second more to use environment timeout behavior in production
const loggedErrors = new Set<string>();

const openrouter = createOpenRouter({
  apiKey: process.env["OPENROUTER_API_KEY"],
});

export const POST = async (req: NextRequest) => {
  await authGuard();

  const { model, messages } = (await req.json()) as ChatRequest;
  const models = await fetchModels();
  const modelConfig = models[model];

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, DEV_TIMEOUT);

  const result = streamText({
    // Workaround for https://github.com/vercel/ai/issues/13103
    experimental_download: (requestedDownloads) =>
      Promise.all(
        requestedDownloads.map((req) => {
          if (req.isUrlSupportedByModel || req.url.protocol === "data:") {
            return null;
          }
          return singleDownload(req);
        }),
      ),
    model:
      modelConfig.provider === "openai"
        ? openai(model)
        : modelConfig.provider === "anthropic"
          ? anthropic(model)
          : openrouter(model.split("/").slice(1).join("/"), {
              extraBody: modelConfig.extraBody,
            }),
    messages: await convertToModelMessages(messages),
    providerOptions: merge(
      {
        ...(modelConfig.provider === "anthropic" && {
          anthropic: {
            // No manual cache markers needed any more. See here for minimum cacheable token requirements: https://platform.claude.com/docs/en/build-with-claude/prompt-caching#cache-limitations
            cacheControl: { type: "ephemeral" },
          },
        }),
      },
      {
        ...(modelConfig.reasoningEffort && {
          [modelConfig.provider]: {
            reasoningEffort: modelConfig.reasoningEffort,
          },
        }),
      },
    ),
    abortSignal: abortController.signal,
    onFinish() {
      clearTimeout(timeoutId);
    },
    onError() {
      clearTimeout(timeoutId);
    },
  });

  return result.toUIMessageStreamResponse({
    messageMetadata({ part }) {
      // AI SDK doesn't add usage metadata to the response by default.
      if (part.type === "finish-step") {
        return part;
      }
    },
    onError(error) {
      // Would add error reporting service integration in commercial product here.
      if (!loggedErrors.has((error as Error).message)) {
        if (loggedErrors.size > 100) {
          loggedErrors.clear();
        }

        loggedErrors.add((error as Error).message);
        console.log("onError:", (error as Error).message);
      }

      return "An error occurred.";
    },
    headers: {
      // Required for nginx to work with streaming responses.
      "X-Accel-Buffering": "no",
    },
  });
};
