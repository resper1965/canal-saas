import { test, expect } from './fixtures';

test.describe('Admin Backoffice Smoke Test', () => {
  test('should load the dashboard successfully with mocked auth', async ({ page }) => {
    // Navigate to the root (which requires auth)
    await page.goto('/');

    // Wait for the layout to render indicating successful auth bypass
    await expect(page.locator('.sidebar-logo')).toBeVisible();
    await expect(page.locator('.user-name')).toContainText('Test Admin');
    
    // Verify topbar title
    await expect(page.locator('.topbar-title')).toContainText('Dashboard');
    
    // Check if the generic Dashboard stats or page loaded
    // Depending on what exactly renders on '/', we mostly care that we didn't get redirected to /login
    expect(page.url()).not.toContain('/login');
  });

  test('should navigate to collections page', async ({ page }) => {
    await page.goto('/insights');

    // Mocks for collection data
    await page.route('**/api/collection/insights', async (route) => {
      await route.fulfill({ json: { 
        name: "insights", 
        label: "Insights", 
        fields: [{ name: "title", type: "text", label: "Título" }] 
      }});
    });

    await page.route('**/api/entries/insights*', async (route) => {
      await route.fulfill({ json: { data: [], meta: { total: 0, totalPages: 0 } } });
    });

    // We should see the collection page loader or empty state
    await expect(page.locator('.collection-toolbar')).toBeVisible();
    await expect(page.locator('text=Novo Insights')).toBeVisible();
  });
});
