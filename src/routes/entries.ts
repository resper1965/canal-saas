/**
 * Canal CMS — Generic CRUD Routes for Collections/Entries
 *
 * Rotas RESTful que operam sobre qualquer collection registrada.
 * Resolve a collection pelo slug, valida campos e persiste no D1.
 */

import { Hono } from 'hono'
import { z } from 'zod'
import { collections, getCollection, getRequiredFields } from '../collections'
import { createAuth } from '../auth'
import { upsertVector, deleteVector } from '../vectorize-sync'
import { sanitizeEntryData } from '../security'
import type { EntryRow } from '../types'

type Env = {
  Bindings: {
    DB: D1Database
    AI: Ai
    VECTORIZE: VectorizeIndex
    MEDIA: R2Bucket
    BETTER_AUTH_SECRET: string
    BETTER_AUTH_URL: string
    ADMIN_SETUP_KEY: string
    RESEND_API_KEY: string
    QUEUE?: Queue
  }
}

const entries = new Hono<Env>()

// ── Lista todas as collections ──────────────────────────────────
entries.get('/collections', (c) => {
  return c.json(collections.map(col => ({
    slug: col.slug,
    label: col.label,
    labelPlural: col.labelPlural,
    icon: col.icon,
    hasLocale: col.hasLocale,
    hasSlug: col.hasSlug,
    hasStatus: col.hasStatus,
    fieldCount: col.fields.length,
  })))
})

// ── Schema de uma collection ────────────────────────────────────
entries.get('/collections/:slug', (c) => {
  const col = getCollection(c.req.param('slug'))
  if (!col) return c.json({ error: 'Collection not found' }, 404)
  return c.json(col)
})

// ── Listar entries de uma collection ────────────────────────────
entries.get('/collections/:slug/entries', async (c) => {
  const col = getCollection(c.req.param('slug'))
  if (!col) return c.json({ error: 'Collection not found' }, 404)

  const locale = c.req.query('locale') || c.req.query('lang') || 'pt'
  const page = parseInt(c.req.query('page') || '1', 10)
  const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100)
  const offset = (page - 1) * limit

  // Tenant identification + session check
  const auth = createAuth(c.env.DB, c.env.BETTER_AUTH_SECRET, c.env.BETTER_AUTH_URL)
  const session = await auth.api.getSession({ headers: c.req.raw.headers }).catch(() => null)
  // SECURITY (P0): Removed unvalidated x-tenant-id header override to fix IDOR.
  // Must rely strictly on the active organization the user authenticated into.
  const authTenantId = session?.session?.activeOrganizationId
  // Also support server-to-server calls that use valid API keys where no active session org is given
  // Ideally MCP or worker bindings pass context, but here we fallback strictly.
  const tenantId = authTenantId || null

  // Security: only authenticated users can request drafts or all entries
  const requestedStatus = c.req.query('status') || 'published'
  const status = session ? requestedStatus : 'published'

  // EDGE CACHING P2: Avoid hitting D1 if public read (Free Tier protection)
  const isCacheable = !tenantId && status === 'published'
  const cacheKey = new Request(c.req.url)
  
  if (isCacheable) {
    const cachedRes = await caches.default.match(cacheKey)
    if (cachedRes) return cachedRes
  }

  // Buscar collection_id
  const colRow = await c.env.DB.prepare(
    'SELECT id FROM collections WHERE slug = ? LIMIT 1'
  ).bind(col.slug).first<{ id: string }>()

  if (!colRow) return c.json({ error: 'Collection not seeded in DB' }, 404)

  // Buscar entries
  let query = `SELECT * FROM entries WHERE collection_id = ?`
  const params: unknown[] = [colRow.id]

  if (col.hasLocale) {
    query += ` AND locale = ?`
    params.push(locale)
  }

  if (col.hasStatus && status !== 'all') {
    query += ` AND status = ?`
    params.push(status)
  }

  if (tenantId) {
    query += ` AND tenant_id = ?`
    params.push(tenantId)
  } else {
    query += ` AND tenant_id IS NULL`
  }

  query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
  params.push(limit, offset)

  const { results } = await c.env.DB.prepare(query).bind(...params).all()

  // Contar total para paginação
  let countQuery = `SELECT COUNT(*) as total FROM entries WHERE collection_id = ?`
  const countParams: unknown[] = [colRow.id]
  if (col.hasLocale) {
    countQuery += ` AND locale = ?`
    countParams.push(locale)
  }
  if (col.hasStatus && status !== 'all') {
    countQuery += ` AND status = ?`
    countParams.push(status)
  }
  if (tenantId) {
    countQuery += ` AND tenant_id = ?`
    countParams.push(tenantId)
  } else {
    countQuery += ` AND tenant_id IS NULL`
  }
  const countResult = await c.env.DB.prepare(countQuery).bind(...countParams).first<{ total: number }>()


  // Parse JSON data de cada entry
  const items = (results as unknown as EntryRow[]).map(row => ({
    id: row.id,
    slug: row.slug,
    locale: row.locale,
    status: row.status,
    ...safeParseJSON(row.data),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  }))

  const resData = {
    data: items,
    meta: {
      collection: col.slug,
      page,
      limit,
      total: countResult?.total ?? 0,
      totalPages: Math.ceil((countResult?.total ?? 0) / limit),
    }
  }

  if (isCacheable) {
    const response = c.json(resData)
    // Cache on Edge for 1 minute (60 seconds)
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60')
    c.executionCtx.waitUntil(caches.default.put(cacheKey, response.clone()))
    return response
  }

  return c.json(resData)
})

