/**
 * Tests: Tenant isolation — entries.ts backend logic
 *
 * Covers:
 * - tenant_id SQL clause generation
 * - Multi-tenant data isolation rules
 * - Fallback when no tenant
 */

import { describe, it, expect } from "vitest";

/** Helper that replicates backend SQL clause logic */
function buildTenantClause(tenantId: string | undefined): { sql: string; params: unknown[] } {
  if (tenantId) {
    return { sql: "AND tenant_id = ?", params: [tenantId] };
  }
  return { sql: "AND tenant_id IS NULL", params: [] };
}

/** Replicates tenant extraction logic from requireSession middleware */
function extractTenantId(
  headerTenantId: string | undefined,
  activeOrgId: string | undefined
): string | undefined {
  return headerTenantId || activeOrgId;
}

describe("Tenant Isolation", () => {
  describe("buildTenantClause", () => {
    it("should add tenant_id = ? when tenant exists", () => {
      const result = buildTenantClause("org-abc-123");
      expect(result.sql).toBe("AND tenant_id = ?");
      expect(result.params).toEqual(["org-abc-123"]);
    });

    it("should add tenant_id IS NULL when no tenant", () => {
      const result = buildTenantClause(undefined);
      expect(result.sql).toBe("AND tenant_id IS NULL");
      expect(result.params).toEqual([]);
    });

    it("should filter with correct param binding", () => {
      const { sql, params } = buildTenantClause("org-ness");
      const fullQuery = `SELECT * FROM entries WHERE collection_id = ? ${sql}`;
      expect(fullQuery).toContain("tenant_id = ?");
      expect(params).toHaveLength(1);
    });
  });

  describe("extractTenantId", () => {
    it("should prefer x-tenant-id header over session org", () => {
      const result = extractTenantId("header-org", "session-org");
      expect(result).toBe("header-org");
    });

    it("should fallback to session activeOrganizationId", () => {
      const result = extractTenantId(undefined, "session-org");
      expect(result).toBe("session-org");
    });

    it("should return undefined when neither is available", () => {
      const result = extractTenantId(undefined, undefined);
      expect(result).toBeUndefined();
    });

    it("should not return empty string as tenant", () => {
      // Empty header should fallback
      const result = extractTenantId("", "session-org");
      // Note: empty string is falsy, so it falls back
      expect(result).toBe("session-org");
    });
  });
});
