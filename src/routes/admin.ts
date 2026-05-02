/**
 * Canal CMS — Admin Routes Module
 * 
 * Endpoints protegidos para gerenciamento administrativo.
 * Todos requerem session ativa com role === 'admin'.
 * Migrated to Drizzle ORM.
 */

import { Hono, Context } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, sql, like, desc, and } from 'drizzle-orm'
import * as schema from '../db/schema'
import { hashApiKey } from '../security'
import { safeParse, CreateApiKeySchema, CreateDomainSchema, UpdateStatusSchema, AddSubscriberSchema, SendNewsletterSchema, UpdateAiSettingsSchema, ForwardMessageSchema, CreateKnowledgeBaseSchema, UpdateOrgSchema } from '../schemas'
import { DEFAULT_TENANT_ID } from '../config'
import type { Bindings } from '../index'

type Variables = {
  tenantId?: string;
  session?: { user: { role: string; email: string }; session: { activeOrganizationId?: string } };
}

type AdminEnv = { Bindings: Bindings; Variables: Variables }

function assertAdmin(c: Context<AdminEnv>): boolean {
  const session = c.get('session')
  return session?.user?.role === 'admin'
}

function getDb(c: Context<AdminEnv>) {
  return drizzle(c.env.DB, { schema })
}

const admin = new Hono<AdminEnv>()

// ── Organizations CRUD ──────────────────────────────────────────
admin.get('/organizations', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const db = getDb(c)
  const results = await db.select({
    id: schema.organization.id,
    name: schema.organization.name,
    slug: schema.organization.slug,
    logo: schema.organization.logo,
    metadata: schema.organization.metadata,
    createdAt: schema.organization.createdAt,
    memberCount: sql<number>`(SELECT COUNT(*) FROM "member" m WHERE m.organizationId = ${schema.organization.id})`,
  }).from(schema.organization).orderBy(desc(schema.organization.createdAt))
  return c.json(results)
})

admin.patch('/organizations/:id', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const id = c.req.param('id')
  const parsed = safeParse(UpdateOrgSchema, await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error }, 400)
  const db = getDb(c)
  await db.update(schema.organization)
    .set({ metadata: JSON.stringify(parsed.data.metadata || {}) })
    .where(eq(schema.organization.id, id))
  return c.json({ success: true })
})

admin.delete('/organizations/:id', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const id = c.req.param('id')
  const db = getDb(c)
  await db.delete(schema.member).where(eq(schema.member.organizationId, id))
  await db.delete(schema.invitation).where(eq(schema.invitation.organizationId, id))
  await db.delete(schema.organization).where(eq(schema.organization.id, id))
  return c.json({ success: true })
})

// ── Usage & Plan Status ─────────────────────────────────────────
admin.get('/usage/:orgId', async (c) => {
  const orgId = c.req.param('orgId')
  const { getUsage } = await import('../plans')
  const usage = await getUsage(c.env.DB, orgId)
  return c.json({
    plan: usage.plan,
    limits: usage.limits,
    current: {
      entries: usage.entries,
      collections: usage.collections,
      domains: usage.domains,
    },
    percentage: {
      entries: Math.round((usage.entries / usage.limits.totalEntries) * 100),
      collections: Math.round((usage.collections / usage.limits.collections) * 100),
      domains: Math.round((usage.domains / usage.limits.domains) * 100),
    },
  })
})

// ── API Keys ────────────────────────────────────────────────────
admin.get('/api-keys/:orgId', async (c) => {
  const orgId = c.req.param('orgId')
  const db = getDb(c)
  const results = await db.select({
    id: schema.apikey.id,
    name: schema.apikey.name,
    createdAt: schema.apikey.createdAt,
    prefix: schema.apikey.prefix,
  }).from(schema.apikey)
    .where(like(schema.apikey.metadata, `%"orgId":"${orgId}"%`))
    .orderBy(desc(schema.apikey.createdAt))
  return c.json(results)
})

