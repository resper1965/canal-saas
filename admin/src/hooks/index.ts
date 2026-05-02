import { useState, useEffect, useCallback } from "react";

interface UseApiResourceOptions {
  autoFetch?: boolean;
}

interface UseApiResourceReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for fetching data from an API endpoint.
 * Handles loading, error states and refetch.
 * 
 * Usage:
 *   const { data, loading, error, refetch } = useApiResource<Applicant[]>("/api/admin/applicants");
 */
export function useApiResource<T>(url: string, opts: UseApiResourceOptions = {}): UseApiResourceReturn<T> {
  const { autoFetch = true } = opts;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json as T);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (autoFetch) refetch();
  }, [autoFetch, refetch]);

  return { data, loading, error, refetch };
}

/**
 * Hook for filtering a list by search query across multiple keys.
 * 
 * Usage:
 *   const { search, setSearch, filtered } = useSearchFilter(items, ["name", "email"]);
 */
export function useSearchFilter<T extends Record<string, unknown>>(
  items: T[],
  keys: (keyof T)[]
) {
  const [search, setSearch] = useState("");

  const filtered = items.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return keys.some((key) => {
      const val = item[key];
      return typeof val === "string" && val.toLowerCase().includes(q);
    });
  });

  return { search, setSearch, filtered };
}
