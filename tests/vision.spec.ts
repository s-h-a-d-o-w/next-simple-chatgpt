import { test, expect } from "@playwright/test";
import { submitPrompt } from "./utilities";
import { join } from "node:path";
import { toDirname } from "@/lib/server/toDirname";

test(`Deleting history entries works correctly`, async ({ page }) => {
  await page.goto("/");

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Add image" }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(
    join(toDirname(import.meta.url), "./data/vision.png"),
  );

  await submitPrompt(
    page,
    "What number can you see here? (No commentary, just output the number)",
  );

  await expect(page.locator('[data-testid$="-assistant"]')).toHaveText("427");
});
