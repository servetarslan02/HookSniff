import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for HookSniff Dashboard — Visual Regression Tests.
 *
 * Uses the dev server on port 3001 (matches `npm run dev`).
 * Screenshots are stored in `e2e/visual/__screenshots__/` per platform.
 *
 * Run:
 *   npm run test:visual              — run all visual tests
 *   npm run test:visual:update       — update baseline snapshots
 *   npx playwright test --grep @visual — run only visual-tagged tests
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',

  /* Run tests in parallel */
  fullyParallel: true,

  /* Fail fast on CI */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Workers */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],

  /* Shared settings for all projects */
  use: {
    /* Base URL for the dev server */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',

    /* Collect trace when retrying */
    trace: 'on-first-retry',

    /* Default screenshot options for visual comparison */
    screenshot: 'only-on-failure',
  },

  /* Configure projects for multiple browsers + mobile */
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        /* Visual comparison settings */
        defaultBrowserType: 'chromium',
      },
    },
    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        defaultBrowserType: 'firefox',
      },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        defaultBrowserType: 'chromium',
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
        defaultBrowserType: 'webkit',
      },
    },
  ],

  /* Run local dev server before starting tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
