import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, desc, sql, count } from 'drizzle-orm'
import { chatbot_config, chat_sessions, chat_messages } from '../db/schema'

type Env = {
  Bindings: {
    DB: D1Database
    MEDIA: R2Bucket
    VECTORIZE: VectorizeIndex
    AI: Ai
  }
}

const app = new Hono<Env>()

// ── Chatbot Configuration ───────────────────────────────────────

// GET /api/admin/chatbot-config?tenant_id=...
app.get('/chatbot-config', async (c) => {
  const db = drizzle(c.env.DB)
  const tenantId = c.req.query('tenant_id') || 'ness'
  const [config] = await db.select().from(chatbot_config).where(eq(chatbot_config.tenant_id, tenantId)).limit(1)
  if (!config) {
    return c.json({
      tenant_id: tenantId,
      bot_name: 'Gabi.OS',
      welcome_message: 'Olá! Como posso ajudar?',
      theme_color: '#00E5A0',
      enabled: 1,
      max_turns: 20
    })
  }
  return c.json(config)
})

// PUT /api/admin/chatbot-config
app.put('/chatbot-config', async (c) => {
  const db = drizzle(c.env.DB)
  const body = await c.req.json()
  const tenantId = body.tenant_id || 'ness'
  const now = new Date().toISOString()

  const [existing] = await db.select().from(chatbot_config).where(eq(chatbot_config.tenant_id, tenantId)).limit(1)

  if (existing) {
    await db.update(chatbot_config).set({
      bot_name: body.bot_name,
      avatar_url: body.avatar_url,
      welcome_message: body.welcome_message,
      system_prompt: body.system_prompt,
      theme_color: body.theme_color,
      enabled: body.enabled,
      max_turns: body.max_turns,
      updated_at: now,
    }).where(eq(chatbot_config.tenant_id, tenantId))
  } else {
    await db.insert(chatbot_config).values({
      id: crypto.randomUUID(),
      tenant_id: tenantId,
      bot_name: body.bot_name || 'Gabi.OS',
      avatar_url: body.avatar_url,
      welcome_message: body.welcome_message,
      system_prompt: body.system_prompt,
      theme_color: body.theme_color || '#00E5A0',
      enabled: body.enabled ?? 1,
      max_turns: body.max_turns ?? 20,
      created_at: now,
      updated_at: now,
    })
  }

  return c.json({ success: true })
})

// ── Public Chatbot Config (cached) ──────────────────────────────

// GET /api/chatbot-config?tenant=...
app.get('/public/chatbot-config', async (c) => {
  const db = drizzle(c.env.DB)
  const tenantId = c.req.query('tenant') || 'ness'
  const [config] = await db.select({
    bot_name: chatbot_config.bot_name,
    avatar_url: chatbot_config.avatar_url,
    welcome_message: chatbot_config.welcome_message,
    theme_color: chatbot_config.theme_color,
    enabled: chatbot_config.enabled,
  }).from(chatbot_config).where(eq(chatbot_config.tenant_id, tenantId)).limit(1)

  c.header('Cache-Control', 'public, max-age=60')
  return c.json(config || { bot_name: 'Gabi.OS', welcome_message: 'Olá! Como posso ajudar?', theme_color: '#00E5A0', enabled: 1 })
})

// ── Chat Analytics ──────────────────────────────────────────────

// GET /api/admin/chat-analytics?tenant_id=...
app.get('/chat-analytics', async (c) => {
  const db = drizzle(c.env.DB)
  const tenantId = c.req.query('tenant_id') || 'ness'

  const sessionsResult = await db.select({ count: count() }).from(chat_sessions).where(eq(chat_sessions.tenant_id, tenantId))
  const totalSessions = sessionsResult[0]?.count || 0

  const avgTurnsResult = await db.select({
    avg: sql<number>`AVG(${chat_sessions.turn_count})`
  }).from(chat_sessions).where(eq(chat_sessions.tenant_id, tenantId))
  const avgTurns = Math.round(avgTurnsResult[0]?.avg || 0)

  const csatResult = await db.select({
    avg: sql<number>`AVG(${chat_sessions.csat_score})`
  }).from(chat_sessions).where(eq(chat_sessions.tenant_id, tenantId))
  const avgCsat = csatResult[0]?.avg ? Number(csatResult[0].avg.toFixed(1)) : null

  const recentSessions = await db.select().from(chat_sessions)
    .where(eq(chat_sessions.tenant_id, tenantId))
    .orderBy(desc(chat_sessions.created_at))
    .limit(20)

  return c.json({
    total_sessions: totalSessions,
    avg_turns: avgTurns,
    avg_csat: avgCsat,
    recent: recentSessions,
  })
})

