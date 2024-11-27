import { test, expect } from "@playwright/test";

// Depends on chat gpt, so it might be flaky.
test("chat has acceptable delay until stream starts", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in with GitHub" }).click();
  await page.getByRole("button", { name: "Sign in with Test" }).click();
  await page
    .getByPlaceholder("Leave empty to re-run.")
    .fill("This is just an end to end test.");

  const start = Date.now();
  await page.getByRole("main").getByRole("button").click();
  await page.getByTestId("message-1-assistant").waitFor();
  const durationUntilResponse = Date.now() - start;
  console.log("durationUntilResponse:", durationUntilResponse);

  expect(durationUntilResponse).toBeLessThan(100);
});
