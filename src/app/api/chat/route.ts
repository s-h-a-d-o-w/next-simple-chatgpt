import { auth } from "@/auth";
import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const whitelist = process.env.WHITELIST?.split(",");

export const POST = auth(async (req) => {
  if (
    !req.auth?.user?.email ||
    (req.auth?.user?.email && !whitelist?.includes(req.auth.user.email))
  ) {
    // In a production app, e.g. sentry would be great here for context logging.
    throw new Error("Unauthorized access attempt to /api/chat! ");
  }

  const payload = await req.json();

  const result = await streamText({
    model: openai("gpt-4-turbo"),
    messages: convertToCoreMessages(payload.messages),
  });

  return result.toDataStreamResponse();
});