admin.post('/api-keys', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const parsed = safeParse(CreateApiKeySchema, await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error }, 400)
  const { name, orgId } = parsed.data

  const id = crypto.randomUUID()
  const rawKey = `pk_${crypto.randomUUID().replace(/-/g, '')}`
  const prefix = rawKey.substring(0, 7)
  const now = new Date().toISOString()

  // Store SHA-256 hash — raw key is never persisted
  const hashedKey = await hashApiKey(rawKey)

  const db = getDb(c)
  await db.insert(schema.apikey).values({
    id,
    name,
    prefix,
    key: hashedKey,
    metadata: JSON.stringify({ orgId }),
    createdAt: now,
  })

  // Return the full key ONLY on creation (never again)
  return c.json({ id, name, prefix, key: rawKey, createdAt: now }, 201)
})

admin.delete('/api-keys/:id', async (c) => {
  const id = c.req.param('id')
  const db = getDb(c)
  await db.delete(schema.apikey).where(eq(schema.apikey.id, id))
  return c.json({ success: true })
})

// ── Tenant Domains (CORS dinâmico) ──────────────────────────────
admin.get('/domains', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = c.get('tenantId')
  const db = getDb(c)
  
  const query = tenantId 
    ? db.select().from(schema.tenant_domains).where(eq(schema.tenant_domains.tenant_id, tenantId))
    : db.select().from(schema.tenant_domains)
  
  return c.json(await query.orderBy(desc(schema.tenant_domains.created_at)))
})

admin.post('/domains', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = c.get('tenantId')
  if (!tenantId) return c.json({ error: 'No active organization' }, 400)

  const parsed = safeParse(CreateDomainSchema, await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error }, 400)
  const { domain } = parsed.data

  // Clean domain (remove protocol/path)
  const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0].toLowerCase()
  const token = crypto.randomUUID()

  const db = getDb(c)
  const id = crypto.randomUUID()
  
  try {
    await db.insert(schema.tenant_domains).values({
      id,
      tenant_id: tenantId,
      domain: cleanDomain,
      verified: 0,
      verification_token: token,
      created_at: new Date().toISOString(),
    })
  } catch (e: unknown) {
    if (e instanceof Error ? e.message : String(e)?.includes('UNIQUE')) return c.json({ error: 'Domain already registered' }, 409)
    throw e
  }

  return c.json({
    id,
    domain: cleanDomain,
    verified: false,
    verification: {
      method: 'TXT record',
      record: `_canal-verify.${cleanDomain}`,
      value: token,
      instructions: `Add a TXT record to your DNS:\n  Host: _canal-verify\n  Value: ${token}\n\nOnce added, call POST /api/admin/domains/${id}/verify`
    }
  }, 201)
})

admin.post('/domains/:id/verify', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const id = c.req.param('id')
  const db = getDb(c)
  
  // Get domain and verification token
  const [record] = await db.select().from(schema.tenant_domains).where(eq(schema.tenant_domains.id, id))
  if (!record) return c.json({ error: 'Domain not found' }, 404)

  if (record.verified) {
    return c.json({ success: true, verified: true, message: 'Already verified' })
  }

  // Real DNS verification via Cloudflare DoH (DNS over HTTPS)
  let verified = false
  try {
    const dohUrl = `https://cloudflare-dns.com/dns-query?name=_canal-verify.${record.domain}&type=TXT`
    const dnsRes = await fetch(dohUrl, {
      headers: { 'Accept': 'application/dns-json' },
    })

    if (dnsRes.ok) {
      const dnsData = await dnsRes.json() as { Answer?: Array<{ data: string }> }
      const txtRecords = dnsData.Answer || []
      
      // Check if any TXT record matches the verification token
      for (const txt of txtRecords) {
        const value = txt.data?.replace(/"/g, '').trim()
        if (value === record.verification_token) {
          verified = true
          break
        }
      }
    }
  } catch (err) {
    // console.error('[DNS Verify] DoH lookup failed:', err)
    // Don't fail hard — inform the user
  }

  if (!verified) {
    return c.json({
      success: false,
      verified: false,
      message: 'DNS TXT record not found or does not match',
      expected: {
        record: `_canal-verify.${record.domain}`,
        type: 'TXT',
        value: record.verification_token,
      },
      hint: 'DNS propagation can take up to 48 hours. Try again later.',
    }, 422)
  }

  // Mark as verified
  await db.update(schema.tenant_domains)
    .set({ verified: 1 })
    .where(eq(schema.tenant_domains.id, id))

  // Invalidate CORS cache for this domain
  try {
    await c.env.CANAL_KV.delete(`cors:https://${record.domain}`)
    await c.env.CANAL_KV.delete(`cors:http://${record.domain}`)
  } catch {}

  return c.json({ success: true, verified: true, domain: record.domain })
})

