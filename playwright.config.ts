import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
} from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
process.env["NEXT_PUBLIC_E2E"] = "true";

const isDev = process.env["NODE_ENV"] !== "production";
const baseURL = process.env["AUTH_URL"]
  ? new URL(process.env["AUTH_URL"]).origin
  : `http://localhost:${process.env["PORT"] ?? 3000}`;

const sharedWebServerOptions: Partial<PlaywrightTestConfig["webServer"]> = {
  url: baseURL,
  timeout: 5 * 1000,
  ignoreHTTPSErrors: true,
  stdout: "pipe",
  stderr: "pipe",
  env: {
    ...process.env,
    NEXT_PUBLIC_E2E: "true",
  },
} as const;

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

    screenshot: "only-on-failure",

    ignoreHTTPSErrors: true,

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
        reuseExistingServer: true,
        command: "pnpm dev:e2e",
        ...sharedWebServerOptions,
      }
    : {
        reuseExistingServer: false,
        command: "pnpm start",
        ...sharedWebServerOptions,
      },
});
