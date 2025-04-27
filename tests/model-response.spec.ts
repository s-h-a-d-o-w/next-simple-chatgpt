import { test, expect } from "@playwright/test";
import { models } from "@/utils/consts";

test("each model generates a valid response", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in with GitHub" }).click();
  await page.getByRole("button", { name: "Sign in with Test" }).click();

  const promptInput = page.getByPlaceholder("Leave empty to re-run.");
  const modelIds = Object.keys(models);

  for (const modelId of modelIds) {
    await page.selectOption("select", modelId);

    await promptInput.fill("Hello");
    await promptInput.press("Control+Enter");

    const assistantMessage = page.locator('[data-testid$="-assistant"]');
    const responseText = await assistantMessage.innerText();
    expect(responseText.trim().length).toBeGreaterThan(0);

    await page.getByRole("button", { name: "reset" }).click();
    await expect(page.getByPlaceholder("Leave empty to re-run.")).toBeVisible();
  }
});
