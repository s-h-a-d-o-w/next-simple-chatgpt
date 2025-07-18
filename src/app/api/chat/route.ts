import { auth } from "@/auth";
import { models, type ModelKey } from "@/config";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText, type Message } from "ai";

export type ChatRequest = {
  model: ModelKey;
  messages: Message[];
};

export const maxDuration = 60;

const whitelist = process.env["WHITELIST"]?.split(",");
const isTest = Boolean(process.env["CI"]);

function convertMessagesAnthropic(messages: Message[]) {
  const coreMessages = convertToCoreMessages(messages);

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
        ? convertToCoreMessages(messages)
        : convertMessagesAnthropic(messages),
    providerOptions: ["o3-mini", "o4-mini"].includes(model)
      ? {
          openai: {
            reasoningEffort: "low",
          },
        }
      : undefined,
  });

  return result.toDataStreamResponse({
    getErrorMessage(error) {
      // Would add error reporting service integration in commercial product here.
      console.log(error);
      return "An error occurred.";
    },
    headers: {
      "X-Accel-Buffering": "no",
    },
  });
});
