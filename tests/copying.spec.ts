import { test, expect } from "@playwright/test";
import { submitPrompt } from "./utils/submitPrompt";
import { mockChatResponse } from "./utils/mockChat";

test(`Copying code and full message works`, async ({ page, context }) => {
  await page.goto("/");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await mockChatResponse(page, {
    text: "```javascript\nfunction add(a, b) { return a + b; }\n```",
  });
  await submitPrompt(
    page,
    "Write a one-line JavaScript function named add that returns the sum of two numbers.",
  );

  const assistantMessage = page.locator('[data-testid$="-assistant"]');
  const copyButtons = assistantMessage.locator('button[aria-label="copy"]');
  const checkButton = page.locator(`button[aria-label="check"]`);
  const renderedCode = (
    await assistantMessage.locator("pre").innerText()
  ).trim();

  await expect
    .poll(async () => {
      await copyButtons.nth(0).click();
      return (await page.evaluate(() => navigator.clipboard.readText())).trim();
    })
    .toBe(renderedCode);

  await copyButtons.nth(1).click();
  await checkButton.waitFor({ state: "visible" });
  const clipboardFull = await page.evaluate(() =>
    navigator.clipboard.readText(),
  );
  expect(clipboardFull).toContain(renderedCode);
});
