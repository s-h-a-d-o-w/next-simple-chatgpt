import { test, expect } from "@playwright/test";
import { submitPrompt } from "./utilities";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.clear();
  });
});

test(`Copying code and message works`, async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);

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

test(`Deleting history entries works correctly`, async ({ page }) => {
  await submitPrompt(page, "What is 2 + 2?");
  await page.getByRole("button", { name: "Reset" }).click();

  await submitPrompt(page, "What is the capital of France?");
  await page.getByRole("button", { name: "Reset" }).click();

  await page.getByRole("button", { name: "History" }).click();

  const historyEntries = page.getByTestId("message-user");
  const deleteButtons = page.locator('button[aria-label="delete"]');
  await expect(historyEntries).toHaveCount(2);

  await historyEntries.nth(1).click({ position: { x: 10, y: 10 } });
  await expect(page.locator('button:has-text("Restore")')).toBeVisible();
  await deleteButtons.nth(1).click();
  await expect(page.locator('button:has-text("Restore")')).not.toBeVisible();
  await expect(historyEntries).toHaveCount(1);

  await deleteButtons.nth(0).click();
  await expect(historyEntries).toHaveCount(0);
});
