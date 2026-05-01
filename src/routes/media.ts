/**
 * Canal CMS — Media Routes (R2 Upload + Gallery)
 *
 * Upload via multipart/form-data.
 * Metadados no D1 (Drizzle), arquivos no R2.
 */

import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, desc, like, sql } from 'drizzle-orm'
import { mediaTable } from '../db/schema'

type Env = {
  Bindings: {
    DB: D1Database
    MEDIA: R2Bucket
  }
}

const media = new Hono<Env>()

function getDb(c: { env: { DB: D1Database } }) {
  return drizzle(c.env.DB)
}

// ── Upload direto (multipart) ───────────────────────────────────
media.post('/media/upload', async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file') as File | null

  if (!file) return c.json({ error: 'No file provided' }, 400)

  const id = crypto.randomUUID()
  const ext = file.name.split('.').pop() || 'bin'
  const r2Key = `uploads/${new Date().toISOString().slice(0, 7)}/${id}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  await c.env.MEDIA.put(r2Key, arrayBuffer, {
    httpMetadata: { contentType: file.type },
  })

  const db = getDb(c)
  await db.insert(mediaTable).values({
    id,
    filename: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    r2_key: r2Key,
    width: null,
    height: null,
    created_at: new Date().toISOString(),
  })

  return c.json({
    id,
    filename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    r2Key,
    url: `/api/v1/media/${id}/file`,
  }, 201)
})

// ── Listar media (galeria) ──────────────────────────────────────
media.get('/media', async (c) => {
  const page = parseInt(c.req.query('page') || '1', 10)
  const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100)
  const offset = (page - 1) * limit
  const mimeFilter = c.req.query('type')

  const db = getDb(c)

  const baseWhere = mimeFilter ? like(mediaTable.mime_type, `${mimeFilter}/%`) : undefined

  const results = baseWhere
    ? await db.select().from(mediaTable).where(baseWhere).orderBy(desc(mediaTable.created_at)).limit(limit).offset(offset)
    : await db.select().from(mediaTable).orderBy(desc(mediaTable.created_at)).limit(limit).offset(offset)

  const countResult = baseWhere
    ? await db.select({ total: sql<number>`COUNT(*)` }).from(mediaTable).where(baseWhere)
    : await db.select({ total: sql<number>`COUNT(*)` }).from(mediaTable)

  return c.json({
    data: results.map(row => ({
      id: row.id,
      filename: row.filename,
      mimeType: row.mime_type,
      sizeBytes: row.size_bytes,
      altText: row.alt_text,
      width: row.width,
      height: row.height,
      url: `/api/v1/media/${row.id}/file`,
      createdAt: row.created_at,
    })),
    meta: { page, limit, total: countResult[0]?.total ?? 0 }
  })
})

// ── Servir arquivo do R2 ────────────────────────────────────────
media.get('/media/:id/file', async (c) => {
  const id = c.req.param('id')
  const db = getDb(c)
  const rows = await db.select({
    r2_key: mediaTable.r2_key,
    mime_type: mediaTable.mime_type,
    filename: mediaTable.filename,
  }).from(mediaTable).where(eq(mediaTable.id, id)).limit(1)

  const row = rows[0]
  if (!row) return c.json({ error: 'Not found' }, 404)

  const object = await c.env.MEDIA.get(row.r2_key)
  if (!object) return c.json({ error: 'File not found in storage' }, 404)

  const headers = new Headers()
  headers.set('Content-Type', row.mime_type)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  headers.set('Content-Disposition', `inline; filename="${row.filename}"`)

  return new Response(object.body, { headers })
})

// ── Metadados de um arquivo ─────────────────────────────────────
media.get('/media/:id', async (c) => {
  const id = c.req.param('id')
  const db = getDb(c)
  const rows = await db.select().from(mediaTable).where(eq(mediaTable.id, id)).limit(1)
  const r = rows[0]
  if (!r) return c.json({ error: 'Not found' }, 404)

  return c.json({
    id: r.id,
    filename: r.filename,
    mimeType: r.mime_type,
    sizeBytes: r.size_bytes,
    altText: r.alt_text,
    width: r.width,
    height: r.height,
    r2Key: r.r2_key,
    url: `/api/v1/media/${r.id}/file`,
    createdAt: r.created_at,
  })
})

// ── Atualizar alt text ──────────────────────────────────────────
media.put('/media/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ altText?: string }>()
  const db = getDb(c)
  await db.update(mediaTable)
    .set({ alt_text: body.altText || null })
    .where(eq(mediaTable.id, id))
  return c.json({ success: true, id })
})

// ── Deletar media ───────────────────────────────────────────────
media.delete('/media/:id', async (c) => {
  const id = c.req.param('id')
  const db = getDb(c)
  const rows = await db.select({ r2_key: mediaTable.r2_key })
    .from(mediaTable).where(eq(mediaTable.id, id)).limit(1)
  const row = rows[0]
  if (!row) return c.json({ error: 'Not found' }, 404)

  await c.env.MEDIA.delete(row.r2_key)
  await db.delete(mediaTable).where(eq(mediaTable.id, id))

  return c.json({ success: true, deleted: id })
})

export { media }
