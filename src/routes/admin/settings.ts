/**
 * Admin — Settings (API Keys, Domains, Health, AI Settings)
 * RBAC: requirePermission() for granular access control.
 */
import { Hono } from 'hono'
import { desc, eq, like, sql } from 'drizzle-orm'
import { hashApiKey } from '../../security'
import { safeParse, CreateApiKeySchema, CreateDomainSchema, UpdateAiSettingsSchema } from '../../schemas'
import { DEFAULT_TENANT_ID } from '../../config'
import type { AdminEnv } from './_shared'
import { requirePermission, logAudit, getDb, schema } from './_shared'

export const settingsRouter = new Hono<AdminEnv>()

// ── API Keys ────────────────────────────────────────────────────
settingsRouter.get('/api-keys/:orgId', async (c) => {
  if (!(await requirePermission(c, { settings: ['read'] }))) return c.json({ error: 'Forbidden' }, 403)
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

settingsRouter.post('/api-keys', async (c) => {
  if (!(await requirePermission(c, { settings: ['update'] }))) return c.json({ error: 'Forbidden' }, 403)
  const parsed = safeParse(CreateApiKeySchema, await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error }, 400)
  const { name, orgId } = parsed.data

  const id = crypto.randomUUID()
  const rawKey = `pk_${crypto.randomUUID().replace(/-/g, '')}`
  const prefix = rawKey.substring(0, 7)
  const now = new Date().toISOString()

  const hashedKey = await hashApiKey(rawKey)

  const db = getDb(c)
  await db.insert(schema.apikey).values({
    id, name, prefix, key: hashedKey,
    metadata: JSON.stringify({ orgId }),
    createdAt: now,
  })

  logAudit(c, 'create', 'api-key', id, `name: ${name}`)
  return c.json({ id, name, prefix, key: rawKey, createdAt: now }, 201)
})

settingsRouter.delete('/api-keys/:id', async (c) => {
  if (!(await requirePermission(c, { settings: ['update'] }))) return c.json({ error: 'Forbidden' }, 403)
  const id = c.req.param('id')
  const db = getDb(c)
  await db.delete(schema.apikey).where(eq(schema.apikey.id, id))
  logAudit(c, 'delete', 'api-key', id)
  return c.json({ success: true })
})

// ── Tenant Domains ──────────────────────────────────────────────
settingsRouter.get('/domains', async (c) => {
  if (!(await requirePermission(c, { settings: ['read'] }))) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = c.get('tenantId')
  const db = getDb(c)
  const query = tenantId
    ? db.select().from(schema.tenant_domains).where(eq(schema.tenant_domains.tenant_id, tenantId))
    : db.select().from(schema.tenant_domains)
  return c.json(await query.orderBy(desc(schema.tenant_domains.created_at)))
})

settingsRouter.post('/domains', async (c) => {
  if (!(await requirePermission(c, { settings: ['update'] }))) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = c.get('tenantId')
  if (!tenantId) return c.json({ error: 'No active organization' }, 400)

  const parsed = safeParse(CreateDomainSchema, await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error }, 400)
  const { domain } = parsed.data

  const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0].toLowerCase()
  const token = crypto.randomUUID()

  const db = getDb(c)
  const id = crypto.randomUUID()

  try {
    await db.insert(schema.tenant_domains).values({
      id, tenant_id: tenantId, domain: cleanDomain,
      verified: 0, verification_token: token,
      created_at: new Date().toISOString(),
    })
  } catch (e: unknown) {
    if ((e instanceof Error ? e.message : String(e))?.includes('UNIQUE')) return c.json({ error: 'Domain already registered' }, 409)
    throw e
  }

  logAudit(c, 'create', 'domain', id, `domain: ${cleanDomain}`)
  return c.json({
    id, domain: cleanDomain, verified: false,
    verification: {
      method: 'TXT record',
      record: `_canal-verify.${cleanDomain}`,
      value: token,
      instructions: `Add a TXT record to your DNS:\n  Host: _canal-verify\n  Value: ${token}\n\nOnce added, call POST /api/admin/domains/${id}/verify`
    }
  }, 201)
})

