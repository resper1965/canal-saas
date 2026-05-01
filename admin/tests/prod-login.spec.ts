import { test, expect, PROD_URL } from './prod-fixtures';

/**
 * P0 — Login + Dashboard Smoke
 * 
 * Validates real authentication against production and
 * confirms the dashboard renders core elements correctly.
 */
test.describe('Production Login', () => {
  test('should login and reach the dashboard', async ({ prodPage: page }) => {
    // After login we should be on dashboard (not /login)
    expect(page.url()).not.toContain('/login');

    // Dashboard shell should render — sidebar with nav links
    const sidebar = page.locator('aside, nav, [class*="sidebar"]').first();
    await expect(sidebar).toBeVisible({ timeout: 10_000 });
  });

  test('should display user identity in sidebar', async ({ prodPage: page }) => {
    // User name or email should be visible somewhere
    const userInfo = page.locator('text=resper').first();
    await expect(userInfo).toBeVisible({ timeout: 5_000 });
  });

  test('should have zero console errors on dashboard load', async ({ prodPage: page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(PROD_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3_000);

    // Filter out network/expected errors
    const realErrors = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('net::ERR') &&
        !e.includes('Failed to load resource') &&
        !e.includes('404')
    );

    expect(realErrors).toHaveLength(0);
  });
});
