/**
 * Tests: API Client — api.ts
 *
 * Covers:
 * - fetchEntries URL construction with params
 * - fetchCollections response parsing
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Mock fetch ──────────────────────────────────────
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ── Import API module ───────────────────────────────
import { fetchEntries, fetchCollections } from "../lib/api";

describe("API Client", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe("fetchEntries", () => {
    it("should call correct URL for a collection slug", async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: [], meta: { total: 0, page: 1, perPage: 20, totalPages: 0 } }),
      });

      await fetchEntries("brandbook");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("/api/v1/collections/brandbook/entries");
    });

    it("should include locale param when specified", async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: [], meta: {} }),
      });

      await fetchEntries("insights", { locale: "en" });

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("locale=en");
    });

    it("should include page param when specified", async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: [], meta: {} }),
      });

      await fetchEntries("insights", { page: 3 });

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("page=3");
    });

    it("should include status param when specified", async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: [], meta: {} }),
      });

      await fetchEntries("cases", { status: "draft" });

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("status=draft");
    });

    it("should use credentials include", async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: [], meta: {} }),
      });

      await fetchEntries("brandbook");

      const opts = mockFetch.mock.calls[0][1];
      expect(opts.credentials).toBe("include");
    });

    it("should return parsed JSON response", async () => {
      const mockData = {
        data: [{ id: "1", title: "Test" }],
        meta: { total: 1, page: 1, perPage: 20, totalPages: 1 },
      };
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(mockData),
      });

      const result = await fetchEntries("brandbook");

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual({ id: "1", title: "Test" });
    });
  });

  describe("fetchCollections", () => {
    it("should call /api/v1/collections", async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ data: [] }),
      });

      await fetchCollections();

      const url = mockFetch.mock.calls[0][0] as string;
      expect(url).toContain("/api/v1/collections");
    });

    it("should parse string fields to JSON", async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: [{
            id: "1",
            slug: "insights",
            label: "Insight",
            label_plural: "Insights",
            icon: "FileText",
            has_locale: 1,
            has_slug: 1,
            has_status: 1,
            fields: '[{"name":"title","type":"text"}]',
          }],
        }),
      });

      const collections = await fetchCollections();

      expect(collections).toHaveLength(1);
      expect(collections[0].fields).toEqual([{ name: "title", type: "text" }]);
    });

    it("should handle already-parsed fields array", async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({
          data: [{
            id: "1",
            slug: "cases",
            label: "Case",
            label_plural: "Cases",
            icon: "Briefcase",
            has_locale: 1,
            has_slug: 1,
            has_status: 1,
            fields: [{ name: "client", type: "text" }],
          }],
        }),
      });

      const collections = await fetchCollections();

      expect(collections[0].fields).toEqual([{ name: "client", type: "text" }]);
    });
  });
});
