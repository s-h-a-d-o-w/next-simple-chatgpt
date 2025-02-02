import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:3000";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env["CI"],
  retries: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // We can't re-use the dev server because authentication would be a problem.
  // Mocking authentication requires running the server in "CI mode".
  webServer: {
    command: "pnpm cross-env CI=true pnpm start",
    url: baseURL,
    stdout: "pipe",
    stderr: "pipe",
    env: {
      ...process.env,
      CI: "true",
    },
  },
});
