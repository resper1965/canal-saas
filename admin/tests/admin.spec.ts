import { test, expect } from './fixtures';

/**
 * Canal Admin — UI Smoke Tests
 * 
 * Uses mocked auth session (fixtures.ts) to test the admin SPA.
 * Validates that key pages render without errors.
 */

test.describe('Admin Dashboard', () => {
  test('renders dashboard layout with sidebar', async ({ page }) => {
    await page.goto('/');
    
    // Should redirect to dashboard or show login  
    // With mocked auth, dashboard should be visible
    await page.waitForLoadState('networkidle');
    
    // Check that the app shell loaded (sidebar nav)
    const sidebar = page.locator('.sidebar, nav, [class*="sidebar"]');
    await expect(sidebar.first()).toBeVisible({ timeout: 10_000 });
  });

  test('dashboard displays stat cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Dashboard should have stat-like elements
    const cards = page.locator('.stat-card, .card, [class*="stat"]');
    await expect(cards.first()).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('Admin Navigation', () => {
  test('sidebar has core navigation items', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Key nav items should exist
    const navItems = page.locator('nav a, .sidebar a, [class*="nav"] a');
    await expect(navItems.nth(3)).toBeVisible({ timeout: 15_000 }); // At least Dashboard, Insights, Cases, etc.
  });
});

test.describe('Collections Page', () => {
  test('collection page loads without crash', async ({ page }) => {
    await page.goto('/crud/insights');
    await page.waitForLoadState('networkidle');

    // Should NOT show error/crash
    const errorElement = page.locator('text=Something went wrong, text=Error, text=Cannot read');
    const hasError = await errorElement.count();
    expect(hasError).toBe(0);
  });
});

test.describe('Error Resilience', () => {
  test('404 page renders gracefully', async ({ page }) => {
    const response = await page.goto('/nonexistent-page-xyz');
    // SPA should still load (200) and show content
    expect(response?.status()).toBeLessThan(500);
  });

  test('no console errors on dashboard load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Filter out expected errors (e.g., favicon, network mocks)
    const realErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('net::ERR') &&
      !e.includes('Failed to load resource')
    );
    
    expect(realErrors.length).toBe(0);
  });
});