// ── Detalhe de uma entry ────────────────────────────────────────
entries.get('/collections/:slug/entries/:id', async (c) => {
  const col = getCollection(c.req.param('slug'))
  if (!col) return c.json({ error: 'Collection not found' }, 404)

  const id = c.req.param('id')
  const locale = c.req.query('locale') || c.req.query('lang') || 'pt'

  const auth = createAuth(c.env.DB, c.env.BETTER_AUTH_SECRET, c.env.BETTER_AUTH_URL)
  const session = await auth.api.getSession({ headers: c.req.raw.headers }).catch(() => null)
  const tenantId = session?.session?.activeOrganizationId || null // Removed header bypass

  // EDGE CACHING P2: Single Entry
  const isCacheable = !tenantId
  const cacheKey = new Request(c.req.url)
  if (isCacheable) {
    const cachedRes = await caches.default.match(cacheKey)
    if (cachedRes) return cachedRes
  }

  let tSql = tenantId ? 'tenant_id = ?' : 'tenant_id IS NULL';

  // Tentar buscar por ID primeiro, depois por slug
  let row = await c.env.DB.prepare(
    `SELECT * FROM entries WHERE id = ? AND ${tSql} LIMIT 1`
  ).bind(...(tenantId ? [id, tenantId] : [id])).first()

  if (!row && col.hasSlug) {
    // Buscar collection_id primeiro
    const colRow = await c.env.DB.prepare(
      'SELECT id FROM collections WHERE slug = ? LIMIT 1'
    ).bind(col.slug).first<{ id: string }>()

    if (colRow) {
      row = await c.env.DB.prepare(
        `SELECT * FROM entries WHERE collection_id = ? AND slug = ? AND locale = ? AND ${tSql} LIMIT 1`
      ).bind(colRow.id, id, locale, ...(tenantId ? [tenantId] : [])).first()
    }
  }

  if (!row) return c.json({ error: 'Entry not found' }, 404)

  const entry = row as unknown as EntryRow
  const resData = {
    id: entry.id,
    slug: entry.slug,
    locale: entry.locale,
    status: entry.status,
    ...safeParseJSON(entry.data),
    createdAt: entry.created_at,
    updatedAt: entry.updated_at,
    publishedAt: entry.published_at,
  }

  if (isCacheable) {
    const response = c.json(resData)
    // Cache on Edge for 1 minute (60 seconds)
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=60')
    c.executionCtx.waitUntil(caches.default.put(cacheKey, response.clone()))
    return response
  }

  return c.json(resData)
})

// ── Helpers de Schema Dinâmico ──────────────────────────────────
function getZodType(type: string): z.ZodTypeAny {
  switch (type) {
    case 'text':
    case 'textarea':
    case 'richtext':
    case 'slug':
    case 'select':
    case 'relation':
    case 'date':
    case 'image':
      return z.string()
    case 'number':
      return z.number()
    case 'boolean':
      return z.boolean()
    case 'json':
      return z.any()
    default:
      return z.any()
  }
}