// GET /api/admin/chat-sessions/:id/messages
app.get('/chat-sessions/:id/messages', async (c) => {
  const db = drizzle(c.env.DB)
  const sessionId = c.req.param('id')
  const messages = await db.select().from(chat_messages)
    .where(eq(chat_messages.session_id, sessionId))
    .orderBy(chat_messages.created_at)
  return c.json(messages)
})

// POST /api/admin/chat-sessions/:id/csat
app.post('/chat-sessions/:id/csat', async (c) => {
  const db = drizzle(c.env.DB)
  const sessionId = c.req.param('id')
  const { score } = await c.req.json()
  await db.update(chat_sessions).set({ csat_score: score }).where(eq(chat_sessions.id, sessionId))
  return c.json({ success: true })
})

// GET /api/admin/chat-export?tenant_id=...&format=csv
app.get('/chat-export', async (c) => {
  const db = drizzle(c.env.DB)
  const tenantId = c.req.query('tenant_id') || 'ness'

  const sessions = await db.select().from(chat_sessions)
    .where(eq(chat_sessions.tenant_id, tenantId))
    .orderBy(desc(chat_sessions.created_at))
    .limit(500)

  const csvRows = ['session_id,visitor_id,locale,turn_count,csat_score,status,created_at,ended_at']
  for (const s of sessions) {
    csvRows.push(`${s.id},${s.visitor_id || ''},${s.locale},${s.turn_count},${s.csat_score || ''},${s.status},${s.created_at},${s.ended_at || ''}`)
  }

  return new Response(csvRows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="chat-sessions-${tenantId}.csv"`,
    },
  })
})

// ── Knowledge Base Management ───────────────────────────────────

// GET /api/admin/knowledge-base?tenant_id=...
app.get('/knowledge-base', async (c) => {
  const tenantId = c.req.query('tenant_id') || 'ness'
  // List R2 objects in the knowledge base prefix
  const listResult = await c.env.MEDIA.list({ prefix: `kb/${tenantId}/` })
  const documents = listResult.objects.map(obj => ({
    key: obj.key,
    filename: obj.key.split('/').pop(),
    size: obj.size,
    uploaded: obj.uploaded,
  }))
  return c.json({ documents, count: documents.length })
})

// POST /api/admin/knowledge-base/upload
app.post('/knowledge-base/upload', async (c) => {
  const tenantId = c.req.query('tenant_id') || 'ness'
  const formData = await c.req.formData()
  const file = formData.get('file') as unknown as File
  if (!file) return c.json({ error: 'No file provided' }, 400)

  const key = `kb/${tenantId}/${file.name}`
  await c.env.MEDIA.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalName: file.name, tenantId },
  })

  return c.json({ success: true, key, filename: file.name, size: file.size })
})

// DELETE /api/admin/knowledge-base/:key
app.delete('/knowledge-base/*', async (c) => {
  const key = c.req.path.replace('/knowledge-base/', '')
  await c.env.MEDIA.delete(key)
  return c.json({ success: true })
})

// POST /api/admin/seed-vectors — ingest documents from R2 into Vectorize
app.post('/seed-vectors', async (c) => {
  const tenantId = c.req.query('tenant_id') || 'ness'
  const listResult = await c.env.MEDIA.list({ prefix: `kb/${tenantId}/` })
  let indexed = 0

  for (const obj of listResult.objects) {
    const r2Obj = await c.env.MEDIA.get(obj.key)
    if (!r2Obj) continue

    const text = await r2Obj.text()
    // Chunk into ~500 char segments
    const chunks = text.match(/.{1,500}/g) || []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const embedResult = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', { text: [chunk] }) as { data?: number[][] }
      if (embedResult.data?.[0]) {
        await c.env.VECTORIZE.upsert([{
          id: `${obj.key}-chunk-${i}`,
          values: embedResult.data[0],
          namespace: tenantId,
          metadata: { source: obj.key, chunk_index: i, text: chunk.substring(0, 200) },
        }])
        indexed++
      }
    }
  }

  return c.json({ success: true, indexed_chunks: indexed, tenant: tenantId })
})

export default app