admin.delete('/domains/:id', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const id = c.req.param('id')
  const db = getDb(c)
  await db.delete(schema.tenant_domains).where(eq(schema.tenant_domains.id, id))
  return c.json({ success: true })
})

// ── Forms, Chats, Leads, Applicants ───────────────────────────────
admin.get('/applicants', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const db = getDb(c)
  const results = await db.select().from(schema.applicants)
    .orderBy(desc(schema.applicants.created_at)).limit(100)
  return c.json(results)
})

admin.patch('/applicants/:id', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const id = c.req.param('id')
  const { status } = UpdateStatusSchema.parse(await c.req.json())
  const db = getDb(c)
  await db.update(schema.applicants)
    .set({ status })
    .where(eq(schema.applicants.id, id))
  return c.json({ success: true })
})

admin.delete('/applicants/:id', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const id = c.req.param('id')
  const db = getDb(c)
  await db.delete(schema.applicants).where(eq(schema.applicants.id, id))
  return c.json({ success: true })
})

admin.get('/forms', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const db = getDb(c)
  const results = await db.select().from(schema.forms)
    .orderBy(desc(schema.forms.created_at)).limit(50)
  return c.json(results)
})

admin.get('/chats', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const db = getDb(c)
  const results = await db.select().from(schema.chats)
    .orderBy(desc(schema.chats.updated_at)).limit(50)
  return c.json(results)
})

admin.get('/leads', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const status = c.req.query('status')
  const db = getDb(c)
  const q = db.select().from(schema.leads).orderBy(desc(schema.leads.created_at)).limit(100)
  const results = status
    ? await q.where(eq(schema.leads.status, status))
    : await q
  return c.json(results)
})

admin.patch('/leads/:id', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const id = parseInt(c.req.param('id'), 10)
  const { status } = UpdateStatusSchema.parse(await c.req.json())
  const db = getDb(c)
  await db.update(schema.leads)
    .set({ status, updated_at: new Date().toISOString() })
    .where(eq(schema.leads.id, id))
  return c.json({ success: true })
})

admin.delete('/leads/:id', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const id = parseInt(c.req.param('id'), 10)
  const db = getDb(c)
  await db.delete(schema.leads).where(eq(schema.leads.id, id))
  return c.json({ success: true })
})

// ── Dashboard Stats & Activity ──────────────────────────────────
admin.get('/stats', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)

  const [leadsCount, formsCount, chatsCount, published, newLeads, newForms, posts, cases, jobs, users] = await Promise.all([
    c.env.DB.prepare('SELECT COUNT(*) as c FROM leads').first<{c:number}>(),
    c.env.DB.prepare('SELECT COUNT(*) as c FROM forms').first<{c:number}>(),
    c.env.DB.prepare('SELECT COUNT(*) as c FROM chats').first<{c:number}>(),
    c.env.DB.prepare("SELECT COUNT(*) as c FROM entries WHERE status='published'").first<{c:number}>(),
    c.env.DB.prepare("SELECT COUNT(*) as c FROM leads WHERE status='new'").first<{c:number}>(),
    c.env.DB.prepare("SELECT COUNT(*) as c FROM forms WHERE status='new'").first<{c:number}>(),
    c.env.DB.prepare("SELECT COUNT(*) as c FROM entries e JOIN collections col ON e.collection_id = col.id WHERE col.slug = 'insights'").first<{c:number}>(),
    c.env.DB.prepare("SELECT COUNT(*) as c FROM entries e JOIN collections col ON e.collection_id = col.id WHERE col.slug = 'cases'").first<{c:number}>(),
    c.env.DB.prepare("SELECT COUNT(*) as c FROM entries e JOIN collections col ON e.collection_id = col.id WHERE col.slug = 'jobs'").first<{c:number}>(),
    c.env.DB.prepare('SELECT COUNT(*) as c FROM user').first<{c:number}>(),
  ])

  const { results: weeklyLeads } = await c.env.DB.prepare(
    `SELECT DATE(created_at) as day, COUNT(*) as count 
     FROM leads WHERE created_at >= DATE('now', '-7 days') 
     GROUP BY DATE(created_at) ORDER BY day ASC`
  ).all()

  return c.json({
    totalLeads: leadsCount?.c || 0,
    newLeads: newLeads?.c || 0,
    totalForms: formsCount?.c || 0,
    newForms: newForms?.c || 0,
    totalChats: chatsCount?.c || 0,
    publishedEntries: published?.c || 0,
    totalPosts: posts?.c || 0,
    totalCases: cases?.c || 0,
    totalJobs: jobs?.c || 0,
    totalUsers: users?.c || 0,
    weeklyLeads: weeklyLeads || [],
  })
})

