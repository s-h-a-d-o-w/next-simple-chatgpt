import { test } from "@playwright/test";

test("authenticate", async ({ page }) => {
  await page.goto(`login`);
  await page.getByRole("button", { name: "Sign in with GitHub" }).click();
  await page.getByRole("button", { name: "Sign in with Test" }).click();
  await page.getByPlaceholder("Enter your prompt here.").fill("...");
  await page.context().storageState({ path: "playwright.state.json" });
});
