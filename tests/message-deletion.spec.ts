import { test, expect } from "@playwright/test";
import { submitPrompt } from "./utilities";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("should delete individual messages correctly", async ({ page }) => {
  test.setTimeout(30000);

  await submitPrompt(page, "First message");
  await submitPrompt(page, "Second message");
  await submitPrompt(page, "Third message");

  const main = page.getByRole(`main`);
  const userMessages = main.locator('[data-testid$="-user"]');
  const assistantMessages = main.locator('[data-testid$="-assistant"]');

  // Verify all messages are present
  await expect(userMessages).toHaveCount(3);
  await expect(assistantMessages).toHaveCount(3);

  // Delete the middle message
  const secondUserMessage = userMessages
    .getByText("Second message")
    .locator("../..");
  await secondUserMessage.getByRole("button", { name: "delete" }).click();

  // Verify remaining messages are correct
  await expect(secondUserMessage).not.toBeVisible();
  await expect(userMessages.getByText("First message")).toBeVisible();
  await expect(userMessages.getByText("Third message")).toBeVisible();
  await expect(assistantMessages).toHaveCount(3);
});

test("should handle rapid consecutive deletions", async ({ page }) => {
  test.setTimeout(30000);

  for (let i = 1; i <= 5; i++) {
    await submitPrompt(page, `Message ${i}`);
  }

  const main = page.getByRole(`main`);
  const userMessages = main.locator('[data-testid$="-user"]');
  await expect(userMessages).toHaveCount(5);

  // Delete messages rapidly without waiting
  for (let i = 1; i <= 3; i++) {
    const message = main
      .getByText(`Message ${i}`, { exact: true })
      .locator("../..");
    await message.getByRole("button", { name: "delete" }).click();
  }

  await expect(userMessages).toHaveCount(2);
  await expect(userMessages.filter({ hasText: "Message 4" })).toBeVisible();
  await expect(userMessages.filter({ hasText: "Message 5" })).toBeVisible();
});

test("should handle deletion of assistant messages", async ({ page }) => {
  await submitPrompt(page, "Generate a response");

  const main = page.getByRole(`main`);
  const assistantMessage = main.locator('[data-testid$="-assistant"]');
  await assistantMessage.getByRole("button", { name: "delete" }).click();

  await expect(assistantMessage).not.toBeVisible();
  await expect(main.getByText("Generate a response")).toBeVisible();
});