admin.get('/activity', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  // Complex UNION ALL — keep as raw SQL (semantic-preserving exception)
  const { results } = await c.env.DB.prepare(`
    SELECT 'lead' as type, name as title, source, status, created_at FROM leads
    UNION ALL
    SELECT 'form' as type, source as title, source, status, created_at FROM forms
    UNION ALL
    SELECT 'chat' as type, session_id as title, 'chatbot' as source, 'active' as status, updated_at as created_at FROM chats
    ORDER BY created_at DESC LIMIT 15
  `).all()
  return c.json(results || [])
})

// ── Newsletter Management ───────────────────────────────────────
admin.get('/newsletter-subscribers', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const db = getDb(c)
  const results = await db.select().from(schema.newsletter)
    .orderBy(desc(schema.newsletter.created_at))
  return c.json(results)
})

admin.post('/newsletter-subscribers', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const parsed = safeParse(AddSubscriberSchema, await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error }, 400)
  const { email } = parsed.data

  const db = getDb(c)
  const existing = await db.select({ id: schema.newsletter.id })
    .from(schema.newsletter)
    .where(eq(schema.newsletter.email, email))
    .limit(1)
  if (existing.length) return c.json({ success: true, id: existing[0].id })

  const result = await c.env.DB.prepare('INSERT INTO newsletter (email) VALUES (?)').bind(email).run()
  return c.json({ success: true, id: result.meta?.last_row_id })
})

admin.delete('/newsletter-subscribers/:id', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const id = parseInt(c.req.param('id'), 10)
  const db = getDb(c)
  await db.delete(schema.newsletter).where(eq(schema.newsletter.id, id))
  return c.json({ success: true })
})

admin.post('/newsletters/send', async (c) => {
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

// ── System Health Check ────────────────────────────────────────
admin.get('/health', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)

  const checks: Record<string, { status: 'ok' | 'degraded' | 'error'; latency_ms?: number }> = {}

  const t0 = Date.now()
  try {
    await c.env.DB.prepare('SELECT 1').first()
    checks.db = { status: 'ok', latency_ms: Date.now() - t0 }
  } catch {
    checks.db = { status: 'error', latency_ms: Date.now() - t0 }
  }

  const t1 = Date.now()
  try {
    await c.env.CANAL_KV.get('__ping__')
    checks.kv = { status: 'ok', latency_ms: Date.now() - t1 }
  } catch {
    checks.kv = { status: 'error' }
  }

  checks.ai = { status: c.env.AI ? 'ok' : 'degraded' }
  checks.storage = { status: c.env.MEDIA ? 'ok' : 'degraded' }
  checks.queue = { status: c.env.QUEUE ? 'ok' : 'degraded' }

  return c.json({ ...checks, checked_at: new Date().toISOString() })
})

