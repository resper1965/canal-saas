import { test, expect, PROD_URL } from './prod-fixtures';

/**
 * P0 — Route Smoke Test
 * 
 * Visits every migrated admin route and verifies:
 * 1. No crash (no error boundary / white screen)
 * 2. Page renders content (not empty)
 * 3. No JS console errors
 */

const ROUTES = [
  { path: '/', name: 'Dashboard Home' },
  { path: '/users', name: 'Users' },
  { path: '/organizations', name: 'Organizations' },
  { path: '/media', name: 'Media' },
  { path: '/decks', name: 'Decks' },
  { path: '/signatures', name: 'Signatures' },
  { path: '/brandbook', name: 'Brandbook' },
  { path: '/account', name: 'Account' },
  { path: '/automation', name: 'Automation' },
  { path: '/newsletters', name: 'Newsletters' },
  { path: '/compliance', name: 'Compliance' },
  { path: '/communications', name: 'Communications' },
  { path: '/ai-settings', name: 'AI Settings' },
  { path: '/emergency', name: 'Emergency' },
  { path: '/saas', name: 'SaaS' },
  { path: '/billing', name: 'Billing' },
  { path: '/chats', name: 'Chats' },
];

test.describe('Route Smoke Tests', () => {
  for (const route of ROUTES) {
    test(`${route.name} (${route.path}) renders without crash`, async ({ prodPage: page }) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      await page.goto(`${PROD_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 20_000 });
      await page.waitForTimeout(1_000);

      // 1. Should NOT show error boundaries or crashes
      const crashIndicators = await page.locator(
        'text=/Something went wrong|Unhandled|Cannot read|undefined is not/i'
      ).count();
      expect(crashIndicators, `${route.name} has crash indicators`).toBe(0);

      // 2. Body should have meaningful content (not white screen)
      const bodyText = await page.locator('body').innerText();
      expect(bodyText.length, `${route.name} rendered empty`).toBeGreaterThan(50);

      // 3. No real console errors
      const realErrors = errors.filter(
        (e) =>
          !e.includes('favicon') &&
          !e.includes('net::ERR') &&
          !e.includes('Failed to load resource') &&
          !e.includes('404')
      );
      expect(realErrors, `${route.name} has console errors: ${realErrors.join(', ')}`).toHaveLength(0);
    });
  }
});
