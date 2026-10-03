import { test, expect } from "@playwright/test";
import { modelSelection } from "@/lib/models";
import { modelSelect } from "./utils/locators";

for (const modelId of modelSelection) {
  test(`Model ${modelId} generates a valid response`, async ({ page }) => {
    await page.goto("/");

    await modelSelect(page).selectOption(modelId);

    const promptInput = page.getByPlaceholder("Enter your prompt here.");
    await promptInput.fill("Hello");
    await promptInput.press("Control+Enter");

    const assistantMessage = page.locator('[data-testid$="-assistant"]');
    await assistantMessage.waitFor({ state: "visible" });
    await expect(assistantMessage).toHaveText(/\S/u);

    await page.getByRole("button", { name: "reset" }).click();
    await expect(promptInput).toBeVisible();
  });
}
