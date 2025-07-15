import { auth } from "@/auth";
import { config } from "@/config";
import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText, type Message } from "ai";

export type ChatRequest = {
  model: string;
  messages: Message[];
};

export const maxDuration = config.api.maxDuration;

const whitelist = process.env["WHITELIST"]?.split(",");
const isTest = Boolean(process.env["CI"]);

export const POST = auth(async (req) => {
  const isUserWhitelisted = whitelist?.includes(String(req.auth?.user?.email));
  if (!isTest && !isUserWhitelisted) {
    throw new Error("Unauthorized access attempt to /api/chat! ");
  }

  const { model, messages } = (await req.json()) as ChatRequest;
  const result = streamText({
    model: openai(model),
    messages: convertToCoreMessages(messages),
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
