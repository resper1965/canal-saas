/**
 * Canal SaaS — Platform Features API
 * 
 * Activity Feed, Notifications, Entry Versioning, Comments/Approvals.
 */

import { Hono } from 'hono'
import type { AdminEnv } from './_shared'

const features = new Hono<AdminEnv>()

// ── Activity Feed (Audit Logs exposed) ──────────────────────────

features.get('/activity', async (c) => {
  const tenantId = c.get('tenantId') || c.req.header('x-tenant-id')
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100)
  const offset = parseInt(c.req.query('offset') || '0')
  const resource = c.req.query('resource') // optional filter

  let query = 'SELECT id, user_id, action, resource, resource_id, details, ip_address, created_at FROM audit_logs'
  const params: string[] = []

  if (tenantId) {
    query += ' WHERE tenant_id = ?'
    params.push(tenantId)
    if (resource) {
      query += ' AND resource = ?'
      params.push(resource)
    }
  } else if (resource) {
    query += ' WHERE resource = ?'
    params.push(resource)
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(String(limit), String(offset))

  const stmt = c.env.DB.prepare(query)
  const result = await stmt.bind(...params).all()

  // Enrich with user names
  const userIds = [...new Set((result.results || []).map((r: any) => r.user_id).filter(Boolean))]
  let userMap: Record<string, string> = {}
  if (userIds.length > 0) {
    const placeholders = userIds.map(() => '?').join(',')
    const users = await c.env.DB.prepare(
      `SELECT id, name, email FROM user WHERE id IN (${placeholders})`
    ).bind(...userIds).all()
    for (const u of (users.results || []) as any[]) {
      userMap[u.id] = u.name || u.email || 'Unknown'
    }
  }

  const enriched = (result.results || []).map((r: any) => ({
    ...r,
    user_name: userMap[r.user_id] || 'System',
    details: r.details ? JSON.parse(r.details) : null,
  }))

  return c.json({ data: enriched, total: enriched.length })
})

// ── Notifications ───────────────────────────────────────────────

features.get('/notifications', async (c) => {
  const session = c.get('session') as any
  const userId = session?.user?.id
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)

  const unreadOnly = c.req.query('unread') === 'true'
  const limit = Math.min(parseInt(c.req.query('limit') || '20'), 50)

  let query = 'SELECT * FROM notifications WHERE user_id = ?'
  const params: any[] = [userId]
  
  if (unreadOnly) {
    query += ' AND read_at IS NULL'
  }
  
  query += ' ORDER BY created_at DESC LIMIT ?'
  params.push(limit)

  const result = await c.env.DB.prepare(query).bind(...params).all()

  // Count unread
  const unread = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_at IS NULL'
  ).bind(userId).first<{ count: number }>()

  return c.json({
    data: result.results || [],
    unread_count: unread?.count || 0,
  })
})

features.post('/notifications/:id/read', async (c) => {
  const session = c.get('session') as any
  const userId = session?.user?.id
  if (!userId) return c.json({ error: 'Unauthorized' }, 401)

  const id = c.req.param('id')
  
  if (id === 'all') {
    await c.env.DB.prepare(
      "UPDATE notifications SET read_at = datetime('now') WHERE user_id = ? AND read_at IS NULL"
    ).bind(userId).run()
  } else {
    await c.env.DB.prepare(
      "UPDATE notifications SET read_at = datetime('now') WHERE id = ? AND user_id = ?"
    ).bind(id, userId).run()
  }

  return c.json({ success: true })
})

// ── Entry Versions ──────────────────────────────────────────────

features.get('/entries/:entryId/versions', async (c) => {
  const entryId = c.req.param('entryId')
  const result = await c.env.DB.prepare(
    'SELECT id, version, changed_by, diff_summary, created_at FROM entry_versions WHERE entry_id = ? ORDER BY version DESC'
  ).bind(entryId).all()

  return c.json({ data: result.results || [] })
})

features.get('/entries/:entryId/versions/:versionId', async (c) => {
  const versionId = c.req.param('versionId')
  const result = await c.env.DB.prepare(
    'SELECT * FROM entry_versions WHERE id = ?'
  ).bind(versionId).first()

  if (!result) return c.json({ error: 'Version not found' }, 404)
  return c.json({ data: { ...result, data: JSON.parse((result as any).data || '{}') } })
})

features.post('/entries/:entryId/versions/:versionId/restore', async (c) => {
  const entryId = c.req.param('entryId')
  const versionId = c.req.param('versionId')

  const version = await c.env.DB.prepare(
    'SELECT data FROM entry_versions WHERE id = ? AND entry_id = ?'
  ).bind(versionId, entryId).first<{ data: string }>()

  if (!version) return c.json({ error: 'Version not found' }, 404)

  await c.env.DB.prepare(
    "UPDATE entries SET data = ?, updated_at = datetime('now') WHERE id = ?"
  ).bind(version.data, entryId).run()

  return c.json({ success: true, message: 'Entry restored to version' })
})

// ── Comments (Approval Workflow) ────────────────────────────────

features.get('/entries/:entryId/comments', async (c) => {
  const entryId = c.req.param('entryId')
  const result = await c.env.DB.prepare(
    'SELECT * FROM comments WHERE entry_id = ? ORDER BY created_at ASC'
  ).bind(entryId).all()

  return c.json({ data: result.results || [] })
})

