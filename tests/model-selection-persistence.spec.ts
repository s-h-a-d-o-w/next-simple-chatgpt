import { test, expect } from "@playwright/test";
import { config, models } from "@/config";
import { clearLocalStorage } from "./utilities";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await clearLocalStorage(page);
});

test("should persist selected model across page reloads", async ({ page }) => {
  const modelSelect = page.locator("select");
  expect(await modelSelect.inputValue()).toBe(config.models.default);

  const differentModel = Object.keys(models).find(
    (m) => m !== config.models.default,
  );
  await modelSelect.selectOption(differentModel!);
  await page.reload();
  expect(await modelSelect.inputValue()).toBe(differentModel);
});

test("should handle oudated model data in localStorage", async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem("model", "some-old-model");
  });

  await page.reload();

  expect(await page.locator("select").inputValue()).toBe(config.models.default);
});
