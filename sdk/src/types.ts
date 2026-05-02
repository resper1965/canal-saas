/**
 * @canal/sdk — TypeScript types
 */

export interface CanalConfig {
  apiKey: string
  baseUrl?: string
}

export interface PaginationMeta {
  collection: string
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T = Record<string, unknown>> {
  data: T[]
  meta: PaginationMeta
}

export interface EntryListOptions {
  status?: 'published' | 'draft' | 'all'
  locale?: string
  page?: number
  limit?: number
}

export interface EntryCreatePayload {
  [key: string]: unknown
}

export interface CollectionDef {
  slug: string
  label: string
  labelPlural: string
  icon: string
  hasLocale: boolean
  hasSlug: boolean
  hasStatus: boolean
  fieldCount: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatStreamCallbacks {
  onToken?: (token: string) => void
  onDone?: (fullText: string) => void
  onError?: (error: Error) => void
}

export interface MediaUploadResult {
  url: string
  key: string
  size: number
}

export interface ChatbotConfig {
  bot_name: string
  avatar_url: string
  welcome_message: string
  theme_color: string
  enabled: number
}
