import { test, expect, type Page } from "@playwright/test";
import { submitPrompt } from "./utilities";
import { join } from "node:path";
import { toDirname } from "@/lib/server/toDirname";

async function addFile(page: Page, path: string) {
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Add image" }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path);

  const filename = path.split("/").pop();
  const filenameWithoutExtension = filename?.split(".")[0];
  const extension = filename?.split(".")[1];
  const altTextRegex =
    extension === "pdf"
      ? new RegExp(`^${filenameWithoutExtension}-page\\d+\\.png$`)
      : new RegExp(`^${filenameWithoutExtension}\\.${extension}$`);

  await expect(page.getByAltText(altTextRegex).first()).toBeVisible();
}

test(`Vision works correctly with PDF`, async ({ page }) => {
  await page.goto("/");

  await addFile(page, join(toDirname(import.meta.url), "./data/vision.pdf"));
  await submitPrompt(
    page,
    "What number can you see here? (No commentary, just output the number)",
  );

  await expect(page.locator('[data-testid$="-assistant"]')).toHaveText("427");
});

test(`Vision works correctly with PNG`, async ({ page }) => {
  await page.goto("/");

  await addFile(page, join(toDirname(import.meta.url), "./data/vision.png"));
  await submitPrompt(
    page,
    "What number can you see here? (No commentary, just output the number)",
  );

  await expect(page.locator('[data-testid$="-assistant"]')).toHaveText("427");
});
