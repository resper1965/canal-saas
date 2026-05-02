/**
 * Canal CMS — Legacy API Routes
 *
 * Mantém retrocompatibilidade com as rotas que o site público consome:
 *   GET /api/insights, /api/cases, /api/jobs, etc.
 *
 * json_extract queries kept as raw SQL (SQLite-specific).
 * Newsletter + forms migrated to Drizzle.
 */

import { Hono } from 'hono'
import { z } from 'zod'
import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { newsletter, forms } from '../db/schema'

type Env = {
  Bindings: {
    DB: D1Database
  }
}

const legacy = new Hono<Env>()

// ── Insights (blog) ─────────────────────────────────────────────
// json_extract() queries — kept as raw SQL
legacy.get('/insights', async (c) => {
  const lang = c.req.query('lang') || 'pt'
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT e.id, e.locale as lang, e.slug,
              json_extract(e.data, '$.title') as title,
              json_extract(e.data, '$.tag') as tag,
              json_extract(e.data, '$.icon') as icon,
              json_extract(e.data, '$.date') as date,
              json_extract(e.data, '$.desc') as desc,
              json_extract(e.data, '$.featured') as featured
       FROM entries e
       JOIN collections col ON e.collection_id = col.id
       WHERE col.slug = 'insights' AND e.locale = ? AND e.status = 'published'
       ORDER BY date DESC`
    ).bind(lang).all()
    return c.json(results)
  } catch (err) {
    // console.error('[legacy] /insights DB error:', err instanceof Error ? err.message : String(err))
    return c.json({ error: 'Service temporarily unavailable' }, 503)
  }
})

legacy.get('/insights/:slug', async (c) => {
  const lang = c.req.query('lang') || 'pt'
  const slug = c.req.param('slug')
  try {
    const result = await c.env.DB.prepare(
      `SELECT e.id, e.locale as lang, e.slug,
              json_extract(e.data, '$.title') as title,
              json_extract(e.data, '$.tag') as tag,
              json_extract(e.data, '$.icon') as icon,
              json_extract(e.data, '$.date') as date,
              json_extract(e.data, '$.desc') as desc,
              json_extract(e.data, '$.body') as body,
              json_extract(e.data, '$.featured') as featured
       FROM entries e
       JOIN collections col ON e.collection_id = col.id
       WHERE col.slug = 'insights' AND e.slug = ? AND e.locale = ? AND e.status = 'published'
       LIMIT 1`
    ).bind(slug, lang).first()
    if (!result) return c.json({ error: 'Not found' }, 404)
    return c.json(result)
  } catch (err) {
    // console.error('[legacy] /insights/:slug DB error:', err instanceof Error ? err.message : String(err))
    return c.json({ error: 'Service temporarily unavailable' }, 503)
  }
})

// ── Cases (portfolio) ───────────────────────────────────────────
legacy.get('/cases', async (c) => {
  const lang = c.req.query('lang') || 'pt'
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT e.id, e.locale as lang, e.slug,
              json_extract(e.data, '$.client') as client,
              json_extract(e.data, '$.category') as category,
              json_extract(e.data, '$.project') as project,
              json_extract(e.data, '$.result') as result,
              json_extract(e.data, '$.desc') as desc,
              json_extract(e.data, '$.stats') as stats,
              json_extract(e.data, '$.image') as image,
              json_extract(e.data, '$.featured') as featured
       FROM entries e
       JOIN collections col ON e.collection_id = col.id
       WHERE col.slug = 'cases' AND e.locale = ? AND e.status = 'published'
       ORDER BY featured DESC, e.id ASC`
    ).bind(lang).all()
    return c.json(results)
  } catch (err) {
    // console.error('[legacy] /cases DB error:', err instanceof Error ? err.message : String(err))
    return c.json({ error: 'Service temporarily unavailable' }, 503)
  }
})