// ── Criar entry (requer auth) ───────────────────────────────────
entries.post('/collections/:slug/entries', async (c) => {
  const col = getCollection(c.req.param('slug'))
  if (!col) return c.json({ error: 'Collection not found' }, 404)

  const rawBody = await c.req.json()

  // Build dynamic Zod schema based on collection definition (P0 fixed)
  const schemaObj: Record<string, z.ZodTypeAny> = {
    locale: z.string().optional(),
    status: z.string().optional(),
    slug: z.string().optional()
  }
  
  col.fields.forEach(f => {
    let fieldSchema = getZodType(f.type)
    if (!f.required) {
      fieldSchema = fieldSchema.nullish() // allows null or undefined
    }
    schemaObj[f.name] = fieldSchema
  })
  
  const schema = z.object(schemaObj).strip()
  const parsed = schema.safeParse(rawBody)
  
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.issues }, 400)
  }
  
  const body = parsed.data as Record<string, unknown>

  // Additional fallback validation for required fields
  const required = getRequiredFields(col)
  const missing = required.filter(f => body[f] === undefined || body[f] === null || body[f] === '')
  if (missing.length > 0) {
    return c.json({ error: `Missing required fields: ${missing.join(', ')}` }, 400)
  }

  // Auth/Tenant validation for writes
  const auth = createAuth(c.env.DB, c.env.BETTER_AUTH_SECRET, c.env.BETTER_AUTH_URL)
  const session = await auth.api.getSession({ headers: c.req.raw.headers }).catch(() => null)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  
  // Security P0: Protect IDOR
  const tenantId = session.session.activeOrganizationId || null

  // Plan enforcement: check entry limits
  if (tenantId) {
    const { getUsage, canCreateEntry } = await import('../plans')
    const usage = await getUsage(c.env.DB, tenantId)
    const check = canCreateEntry(usage)
    if (!check.allowed) {
      return c.json({ error: check.reason, code: 'PLAN_LIMIT' }, 403)
    }
  }

  // Buscar collection_id
  const colRow = await c.env.DB.prepare(
    'SELECT id FROM collections WHERE slug = ? LIMIT 1'
  ).bind(col.slug).first<{ id: string }>()

  if (!colRow) return c.json({ error: 'Collection not seeded in DB' }, 404)

  const id = crypto.randomUUID()
  const locale = (body.locale as string) || 'pt'
  const status = (body.status as string) || 'draft'
  const slug = col.hasSlug ? ((body.slug as string) || generateSlug(body.title as string || id)) : null

  // Separar campos de sistema dos dados
  const { locale: _l, status: _s, slug: _sl, ...rawData } = body
  const data = sanitizeEntryData(rawData as Record<string, unknown>)

  const now = new Date().toISOString()
  const publishedAt = status === 'published' ? now : null

  await c.env.DB.prepare(
    `INSERT INTO entries (id, tenant_id, collection_id, data, slug, locale, status, published_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(id, tenantId || null, colRow.id, JSON.stringify(data), slug, locale, status, publishedAt, now, now).run()

  // Auto-vectorize (fire-and-forget)
  if (status === 'published') {
    upsertVector(c.env, id, data as Record<string, unknown>, col.slug)
    
    // Dispara webhook via fila (Background Job)
    try {
      if (c.env.QUEUE) {
        c.env.QUEUE.send({
          type: 'webhook-dispatch',
          payload: { event: 'entry.published', collectionSlug: col.slug, entryId: id, tenantId, payloadData: data }
        })
      }
    } catch (e) {
    }
  }

  // Auto-SEO para posts e pages sem meta tags
  if (col.slug === 'insights' || col.slug === 'pages') {
    const d = data as Record<string, any>
    if (!d.seo_title || !d.seo_description) {
      try {
        if (c.env.QUEUE) {
          c.env.QUEUE.send({
            type: 'generate-seo',
            payload: { entryId: id, data, tenantId }
          })
        }
      } catch(e) {
      }
    }
    
    // Auto-Translate para inglês e espanhol (se publicado e for post principal)
    if (status === 'published' && locale === 'pt') {
      try {
        if (c.env.QUEUE) {
          c.env.QUEUE.send({ type: 'translate', payload: { entryId: id, data, targetLocale: 'en', tenantId } })
          c.env.QUEUE.send({ type: 'translate', payload: { entryId: id, data, targetLocale: 'es', tenantId } })
        }
      } catch(e) {
      }
    }
  }

  return c.json({ id, slug, locale, status }, 201)
})

// ── Atualizar entry (requer auth) ───────────────────────────────
entries.put('/collections/:slug/entries/:id', async (c) => {
  const col = getCollection(c.req.param('slug'))
  if (!col) return c.json({ error: 'Collection not found' }, 404)

  const entryId = c.req.param('id')
  const rawBody = await c.req.json()

  // Build dynamic Zod schema to strip unapproved fields
  const schemaObj: Record<string, z.ZodTypeAny> = {
    locale: z.string().optional(),
    status: z.string().optional(),
    slug: z.string().optional()
  }
  
  col.fields.forEach(f => {
    schemaObj[f.name] = getZodType(f.type).nullish() // Updates represent partial changes, make everything optional
  })
  
  const schema = z.object(schemaObj).strip()
  const parsed = schema.safeParse(rawBody)
  
  if (!parsed.success) {
    return c.json({ error: 'Validation failed', details: parsed.error.issues }, 400)
  }
  
  const body = parsed.data as Record<string, unknown>

  const auth = createAuth(c.env.DB, c.env.BETTER_AUTH_SECRET, c.env.BETTER_AUTH_URL)
  const session = await auth.api.getSession({ headers: c.req.raw.headers }).catch(() => null)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  
  const tenantId = session.session.activeOrganizationId || null // Fixed IDOR bypass

  let tSql = tenantId ? 'tenant_id = ?' : 'tenant_id IS NULL';

  const existing = await c.env.DB.prepare(
    `SELECT * FROM entries WHERE id = ? AND ${tSql} LIMIT 1`
  ).bind(...(tenantId ? [entryId, tenantId] : [entryId])).first()

  if (!existing) return c.json({ error: 'Entry not found' }, 404)

  const ex = existing as unknown as EntryRow
  const status = (body.status as string) || ex.status
  const slug = col.hasSlug ? ((body.slug as string) || ex.slug) : null
  const locale = (body.locale as string) || ex.locale

  // Merge data existing + new
  const existingData = safeParseJSON(ex.data)
  const { locale: _l, status: _s, slug: _sl, ...rawNewData } = body
  const newData = sanitizeEntryData(rawNewData as Record<string, unknown>)
  const mergedData = { ...existingData, ...newData }

  const now = new Date().toISOString()
  const publishedAt = status === 'published' ? (ex.published_at || now) : null

  await c.env.DB.prepare(
    `UPDATE entries SET data = ?, slug = ?, locale = ?, status = ?, published_at = ?, updated_at = ?
     WHERE id = ? AND ${tSql}`
  ).bind(JSON.stringify(mergedData), slug, locale, status, publishedAt, now, entryId, ...(tenantId ? [tenantId] : [])).run()

  // Auto-vectorize (fire-and-forget)
  if (status === 'published') {
    upsertVector(c.env, entryId, mergedData as Record<string, unknown>, col.slug)
  } else {
    deleteVector(c.env, entryId) // unpublished = remove from RAG
  }

  return c.json({ id: entryId, slug, locale, status, updated: true })
})

// ── Deletar entry (requer auth) ─────────────────────────────────
entries.delete('/collections/:slug/entries/:id', async (c) => {
  const entryId = c.req.param('id')

  const auth = createAuth(c.env.DB, c.env.BETTER_AUTH_SECRET, c.env.BETTER_AUTH_URL)
  const session = await auth.api.getSession({ headers: c.req.raw.headers }).catch(() => null)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  
  const tenantId = session.session.activeOrganizationId || null // Fixed IDOR bypass

  let tSql = tenantId ? 'tenant_id = ?' : 'tenant_id IS NULL';

  const { success } = await c.env.DB.prepare(
    `DELETE FROM entries WHERE id = ? AND ${tSql}`
  ).bind(...(tenantId ? [entryId, tenantId] : [entryId])).run()

  // Remove from vector index
  deleteVector(c.env, entryId)

  return c.json({ success, deleted: entryId })
})

// ── Encaminhar formulário via email (Resend) ────────────────────
entries.post('/collections/forms/entries/:id/forward', async (c) => {
  const entryId = c.req.param('id')
  
  const auth = createAuth(c.env.DB, c.env.BETTER_AUTH_SECRET, c.env.BETTER_AUTH_URL)
  const session = await auth.api.getSession({ headers: c.req.raw.headers }).catch(() => null)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  
  const tenantId = session.session.activeOrganizationId || null // Fixed IDOR bypass

  let tSql = tenantId ? 'tenant_id = ?' : 'tenant_id IS NULL';

  const existing = await c.env.DB.prepare(
    `SELECT * FROM entries WHERE id = ? AND collection_id = 'forms' AND ${tSql} LIMIT 1`
  ).bind(...(tenantId ? [entryId, tenantId] : [entryId])).first()

  if (!existing) return c.json({ error: 'Entry not found' }, 404)

  const forwardSchema = z.object({ emails: z.array(z.string().email()).min(1) })
  const parsed = forwardSchema.safeParse(await c.req.json().catch(() => ({})))
  if (!parsed.success) return c.json({ error: 'Valid email list required' }, 400)
  const emails = parsed.data.emails

  // Use Resend to send the payload
  const data = safeParseJSON(existing.data)
  
  const htmlStr = `
    <h2>Novo formulário recebido: ${data.source || 'Website'}</h2>
    <p>Detalhes da submissão (#${entryId}):</p>
    <pre style="background:#f4f4f4;padding:16px;border-radius:4px;">${JSON.stringify(data.payload, null, 2)}</pre>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Sistema <noreply@ness.com.br>',
      to: emails,
      subject: `Novo contato via ${data.source || 'Website'}`,
      html: htmlStr
    })
  })

  if (!res.ok) {
    const errorText = await res.text()
    return c.json({ error: 'Failed to send email: ' + errorText }, 500)
  }

  return c.json({ success: true, forwardedTo: emails })
})

// ── Helpers ─────────────────────────────────────────────────────

function safeParseJSON(str: unknown): Record<string, unknown> {
  if (typeof str !== 'string') return {}
  try { return JSON.parse(str) } catch { return {} }
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80)
}

export { entries }
