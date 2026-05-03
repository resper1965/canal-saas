/**
 * Admin — Leads, Forms, Chats, Applicants, Stats, Activity
 */
import { Hono } from 'hono'
import { desc, eq, sql } from 'drizzle-orm'
import { UpdateStatusSchema } from '../../schemas'
import type { AdminEnv } from './_shared'
import { assertAdmin, getDb, schema } from './_shared'

export const leadsRouter = new Hono<AdminEnv>()

// ── Applicants ──────────────────────────────────────────────────
leadsRouter.get('/applicants', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const db = getDb(c)
  const results = await db.select().from(schema.applicants)
    .orderBy(desc(schema.applicants.created_at)).limit(100)
  return c.json(results)
})

leadsRouter.patch('/applicants/:id', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const id = c.req.param('id')
  const { status } = UpdateStatusSchema.parse(await c.req.json())
  const db = getDb(c)
  await db.update(schema.applicants).set({ status }).where(eq(schema.applicants.id, id))
  return c.json({ success: true })
})

leadsRouter.delete('/applicants/:id', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const id = c.req.param('id')
  const db = getDb(c)
  await db.delete(schema.applicants).where(eq(schema.applicants.id, id))
  return c.json({ success: true })
})

// ── Forms ───────────────────────────────────────────────────────
leadsRouter.get('/forms', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const db = getDb(c)
  const results = await db.select().from(schema.forms)
    .orderBy(desc(schema.forms.created_at)).limit(50)
  return c.json(results)
})

// ── Chats ───────────────────────────────────────────────────────
leadsRouter.get('/chats', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const db = getDb(c)
  const results = await db.select().from(schema.chats)
    .orderBy(desc(schema.chats.updated_at)).limit(50)
  return c.json(results)
})

// ── Leads CRUD ──────────────────────────────────────────────────
leadsRouter.get('/leads', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const status = c.req.query('status')
  const db = getDb(c)
  const q = db.select().from(schema.leads).orderBy(desc(schema.leads.created_at)).limit(100)
  const results = status ? await q.where(eq(schema.leads.status, status)) : await q
  return c.json(results)
})

leadsRouter.patch('/leads/:id', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const id = parseInt(c.req.param('id'), 10)
  const { status } = UpdateStatusSchema.parse(await c.req.json())
  const db = getDb(c)
  await db.update(schema.leads)
    .set({ status, updated_at: new Date().toISOString() })
    .where(eq(schema.leads.id, id))
  return c.json({ success: true })
})

leadsRouter.delete('/leads/:id', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
  const id = parseInt(c.req.param('id'), 10)
  const db = getDb(c)
  await db.delete(schema.leads).where(eq(schema.leads.id, id))
  return c.json({ success: true })
})

// ── Dashboard Stats ─────────────────────────────────────────────
leadsRouter.get('/stats', async (c) => {
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
    totalLeads: leadsCount?.c || 0, newLeads: newLeads?.c || 0,
    totalForms: formsCount?.c || 0, newForms: newForms?.c || 0,
    totalChats: chatsCount?.c || 0, publishedEntries: published?.c || 0,
    totalPosts: posts?.c || 0, totalCases: cases?.c || 0,
    totalJobs: jobs?.c || 0, totalUsers: users?.c || 0,
    weeklyLeads: weeklyLeads || [],
  })
})

// ── Activity Feed ───────────────────────────────────────────────
leadsRouter.get('/activity', async (c) => {
  if (!assertAdmin(c)) return c.json({ error: 'Forbidden' }, 403)
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
