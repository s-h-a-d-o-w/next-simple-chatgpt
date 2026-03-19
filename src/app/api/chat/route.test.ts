import { POST, type ChatRequest } from "./route";
import { test, expect } from "vitest";
import { NextRequest } from "next/server";
import type { ModelKey } from "@/lib/server/models";
import type { Metadata } from "@/types";
import { pause } from "@/lib/utils/pause";

type AnthropicUsage = {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  cache_creation_input_tokens: number;
  service_tier: string;
  inference_geo: string;
  cache_creation: {
    ephemeral_5m_input_tokens: number;
    ephemeral_1h_input_tokens: number;
  };
};

// Haiku 4.5 requires a minimum of 4096 tokens for caching
const longSystemPrompt = `You are a helpful assistant with extensive knowledge across many domains.

${Array.from({ length: 11 })
  .fill(null)
  .map(
    (_, i) => `
## Section ${i + 1}: Important Guidelines and Information

This section contains important information about how to respond to user queries. We need to ensure that this prompt is sufficiently long to trigger the caching mechanism. The prompt caching feature requires a minimum number of tokens to be activated.

### Key Principles
- Always provide accurate and helpful information
- Be concise when appropriate, but thorough when needed
- Use examples to illustrate complex concepts
- Acknowledge uncertainty when it exists
- Consider multiple perspectives on issues
- Provide actionable advice when possible
- Ask clarifying questions when the request is ambiguous

### Background Information
The caching mechanism works by storing frequently used prompt prefixes. This allows for faster response times and reduced token usage on subsequent requests. The minimum token requirement varies by model:
- Claude Haiku 4.5: 4096 tokens
- Claude Haiku 3.5: 2048 tokens
- Claude Haiku 3: 2048 tokens

When automatic caching is enabled, the API automatically determines where to place cache breakpoints based on the content structure. This optimizes for both performance and cost efficiency.

### Additional Context
This system prompt is designed to be sufficiently long to trigger automatic caching in Claude models. By including this extended system prompt, we ensure that the prompt caching feature can be properly tested. The caching is particularly beneficial for applications that make repeated API calls with similar prompt structures.

### Usage Guidelines
1. Process user requests efficiently
2. Maintain context throughout the conversation
3. Provide relevant information
4. Structure responses clearly
5. Use formatting when helpful
6. Include code examples when discussing programming
7. Provide citations when referencing facts
8. Summarize complex information when appropriate
9. Break down complex problems into steps
10. Consider the user's perspective and needs
`,
  )
  .join("\n")}

## Final Instructions
Please respond to all user queries following the above guidelines. Remember to be helpful, accurate, and considerate in all interactions.`;

async function callRouteHandler(model: ModelKey, systemPrompt: string) {
  const body: ChatRequest = {
    model,
    messages: [
      {
        id: "system-1",
        role: "system",
        parts: [{ type: "text", text: systemPrompt }],
      },
      {
        id: "user-1",
        role: "user",
        parts: [{ type: "text", text: "What is 2 + 2?" }],
      },
    ],
  };

  const response = await POST(
    new NextRequest("http://localhost:3000/api/chat", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );
  expect(response.status).toBe(200);

  const text = await response.text();
  const lines = text.split("\n").filter(Boolean);

  for (const line of lines) {
    if (line.startsWith("data: ") && !line.includes("[DONE]")) {
      const data = JSON.parse(line.slice(6)) as {
        type: string;
        messageMetadata: Metadata;
      };
      if (data.type === "message-metadata") {
        // console.log(JSON.stringify(data.messageMetadata, null, 2));
        return data.messageMetadata;
      }
    }
  }

  throw new Error("No message metadata found");
}

// Includes sanity checks for anthropic metadata, since in the past, the right numbers were in provider metadata but those in root level usage were wrong. (Or I misinterpreted them.)
test("caching works with anthropic provider", async () => {
  const timestamp = Date.now().toString();

  const cacheWriteMetadata = await callRouteHandler(
    "claude-haiku-4-5",
    timestamp + " " + longSystemPrompt,
  );
  const {
    usage: { cacheWriteTokens },
  } = cacheWriteMetadata;
  expect(cacheWriteTokens).toBeGreaterThan(4096);
  const anthropicCacheWriteUsage = cacheWriteMetadata.rawPart
    .providerMetadata?.["anthropic"]?.["usage"] as AnthropicUsage;
  expect(anthropicCacheWriteUsage.cache_creation_input_tokens).toEqual(
    cacheWriteTokens,
  );

  await pause(1000);

  const cacheReadMetadata = await callRouteHandler(
    "claude-haiku-4-5",
    timestamp + " " + longSystemPrompt,
  );
  const {
    usage: { cacheReadTokens, inputTokens, outputTokens },
  } = cacheReadMetadata;
  expect(cacheReadTokens).toBeGreaterThan(4096);
  const anthropicCacheReadUsage = cacheReadMetadata.rawPart.providerMetadata?.[
    "anthropic"
  ]?.["usage"] as AnthropicUsage;
  expect(anthropicCacheReadUsage.cache_read_input_tokens).toEqual(
    cacheReadTokens,
  );
  expect(anthropicCacheReadUsage.input_tokens).toEqual(inputTokens);
  expect(anthropicCacheReadUsage.output_tokens).toEqual(outputTokens);
}, 30000);

test("caching works with openai provider", async () => {
  const timestamp = Date.now().toString();

  const {
    usage: { inputTokens },
  } = await callRouteHandler(
    "gpt-4.1",
    timestamp + " " + longSystemPrompt.slice(0, 6000),
  );
  expect(inputTokens).toBeGreaterThan(1024);

  await pause(1000);

  const cacheReadMetadata = await callRouteHandler(
    "gpt-4.1",
    timestamp + " " + longSystemPrompt.slice(0, 6000),
  );
  const {
    usage: { cacheReadTokens },
  } = cacheReadMetadata;
  expect(cacheReadTokens).toBeGreaterThan(1024);
}, 30000);
