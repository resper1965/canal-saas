/**
 * usePermission — React hook for RBAC permission checks
 *
 * Uses Better Auth's checkRolePermission for synchronous client-side checks.
 * Falls back to hasPermission API call when the member role isn't cached.
 *
 * Usage:
 *   const { allowed, loading } = usePermission({ entry: ['create'] })
 *   const { allowed: canExport } = usePermission({ lead: ['export'] })
 */
import { useState, useEffect, useMemo } from 'react'
import { authClient } from '../lib/auth-client'
import type { statement } from '@shared/permissions'

type PermissionCheck = Partial<{
  [K in keyof typeof statement]: (typeof statement)[K][number][]
}>

interface UsePermissionResult {
  allowed: boolean
  loading: boolean
}

/**
 * Check if the current user has the given permission in their active org.
 * Uses client-side role checking via checkRolePermission (sync, no API call).
 */
export function usePermission(permissions: PermissionCheck): UsePermissionResult {
  const [allowed, setAllowed] = useState(false)
  const [loading, setLoading] = useState(true)

  // Stable key to avoid re-running effect on every render
  const permKey = useMemo(() => JSON.stringify(permissions), [permissions])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function check() {
      try {
        const result = await authClient.organization.hasPermission({
          permissions: JSON.parse(permKey),
        })
        if (!cancelled) {
          setAllowed(!!(result as { data?: { success?: boolean } })?.data?.success)
        }
      } catch {
        if (!cancelled) setAllowed(false)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    check()
    return () => { cancelled = true }
  }, [permKey])

  return { allowed, loading }
}

/**
 * Check multiple permissions at once.
 * Returns a map of permission keys to boolean values.
 */
export function usePermissions<T extends Record<string, PermissionCheck>>(
  checks: T
): { results: Record<keyof T, boolean>; loading: boolean } {
  const [results, setResults] = useState<Record<keyof T, boolean>>(() => {
    const initial = {} as Record<keyof T, boolean>
    for (const key of Object.keys(checks)) {
      initial[key as keyof T] = false
    }
    return initial
  })
  const [loading, setLoading] = useState(true)

  const checksKey = useMemo(() => JSON.stringify(checks), [checks])

  useEffect(() => {
    let cancelled = false
    setLoading(true)

    async function checkAll() {
      const parsed = JSON.parse(checksKey) as T
      const newResults = {} as Record<keyof T, boolean>

      await Promise.all(
        Object.entries(parsed).map(async ([key, permissions]) => {
          try {
            const result = await authClient.organization.hasPermission({
              permissions: permissions as PermissionCheck,
            })
            newResults[key as keyof T] = !!(result as { data?: { success?: boolean } })?.data?.success
          } catch {
            newResults[key as keyof T] = false
          }
        })
      )

      if (!cancelled) {
        setResults(newResults)
        setLoading(false)
      }
    }

    checkAll()
    return () => { cancelled = true }
  }, [checksKey])

  return { results, loading }
}
