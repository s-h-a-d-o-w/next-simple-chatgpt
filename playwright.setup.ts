import { chromium, FullConfig } from "@playwright/test";

export default async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${config.projects[0]!.use.baseURL}/login`);
  await page.getByRole("button", { name: "Sign in with GitHub" }).click();
  await page.getByRole("button", { name: "Sign in with Test" }).click();
  await page.getByPlaceholder("Enter your prompt here.").fill("...");

  await context.storageState({ path: "playwright.state.json" });
  await browser.close();
}
