import { Page } from "@playwright/test";

export const assistantMessage = (page: Page) =>
  page.locator('[data-testid$="-assistant"]');
