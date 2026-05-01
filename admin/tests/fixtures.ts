import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Mock the session endpoint
    await page.route('**/api/auth/get-session', async (route) => {
      const json = {
        session: {
          id: "mock-session-id",
          userId: "mock-user-id",
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
          ipAddress: "127.0.0.1",
          userAgent: "Playwright"
        },
        user: {
          id: "mock-user-id",
          email: "resper@bekaa.eu", // SUPER_ADMIN_EMAIL from dashboard.tsx
          emailVerified: true,
          name: "Test Admin",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          role: "admin"
        }
      };
      await route.fulfill({ json });
    });

    // Mock full organization endpoint
    await page.route('**/api/auth/organization/get-full-organization', async (route) => {
      const json = {
        id: "mock-org-id",
        name: "Mock Workspace",
        slug: "mock-workspace",
        createdAt: new Date().toISOString(),
        metadata: {},
        members: [{
          id: "mock-user-id",
          role: "owner"
        }]
      };
      await route.fulfill({ json });
    });

    // Mock set active endpoint
    await page.route('**/api/auth/organization/set-active', async (route) => {
      await route.fulfill({ json: { success: true, organizationId: "mock-org-id" } });
    });

    // Mock active organization endpoint
    await page.route('**/api/auth/organization/get-active', async (route) => {
      const json = {
        id: "mock-org-id",
        name: "Mock Workspace",
        slug: "mock-workspace",
        createdAt: new Date().toISOString(),
        metadata: {}
      };
      await route.fulfill({ json });
    });

    // Mock collections and dashboard stats api
    await page.route('**/api/v1/collections/*', async (route) => {
      await route.fulfill({ json: { data: [], meta: { total: 0 } } });
    });

    await page.route('**/api/admin/stats*', async (route) => {
      await route.fulfill({ json: { 
        totalLeads: 10, newLeads: 2, totalForms: 5, newForms: 1, 
        totalChats: 3, publishedEntries: 42, totalPosts: 12, 
        totalCases: 5, totalJobs: 2, totalUsers: 3, weeklyLeads: [] 
      } });
    });

    await page.route('**/api/admin/health*', async (route) => {
      await route.fulfill({ json: { 
        db: { status: "ok" }, kv: { status: "ok" }, ai: { status: "ok" }, 
        storage: { status: "ok" }, queue: { status: "ok" } 
      } });
    });
    
    await page.route('**/api/admin/activity*', async (route) => {
      await route.fulfill({ json: [] });
    });

    // Mock list organizations endpoint
    await page.route('**/api/auth/organization/list', async (route) => {
      const json = [
        {
          id: "mock-org-id",
          name: "Mock Workspace",
          slug: "mock-workspace",
          createdAt: new Date().toISOString(),
          metadata: {}
        }
      ];
      await route.fulfill({ json });
    });

    await use(page);
  },
});

export { expect } from '@playwright/test';
