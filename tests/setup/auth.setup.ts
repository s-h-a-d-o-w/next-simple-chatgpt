import { test } from "@playwright/test";

test("authenticate", async ({ page, context }) => {
  const ngrokCookies = [];
  if (process.env["AUTH_URL"]?.includes("ngrok")) {
    const hostname = new URL(process.env["AUTH_URL"]).hostname;
    ngrokCookies.push({
      name: "abuse_interstitial",
      value: hostname,
      domain: hostname,
      path: "/",
    });
  }

  await context.addCookies(ngrokCookies);

  await page.context().storageState({ path: "playwright.state.json" });
});
