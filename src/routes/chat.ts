/**
 * Canal SaaS — RAG Chat Route
 * 
 * Public chatbot with RAG (Retrieval-Augmented Generation)
 * using Vectorize + Durable Objects.
 */
import { Hono } from 'hono'
import { z } from 'zod'
import type { Bindings, Variables } from '../index'
import { DEFAULT_TENANT_ID } from '../config'

type ChatEnv = { Bindings: Bindings; Variables: Variables }

export const chatRoutes = new Hono<ChatEnv>()

// ── Rate limiter (in-memory per isolate) ─────────────────────────
const chatRateMap = new Map<string, { count: number; resetAt: number }>()
const CHAT_RATE_LIMIT = 20
const CHAT_RATE_WINDOW = 60_000

function isChatRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = chatRateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    chatRateMap.set(ip, { count: 1, resetAt: now + CHAT_RATE_WINDOW })
    return false
  }
  if (entry.count >= CHAT_RATE_LIMIT) return true
  entry.count++
  return false
}

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(4000),
  })).min(1).max(20),
  locale: z.string().max(10).optional(),
})

// ── POST /api/chat — Public RAG via GabiAgent DO ────────────────
chatRoutes.post('/', async (c) => {
  const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
  if (isChatRateLimited(clientIp)) {
    return c.json({ error: 'Too many requests. Please wait.' }, 429)
  }

  const rawBody = await c.req.json()
  const chatParsed = chatSchema.safeParse(rawBody)
  if (!chatParsed.success) {
    return c.json({ error: 'Invalid request' }, 400)
  }

  const { messages, locale } = chatParsed.data
  const lastMessage = messages[messages.length - 1]?.content || ''

  // 1. Embedding
  const queryEmbedding = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: [lastMessage]
  }) as { data: number[][] }

  // 2. Vectorize search
  const tenantFilter = c.get('tenantId')
  const vectorResults = await c.env.VECTORIZE.query(queryEmbedding.data[0], {
    topK: 3,
    returnMetadata: 'all',
    ...(tenantFilter ? { filter: { tenant_id: { $eq: tenantFilter } } } : {}),
  })

  const context = vectorResults.matches
    .map((m) => (m.metadata as Record<string, string> | undefined)?.content || '')
    .join('\n\n---\n\n')

  let ragContext = context.trim()

  if (!ragContext) {
    const fallback = await c.env.DB.prepare(`
      SELECT payload FROM entries
      WHERE collection_id = (SELECT id FROM collections WHERE slug = 'solutions')
      LIMIT 10
    `).all()

    ragContext = fallback.results.map((r) => {
      const p = JSON.parse((r as { payload?: string }).payload || '{}')
      return `${p.title || ''}\n${p.content || p.desc || ''}`
    }).join('\n\n---\n\n')
  }

  const sessionId = c.req.header('x-session-id') || crypto.randomUUID()

  // Forward to GabiAgent DO
  const chatTenantId = c.get('tenantId') || 'public'
  const id = c.env.AGENT_DO.idFromName(`gabi_agent_${chatTenantId}_${sessionId}`)
  const stub = c.env.AGENT_DO.get(id)

  const agentReq = new Request(c.req.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-session-id': sessionId,
      'x-tenant-id': chatTenantId,
    },
    body: JSON.stringify({ messages, locale, ragContext, clientIp })
  })

  return stub.fetch(agentReq)
})

// ── POST /api/chat/csat — Feedback ──────────────────────────────
chatRoutes.post('/csat', async (c) => {
  const body = await c.req.json().catch(() => ({}))
  const sessionId = c.req.header('x-session-id')
  const score = body.csat_score

  if (!sessionId || typeof score !== 'number') {
    return c.json({ error: 'Missing session_id or csat_score' }, 400)
  }

  try {
    await c.env.DB.prepare(
      'UPDATE chat_sessions SET csat_score = ? WHERE id = ?'
    ).bind(score, sessionId).run()
    return c.json({ success: true })
  } catch {
    return c.json({ error: 'Failed to record feedback' }, 500)
  }
})
