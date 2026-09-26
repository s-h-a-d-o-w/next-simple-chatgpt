import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
} from "@playwright/test";
import { execFileSync } from "node:child_process";

const isDev = process.env["NODE_ENV"] !== "production";
const port = process.env["PORT"] ?? 3_000;
const baseURL = process.env["AUTH_URL"]
  ? new URL(process.env["AUTH_URL"]).origin
  : `http://localhost:${port}`;

const sharedWebServerOptions: Partial<PlaywrightTestConfig["webServer"]> = {
  url: baseURL,
  timeout: 20 * 1_000,
  ignoreHTTPSErrors: true,
  stdout: "pipe",
  stderr: "pipe",
  env: {
    ...process.env,
    NEXT_PUBLIC_TEST: "true",
  },
} as const;

// kill possible existing server on the port, but only if we're not running in a test worker
if (!isDev && process.env["TEST_WORKER_INDEX"] === undefined) {
  execFileSync(
    "sh",
    [
      "-c",
      `(lsof -tiTCP:"$1" -sTCP:LISTEN 2>/dev/null || ss -H -ltnp "sport = :$1" 2>/dev/null | sed -n 's/.*pid=\\([0-9][0-9]*\\).*/\\1/p') | xargs -r kill -9`,
      "sh",
      String(port),
    ],
    { stdio: "ignore" },
  );
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  timeout: 10_000,

  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: Boolean(process.env["CI"]),
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
    { name: "setup", testMatch: /.*\.setup\.ts/u },
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
        command: "node --env-file=.env.local .next/standalone/server.js",
        ...sharedWebServerOptions,
        env: {
          ...sharedWebServerOptions.env,
          HOSTNAME: "0.0.0.0",
        },
      },
});
