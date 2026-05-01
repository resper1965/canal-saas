import { test as base, expect, Page } from '@playwright/test';

/**
 * Production Fixtures — Real Auth Against canal.ness.com.br
 * 
 * Uses actual login flow (email + password) instead of mocked sessions.
 * Auth state is stored and reused across tests via storageState.
 */

const PROD_URL = 'https://canal.ness.com.br';
const CREDENTIALS = {
  email: process.env.CANAL_EMAIL || 'resper@bekaa.eu',
  password: process.env.CANAL_PASSWORD || '',
};

async function loginToProd(page: Page): Promise<void> {
  await page.goto(`${PROD_URL}/login`, { waitUntil: 'networkidle' });

  // Fill credentials
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
  const passwordInput = page.locator('input[type="password"]').first();

  await emailInput.fill(CREDENTIALS.email);
  await passwordInput.fill(CREDENTIALS.password);

  // Submit
  const submitBtn = page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login"), button:has-text("Sign")').first();
  await submitBtn.click();

  // Wait for redirect away from /login
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15_000 });
}

export const test = base.extend<{ prodPage: Page }>({
  prodPage: async ({ page }, use) => {
    await loginToProd(page);
    await use(page);
  },
});

export { expect, PROD_URL };
