import { authGuard } from "@/lib/server/authGuard";
import {
  isReasoningEffort,
  type ModelKey,
  type ReasoningEffort,
} from "@/lib/models";
import { fetchModels } from "@/lib/server/models";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import {
  type UIMessage,
  convertToModelMessages,
  streamText,
  toUIMessageStream,
  createUIMessageStreamResponse,
  createDownload,
} from "ai";
import { NextRequest } from "next/server";
import { merge } from "lodash-es";
import { normalizeUsage } from "./normalizeUsage";
import { getCost } from "./billing/getCost";
import type { Metadata } from "@/types";

type SdkChatProps = {
  id: string;
  messages: UIMessage[];
};

export type AppChatProps = {
  model: ModelKey;

  reasoningEffort?: ReasoningEffort;
};

export type ChatProps = SdkChatProps & AppChatProps;

// Workaround for https://github.com/vercel/ai/issues/13103
const singleDownload = createDownload();

const loggedErrors = new Set<string>();

const openrouter = createOpenRouter({
  apiKey: process.env["OPENROUTER_API_KEY"],
});

// https://openrouter.ai/docs/use-cases/reasoning-tokens
const openRouterReasoningEfforts = {
  low: "low",
  medium: "medium",
  high: "high",
  "extra high": "xhigh",
  max: "max",
} satisfies Record<ReasoningEffort, string>;

async function processChatProps(request: ChatProps) {
  const { model, messages: rawMessages, reasoningEffort, ...rest } = request;
  const instructions = rawMessages
    .filter(({ role }) => role === "system")
    .flatMap((message) =>
      message.parts
        .filter((part) => part.type === "text")
        .map(({ text }) => text),
    )
    .join("\n\n");
  const messages = await convertToModelMessages(
    rawMessages.filter(({ role }) => role !== "system"),
  );

  return {
    ...rest,
    model,
    instructions,
    messages,
    reasoningEffort: isReasoningEffort(reasoningEffort)
      ? reasoningEffort
      : undefined,
  };
}

export const POST = async (req: NextRequest) => {
  await authGuard();

  const {
    id: sessionId,
    model,
    messages,
    instructions,
    reasoningEffort,
  } = await processChatProps((await req.json()) as ChatProps);
  const models = await fetchModels();
  const modelConfig = models[model];
  const isAnthropic = modelConfig.provider === "anthropic";
  const isOpenAI = modelConfig.provider === "openai";

  const result = streamText({
    // Workaround for https://github.com/vercel/ai/issues/13103
    experimental_download: (requestedDownloads) =>
      Promise.all(
        requestedDownloads
          .map((downloadReq) => {
            if (
              downloadReq.isUrlSupportedByModel ||
              downloadReq.url.protocol === "data:"
            ) {
              return undefined;
            }
            return singleDownload(downloadReq);
          })
          .filter(
            (item): item is NonNullable<typeof item> => item !== undefined,
          ),
      ),
    model: isOpenAI
      ? openai(model)
      : isAnthropic
        ? anthropic(model)
        : openrouter(model.split("/").slice(1).join("/"), {
            // providerOptions is bricked: https://github.com/OpenRouterTeam/ai-sdk-provider/issues/616
            extraBody: {
              session_id: sessionId,
              cache_control: { type: "ephemeral" }, // ignored by non-anthropic models
              provider: {
                sort: "latency",
                // https://www.washingtonpost.com/nation/2026/10/15/see-full-list-major-donors-white-house-ballroom/
                // ... but we need "google-vertex" 🤮️ for ZDR anthropic LLM usage
                ignore: [
                  "amazon-nova",
                  "amazon-bedrock",
                  "azure",
                  "google-ai-studio",
                ],
              },
              ...(modelConfig.supportsReasoning && reasoningEffort
                ? {
                    reasoning: {
                      effort: openRouterReasoningEfforts[reasoningEffort],
                    },
                  }
                : {}),
            },
          }),
    instructions,
    messages,
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
        ...(reasoningEffort &&
          (isOpenAI || isAnthropic) && {
            [modelConfig.provider]: {
              reasoningEffort,
            },
          }),
      },
    ),
    // Stops upstream generation (and billing) when the user hits stop or closes the tab.
    abortSignal: req.signal,
    timeout: { firstChunkMs: 120_000, chunkMs: 60_000 },
  });

  const stream = toUIMessageStream({
    stream: result.stream,
    // AI SDK doesn't add usage metadata to the response by default. Needed for testing.
    messageMetadata({ part }) {
      if (part.type === "finish-step") {
        // part.finishReason
        const usage = normalizeUsage(part.usage);
        const cost = getCost(modelConfig, usage);
        return {
          cost,
          usage,
          triggeredContentFilter: part.finishReason === "content-filter",
        } satisfies Metadata;
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
  });

  return createUIMessageStreamResponse({
    keepAliveMs: 5_000,
    stream,
    headers: {
      // Required for nginx to work with streaming responses.
      "X-Accel-Buffering": "no",
    },
  });
};
