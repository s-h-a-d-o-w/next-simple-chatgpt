import { test, expect } from "@playwright/test";
import { submitPrompt } from "./utils/submitPrompt";
import { mockChatResponse } from "./utils/mockChat";

test(`Deleting and restoring history entries works correctly`, async ({
  page,
}) => {
  await page.goto("/");
  await mockChatResponse(page, {
    text: "4",
  });
  await submitPrompt(page, "What is 2 + 2?");
  await page.getByRole("button", { name: "Reset" }).click();

  await mockChatResponse(page, {
    text: "The capital of France is Paris.",
  });
  await submitPrompt(page, "What is the capital of France?");
  await page.getByRole("button", { name: "Reset" }).click();

  await mockChatResponse(page, {
    text: "2",
  });
  await submitPrompt(page, "What is 1 + 1?");
  await page.getByRole("button", { name: "Reset" }).click();

  await page.getByRole("button", { name: "History" }).click();

  const historyEntries = page.getByTestId("message-user");
  const deleteButtons = page.locator('button[aria-label="delete"]');
  await expect(historyEntries).toHaveCount(3);

  await historyEntries.nth(1).click({ position: { x: 10, y: 10 } });
  await expect(page.locator('button:has-text("Restore")')).toBeVisible();
  await expect(page.getByText("What is the capital of France?")).toHaveCount(2);
  await deleteButtons.nth(1).click();
  await expect(page.locator('button:has-text("Restore")')).not.toBeVisible();
  await expect(historyEntries).toHaveCount(2);
  // Correct entry was deleted.
  await expect(page.getByText("What is 1 + 1?")).toBeVisible();
  await expect(page.getByText("What is 2 + 2?")).toBeVisible();

  await deleteButtons.nth(0).click();
  await expect(historyEntries).toHaveCount(1);
  await expect(page.getByText("What is 2 + 2?")).toBeVisible();
  await historyEntries.nth(0).click({ position: { x: 10, y: 10 } });

  await page.locator('button:has-text("Restore")').click();
  await expect(page.getByText("4")).toBeVisible();
});
