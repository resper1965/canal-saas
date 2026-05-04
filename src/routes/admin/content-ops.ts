/**
 * Admin — Content Operations & Compliance
 * 
 * - AI translate/social generation (queue-based)
 * - Social posts management
 * - ROPA records & Incidents
 * RBAC: requirePermission() for granular access control.
 */
import { Hono } from 'hono'
import { desc, eq, and } from 'drizzle-orm'
import { DEFAULT_TENANT_ID } from '../../config'
import type { AdminEnv } from './_shared'
import { requirePermission, logAudit, getDb, schema } from './_shared'

export const contentOpsRouter = new Hono<AdminEnv>()

// ── Translate Entry (Queue) ─────────────────────────────────────
contentOpsRouter.post('/entries/:id/translate', async (c) => {
  if (!(await requirePermission(c, { entry: ['update'] }))) return c.json({ error: 'Forbidden' }, 403)
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

  logAudit(c, 'translate', 'entry', entryId, `locale: ${targetLocale}`)
  return c.json({ success: true, message: 'Translation queued' })
})

// ── Generate Social Caption (Queue) ─────────────────────────────
contentOpsRouter.post('/entries/:id/social', async (c) => {
  if (!(await requirePermission(c, { automation: ['configure'] }))) return c.json({ error: 'Forbidden' }, 403)
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

  logAudit(c, 'generate-social', 'entry', entryId, `platform: ${platform}`)
  return c.json({ success: true, message: 'Social caption generation queued' })
})

// ── Social Posts ─────────────────────────────────────────────────
contentOpsRouter.get('/social-posts', async (c) => {
  if (!(await requirePermission(c, { newsletter: ['read'] }))) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = c.get('tenantId') as string
  const db = getDb(c)
  const posts = await db.select().from(schema.social_posts).where(eq(schema.social_posts.tenant_id, tenantId))
  return c.json(posts)
})

contentOpsRouter.patch('/social-posts/:id', async (c) => {
  if (!(await requirePermission(c, { newsletter: ['create'] }))) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = c.get('tenantId') as string
  const id = c.req.param('id')
  const body = await c.req.json()
  const db = getDb(c)
  await db.update(schema.social_posts)
    .set({ status: body.status, updated_at: new Date().toISOString() })
    .where(and(eq(schema.social_posts.tenant_id, tenantId), eq(schema.social_posts.id, id)))
  logAudit(c, 'update', 'social-post', id, `status: ${body.status}`)
  return c.json({ success: true })
})

// ── Compliance: ROPA & Incidents ────────────────────────────────
contentOpsRouter.get('/compliance/ropa', async (c) => {
  if (!(await requirePermission(c, { compliance: ['read'] }))) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = c.get('tenantId') as string
  const db = getDb(c)
  const records = await db.select().from(schema.ropa_records).where(eq(schema.ropa_records.tenant_id, tenantId))
  return c.json(records)
})

contentOpsRouter.post('/compliance/ropa', async (c) => {
  if (!(await requirePermission(c, { compliance: ['manage'] }))) return c.json({ error: 'Forbidden' }, 403)
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
  logAudit(c, 'create', 'ropa-record', newRecord.id, `process: ${body.process_name}`)
  return c.json({ success: true, record: newRecord })
})

contentOpsRouter.get('/compliance/incidents', async (c) => {
  if (!(await requirePermission(c, { compliance: ['read'] }))) return c.json({ error: 'Forbidden' }, 403)
  const tenantId = c.get('tenantId') as string
  const db = getDb(c)
  const records = await db.select().from(schema.incidents).where(eq(schema.incidents.tenant_id, tenantId))
  return c.json(records)
})
