import { test, expect } from "@playwright/test";
import { models } from "@/config";

for (const modelId of Object.keys(models)) {
  test(`Model ${modelId} generates a valid response`, async ({ page }) => {
    await page.goto("/");

    await page.selectOption("select", modelId);

    const promptInput = page.getByPlaceholder("Enter your prompt here.");
    await promptInput.fill("Hello");
    await promptInput.press("Control+Enter");

    const assistantMessage = page.locator('[data-testid$="-assistant"]');
    await assistantMessage.waitFor({ state: "visible" });
    await expect(assistantMessage).toHaveText(/\S/);

    await page.getByRole("button", { name: "reset" }).click();
    await expect(
      page.getByPlaceholder("Enter your prompt here."),
    ).toBeVisible();
  });
}
