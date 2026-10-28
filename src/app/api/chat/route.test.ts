import { openai } from "@ai-sdk/openai";
import { POST, type ChatProps } from "./route";
import { it, describe, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import type { ModelKey } from "@/lib/models";
import type { Metadata } from "@/types";
import { config } from "@/config";
import { MockLanguageModelV4 } from "ai/test";
import { simulateReadableStream } from "ai";

vi.mock(import("@ai-sdk/openai"), { spy: true });

// Haiku 4.5 requires a minimum of 4096 tokens for caching
const longSystemPrompt = Array.from({ length: 400 })
  .fill(undefined)
  .map(
    () => `
You are a helpful assistant with extensive knowledge across many domains.`,
  )
  .join("\n");

async function callRouteHandler(model: ModelKey, systemPrompt: string) {
  const body: ChatProps = {
    id: "test-session",
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

describe("/api/chat", () => {
  // Includes sanity checks for anthropic metadata, since in the past, the right numbers were in provider metadata but those in root level usage were wrong. (Or I misinterpreted them.)
  it("caches correctly with anthropic provider", async () => {
    const timestamp = Date.now().toString();

    const cacheWriteMetadata = await callRouteHandler(
      config.models.default,
      timestamp + " " + longSystemPrompt,
    );
    const {
      usage: { cacheWriteTokens },
    } = cacheWriteMetadata;
    expect(cacheWriteTokens).toBeGreaterThan(4_096);

    // Attempt at reducing flakiness.
    await new Promise((resolve) => setTimeout(resolve, 1_000));

    const cacheReadMetadata = await callRouteHandler(
      config.models.default,
      timestamp + " " + longSystemPrompt,
    );
    const {
      usage: { cacheReadTokens },
    } = cacheReadMetadata;
    expect(cacheReadTokens).toBeGreaterThan(4_096);
  }, 30_000);

  it("has reasonable normalized usage with openai provider", async () => {
    const timestamp = Date.now().toString();

    const {
      usage: { inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens },
    } = await callRouteHandler(
      "gpt-4.1",
      timestamp + " " + longSystemPrompt.slice(0, 7_000),
    );
    expect(inputTokens).toBeGreaterThan(1_023);
    expect(outputTokens).toBeGreaterThan(0);
    expect(cacheReadTokens).toBe(0);
    expect(cacheWriteTokens).toBe(0);

    // It's not possible to test caching, since caching with OpenAI is merely "best effort".
  }, 30_000);

  it("aborts streaming when the request is aborted", async () => {
    const controller = new AbortController();

    const model = new MockLanguageModelV4({
      doStream: [
        {
          stream: simulateReadableStream({
            initialDelayInMs: 10,
            chunkDelayInMs: 10,
            chunks: [
              { type: "text-start", id: "text-1" },
              { type: "text-delta", id: "text-1", delta: "Hello" },
              { type: "text-delta", id: "text-1", delta: ", world" },
              { type: "text-end", id: "text-1" },
              {
                type: "finish",
                finishReason: { unified: "stop", raw: undefined },
                usage: {
                  inputTokens: {
                    total: 1,
                    noCache: 1,
                    cacheRead: undefined,
                    cacheWrite: undefined,
                  },
                  outputTokens: { total: 1, text: 1, reasoning: undefined },
                },
              },
            ],
          }),
        },
      ],
    });
    vi.mocked(openai).mockReturnValueOnce(model);

    const response = await POST(
      new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({
          model: "gpt-4.1",
          messages: [
            {
              id: "user-1",
              role: "user",
              parts: [{ type: "text", text: "Hello." }],
            },
          ],
        }),
        signal: controller.signal,
      }),
    );

    const reader = response.body!.getReader();
    const parts: unknown[] = [];
    for (let i = 0; ; i++) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      // Abort the request after reading 4 chunks.
      if (i === 4) {
        controller.abort(new Error("user cancelled"));
      }
      parts.push(value);
    }

    const serialized = Buffer.concat(parts as Uint8Array[]).toString();
    expect(serialized).toMatchInlineSnapshot(`
      ": stream-open

      data: {"type":"start"}

      data: {"type":"start-step"}

      data: {"type":"text-start","id":"text-1"}

      data: {"type":"text-delta","id":"text-1","delta":"Hello"}

      data: {"type":"abort","reason":"Error: user cancelled"}

      data: [DONE]

      "
    `);
  });
});
