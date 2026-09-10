import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config. Unlike the vitest unit suite, these tests drive a real
 * browser against a real Supabase project and need a signed-in account
 * that already exists there (see e2e/README.md) — there is no seed step
 * that can create one without knowing that project's auth settings
 * (e.g. whether email confirmation is required), so this is intentionally
 * not part of `npm test` / CI's required checks. Run locally with
 * `npm run test:e2e` once TEST_USER_EMAIL/TEST_USER_PASSWORD are set.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "retain-on-failure",
    ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } }
      : {}),
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
