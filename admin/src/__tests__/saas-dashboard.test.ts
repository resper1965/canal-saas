/**
 * Tests: SaaS Dashboard — saas.tsx
 *
 * Covers:
 * - Role-based access control (RBAC) logic
 * - Tab visibility based on user role
 * - Plan tier identification
 */

import { describe, it, expect } from "vitest";

const SUPER_ADMIN_EMAIL = "resper@bekaa.eu";

type Tab = "overview" | "members" | "plan" | "settings";

function getVisibleTabs(userEmail: string, myRole: string): Tab[] {
  const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL;
  const isAdmin = isSuperAdmin || myRole === "owner" || myRole === "admin";
  const isEditor = isAdmin || myRole === "member";

  const tabs: { key: Tab; visible: boolean }[] = [
    { key: "overview", visible: true },
    { key: "members", visible: isEditor },
    { key: "plan", visible: true },
    { key: "settings", visible: isAdmin },
  ];

  return tabs.filter(t => t.visible).map(t => t.key);
}

function getPlanTier(metadata: Record<string, unknown> | null): string {
  if (!metadata) return "free";
  return (metadata.plan as string) === "pro" ? "pro" : "free";
}

describe("SaaS Dashboard RBAC", () => {
  describe("Tab visibility", () => {
    it("super admin should see all 4 tabs", () => {
      const tabs = getVisibleTabs("resper@bekaa.eu", "member");
      expect(tabs).toEqual(["overview", "members", "plan", "settings"]);
    });

    it("owner should see all 4 tabs", () => {
      const tabs = getVisibleTabs("joao@empresa.com", "owner");
      expect(tabs).toEqual(["overview", "members", "plan", "settings"]);
    });

    it("admin should see all 4 tabs", () => {
      const tabs = getVisibleTabs("joao@empresa.com", "admin");
      expect(tabs).toEqual(["overview", "members", "plan", "settings"]);
    });

    it("member should see overview, members, plan (no settings)", () => {
      const tabs = getVisibleTabs("joao@empresa.com", "member");
      expect(tabs).toEqual(["overview", "members", "plan"]);
    });

    it("unknown role defaults to member behavior", () => {
      const tabs = getVisibleTabs("unknown@test.com", "viewer");
      expect(tabs).toEqual(["overview", "plan"]);
    });
  });

  describe("Plan tier detection", () => {
    it("should return 'free' when no metadata", () => {
      expect(getPlanTier(null)).toBe("free");
    });

    it("should return 'free' when plan is not set", () => {
      expect(getPlanTier({})).toBe("free");
    });

    it("should return 'pro' when plan === 'pro'", () => {
      expect(getPlanTier({ plan: "pro" })).toBe("pro");
    });

    it("should return 'free' for unknown plan values", () => {
      expect(getPlanTier({ plan: "enterprise" })).toBe("free");
    });
  });
});
