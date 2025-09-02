import { Page } from "@playwright/test";

export async function submitPrompt(page: Page, prompt: string) {
  const promptInput = page.getByRole("textbox", { name: "chat prompt" });
  await promptInput.fill(prompt);
  await promptInput.press("Control+Enter");
  await page
    .getByRole("button", { name: "replay" })
    .waitFor({ state: "visible" });
}

export async function clearLocalStorage(page: Page) {
  await page.evaluate(() => localStorage.clear());
}
