import { test, expect, type Page } from "@playwright/test";
import { submitPrompt } from "./utils/submitPrompt";
import path from "node:path";
import { toDirname } from "@/lib/server/toDirname";

async function addFile(page: Page, filePath: string) {
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Add image" }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(filePath);

  const filename = filePath.split("/").pop();
  const filenameWithoutExtension = filename?.split(".")[0];
  const extension = filename?.split(".")[1];
  const altTextRegex =
    extension === "pdf"
      ? new RegExp(`^${filenameWithoutExtension}-page\\d+\\.png$`, "u")
      : new RegExp(`^${filenameWithoutExtension}\\.${extension}$`, "u");

  await expect(page.getByAltText(altTextRegex).first()).toBeVisible();
}

test(`Vision works correctly with PDF`, async ({ page }) => {
  await page.goto("/");

  await addFile(page, path.join(toDirname(import.meta.url), "./data/vision.pdf"));
  await submitPrompt(
    page,
    "What number can you see here? (No commentary, just output the number)",
  );

  await expect(page.locator('[data-testid$="-assistant"]')).toHaveText("427");
});

test(`Vision works correctly with PNG`, async ({ page }) => {
  await page.goto("/");

  await addFile(page, path.join(toDirname(import.meta.url), "./data/vision.png"));
  await submitPrompt(
    page,
    "What number can you see here? (No commentary, just output the number)",
  );

  await expect(page.locator('[data-testid$="-assistant"]')).toHaveText("427");
});
