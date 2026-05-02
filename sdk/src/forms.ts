/**
 * @canal/sdk — Forms module
 * 
 * Submits form data to the Canal CMS generic entries API.
 */

import type { CanalConfig } from './types'

export class Forms {
  constructor(private config: CanalConfig) {}

  /**
   * Submit a form entry.
   * Creates an entry in the "forms" collection with source and payload.
   */
  async submit(
    source: string,
    data: Record<string, unknown>
  ): Promise<{ id: string; status: string }> {
    const base = this.config.baseUrl!
    const res = await fetch(`${base}/api/v1/collections/forms/entries`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source,
        payload: JSON.stringify(data),
      }),
    })

    if (!res.ok) {
      throw new Error(`Canal SDK: Form submit failed (${res.status})`)
    }

    return res.json() as Promise<{ id: string; status: string }>
  }
}
