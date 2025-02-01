import { auth } from "@/auth";
import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

const whitelist = process.env["WHITELIST"]?.split(",");
export const isTest = Boolean(process.env["CI"]);

export const POST = auth(async (req) => {
  const isUserWhitelisted = whitelist?.includes(String(req.auth?.user?.email));
  if (!isTest && !isUserWhitelisted) {
    // In a production app, e.g. sentry would be great here for context logging.
    throw new Error("Unauthorized access attempt to /api/chat! ");
  }

  const payload = await req.json();

  const result = streamText({
    model: openai(payload.model),
    messages: convertToCoreMessages(payload.messages),
    providerOptions: {
      openai: {
        reasoningEffort: "low",
      },
    },
  });

  return result.toDataStreamResponse({
    getErrorMessage(error) {
      console.log(error);
      return "An error occurred.";
    },
  });
});
