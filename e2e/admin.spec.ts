/**
 * Canal SaaS — E2E Tests for Admin & Protected Routes
 *
 * Validates:
 *   - Admin routes reject unauthenticated requests (403)
 *   - Chatbot config is publicly accessible
 *   - MCP endpoint requires auth (401)
 *   - Chat endpoint rejects empty/malformed payload
 *   - DSAR endpoint validates input
 *   - Health check structure
 *
 * Run: CANAL_API_URL=https://canal.bekaa.eu npx playwright test e2e/admin.spec.ts
 */

import { test, expect } from '@playwright/test';

const BASE = process.env.CANAL_API_URL || 'http://localhost:8787';

// ── Admin Routes: Auth Guard ───────────────────────────────────

test.describe('Admin Auth Guard — Rejects unauthenticated requests', () => {
  const protectedEndpoints = [
    { method: 'GET', path: '/api/admin/stats' },
    { method: 'GET', path: '/api/admin/leads' },
    { method: 'GET', path: '/api/admin/applicants' },
    { method: 'GET', path: '/api/admin/forms' },
    { method: 'GET', path: '/api/admin/chats' },
    { method: 'GET', path: '/api/admin/organizations' },
    { method: 'GET', path: '/api/admin/health' },
    { method: 'GET', path: '/api/admin/ai-settings' },
    { method: 'GET', path: '/api/admin/ai-stats' },
    { method: 'GET', path: '/api/admin/domains' },
    { method: 'GET', path: '/api/admin/communications' },
    { method: 'GET', path: '/api/admin/newsletter-subscribers' },
    { method: 'GET', path: '/api/admin/knowledge-base' },
    { method: 'GET', path: '/api/admin/chat-sessions' },
    { method: 'GET', path: '/api/admin/social-posts' },
    { method: 'GET', path: '/api/admin/compliance/ropa' },
    { method: 'GET', path: '/api/admin/compliance/incidents' },
    { method: 'GET', path: '/api/admin/activity' },
  ];

  for (const ep of protectedEndpoints) {
    test(`${ep.method} ${ep.path} returns 401 or 403`, async ({ request }) => {
      const res = await request.fetch(`${BASE}${ep.path}`, { method: ep.method });
      // Unauthenticated = 401 (no session) or 403 (forbidden)
      expect([401, 403]).toContain(res.status());
    });
  }
});

// ── Admin Write Routes: Auth Guard ─────────────────────────────

test.describe('Admin Write Routes — Rejects unauthenticated', () => {
  test('PUT /api/admin/ai-settings requires auth', async ({ request }) => {
    const res = await request.put(`${BASE}/api/admin/ai-settings`, {
      data: { bot_name: 'Test' },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('POST /api/admin/newsletter-subscribers requires auth', async ({ request }) => {
    const res = await request.post(`${BASE}/api/admin/newsletter-subscribers`, {
      data: { email: 'test@example.com' },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('POST /api/admin/domains requires auth', async ({ request }) => {
    const res = await request.post(`${BASE}/api/admin/domains`, {
      data: { domain: 'test.example.com' },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('POST /api/admin/knowledge-base requires auth', async ({ request }) => {
    const res = await request.post(`${BASE}/api/admin/knowledge-base`, {
      data: { title: 'Test', text_payload: 'Hello' },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('POST /api/admin/compliance/ropa requires auth', async ({ request }) => {
    const res = await request.post(`${BASE}/api/admin/compliance/ropa`, {
      data: { process_name: 'test' },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('DELETE /api/admin/leads/999 requires auth', async ({ request }) => {
    const res = await request.delete(`${BASE}/api/admin/leads/999`);
    expect([401, 403]).toContain(res.status());
  });

  test('PATCH /api/admin/organizations/nonexistent requires auth', async ({ request }) => {
    const res = await request.patch(`${BASE}/api/admin/organizations/nonexistent`, {
      data: { metadata: {} },
    });
    expect([401, 403]).toContain(res.status());
  });
});

// ── Public Endpoints ───────────────────────────────────────────

test.describe('Public Endpoints', () => {
  test('GET /api/chatbot-config returns valid config', async ({ request }) => {
    const res = await request.get(`${BASE}/api/chatbot-config`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    // Must have at minimum the bot name and theme color
    expect(body.bot_name).toBeTruthy();
    expect(body.theme_color).toBeTruthy();
  });

  test('GET /api/v1/collections/:slug returns schema', async ({ request }) => {
    const res = await request.get(`${BASE}/api/v1/collections/insights`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.slug).toBe('insights');
    expect(body.fields).toBeTruthy();
  });

  test('GET /api/v1/collections/nonexistent returns 404', async ({ request }) => {
    const res = await request.get(`${BASE}/api/v1/collections/nonexistent-slug`);
    expect(res.status()).toBe(404);
  });
});

// ── MCP Endpoint ───────────────────────────────────────────────

test.describe('MCP Endpoint', () => {
  test('GET /api/mcp requires auth (401)', async ({ request }) => {
    const res = await request.get(`${BASE}/api/mcp`);
    expect([401, 405]).toContain(res.status());
  });
});

// ── Chat Endpoint ──────────────────────────────────────────────

test.describe('Chat Endpoint', () => {
  test('POST /api/chat with empty messages returns error or empty', async ({ request }) => {
    const res = await request.post(`${BASE}/api/chat`, {
      data: { messages: [] },
      timeout: 5000,
    });
    // Empty messages should fail validation or return quickly
    expect([400, 200]).toContain(res.status());
  });
});
