/**
 * Admin — Organizations & Usage
 */
import { Hono } from 'hono'
import { desc, sql, eq } from 'drizzle-orm'
import { safeParse, UpdateOrgSchema } from '../../schemas'
import type { AdminEnv } from './_shared'
import { assertAdmin, getDb, schema } from './_shared'

export const organizationsRouter = new Hono<AdminEnv>()

organizationsRouter.get('/', async (c) => {
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

organizationsRouter.patch('/:id', async (c) => {
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

organizationsRouter.delete('/:id', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const id = c.req.param('id')
  const db = getDb(c)
  await db.delete(schema.member).where(eq(schema.member.organizationId, id))
  await db.delete(schema.invitation).where(eq(schema.invitation.organizationId, id))
  await db.delete(schema.organization).where(eq(schema.organization.id, id))
  return c.json({ success: true })
})

organizationsRouter.get('/usage/:orgId', async (c) => {
  const orgId = c.req.param('orgId')
  const { getUsage } = await import('../../plans')
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