legacy.get('/cases/:slug', async (c) => {
  const lang = c.req.query('lang') || 'pt'
  const slug = c.req.param('slug')
  try {
    const result = await c.env.DB.prepare(
      `SELECT e.id, e.locale as lang, e.slug,
              json_extract(e.data, '$.client') as client,
              json_extract(e.data, '$.category') as category,
              json_extract(e.data, '$.project') as project,
              json_extract(e.data, '$.result') as result,
              json_extract(e.data, '$.desc') as desc,
              json_extract(e.data, '$.stats') as stats,
              json_extract(e.data, '$.image') as image,
              json_extract(e.data, '$.featured') as featured
       FROM entries e
       JOIN collections col ON e.collection_id = col.id
       WHERE col.slug = 'cases' AND e.slug = ? AND e.locale = ? AND e.status = 'published'
       LIMIT 1`
    ).bind(slug, lang).first()
    if (!result) return c.json({ error: 'Not found' }, 404)
    return c.json(result)
  } catch (err) {
    // console.error('[legacy] /cases/:slug DB error:', err instanceof Error ? err.message : String(err))
    return c.json({ error: 'Service temporarily unavailable' }, 503)
  }
})

// ── Jobs (carreiras) ────────────────────────────────────────────
legacy.get('/jobs', async (c) => {
  const lang = c.req.query('lang') || 'pt'
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT e.id, e.locale as lang,
              json_extract(e.data, '$.title') as title,
              json_extract(e.data, '$.vertical') as vertical,
              json_extract(e.data, '$.location') as location,
              json_extract(e.data, '$.type') as type,
              json_extract(e.data, '$.desc') as desc,
              json_extract(e.data, '$.requirements') as requirements
       FROM entries e
       JOIN collections col ON e.collection_id = col.id
       WHERE col.slug = 'jobs' AND e.locale = ? AND e.status = 'published'
       ORDER BY e.created_at ASC`
    ).bind(lang).all()
    const items = (results as unknown as Record<string, unknown>[]).map(j => ({
      ...j,
      requirements: (() => { try { return typeof j.requirements === 'string' ? JSON.parse(j.requirements) : j.requirements } catch { return [] } })()
    }))
    return c.json(items)
  } catch (err) {
    // console.error('[legacy] /jobs DB error:', err instanceof Error ? err.message : String(err))
    return c.json({ error: 'Service temporarily unavailable' }, 503)
  }
})

// ── Newsletter (Drizzle) ────────────────────────────────────────
const newsletterSchema = z.object({
  email: z.string().email().max(254),
})

legacy.post('/newsletter', async (c) => {
  try {
    const body = await c.req.json()
    const parsed = newsletterSchema.safeParse(body)
    if (!parsed.success) return c.json({ error: 'Invalid email' }, 400)
    const { email } = parsed.data

    const db = drizzle(c.env.DB)
    const existing = await db.select({ id: newsletter.id })
      .from(newsletter).where(eq(newsletter.email, email)).limit(1)

    // Always return success — prevents email enumeration (A07)
    if (existing.length) return c.json({ success: true })

    await db.insert(newsletter).values({ email })
    return c.json({ success: true })
  } catch (err) {
    // console.error('[security] newsletter error:', err instanceof Error ? err.message : String(err))
    return c.json({ error: 'Failed' }, 500)
  }
})

// ── Form submission (Drizzle) ───────────────────────────────────
const ALLOWED_FORM_TYPES = ['contact', 'careers', 'whistleblower', 'newsletter'] as const

const formSchema = z.object({
  type: z.enum(ALLOWED_FORM_TYPES).optional().default('contact'),
  name: z.string().max(200).optional(),
  email: z.string().email().max(254).optional(),
  message: z.string().max(5000).optional(),
  phone: z.string().max(30).optional(),
  company: z.string().max(200).optional(),
  subject: z.string().max(300).optional(),
  source: z.string().max(200).optional(),
  referrer: z.string().max(200).optional(),
  referrerLabel: z.string().max(200).optional(),
}).passthrough()

legacy.post('/submit-form', async (c) => {
  try {
    const body = await c.req.json()
    const parsed = formSchema.safeParse(body)
    if (!parsed.success) {
      return c.json({ error: 'Invalid form payload', details: parsed.error.issues }, 400)
    }
    const { type, ...rest } = parsed.data

    const db = drizzle(c.env.DB)
    await db.insert(forms).values({
      payload: JSON.stringify(rest),
      source: type,
      status: 'new',
    })

    return c.json({ success: true, message: 'Formulário registrado.' })
  } catch (err) {
    // console.error('[security] form submission error:', err instanceof Error ? err.message : String(err))
    return c.json({ error: 'Failed to submit form' }, 500)
  }
})

export { legacy }
