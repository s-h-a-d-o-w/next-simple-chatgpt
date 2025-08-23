import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { submitPrompt } from "./utilities";

async function bottomDistance(page: Page) {
  return await page.evaluate(() => {
    const bottom =
      document.body.scrollHeight - (window.scrollY + window.innerHeight);
    return Math.max(0, Math.round(bottom));
  });
}

test("Auto-scroll snaps to bottom when user does not scroll", async ({
  page,
}) => {
  await page.goto("/");

  await submitPrompt(
    page,
    "Please output 50 lines with 1 random word on each line.",
  );

  expect(await bottomDistance(page)).toBeLessThanOrEqual(0);
});

test("Auto-scroll pauses when user scrolls up during streaming, and resumes on next message", async ({
  page,
}) => {
  await page.goto("/");

  await submitPrompt(
    page,
    "Please output 50 lines with 1 random word on each line.",
  );

  const assistantMessage = page.locator('[data-testid$="-assistant"]').last();
  await assistantMessage.waitFor({ state: "visible" });
  await expect.poll(() => bottomDistance(page)).toBeLessThanOrEqual(0);

  // User scrolls up -> auto-scroll should stop for the remainder of this stream
  await page.evaluate(() => window.scrollTo(0, 0));
  await page
    .getByRole("button", { name: "replay" })
    .waitFor({ state: "visible" });
  expect(await bottomDistance(page)).toBeGreaterThan(200);

  // Start another response; after previous stream ended, the hook resets and should auto-scroll again
  await submitPrompt(
    page,
    "Please output 10 lines with 1 random word on each line.",
  );
  await expect.poll(() => bottomDistance(page)).toBeLessThanOrEqual(0);
});
