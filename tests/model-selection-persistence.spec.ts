import { test, expect } from "@playwright/test";
import { config } from "@/config";
import { modelSelection } from "@/lib/models";
import { modelSelect } from "./utils/locators";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("should persist selected model across page reloads", async ({ page }) => {
  const select = modelSelect(page);
  expect(await select.inputValue()).toBe(config.models.default);

  const differentModel = modelSelection.find(
    (m) => m !== config.models.default,
  );
  await select.selectOption(differentModel!);
  await page.reload();
  expect(await select.inputValue()).toBe(differentModel);
});

test("should handle oudated model data in localStorage", async ({ page }) => {
  await page.evaluate(() => {
    localStorage.setItem("model", "some-old-model");
  });

  await page.reload();

  expect(await modelSelect(page).inputValue()).toBe(config.models.default);
});
