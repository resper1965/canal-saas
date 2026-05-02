/**
 * @canal/sdk — Chat module
 * 
 * Connects to the Canal chatbot (GabiAgent) via streaming POST.
 * Supports both streaming (onToken) and full-response modes.
 */

import type { CanalConfig, ChatMessage, ChatStreamCallbacks, ChatbotConfig } from './types'

export class Chat {
  private sessionId: string

  constructor(private config: CanalConfig) {
    this.sessionId = `sdk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }

  /** Get chatbot configuration for a tenant */
  async getConfig(tenant?: string): Promise<ChatbotConfig> {
    const base = this.config.baseUrl!
    const params = tenant ? `?tenant=${tenant}` : ''
    const res = await fetch(`${base}/api/chatbot-config${params}`)

    if (!res.ok) {
      throw new Error(`Canal SDK: Failed to get chatbot config (${res.status})`)
    }

    return res.json() as Promise<ChatbotConfig>
  }

  /**
   * Send messages to the chatbot and stream the response.
   * 
   * @example
   * ```ts
   * const chat = canal.chat
   * const response = await chat.send([
   *   { role: 'user', content: 'Hello!' }
   * ], {
   *   onToken: (token) => process.stdout.write(token),
   *   onDone: (full) => console.log('\n---\n', full)
   * })
   * ```
   */
  async send(
    messages: ChatMessage[],
    callbacks?: ChatStreamCallbacks
  ): Promise<string> {
    const base = this.config.baseUrl!
    const res = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': this.sessionId,
      },
      body: JSON.stringify({ messages }),
    })

    if (!res.ok) {
      const error = new Error(`Canal SDK: Chat failed (${res.status})`)
      callbacks?.onError?.(error)
      throw error
    }

    // Stream the response
    const reader = res.body?.getReader()
    if (!reader) {
      throw new Error('Canal SDK: No response body')
    }

    const decoder = new TextDecoder()
    let fullText = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        callbacks?.onToken?.(chunk)
      }
    } catch (err) {
      callbacks?.onError?.(err as Error)
      throw err
    }

    callbacks?.onDone?.(fullText)
    return fullText
  }

  /** Reset the session (creates a new session ID) */
  resetSession(): string {
    this.sessionId = `sdk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    return this.sessionId
  }

  /** Get the current session ID */
  getSessionId(): string {
    return this.sessionId
  }
}
