import { useCallback } from 'react'
import { useToast } from '../components/ui/Toast'

interface FetchOptions extends RequestInit {
  successMessage?: string
  errorMessage?: string
  silent?: boolean
}

/**
 * Hook that wraps fetch with automatic toast feedback.
 * 
 * Usage:
 *   const fetchWithToast = useFetchWithToast()
 *   const data = await fetchWithToast('/api/admin/leads', { method: 'DELETE', successMessage: 'Lead removed' })
 */
export function useFetchWithToast() {
  const { toast } = useToast()

  return useCallback(async (url: string, options: FetchOptions = {}) => {
    const { successMessage, errorMessage, silent, ...fetchOpts } = options

    try {
      const res = await fetch(url, fetchOpts)
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        const msg = data?.error || errorMessage || `Error (${res.status})`
        if (!silent) toast(msg, 'error')
        throw new Error(msg)
      }

      if (successMessage && !silent) toast(successMessage, 'success')
      return data
    } catch (err) {
      if (!silent && err instanceof Error && !err.message.startsWith('Error')) {
        toast(errorMessage || 'Connection error', 'error')
      }
      throw err
    }
  }, [toast])
}