// ── AI Settings (D1-backed via chatbot_config) ─────────────────
admin.get('/ai-settings', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = c.get('tenantId') || DEFAULT_TENANT_ID
  const db = getDb(c)
  const [config] = await db.select().from(schema.chatbot_config).where(eq(schema.chatbot_config.tenant_id, tenantId)).limit(1)
  
  if (config) {
    return c.json({
      enabled: config.enabled === 1,
      bot_name: config.bot_name,
      avatar_url: config.avatar_url,
      welcome_message: config.welcome_message,
      system_prompt: config.system_prompt,
      theme_color: config.theme_color,
      max_turns: config.max_turns
    })
  }
  return c.json({ 
    enabled: true, 
    bot_name: 'Gabi.OS',
    avatar_url: '',
    welcome_message: 'Olá! Como posso ajudar?',
    system_prompt: '',
    theme_color: '#00E5A0',
    max_turns: 20
  })
})

admin.put('/ai-settings', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = c.get('tenantId') || DEFAULT_TENANT_ID
  const db = getDb(c)
  
  const parsed = safeParse(UpdateAiSettingsSchema, await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error }, 400)
  const payload = parsed.data

  const existing = await db.select({ id: schema.chatbot_config.id }).from(schema.chatbot_config).where(eq(schema.chatbot_config.tenant_id, tenantId)).limit(1)
  
  if (existing.length > 0) {
    await db.update(schema.chatbot_config).set({
      enabled: payload.enabled !== false ? 1 : 0,
      bot_name: payload.bot_name,
      avatar_url: payload.avatar_url,
      welcome_message: payload.welcome_message,
      system_prompt: payload.system_prompt,
      theme_color: payload.theme_color,
      max_turns: payload.max_turns,
      updated_at: new Date().toISOString()
    }).where(eq(schema.chatbot_config.id, existing[0].id))
  } else {
    await db.insert(schema.chatbot_config).values({
      id: crypto.randomUUID(),
      tenant_id: tenantId,
      enabled: payload.enabled !== false ? 1 : 0,
      bot_name: payload.bot_name || 'Gabi.OS',
      avatar_url: payload.avatar_url,
      welcome_message: payload.welcome_message || 'Olá! Como posso ajudar?',
      system_prompt: payload.system_prompt,
      theme_color: payload.theme_color || '#00E5A0',
      max_turns: payload.max_turns || 20,
      created_at: new Date().toISOString()
    })
  }

  return c.json({ success: true })
})

admin.get('/ai-stats', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const db = getDb(c)
  const [totalChats, totalLeads, recentChats] = await Promise.all([
    db.select({ c: sql<number>`COUNT(*)` }).from(schema.chats),
    db.select({ c: sql<number>`COUNT(*)` }).from(schema.leads).where(eq(schema.leads.source, 'chatbot')),
    db.select({ c: sql<number>`COUNT(*)` }).from(schema.chats)
      .where(sql`${schema.chats.updated_at} >= DATE('now', '-7 days')`),
  ])
  return c.json({
    totalChats: totalChats[0]?.c || 0,
    totalLeads: totalLeads[0]?.c || 0,
    recentChats: recentChats[0]?.c || 0,
  })
})

// ── Communications (unified inbox) ─────────────────────────────
admin.get('/communications', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  // Complex UNION ALL — keep as raw SQL
  const { results } = await c.env.DB.prepare(`
    SELECT 'form' as type, id, payload as data, source as title, source, status, created_at FROM forms
    UNION ALL
    SELECT 'lead' as type, id, json_object('name',name,'contact',contact,'intent',intent,'urgency',urgency) as data, name as title, source, status, created_at FROM leads
    ORDER BY created_at DESC LIMIT 100
  `).all()
  return c.json(results || [])
})

