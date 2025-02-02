import { test, expect } from "@playwright/test";

test("each model generates a valid response", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in with GitHub" }).click();
  await page.getByRole("button", { name: "Sign in with Test" }).click();

  const promptInput = page.getByPlaceholder("Leave empty to re-run.");
  const models = ["gpt-4-turbo", "o3-mini"];

  for (const model of models) {
    await page.selectOption("select", model);

    await promptInput.fill("Hello");
    await promptInput.press("Control+Enter");

    const assistantMessage = page.locator('[data-testid$="-assistant"]');
    const responseText = await assistantMessage.innerText();
    expect(responseText.trim().length).toBeGreaterThan(0);

    await page.getByRole("button", { name: "reset" }).click();
    await expect(page.getByPlaceholder("Leave empty to re-run.")).toBeVisible();
  }
});
