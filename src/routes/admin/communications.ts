/**
 * Admin — Communications, Knowledge Base, Newsletters, Chat Analytics
 */
import { Hono } from 'hono'
import { desc, eq } from 'drizzle-orm'
import { safeParse, AddSubscriberSchema, SendNewsletterSchema, ForwardMessageSchema, CreateKnowledgeBaseSchema } from '../../schemas'
import { DEFAULT_TENANT_ID } from '../../config'
import type { AdminEnv } from './_shared'
import { assertAdmin, getDb, schema } from './_shared'

export const communicationsRouter = new Hono<AdminEnv>()

// ── Newsletter Subscribers ──────────────────────────────────────
communicationsRouter.get('/newsletter-subscribers', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const db = getDb(c)
  const results = await db.select().from(schema.newsletter).orderBy(desc(schema.newsletter.created_at))
  return c.json(results)
})

communicationsRouter.post('/newsletter-subscribers', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const parsed = safeParse(AddSubscriberSchema, await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error }, 400)
  const { email } = parsed.data

  const db = getDb(c)
  const existing = await db.select({ id: schema.newsletter.id })
    .from(schema.newsletter).where(eq(schema.newsletter.email, email)).limit(1)
  if (existing.length) return c.json({ success: true, id: existing[0].id })

  const result = await c.env.DB.prepare('INSERT INTO newsletter (email) VALUES (?)').bind(email).run()
  return c.json({ success: true, id: result.meta?.last_row_id })
})

communicationsRouter.delete('/newsletter-subscribers/:id', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const id = parseInt(c.req.param('id'), 10)
  const db = getDb(c)
  await db.delete(schema.newsletter).where(eq(schema.newsletter.id, id))
  return c.json({ success: true })
})

