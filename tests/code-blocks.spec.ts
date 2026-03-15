import { test, expect } from "@playwright/test";
import { submitPrompt } from "./utilities";
import { assistantMessage } from "./utils/locators";

test(`Code blocks render plaintext when the language is not supported`, async ({
  page,
}) => {
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
  await page.goto("/");

  await submitPrompt(
    page,
    `Repeat this back to me verbatim:

\`\`\`
something
\`\`\``,
  );

  await expect(assistantMessage(page)).toHaveText("something");
});
