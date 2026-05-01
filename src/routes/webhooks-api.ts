import { Hono } from 'hono'
import { z } from 'zod'
import { drizzle } from 'drizzle-orm/d1'
import { eq, and } from 'drizzle-orm'
import { webhooks_targets } from '../db/schema'

type Env = {
  Bindings: {
    DB: D1Database
  }
  Variables: {
    tenantId?: string;
  }
}

const webhooksApi = new Hono<Env>()

const webhookSchema = z.object({
  url: z.string().url("A URL do webhook precisa ser válida (ex: https://...)"),
  secret: z.string().optional(),
  events: z.array(z.string()).default(['entry.published']),
}).strip()

// ── GET /api/admin/webhooks ─────────────────────────────────────
webhooksApi.get('/', async (c) => {
  const tenantId = c.get('tenantId') as string | undefined
  const db = drizzle(c.env.DB)

  // Use raw array queries combined with tenantId filter
  const targets = await db.select().from(webhooks_targets)
    .where(tenantId ? eq(webhooks_targets.tenant_id, tenantId) : undefined)
    .all()

  return c.json({ data: targets })
})

// ── POST /api/admin/webhooks ────────────────────────────────────
webhooksApi.post('/', async (c) => {
  const tenantId = c.get('tenantId') as string | undefined
  const rawBody = await c.req.json().catch(() => ({}))
  
  const parsed = webhookSchema.safeParse(rawBody)
  if (!parsed.success) {
    return c.json({ error: 'Validação Falhou', details: parsed.error.issues }, 400)
  }

  const { url, secret, events } = parsed.data
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  
  const db = drizzle(c.env.DB)
  await db.insert(webhooks_targets).values({
    id,
    tenant_id: tenantId || null,
    url,
    secret: secret || null,
    events: JSON.stringify(events),
    active: 1,
    created_at: now,
    updated_at: now
  })

  return c.json({ success: true, id }, 201)
})

// ── DELETE /api/admin/webhooks/:id ──────────────────────────────
webhooksApi.delete('/:id', async (c) => {
  const id = c.req.param('id')
  const tenantId = c.get('tenantId') as string | undefined
  
  const db = drizzle(c.env.DB)
  const result = await db.delete(webhooks_targets)
    .where(
      tenantId 
        ? and(eq(webhooks_targets.id, id), eq(webhooks_targets.tenant_id, tenantId))
        : eq(webhooks_targets.id, id)
    )
    .run()

  return c.json({ success: result.meta.changes > 0 })
})

export { webhooksApi }
