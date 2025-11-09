import { auth } from "@/auth";
import { models, type ModelKey } from "@/config";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { isTest } from "@/utils/consts";

export type ChatRequest = {
  model: ModelKey;
  messages: UIMessage[];
};

export const maxDuration = 60;

const whitelist = process.env["WHITELIST"]?.split(",");

function convertMessagesAnthropic(messages: UIMessage[]) {
  const coreMessages = convertToModelMessages(messages);

  const relevantIndices = coreMessages
    .map((msg, index) =>
      msg.role === "user" || msg.role === "tool" ? index : -1,
    )
    .filter((index) => index !== -1)
    // take last 2 user/tool messages
    .slice(-2);
  // definitely always include the last user message
  const lastUserMsgIndex = coreMessages.findLastIndex(
    (msg) => msg.role === "user",
  );
  // it's fine if it's -1 or duplicate, since we will simply do an inclusion check
  relevantIndices.push(lastUserMsgIndex);

  const messagesWithCacheMarkers = coreMessages.map((message, index) => {
    if (relevantIndices.includes(index)) {
      return {
        ...message,
        providerOptions: {
          anthropic: {
            cacheControl: { type: "ephemeral" },
          },
        },
      };
    }
    return message;
  });

  return messagesWithCacheMarkers;
}

export const POST = auth(async (req) => {
  const isUserWhitelisted = whitelist?.includes(String(req.auth?.user?.email));
  if (!isTest && !isUserWhitelisted) {
    throw new Error("Unauthorized access attempt to /api/chat! ");
  }

  const { model, messages } = (await req.json()) as ChatRequest;
  const modelConfig = models[model];
  const result = streamText({
    model: modelConfig.provider === "openai" ? openai(model) : anthropic(model),
    messages:
      modelConfig.provider === "openai"
        ? convertToModelMessages(messages)
        : convertMessagesAnthropic(messages),
    providerOptions:
      modelConfig.provider === "openai" && "reasoningEffort" in modelConfig
        ? {
            openai: {
              reasoningEffort: modelConfig.reasoningEffort,
            },
          }
        : undefined,
  });

  return result.toUIMessageStreamResponse({
    onError(error) {
      // Would add error reporting service integration in commercial product here.
      console.log(error);
      return "An error occurred.";
    },
    headers: {
      // Required for nginx to work with streaming responses.
      "X-Accel-Buffering": "no",
    },
  });
});