features.post('/entries/:entryId/comments', async (c) => {
  const entryId = c.req.param('entryId')
  const session = c.get('session') as any
  const userId = session?.user?.id
  const userName = session?.user?.name || session?.user?.email

  const { body } = await c.req.json<{ body: string }>()
  if (!body?.trim()) return c.json({ error: 'Comment body required' }, 400)

  const id = crypto.randomUUID()
  await c.env.DB.prepare(
    "INSERT INTO comments (id, entry_id, user_id, user_name, body, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))"
  ).bind(id, entryId, userId, userName, body.trim()).run()

  return c.json({ success: true, id })
})

features.post('/entries/:entryId/comments/:commentId/resolve', async (c) => {
  const commentId = c.req.param('commentId')
  await c.env.DB.prepare(
    "UPDATE comments SET resolved_at = datetime('now') WHERE id = ?"
  ).bind(commentId).run()

  return c.json({ success: true })
})

// ── Approval Workflow ───────────────────────────────────────────

features.post('/entries/:entryId/submit-review', async (c) => {
  const entryId = c.req.param('entryId')
  const session = c.get('session') as any

  await c.env.DB.prepare(
    "UPDATE entries SET status = 'in_review', updated_at = datetime('now'), updated_by = ? WHERE id = ?"
  ).bind(session?.user?.id, entryId).run()

  // Create notification for admins/editors
  const tenantId = c.get('tenantId')
  if (tenantId) {
    const members = await c.env.DB.prepare(
      "SELECT userId FROM member WHERE organizationId = ? AND role IN ('admin', 'owner')"
    ).bind(tenantId).all()

    const entry = await c.env.DB.prepare(
      "SELECT json_extract(data, '$.title') as title FROM entries WHERE id = ?"
    ).bind(entryId).first<{ title: string }>()

    for (const m of (members.results || []) as any[]) {
      if (m.userId === session?.user?.id) continue
      await c.env.DB.prepare(
        "INSERT INTO notifications (id, tenant_id, user_id, type, title, body, action_url, created_at) VALUES (?, ?, ?, 'review_requested', ?, ?, ?, datetime('now'))"
      ).bind(
        crypto.randomUUID(), tenantId, m.userId,
        `Revisão solicitada: ${entry?.title || 'Entry'}`,
        `${session?.user?.name || 'Alguém'} enviou para revisão`,
        `/content/${entryId}`
      ).run()
    }
  }

  return c.json({ success: true, status: 'in_review' })
})

features.post('/entries/:entryId/approve', async (c) => {
  const entryId = c.req.param('entryId')
  const session = c.get('session') as any

  await c.env.DB.prepare(
    "UPDATE entries SET status = 'approved', updated_at = datetime('now'), updated_by = ? WHERE id = ?"
  ).bind(session?.user?.id, entryId).run()

  return c.json({ success: true, status: 'approved' })
})

features.post('/entries/:entryId/reject', async (c) => {
  const entryId = c.req.param('entryId')
  const session = c.get('session') as any
  const { reason } = await c.req.json<{ reason?: string }>()

  await c.env.DB.prepare(
    "UPDATE entries SET status = 'draft', updated_at = datetime('now'), updated_by = ? WHERE id = ?"
  ).bind(session?.user?.id, entryId).run()

  if (reason) {
    await c.env.DB.prepare(
      "INSERT INTO comments (id, entry_id, user_id, user_name, body, created_at) VALUES (?, ?, ?, ?, ?, datetime('now'))"
    ).bind(crypto.randomUUID(), entryId, session?.user?.id, session?.user?.name, `❌ Rejeitado: ${reason}`).run()
  }

  return c.json({ success: true, status: 'draft' })
})

// ── Global Search ───────────────────────────────────────────────

features.get('/search', async (c) => {
  const q = c.req.query('q')?.trim()
  if (!q || q.length < 2) return c.json({ results: [] })

  const tenantId = c.get('tenantId') || c.req.header('x-tenant-id')
  const searchPattern = `%${q}%`

  const [entriesResult, leadsResult, commentsResult] = await Promise.all([
    c.env.DB.prepare(
      "SELECT id, 'entry' as type, json_extract(data, '$.title') as title, slug, status, collection_id, created_at FROM entries WHERE tenant_id = ? AND (json_extract(data, '$.title') LIKE ? OR json_extract(data, '$.body') LIKE ? OR slug LIKE ?) ORDER BY created_at DESC LIMIT 10"
    ).bind(tenantId, searchPattern, searchPattern, searchPattern).all(),

    c.env.DB.prepare(
      "SELECT id, 'lead' as type, name as title, contact, status, created_at FROM leads WHERE tenant_id = ? AND (name LIKE ? OR contact LIKE ? OR intent LIKE ?) ORDER BY created_at DESC LIMIT 10"
    ).bind(tenantId, searchPattern, searchPattern, searchPattern).all(),

    c.env.DB.prepare(
      "SELECT c.id, 'comment' as type, c.body as title, c.entry_id, c.user_name, c.created_at FROM comments c INNER JOIN entries e ON c.entry_id = e.id WHERE e.tenant_id = ? AND c.body LIKE ? ORDER BY c.created_at DESC LIMIT 5"
    ).bind(tenantId, searchPattern).all(),
  ])

  return c.json({
    results: [
      ...(entriesResult.results || []),
      ...(leadsResult.results || []),
      ...(commentsResult.results || []),
    ],
    query: q,
  })
})

export { features }
