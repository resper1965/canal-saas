import { test, expect, PROD_URL } from './prod-fixtures';

/**
 * Visual Regression Baseline
 * 
 * Captures a full-page screenshot of every admin route.
 * These serve as the visual baseline for future comparisons.
 * 
 * Run: CANAL_PASSWORD=xxx npx playwright test prod-visual --update-snapshots
 */

const ROUTES = [
  { path: '/', name: 'dashboard' },
  { path: '/users', name: 'users' },
  { path: '/organizations', name: 'organizations' },
  { path: '/media', name: 'media' },
  { path: '/decks', name: 'decks' },
  { path: '/signatures', name: 'signatures' },
  { path: '/brandbook', name: 'brandbook' },
  { path: '/account', name: 'account' },
  { path: '/automation', name: 'automation' },
  { path: '/newsletters', name: 'newsletters' },
  { path: '/compliance', name: 'compliance' },
  { path: '/communications', name: 'communications' },
  { path: '/ai-settings', name: 'ai-settings' },
  { path: '/emergency', name: 'emergency' },
  { path: '/saas', name: 'saas' },
];

test.describe('Visual Baseline Captures', () => {
  for (const route of ROUTES) {
    test(`snapshot: ${route.name}`, async ({ prodPage: page }) => {
      await page.goto(`${PROD_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 20_000 });
      await page.waitForTimeout(1_500); // let animations settle

      await expect(page).toHaveScreenshot(`${route.name}.png`, {
        fullPage: true,
        animations: 'disabled',
        maxDiffPixelRatio: 0.02,
      });
    });
  }
});
