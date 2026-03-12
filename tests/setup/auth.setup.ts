import { test } from "@playwright/test";

test("authenticate", async ({ page, context }) => {
  if (process.env["AUTH_URL"]?.includes("ngrok")) {
    const hostname = new URL(process.env["AUTH_URL"]).hostname;
    await context.addCookies([
      {
        name: "abuse_interstitial",
        value: hostname,
        domain: hostname,
        path: "/",
      },
    ]);
  }

  await page.goto(`login`);
  await page.getByRole("button", { name: "Sign in with GitHub" }).click();
  await page.getByRole("button", { name: "Sign in with Test" }).click();
  await page.getByPlaceholder("Enter your prompt here.").fill("...");
  await page.context().storageState({ path: "playwright.state.json" });
});
