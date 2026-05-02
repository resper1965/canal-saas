/**
 * @canal/sdk — Media module
 * 
 * Media URL builder and upload helper.
 */

import type { CanalConfig } from './types'

export class Media {
  constructor(private config: CanalConfig) {}

  /**
   * Build a media URL with optional transformations.
   * Uses Cloudflare Image Resizing when available.
   */
  url(filename: string, options?: { width?: number; quality?: number }): string {
    const base = this.config.baseUrl!
    const params = new URLSearchParams()
    if (options?.width) params.set('w', String(options.width))
    if (options?.quality) params.set('q', String(options.quality))
    const qs = params.toString()
    return `${base}/media/${filename}${qs ? `?${qs}` : ''}`
  }

  /**
   * Upload a file to R2 storage.
   * Note: Requires session auth (cookie), not API key.
   */
  async upload(file: File | Blob, filename?: string): Promise<{ url: string; key: string }> {
    const base = this.config.baseUrl!
    const formData = new FormData()
    formData.append('file', file, filename)

    const res = await fetch(`${base}/api/v1/media/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: formData,
    })

    if (!res.ok) {
      throw new Error(`Canal SDK: Upload failed (${res.status})`)
    }

    return res.json() as Promise<{ url: string; key: string }>
  }
}
