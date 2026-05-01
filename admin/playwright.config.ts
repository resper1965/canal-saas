import { defineConfig, devices } from '@playwright/test';

/**
 * Canal Admin — Playwright E2E Configuration
 * 
 * Three project modes:
 * - api-smoke:    API endpoint verification (no browser)
 * - admin-ui:     Mocked auth UI tests (vite dev server)
 * - production:   Real auth E2E against canal.ness.com.br
 */
const PROD_URL = process.env.PROD_URL || 'https://canal.ness.com.br';
const isCI = !!process.env.CI;
const baseURL = isCI ? PROD_URL : 'http://127.0.0.1:5173';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  fullyParallel: false, // Sequential for prod tests (shared auth state)
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: 1,
  reporter: isCI ? 'github' : 'html',

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'api-smoke',
      testMatch: /api\.spec\.ts/,
      use: { baseURL: PROD_URL },
    },
    {
      name: 'admin-ui',
      testMatch: /(admin|smoke)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'production',
      testMatch: /prod-.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: PROD_URL,
        screenshot: 'on',
      },
    },
  ],

  // Auto-start web server for admin-ui local testing
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
