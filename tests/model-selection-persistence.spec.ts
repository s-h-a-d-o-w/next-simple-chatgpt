import { test, expect } from "@playwright/test";
import { models } from "@/config";
import { clearLocalStorage } from "./utilities";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await clearLocalStorage(page);
});

test("should persist selected model across page reloads", async ({ page }) => {
  const modelSelect = page.locator("select");
  expect(await modelSelect.inputValue()).toBe("claude-3-5-haiku-latest");

  const differentModel = Object.keys(models).find(
    (m) => m !== "claude-3-5-haiku-latest",
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

  expect(await page.locator("select").inputValue()).toBe(
    "claude-3-5-haiku-latest",
  );
});
