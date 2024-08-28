import { openai } from "@ai-sdk/openai";
import { convertToCoreMessages, streamText } from "ai";

// const SYSTEM_PROMPT = "You are a concise assistant.";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const payload = await req.json();

  const result = await streamText({
    model: openai("gpt-4-turbo"),
    // system: SYSTEM_PROMPT,
    messages: convertToCoreMessages(payload.messages),
  });

  return result.toDataStreamResponse();
}