settingsRouter.post('/domains/:id/verify', async (c) => {
  if (!(await requirePermission(c, { settings: ['update'] }))) return c.json({ error: 'Forbidden' }, 403)
  const id = c.req.param('id')
  const db = getDb(c)

  const [record] = await db.select().from(schema.tenant_domains).where(eq(schema.tenant_domains.id, id))
  if (!record) return c.json({ error: 'Domain not found' }, 404)
  if (record.verified) return c.json({ success: true, verified: true, message: 'Already verified' })

  let verified = false
  try {
    const dohUrl = `https://cloudflare-dns.com/dns-query?name=_canal-verify.${record.domain}&type=TXT`
    const dnsRes = await fetch(dohUrl, { headers: { 'Accept': 'application/dns-json' } })
    if (dnsRes.ok) {
      const dnsData = await dnsRes.json() as { Answer?: Array<{ data: string }> }
      for (const txt of dnsData.Answer || []) {
        if (txt.data?.replace(/"/g, '').trim() === record.verification_token) { verified = true; break }
      }
    }
  } catch { /* DNS lookup failed */ }

  if (!verified) {
    return c.json({
      success: false, verified: false,
      message: 'DNS TXT record not found or does not match',
      expected: { record: `_canal-verify.${record.domain}`, type: 'TXT', value: record.verification_token },
      hint: 'DNS propagation can take up to 48 hours. Try again later.',
    }, 422)
  }

  await db.update(schema.tenant_domains).set({ verified: 1 }).where(eq(schema.tenant_domains.id, id))
  try {
    await c.env.CANAL_KV.delete(`cors:https://${record.domain}`)
    await c.env.CANAL_KV.delete(`cors:http://${record.domain}`)
  } catch {}

  logAudit(c, 'verify', 'domain', id, `domain: ${record.domain}`)
  return c.json({ success: true, verified: true, domain: record.domain })
})

settingsRouter.delete('/domains/:id', async (c) => {
  if (!(await requirePermission(c, { settings: ['update'] }))) return c.json({ error: 'Forbidden' }, 403)
  const id = c.req.param('id')
  const db = getDb(c)
  await db.delete(schema.tenant_domains).where(eq(schema.tenant_domains.id, id))
  logAudit(c, 'delete', 'domain', id)
  return c.json({ success: true })
})

// ── System Health ───────────────────────────────────────────────
settingsRouter.get('/health', async (c) => {
  if (!(await requirePermission(c, { settings: ['read'] }))) return c.json({ error: 'Forbidden' }, 403)
  const checks: Record<string, { status: 'ok' | 'degraded' | 'error'; latency_ms?: number }> = {}

  const t0 = Date.now()
  try { await c.env.DB.prepare('SELECT 1').first(); checks.db = { status: 'ok', latency_ms: Date.now() - t0 } }
  catch { checks.db = { status: 'error', latency_ms: Date.now() - t0 } }

  const t1 = Date.now()
  try { await c.env.CANAL_KV.get('__ping__'); checks.kv = { status: 'ok', latency_ms: Date.now() - t1 } }
  catch { checks.kv = { status: 'error' } }

  checks.ai = { status: c.env.AI ? 'ok' : 'degraded' }
  checks.storage = { status: c.env.MEDIA ? 'ok' : 'degraded' }
  checks.queue = { status: c.env.QUEUE ? 'ok' : 'degraded' }

  return c.json({ ...checks, checked_at: new Date().toISOString() })
})

// ── AI Settings ─────────────────────────────────────────────────
settingsRouter.get('/ai-settings', async (c) => {
  if (!(await requirePermission(c, { automation: ['read'] }))) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = c.get('tenantId') || DEFAULT_TENANT_ID
  const db = getDb(c)
  const [config] = await db.select().from(schema.chatbot_config).where(eq(schema.chatbot_config.tenant_id, tenantId)).limit(1)

  if (config) {
    return c.json({
      enabled: config.enabled === 1, bot_name: config.bot_name,
      avatar_url: config.avatar_url, welcome_message: config.welcome_message,
      system_prompt: config.system_prompt, theme_color: config.theme_color,
      max_turns: config.max_turns
    })
  }
  return c.json({
    enabled: true, bot_name: 'Gabi.OS', avatar_url: '',
    welcome_message: 'Olá! Como posso ajudar?', system_prompt: '',
    theme_color: '#00E5A0', max_turns: 20
  })
})

settingsRouter.put('/ai-settings', async (c) => {
  if (!(await requirePermission(c, { automation: ['configure'] }))) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = c.get('tenantId') || DEFAULT_TENANT_ID
  const db = getDb(c)

  const parsed = safeParse(UpdateAiSettingsSchema, await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error }, 400)
  const payload = parsed.data

  const existing = await db.select({ id: schema.chatbot_config.id }).from(schema.chatbot_config).where(eq(schema.chatbot_config.tenant_id, tenantId)).limit(1)

  if (existing.length > 0) {
    await db.update(schema.chatbot_config).set({
      enabled: payload.enabled !== false ? 1 : 0,
      bot_name: payload.bot_name, avatar_url: payload.avatar_url,
      welcome_message: payload.welcome_message, system_prompt: payload.system_prompt,
      theme_color: payload.theme_color, max_turns: payload.max_turns,
      updated_at: new Date().toISOString()
    }).where(eq(schema.chatbot_config.id, existing[0].id))
  } else {
    await db.insert(schema.chatbot_config).values({
      id: crypto.randomUUID(), tenant_id: tenantId,
      enabled: payload.enabled !== false ? 1 : 0,
      bot_name: payload.bot_name || 'Gabi.OS', avatar_url: payload.avatar_url,
      welcome_message: payload.welcome_message || 'Olá! Como posso ajudar?',
      system_prompt: payload.system_prompt, theme_color: payload.theme_color || '#00E5A0',
      max_turns: payload.max_turns || 20, created_at: new Date().toISOString()
    })
  }

  logAudit(c, 'update', 'ai-settings')
  return c.json({ success: true })
})

settingsRouter.get('/ai-stats', async (c) => {
  if (!(await requirePermission(c, { automation: ['read'] }))) return c.json({ error: 'Forbidden' }, 403)
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
