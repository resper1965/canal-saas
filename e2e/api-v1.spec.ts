/**
 * Canal SaaS — E2E Tests for Public API v1
 *
 * Tests the key API endpoints that external clients use:
 *   - OpenAPI spec / Docs
 *   - Collections listing
 *   - Entries CRUD (with API key)
 *   - Rate limiting headers
 *   - Onboarding flow
 *   - Billing endpoints
 *   - Widget.js
 *   - Developer portal
 *
 * Run: npx playwright test e2e/api-v1.spec.ts
 * Requires: wrangler dev running on localhost:8787
 */

import { test, expect } from '@playwright/test';

const BASE = process.env.CANAL_API_URL || 'http://localhost:8787';

// ── Public endpoints (no auth) ─────────────────────────────────

test.describe('Public Endpoints', () => {
  test('GET /api/docs renders Swagger UI', async ({ request }) => {
    const res = await request.get(`${BASE}/api/docs`);
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain('swagger-ui');
  });

  test('GET /api/openapi.json returns valid OpenAPI spec', async ({ request }) => {
    const res = await request.get(`${BASE}/api/openapi.json`);
    expect(res.status()).toBe(200);
    const spec = await res.json();
    expect(spec.openapi).toBe('3.1.0');
    expect(spec.info.title).toBeTruthy();
    expect(spec.paths).toBeTruthy();
  });

  test('GET /widget.js returns JavaScript', async ({ request }) => {
    const res = await request.get(`${BASE}/widget.js`);
    expect(res.status()).toBe(200);
    const ct = res.headers()['content-type'];
    expect(ct).toContain('javascript');
    const body = await res.text();
    expect(body).toContain('canal-chat');
  });

  test('GET /api/developers serves developer portal', async ({ request }) => {
    const res = await request.get(`${BASE}/api/developers`);
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain('Canal');
  });
});

// ── API v1 (requires auth) ─────────────────────────────────────

test.describe('API v1 — Collections', () => {
  test('GET /api/v1/collections returns 401 without auth', async ({ request }) => {
    const res = await request.get(`${BASE}/api/v1/collections`);
    // Should be 401 or 403 without API key
    expect([401, 403]).toContain(res.status());
  });

  test('GET /api/v1/collections returns list with valid API key', async ({ request }) => {
    const apiKey = process.env.CANAL_TEST_API_KEY;
    if (!apiKey) {
      test.skip();
      return;
    }

    const res = await request.get(`${BASE}/api/v1/collections`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

test.describe('API v1 — Entries', () => {
  const apiKey = process.env.CANAL_TEST_API_KEY;

  test('GET /api/v1/collections/insights/entries returns entries or empty', async ({ request }) => {
    if (!apiKey) { test.skip(); return; }

    const res = await request.get(`${BASE}/api/v1/collections/insights/entries?status=published&limit=5`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });

  test('Rate limit headers are present', async ({ request }) => {
    if (!apiKey) { test.skip(); return; }

    const res = await request.get(`${BASE}/api/v1/collections`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    const headers = res.headers();
    expect(headers['x-ratelimit-limit']).toBeTruthy();
    expect(headers['x-ratelimit-remaining']).toBeTruthy();
  });
});

// ── Onboarding ─────────────────────────────────────────────────

test.describe('Onboarding API', () => {
  test('POST /api/onboarding/signup rejects invalid payload', async ({ request }) => {
    const res = await request.post(`${BASE}/api/onboarding/signup`, {
      data: { name: 'A' },  // too short or missing fields
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });
});

// ── Billing ────────────────────────────────────────────────────

test.describe('Billing API', () => {
  test('GET /api/saas/billing/usage requires tenantId', async ({ request }) => {
    const res = await request.get(`${BASE}/api/saas/billing/usage`);
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain('tenantId');
  });

  test('GET /api/saas/billing/status/:tenantId returns plan info', async ({ request }) => {
    const res = await request.get(`${BASE}/api/saas/billing/status/nonexistent`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.plan).toBe('free');
  });

  test('POST /api/saas/billing/checkout returns mock URL without Stripe key', async ({ request }) => {
    const res = await request.post(`${BASE}/api/saas/billing/checkout`, {
      data: { tenantId: 'test', plan: 'pro' },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.url || body.mock).toBeTruthy();
  });
});

// ── Widget Integration (browser) ───────────────────────────────

test.describe('Widget Browser Test', () => {
  test('Widget loads as web component in browser', async ({ page }) => {
    // Create a minimal HTML page that loads the widget
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <script src="${BASE}/widget.js" data-key="pk_test_12345"></script>
          <canal-chat position="bottom-right"></canal-chat>
        </body>
      </html>
    `);

    // Wait for the widget to render
    await page.waitForTimeout(2000);

    // Check if the custom element was defined
    const isDefined = await page.evaluate(() => {
      return customElements.get('canal-chat') !== undefined;
    });
    expect(isDefined).toBe(true);
  });
});
