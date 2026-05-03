/**
 * Canal SaaS — Setup Routes (admin bootstrap)
 * 
 * Protected by x-setup-key header.
 * - POST /api/setup/admin — Create initial admin user
 * - POST /api/setup/seed-org — Create initial organization
 * - POST /api/admin/seed-vectors — Re-index all vectors
 * - POST /api/admin/seed-collections — Sync collection definitions
 */
import { Hono } from 'hono'
import { z } from 'zod'
import type { Bindings, Variables } from '../index'
import { getAuth } from '../middleware/context'
import { seedVectors } from '../seed-vectors'
import { collections } from '../collections'

type Env = { Bindings: Bindings; Variables: Variables }

export const setupRoutes = new Hono<Env>()

const setupAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
}).strip()

// ── Bootstrap admin ─────────────────────────────────────────────
setupRoutes.post('/admin', async (c) => {
  const key = c.req.header('x-setup-key')
  if (!key || key !== c.env.ADMIN_SETUP_KEY) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const auth = getAuth(c)
  const parsed = setupAdminSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: 'Invalid payload', details: parsed.error.issues }, 400)

  const { email, password, name } = parsed.data

  try {
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
    })
    return c.json({ success: true, user: result.user.email })
  } catch (err: unknown) {
    return c.json({ error: err instanceof Error ? err.message : 'Failed to create user' }, 400)
  }
})

// ── Seed Organization ───────────────────────────────────────────
setupRoutes.post('/seed-org', async (c) => {
  const key = c.req.header('x-setup-key')
  if (!key || key !== c.env.ADMIN_SETUP_KEY) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const body = await c.req.json() as { name: string; slug: string; plan?: string; userId: string }
  if (!body.name || !body.slug || !body.userId) {
    return c.json({ error: 'name, slug, and userId required' }, 400)
  }

  const auth = getAuth(c)

  try {
    const orgResult = await auth.api.createOrganization({
      body: { name: body.name, slug: body.slug },
      headers: new Headers(),
    })

    const orgId = (orgResult as Record<string, unknown>)?.id || (orgResult as { organization?: { id?: string } })?.organization?.id
    if (!orgId) {
      return c.json({ error: 'Failed to create org', debug: orgResult }, 500)
    }

    const plan = body.plan || 'enterprise'
    const orgMeta = JSON.stringify({ plan, usageLimit: 999999 })
    await c.env.DB.prepare('UPDATE organization SET metadata = ? WHERE id = ?').bind(orgMeta, orgId).run()

    await c.env.DB.prepare(
      `INSERT INTO member (id, organizationId, userId, role, createdAt)
       VALUES (?, ?, ?, 'owner', datetime('now'))
       ON CONFLICT DO NOTHING`
    ).bind(crypto.randomUUID(), orgId, body.userId).run()

    return c.json({ success: true, orgId, name: body.name, slug: body.slug, plan })
  } catch (err: unknown) {
    return c.json({ error: err instanceof Error ? err.message : 'Failed to seed organization' }, 500)
  }
})

// ── Seed Vectors ────────────────────────────────────────────────
setupRoutes.post('/seed-vectors', async (c) => {
  try {
    const results = await seedVectors(c.env)
    return c.json({ success: true, results })
  } catch (e: unknown) {
    return c.json({ success: false, error: e instanceof Error ? e.message : String(e) }, 500)
  }
})

// ── Seed Collections ────────────────────────────────────────────
setupRoutes.post('/seed-collections', async (c) => {
  const results: Array<{ slug: string; status: string; governance?: string; error?: string }> = []
  for (const col of collections) {
    const id = crypto.randomUUID()
    try {
      await c.env.DB.prepare(
        `INSERT INTO collections (id, slug, label, label_plural, icon, has_locale, has_slug, has_status, governance, fields, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(slug) DO UPDATE SET
           label = excluded.label,
           label_plural = excluded.label_plural,
           icon = excluded.icon,
           governance = excluded.governance,
           fields = excluded.fields`
      ).bind(
        id, col.slug, col.label, col.labelPlural ?? col.label + 's',
        col.icon, col.hasLocale ? 1 : 0, col.hasSlug ? 1 : 0, col.hasStatus ? 1 : 0,
        col.governance,
        JSON.stringify(col.fields), collections.indexOf(col)
      ).run()
      results.push({ slug: col.slug, status: 'ok', governance: col.governance })
    } catch (e: unknown) {
      results.push({ slug: col.slug, status: 'error', error: e instanceof Error ? e.message : String(e) })
    }
  }

  return c.json({ success: true, results })
})
