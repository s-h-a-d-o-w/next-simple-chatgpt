import { defineConfig, devices } from "@playwright/test";
import { getLocalIp } from "./scripts/getLocalIp";

const isDev = process.env["NODE_ENV"] !== "production";
const baseURL = isDev
  ? `https://${getLocalIp()}:3000`
  : "http://localhost:3000";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  timeout: 10000,
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env["CI"],
  retries: isDev ? 0 : 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    ...(isDev && {
      launchOptions: {
        args: [
          "--auto-open-devtools-for-tabs",
          // "--devtools-flags=dock-to-bottom,console-drawer",
        ],
      },
    }),
  },

  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright.state.json",
      },
      dependencies: ["setup"],
    },
  ],

  webServer: isDev
    ? {
        // We can't use `env` in dev because we run a script => env would be overwritten
        reuseExistingServer: true,
        ignoreHTTPSErrors: true,
        command: "pnpm dev:e2e",
        url: baseURL,
        stdout: "pipe",
        stderr: "pipe",
      }
    : {
        reuseExistingServer: false,
        ignoreHTTPSErrors: true,
        command: "pnpm start",
        url: baseURL,
        stdout: "pipe",
        stderr: "pipe",
        env: {
          ...process.env,
          CI: "true",
        },
      },
});
