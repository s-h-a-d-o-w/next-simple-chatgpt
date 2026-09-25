import { Page, Route } from "@playwright/test";
import type { Metadata } from "@/types";

type MockChatOptions = {
  text: string;

  metadata?: Metadata;
};

function createMockStreamResponse(text: string, metadata?: Metadata) {
  return [
    `data: {"type":"start"}`,

    `data: {"type":"start-step"}`,

    `data: {"type":"text-start","id":"0"}`,

    `data: {"type":"text-delta","id":"0","delta":${JSON.stringify(text)}}`,

    `data: {"type":"text-end","id":"0"}`,

    `data: {"type":"finish-step"}`,

    `data: {"type":"message-metadata","messageMetadata":${JSON.stringify(metadata ?? {})}}`,

    `data: {"type":"finish","finishReason":"stop"}`,

    `data: [DONE]`,
  ].join("\n\n");
}

export async function mockChatResponse(
  page: Page,
  { text, metadata }: MockChatOptions,
) {
  await page.route("**/api/chat", async (route: Route) => {
    const response = createMockStreamResponse(text, metadata);

    await route.fulfill({
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: response,
    });
  });
}