// ── Send Newsletter ─────────────────────────────────────────────
communicationsRouter.post('/newsletters/send', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)

  const parsed = safeParse(SendNewsletterSchema, await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error }, 400)
  const { subject, preheader, body } = parsed.data

  const db = getDb(c)
  const subs = await db.select({ email: schema.newsletter.email }).from(schema.newsletter)
  if (!subs.length) return c.json({ error: 'No subscribers' }, 400)

  const emails = subs.map(s => s.email).filter(Boolean)

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;">
      <div style="background:#0A0A0A;padding:32px 40px;">
        <span style="font-family:Montserrat,sans-serif;font-size:24px;font-weight:700;color:#fff;letter-spacing:-0.5px;">ness<span style="color:#00ADE8;">.</span></span>
      </div>
      <div style="padding:40px;">
        ${preheader ? `<p style="font-size:0;color:transparent;display:none;">${preheader}</p>` : ''}
        <h1 style="font-size:22px;color:#111;margin:0 0 24px;">${subject}</h1>
        <div style="font-size:14px;line-height:1.8;color:#333;white-space:pre-wrap;">${body.replace(/</g, '&lt;').replace(/\n/g, '<br/>')}</div>
      </div>
      <div style="background:#F8F9FA;padding:20px 40px;border-top:1px solid #eee;">
        <p style="font-size:11px;color:#999;margin:0;">ness. · canal.bekaa.eu</p>
      </div>
    </div>
  `

  if (!c.env.RESEND_API_KEY) return c.json({ error: 'Resend API key not configured' }, 500)

  let sentCount = 0
  for (let i = 0; i < emails.length; i += 50) {
    const batch = emails.slice(i, i + 50)
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${c.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: 'ness. <newsletter@canal.bekaa.eu>', to: batch, subject, html }),
      })
      sentCount += batch.length
    } catch (err) { console.error('[newsletter] batch send error:', err) }
  }

  return c.json({ success: true, sent: sentCount })
})

// ── Unified Inbox ───────────────────────────────────────────────
communicationsRouter.get('/communications', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const { results } = await c.env.DB.prepare(`
    SELECT 'form' as type, id, payload as data, source as title, source, status, created_at FROM forms
    UNION ALL
    SELECT 'lead' as type, id, json_object('name',name,'contact',contact,'intent',intent,'urgency',urgency) as data, name as title, source, status, created_at FROM leads
    ORDER BY created_at DESC LIMIT 100
  `).all()
  return c.json(results || [])
})

communicationsRouter.post('/communications/forward', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const session = c.get('session')
  const parsed = safeParse(ForwardMessageSchema, await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error }, 400)
  const { messageId, messageType, to } = parsed.data

  const db = getDb(c)
  let content = ''
  let subject = ''
  if (messageType === 'form') {
    const rows = await db.select().from(schema.forms).where(eq(schema.forms.id, messageId)).limit(1)
    if (rows[0]) { content = JSON.stringify(rows[0], null, 2); subject = `[Canal] Formulário #${messageId}` }
  } else if (messageType === 'lead') {
    const rows = await db.select().from(schema.leads).where(eq(schema.leads.id, messageId)).limit(1)
    if (rows[0]) { content = JSON.stringify(rows[0], null, 2); subject = `[Canal] Lead: ${rows[0].name}` }
  }

  if (!content) return c.json({ error: 'Message not found' }, 404)
  if (!c.env.RESEND_API_KEY) return c.json({ error: 'Resend not configured' }, 500)

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${c.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Canal CMS <canal@canal.bekaa.eu>', to: [to], subject,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#111;">${subject}</h2>
        <p style="font-size:12px;color:#888;">Encaminhado por ${session?.user?.email} via Canal CMS</p>
        <pre style="background:#f5f5f5;padding:16px;border-radius:8px;font-size:12px;overflow-x:auto;">${content.replace(/</g,'&lt;')}</pre>
      </div>`,
    }),
  })

  return c.json({ success: true })
})

// ── Knowledge Base (RAG) ────────────────────────────────────────
communicationsRouter.get('/knowledge-base', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = c.get('tenantId') || DEFAULT_TENANT_ID
  const db = getDb(c)
  const results = await db.select().from(schema.knowledge_base)
    .where(eq(schema.knowledge_base.tenant_id, tenantId))
    .orderBy(desc(schema.knowledge_base.created_at))
  return c.json(results)
})

communicationsRouter.post('/knowledge-base', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = c.get('tenantId') || DEFAULT_TENANT_ID
  const session = c.get('session')
  const parsed = safeParse(CreateKnowledgeBaseSchema, await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error }, 400)
  const { title, text_payload } = parsed.data

  const id = crypto.randomUUID()
  const r2_key = `knowledge-base/${tenantId}/${id}.txt`

  await c.env.MEDIA.put(r2_key, text_payload, { httpMetadata: { contentType: 'text/plain' } })

  const db = getDb(c)
  await db.insert(schema.knowledge_base).values({
    id, tenant_id: tenantId, title, r2_key, status: 'pending',
    created_by: session?.user?.email || 'api',
    created_at: new Date().toISOString()
  })

  if (c.env.QUEUE) {
    await c.env.QUEUE.send({ type: 'vectorize-document', payload: { id, tenantId, r2_key } })
  }

  return c.json({ success: true, id })
})

communicationsRouter.delete('/knowledge-base/:id', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const id = c.req.param('id')
  const tenantId = c.get('tenantId') || DEFAULT_TENANT_ID
  const db = getDb(c)

  const [doc] = await db.select().from(schema.knowledge_base).where(eq(schema.knowledge_base.id, id)).limit(1)
  if (!doc) return c.json({ error: 'Not found' }, 404)
  if (doc.tenant_id !== tenantId) return c.json({ error: 'Forbidden' }, 403)

  await c.env.MEDIA.delete(doc.r2_key)
  await db.delete(schema.knowledge_base).where(eq(schema.knowledge_base.id, id))

  return c.json({ success: true })
})

// ── Chat Sessions & Export ──────────────────────────────────────
communicationsRouter.get('/chat-sessions', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = c.get('tenantId') || DEFAULT_TENANT_ID

  const statsResult = await c.env.DB.prepare(`
    SELECT COUNT(id) as total_sessions, AVG(turn_count) as avg_turns, AVG(csat_score) as avg_csat
    FROM chat_sessions WHERE tenant_id = ?
  `).bind(tenantId).all()

  const listResult = await c.env.DB.prepare(`
    SELECT id, turn_count, csat_score, locale, status, created_at, ended_at
    FROM chat_sessions WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 100
  `).bind(tenantId).all()

  return c.json({
    stats: statsResult.results[0] || { total_sessions: 0, avg_turns: 0, avg_csat: null },
    sessions: listResult.results || []
  })
})

communicationsRouter.get('/chat-sessions/export', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = c.get('tenantId') || DEFAULT_TENANT_ID

  const rows = await c.env.DB.prepare(`
    SELECT s.id, s.created_at, s.csat_score, m.role, m.content
    FROM chat_sessions s JOIN chat_messages m ON s.id = m.session_id
    WHERE s.tenant_id = ? ORDER BY s.created_at DESC, m.id ASC
  `).bind(tenantId).all()

  const header = 'Session ID,Data,Feedback,Remetente,Mensagem\n'
  const csv = rows.results.map((r: Record<string, unknown>) => {
    const txt = String(r.content).replace(/"/g, '""').replace(/\n/g, ' ')
    return `"${r.id}","${r.created_at}","${r.csat_score || ''}","${r.role}","${txt}"`
  }).join('\n')

  return new Response(header + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="historico_gabi.csv"'
    }
  })
})
