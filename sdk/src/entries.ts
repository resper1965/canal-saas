/**
 * @canal/sdk — Entries module
 * 
 * CRUD operations for CMS entries via API.
 */

import type { CanalConfig, PaginatedResponse, EntryListOptions, EntryCreatePayload } from './types'

export class Entries {
  constructor(private config: CanalConfig) {}

  private get headers() {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    }
  }

  private get base() {
    return this.config.baseUrl!
  }

  /** List entries from a collection with pagination and filters */
  async list<T = Record<string, unknown>>(
    collection: string,
    options: EntryListOptions = {}
  ): Promise<PaginatedResponse<T>> {
    const params = new URLSearchParams()
    if (options.status) params.set('status', options.status)
    if (options.locale) params.set('locale', options.locale)
    if (options.page) params.set('page', String(options.page))
    if (options.limit) params.set('limit', String(options.limit))

    const url = `${this.base}/api/v1/collections/${collection}/entries?${params}`
    const res = await fetch(url, { headers: this.headers })

    if (!res.ok) {
      throw new Error(`Canal SDK: Failed to list ${collection} (${res.status})`)
    }

    return res.json() as Promise<PaginatedResponse<T>>
  }

  /** Get a single entry by ID or slug */
  async get<T = Record<string, unknown>>(
    collection: string,
    idOrSlug: string,
    locale?: string
  ): Promise<T> {
    const params = locale ? `?locale=${locale}` : ''
    const url = `${this.base}/api/v1/collections/${collection}/entries/${idOrSlug}${params}`
    const res = await fetch(url, { headers: this.headers })

    if (!res.ok) {
      throw new Error(`Canal SDK: Entry not found (${res.status})`)
    }

    return res.json() as Promise<T>
  }

  /** Create a new entry (requires session auth, not API key) */
  async create(
    collection: string,
    data: EntryCreatePayload
  ): Promise<{ id: string; slug?: string; status: string }> {
    const url = `${this.base}/api/v1/collections/${collection}/entries`
    const res = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(`Canal SDK: Create failed (${res.status}): ${JSON.stringify(err)}`)
    }

    return res.json() as Promise<{ id: string; slug?: string; status: string }>
  }

  /** Update an existing entry */
  async update(
    collection: string,
    id: string,
    data: Partial<EntryCreatePayload>
  ): Promise<{ success: boolean }> {
    const url = `${this.base}/api/v1/collections/${collection}/entries/${id}`
    const res = await fetch(url, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      throw new Error(`Canal SDK: Update failed (${res.status})`)
    }

    return res.json() as Promise<{ success: boolean }>
  }

  /** Delete an entry */
  async delete(
    collection: string,
    id: string
  ): Promise<{ success: boolean }> {
    const url = `${this.base}/api/v1/collections/${collection}/entries/${id}`
    const res = await fetch(url, {
      method: 'DELETE',
      headers: this.headers,
    })

    if (!res.ok) {
      throw new Error(`Canal SDK: Delete failed (${res.status})`)
    }

    return res.json() as Promise<{ success: boolean }>
  }
}
