import { test, expect } from "@playwright/test";
import { submitPrompt } from "./utilities";

test(`Deleting history entries works correctly`, async ({ page }) => {
  await page.goto("/");
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
