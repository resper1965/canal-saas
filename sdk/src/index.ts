/**
 * @canal/sdk — Main entry point
 * 
 * Usage:
 * ```ts
 * import { Canal } from '@canal/sdk'
 * 
 * const canal = Canal.init({ apiKey: 'pk_xxx' })
 * const posts = await canal.entries.list('insights', { status: 'published' })
 * ```
 */

import { Entries } from './entries'
import { Media } from './media'
import { Forms } from './forms'
import { Chat } from './chat'
import type { CanalConfig, CollectionDef } from './types'

const DEFAULT_BASE_URL = 'https://canal.bekaa.eu'

export class Canal {
  readonly entries: Entries
  readonly media: Media
  readonly forms: Forms
  readonly chat: Chat

  private config: CanalConfig

  private constructor(config: CanalConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl?.replace(/\/$/, '') || DEFAULT_BASE_URL,
    }
    this.entries = new Entries(this.config)
    this.media = new Media(this.config)
    this.forms = new Forms(this.config)
    this.chat = new Chat(this.config)
  }

  /**
   * Initialize the Canal SDK.
   * 
   * @param config - API key and optional base URL
   * @returns Canal instance with entries, media, forms, and chat modules
   * 
   * @example
   * ```ts
   * const canal = Canal.init({ 
   *   apiKey: 'pk_xxx',
   *   baseUrl: 'https://canal.bekaa.eu' // optional
   * })
   * ```
   */
  static init(config: CanalConfig): Canal {
    if (!config.apiKey) {
      throw new Error('Canal SDK: apiKey is required. Get one from the admin panel.')
    }
    return new Canal(config)
  }

  /** List all available collections */
  async collections(): Promise<CollectionDef[]> {
    const res = await fetch(`${this.config.baseUrl}/api/v1/collections`, {
      headers: { 'Authorization': `Bearer ${this.config.apiKey}` },
    })

    if (!res.ok) {
      throw new Error(`Canal SDK: Failed to fetch collections (${res.status})`)
    }

    return res.json() as Promise<CollectionDef[]>
  }

  /** Get the OpenAPI spec URL */
  get docsUrl(): string {
    return `${this.config.baseUrl}/api/docs`
  }

  /** Get the OpenAPI JSON spec URL */
  get specUrl(): string {
    return `${this.config.baseUrl}/api/openapi.json`
  }
}

// Re-export types
export type {
  CanalConfig,
  PaginatedResponse,
  PaginationMeta,
  EntryListOptions,
  EntryCreatePayload,
  CollectionDef,
  ChatMessage,
  ChatStreamCallbacks,
  ChatbotConfig,
  MediaUploadResult,
} from './types'