admin.post('/communications/forward', async (c) => {
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
      from: 'Canal CMS <canal@canal.bekaa.eu>',
      to: [to],
      subject,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#111;">${subject}</h2>
        <p style="font-size:12px;color:#888;">Encaminhado por ${session?.user?.email} via Canal CMS</p>
        <pre style="background:#f5f5f5;padding:16px;border-radius:8px;font-size:12px;overflow-x:auto;">${content.replace(/</g,'&lt;')}</pre>
      </div>`,
    }),
  })

  return c.json({ success: true })
})

// ── Knowledge Base (RAG) ─────────────────────────────────────────
admin.get('/knowledge-base', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = c.get('tenantId') || DEFAULT_TENANT_ID
  const db = getDb(c)
  const results = await db.select().from(schema.knowledge_base)
    .where(eq(schema.knowledge_base.tenant_id, tenantId))
    .orderBy(desc(schema.knowledge_base.created_at))
  return c.json(results)
})

admin.post('/knowledge-base', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = c.get('tenantId') || DEFAULT_TENANT_ID
  const session = c.get('session')
  const parsed = safeParse(CreateKnowledgeBaseSchema, await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error }, 400)
  const { title, text_payload } = parsed.data

  const id = crypto.randomUUID()
  const r2_key = `knowledge-base/${tenantId}/${id}.txt`
  
  // 1. Salvar no R2 como backup raw text
  await c.env.MEDIA.put(r2_key, text_payload, {
    httpMetadata: { contentType: 'text/plain' },
  })

  // 2. Inserir registro pendente no Drizzle
  const db = getDb(c)
  await db.insert(schema.knowledge_base).values({
    id,
    tenant_id: tenantId,
    title,
    r2_key,
    status: 'pending',
    created_by: session?.user?.email || 'api',
    created_at: new Date().toISOString()
  })

  // 3. Disparar Queue de background para Chunking e Embeddings
  if (c.env.QUEUE) {
    await c.env.QUEUE.send({
      type: 'vectorize-document',
      payload: { id, tenantId, r2_key }
    })
  } else {
    // Fallback if queue not bound (local dev without queue simulator sometimes)
    // console.warn('Queue not bound, skipping vectorization.')
  }

  return c.json({ success: true, id })
})

admin.delete('/knowledge-base/:id', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const id = c.req.param('id')
  const tenantId = c.get('tenantId') || DEFAULT_TENANT_ID
  const db = getDb(c)
  
  const [doc] = await db.select().from(schema.knowledge_base).where(eq(schema.knowledge_base.id, id)).limit(1)
  if (!doc) return c.json({ error: 'Not found' }, 404)
  if (doc.tenant_id !== tenantId) return c.json({ error: 'Forbidden' }, 403)

  // 1. Deletar do R2
  await c.env.MEDIA.delete(doc.r2_key)

  // 2. Deletar os vetores no Vectorize filtrando pelo namespace/id (This will be done via API or queue? 
  // O SDK deleteByID aceita lista de IDs, precisaremos remover os chunks do Vectorize,
  // ou marcar a deleção. Se tivermos ID = doc.id + "-chunk-1", podemos ter dificuldades sem query. 
  // Por enquanto, faremos o melhor possível (excluir base e ignorar vectors até termos namespace full reset).
  await db.delete(schema.knowledge_base).where(eq(schema.knowledge_base.id, id))

  return c.json({ success: true })
})

// ── Epic 3.3: Chat History & Analytics ──────────────────────────────

admin.get('/chat-sessions', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = c.get('tenantId') || DEFAULT_TENANT_ID
  const db = getDb(c)

  // Consultar estatísticas gerais e a lista de sessões recentes
  const statsResult = await c.env.DB.prepare(`
    SELECT
      COUNT(id) as total_sessions,
      AVG(turn_count) as avg_turns,
      AVG(csat_score) as avg_csat
    FROM chat_sessions
    WHERE tenant_id = ?
  `).bind(tenantId).all()

  const listResult = await c.env.DB.prepare(`
    SELECT id, turn_count, csat_score, locale, status, created_at, ended_at
    FROM chat_sessions
    WHERE tenant_id = ?
    ORDER BY created_at DESC
    LIMIT 100
  `).bind(tenantId).all()

  return c.json({
    stats: statsResult.results[0] || { total_sessions: 0, avg_turns: 0, avg_csat: null },
    sessions: listResult.results || []
  })
})

admin.get('/chat-sessions/export', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = c.get('tenantId') || DEFAULT_TENANT_ID

  const rows = await c.env.DB.prepare(`
    SELECT s.id, s.created_at, s.csat_score, m.role, m.content
    FROM chat_sessions s
    JOIN chat_messages m ON s.id = m.session_id
    WHERE s.tenant_id = ?
    ORDER BY s.created_at DESC, m.id ASC
  `).bind(tenantId).all()

  const header = 'Session ID,Data,Feedback,Remetente,Mensagem\n'
  const csv = rows.results.map((r: Record<string, unknown>) => {
    // Sanitização super básica para CSV
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
// ── Tarefas Assíncronas (Content Automation / Backlog Epic 2.1) ────────────────────
admin.post('/entries/:id/translate', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Unauthorized' }, 401)
  
  const entryId = c.req.param('id')
  const body = await c.req.json().catch(() => ({}))
  const targetLocale = body.targetLocale || 'en'
  const tenantId = c.get('tenantId')

  if (!c.env.QUEUE) return c.json({ error: 'Queue binding not found' }, 500)

  const db = getDb(c)
  const [entry] = await db.select().from(schema.entries).where(eq(schema.entries.id, entryId)).limit(1)

  if (!entry) return c.json({ error: 'Entry not found' }, 404)

  const data = typeof entry.data === 'string' ? JSON.parse(entry.data) : entry.data

  c.env.QUEUE.send({
    type: 'translate',
    payload: { entryId: entry.id, data, targetLocale, tenantId }
  })

  return c.json({ success: true, message: 'Translation queued' })
})

admin.post('/entries/:id/social', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Unauthorized' }, 401)
  
  const entryId = c.req.param('id')
  const tenantId = c.get('tenantId')
  const body = await c.req.json().catch(() => ({}))
  const platform = body.platform || 'linkedin'

  if (!c.env.QUEUE) return c.json({ error: 'Queue binding not found' }, 500)

  const db = getDb(c)
  const [entry] = await db.select().from(schema.entries).where(eq(schema.entries.id, entryId)).limit(1)

  if (!entry) return c.json({ error: 'Entry not found' }, 404)

  const data = typeof entry.data === 'string' ? JSON.parse(entry.data) : entry.data

  c.env.QUEUE.send({
    type: 'generate-social-caption',
    payload: { entryId: entry.id, data, tenantId, platform }
  })

  return c.json({ success: true, message: 'Social caption generation queued' })
})

admin.get('/social-posts', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Unauthorized' }, 401)
  const tenantId = c.get('tenantId') as string
  const db = getDb(c)
  const posts = await db.select().from(schema.social_posts).where(eq(schema.social_posts.tenant_id, tenantId))
  return c.json(posts)
})

admin.patch('/social-posts/:id', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Unauthorized' }, 401)
  const tenantId = c.get('tenantId') as string
  const id = c.req.param('id')
  const body = await c.req.json()
  const db = getDb(c)
  await db.update(schema.social_posts)
    .set({ status: body.status, updated_at: new Date().toISOString() })
    .where(and(eq(schema.social_posts.tenant_id, tenantId), eq(schema.social_posts.id, id)))
  return c.json({ success: true })
})

// ── Compliance & Segurança: ROPA & Incidentes ──────────────────────
admin.get('/compliance/ropa', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Unauthorized' }, 401)
  const tenantId = c.get('tenantId') as string
  const db = getDb(c)
  
  const records = await db.select().from(schema.ropa_records).where(eq(schema.ropa_records.tenant_id, tenantId))
  return c.json(records)
})

admin.post('/compliance/ropa', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Unauthorized' }, 401)
  const tenantId = c.get('tenantId') as string
  const db = getDb(c)
  const body = await c.req.json()

  const newRecord = {
    id: crypto.randomUUID(),
    tenant_id: tenantId,
    process_name: body.process_name,
    purpose: body.purpose,
    data_categories: typeof body.data_categories === 'string' ? body.data_categories : JSON.stringify(body.data_categories || []),
    data_subjects: typeof body.data_subjects === 'string' ? body.data_subjects : JSON.stringify(body.data_subjects || []),
    legal_basis: body.legal_basis,
    retention_period: body.retention_period || '',
    international_transfer: body.international_transfer ? 1 : 0,
    security_measures: body.security_measures || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  await db.insert(schema.ropa_records).values(newRecord)
  return c.json({ success: true, record: newRecord })
})

admin.get('/compliance/incidents', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Unauthorized' }, 401)
  const tenantId = c.get('tenantId') as string
  const db = getDb(c)
  
  const records = await db.select().from(schema.incidents).where(eq(schema.incidents.tenant_id, tenantId))
  return c.json(records)
})

export { admin }
