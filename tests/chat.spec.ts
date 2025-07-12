import { test, expect } from "@playwright/test";

test(`Copying code and message works`, async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

  await page.goto("/");

  const promptInput = page.getByPlaceholder("Enter your prompt here.");
  await promptInput.fill(
    "Write a one-line JavaScript function named add that returns the sum of two numbers.",
  );
  await promptInput.press("Control+Enter");

  const assistantMessage = page.locator('[data-testid$="-assistant"]');
  const copyButtons = assistantMessage.locator('button[aria-label="copy"]');
  const checkButton = page.locator(`button[aria-label="check"]`);
  const renderedCode = (
    await assistantMessage.locator("pre").innerText()
  ).trim();

  await copyButtons.nth(0).click();
  await checkButton.waitFor({ state: "visible" });
  const clipboardCode = await page.evaluate(() =>
    navigator.clipboard.readText(),
  );
  expect(clipboardCode.trim()).toBe(renderedCode);

  await copyButtons.nth(1).click();
  await checkButton.waitFor({ state: "visible" });
  const clipboardFull = await page.evaluate(() =>
    navigator.clipboard.readText(),
  );
  expect(clipboardFull).toContain(renderedCode);
});
