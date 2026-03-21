import { test, expect } from "@playwright/test";
import { submitPrompt } from "./utils/submitPrompt";
import { assistantMessage } from "./utils/locators";
import { mockChatResponse } from "./utils/mockChat";

test(`Code blocks render plaintext when the language is not supported`, async ({
  page,
}) => {
  await mockChatResponse(page, {
    text: "```unsupported\nsomething\n```",
  });

  await page.goto("/");

  await submitPrompt(
    page,
    `Repeat this back to me verbatim:

\`\`\`unsupported
something
\`\`\``,
  );

  await expect(assistantMessage(page)).toHaveText("something");
});

test(`Code blocks render plaintext when no language is specified`, async ({
  page,
}) => {
  await mockChatResponse(page, {
    text: "```\nsomething\n```",
  });

  await page.goto("/");

  await submitPrompt(page, "Write a code block");

  await expect(assistantMessage(page)).toHaveText("something");
});
