import { test, expect } from '@playwright/test';

/**
 * Canal CMS — API Smoke Tests
 * 
 * Validates all public endpoints are responding correctly.
 * Runs against production (canal.ness.com.br).
 * No browser needed — pure HTTP assertions.
 */

const BASE = 'https://canal.ness.com.br';

test.describe('Public API — Content Endpoints', () => {
  test('GET /api/insights returns array', async ({ request }) => {
    const res = await request.get(`${BASE}/api/insights?lang=pt`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    // Validate shape of first item
    expect(data[0]).toHaveProperty('title');
    expect(data[0]).toHaveProperty('slug');
  });

  test('GET /api/cases returns array', async ({ request }) => {
    const res = await request.get(`${BASE}/api/cases?lang=pt`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test('GET /api/jobs returns array', async ({ request }) => {
    const res = await request.get(`${BASE}/api/jobs?lang=pt`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});

test.describe('Public API — Collections', () => {
  test('GET /api/v1/collections returns collection list', async ({ request }) => {
    const res = await request.get(`${BASE}/api/v1/collections`);
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('slug');
    expect(data[0]).toHaveProperty('label');
  });

  test('GET /api/v1/collections/insights/entries returns paginated data', async ({ request }) => {
    const res = await request.get(`${BASE}/api/v1/collections/insights/entries?locale=pt`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
    expect(body.meta).toHaveProperty('total');
    expect(body.meta).toHaveProperty('page');
  });
});

test.describe('Public API — Media', () => {
  test('GET /api/v1/media returns paginated gallery', async ({ request }) => {
    const res = await request.get(`${BASE}/api/v1/media`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body).toHaveProperty('meta');
  });
});

test.describe('Public API — Newsletter', () => {
  test('POST /api/newsletter validates email format', async ({ request }) => {
    const res = await request.post(`${BASE}/api/newsletter`, {
      data: { email: 'invalid' },
    });
    expect(res.status()).toBe(400);
  });

  test('POST /api/newsletter accepts valid email', async ({ request }) => {
    const res = await request.post(`${BASE}/api/newsletter`, {
      data: { email: `playwright-${Date.now()}@test.ness.com.br` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});

test.describe('Public API — Form Submission', () => {
  test('POST /api/submit-form rejects invalid payload', async ({ request }) => {
    const res = await request.post(`${BASE}/api/submit-form`, {
      data: { email: 'not-an-email' },
    });
    expect(res.status()).toBe(400);
  });

  test('POST /api/submit-form accepts valid contact form', async ({ request }) => {
    const res = await request.post(`${BASE}/api/submit-form`, {
      data: {
        type: 'contact',
        name: 'Playwright Bot',
        email: 'playwright@test.ness.com.br',
        message: 'E2E smoke test — safe to ignore.',
        source: 'e2e-test',
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});

test.describe('Auth & Security', () => {
  test('Admin endpoints require authentication', async ({ request }) => {
    const res = await request.get(`${BASE}/api/admin/stats`);
    // Should return 401 or 403, NOT 200
    expect([401, 403]).toContain(res.status());
  });

  test('Chat rate limiter responds', async ({ request }) => {
    const res = await request.post(`${BASE}/api/chat`, {
      data: {
        messages: [{ role: 'user', content: 'ping' }],
        locale: 'pt',
      },
    });
    // Should succeed (200) or be rate-limited (429), but NOT error
    expect([200, 429]).toContain(res.status());
  });
});

test.describe('Infrastructure', () => {
  test('Homepage responds with 200', async ({ request }) => {
    const res = await request.get(`${BASE}/`);
    expect(res.status()).toBe(200);
  });

  test('Marketing brands endpoint works', async ({ request }) => {
    const res = await request.get(`${BASE}/api/v1/marketing/brands`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data).toHaveProperty('ness');
  });
});
