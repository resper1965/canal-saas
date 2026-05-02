/**
 * Canal CMS — Marketing Hub Routes
 *
 * /api/v1/marketing/signature/:slug  → Gera HTML da assinatura de email
 * /api/v1/marketing/signature/:slug/preview → Preview visual
 * 
 * Partially migrated to Drizzle. json_extract queries kept as raw SQL.
 */

import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, and } from 'drizzle-orm'
import * as schema from '../db/schema'
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
  }
}

import { SUB_BRANDS } from '../config'

const BRAND_CONFIG = SUB_BRANDS

const marketing = new Hono<Env>()

function getDb(c: { env: { DB: D1Database } }) {
  return drizzle(c.env.DB, { schema })
}

// ── Gera HTML inline para assinatura de email ───────────────────
marketing.get('/marketing/signature/:slug', async (c) => {
  const slug = c.req.param('slug')
  const format = c.req.query('format') || 'html'

  const db = getDb(c)
  const col = await db.select({ id: schema.collections.id })
    .from(schema.collections)
    .where(eq(schema.collections.slug, 'signatures'))
    .limit(1)

  if (!col.length) return c.json({ error: 'Signatures collection not found' }, 404)

  const entryRows = await db.select()
    .from(schema.entries)
    .where(and(
      eq(schema.entries.collection_id, col[0].id),
      eq(schema.entries.slug, slug),
      eq(schema.entries.status, 'published'),
    ))
    .limit(1)

  if (!entryRows.length) return c.json({ error: 'Signature not found' }, 404)

  const data = safeParseJSON(entryRows[0].data)
  const brand = BRAND_CONFIG[data.brand as string] ?? BRAND_CONFIG.ness

  if (format === 'json') return c.json({ data, brand })

  const html = generateSignatureHTML(data, brand)
  c.header('Content-Type', 'text/html; charset=utf-8')
  c.header('Cache-Control', 'public, max-age=3600')
  return c.body(html)
})

// ── Preview visual ──────────────────────────────────────────────
marketing.get('/marketing/signature/:slug/preview', async (c) => {
  const slug = c.req.param('slug')

  const db = getDb(c)
  const col = await db.select({ id: schema.collections.id })
    .from(schema.collections)
    .where(eq(schema.collections.slug, 'signatures'))
    .limit(1)

  if (!col.length) return c.json({ error: 'Signatures collection not found' }, 404)

  const entryRows = await db.select()
    .from(schema.entries)
    .where(and(
      eq(schema.entries.collection_id, col[0].id),
      eq(schema.entries.slug, slug),
    ))
    .limit(1)

  if (!entryRows.length) return c.json({ error: 'Signature not found' }, 404)

  const data = safeParseJSON(entryRows[0].data)
  const brand = BRAND_CONFIG[data.brand as string] ?? BRAND_CONFIG.ness
  const signatureHtml = generateSignatureHTML(data, brand)

  const previewPage = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Assinatura — ${data.name}</title>
  <style>
    * { margin: 0; box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; background: #f5f5f5; padding: 40px; display: flex; flex-direction: column; align-items: center; gap: 20px; }
    h1 { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 2px; }
    .preview { background: white; padding: 32px; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); max-width: 700px; width: 100%; }
    .actions { display: flex; gap: 12px; }
    .actions button { padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer; font-size: 13px; }
    .actions button:hover { background: #f0f0f0; }
  </style>
</head>
<body>
  <h1>Preview da Assinatura</h1>
  <div class="preview" id="sig">${signatureHtml}</div>
  <div class="actions">
    <button onclick="copyHTML()">📋 Copiar HTML</button>
    <button onclick="selectAll()">✅ Selecionar Tudo</button>
  </div>
  <script>
    function copyHTML() {
      navigator.clipboard.writeText(document.getElementById('sig').innerHTML);
      alert('HTML copiado!');
    }
    function selectAll() {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById('sig'));
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  </script>
</body>
</html>`

  c.header('Content-Type', 'text/html; charset=utf-8')
  return c.body(previewPage)
})

// ── Lista todas as assinaturas (Drizzle) ────────────────────────
marketing.get('/marketing/signatures', async (c) => {
  const db = getDb(c)
  const col = await db.select({ id: schema.collections.id })
    .from(schema.collections)
    .where(eq(schema.collections.slug, 'signatures'))
    .limit(1)

  if (!col.length) return c.json({ data: [] })

  const results = await db.query.entries.findMany({
    where: eq(schema.entries.collection_id, col[0].id),
    orderBy: (e, { desc }) => [desc(e.created_at)],
  })

  const items = results.map(row => ({
    id: row.id,
    slug: row.slug,
    status: row.status,
    ...safeParseJSON(row.data),
    previewUrl: `/api/v1/marketing/signature/${row.slug}/preview`,
    htmlUrl: `/api/v1/marketing/signature/${row.slug}`,
  }))

  return c.json({ data: items })
})

// ── Brand config público ────────────────────────────────────────
marketing.get('/marketing/brands', (c) => {
  return c.json({ data: BRAND_CONFIG })
})

// ── Helpers ─────────────────────────────────────────────────────

function safeParseJSON(str: unknown): Record<string, unknown> {
  if (typeof str !== 'string') return {}
  try { return JSON.parse(str) } catch { return {} }
}

function generateSignatureHTML(
  data: Record<string, unknown>,
  brand: typeof BRAND_CONFIG[string]
): string {
  const name = data.name as string || ''
  const role = data.role as string || ''
  const email = data.email as string || ''
  const phone = data.phone as string || ''
  const linkedin = data.linkedin as string || ''
  const photoUrl = data.photo_url as string || ''

  const photoCell = photoUrl ? `
    <td style="vertical-align:top;padding-right:16px;">
      <img src="${photoUrl}" width="72" height="72" style="border-radius:50%;border:2px solid ${brand.color};" alt="${name}">
    </td>` : ''

  const linkedinLink = linkedin ? `
    <tr>
      <td style="padding-top:6px;">
        <a href="${linkedin}" style="color:${brand.color};text-decoration:none;font-size:12px;font-family:-apple-system,Arial,sans-serif;">
          LinkedIn ↗
        </a>
      </td>
    </tr>` : ''

  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#333;">
  <tr>
    ${photoCell}
    <td style="vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-size:16px;font-weight:700;color:#1a1a1a;padding-bottom:2px;line-height:1.3;">${name}</td></tr>
        <tr><td style="font-size:13px;color:#666;padding-bottom:8px;line-height:1.3;">${role}</td></tr>
        <tr>
          <td style="border-top:2px solid ${brand.color};padding-top:8px;">
            <table cellpadding="0" cellspacing="0" border="0">
              <tr><td style="font-size:12px;color:#444;line-height:1.6;font-family:-apple-system,Arial,sans-serif;">
                <a href="mailto:${email}" style="color:#333;text-decoration:none;">${email}</a>
                ${phone ? `<br><span style="color:#888;">${phone}</span>` : ''}
              </td></tr>
              ${linkedinLink}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding-top:10px;">
            <span style="font-size:14px;font-weight:700;color:${brand.color};letter-spacing:-0.5px;">${brand.name}</span>
            <span style="font-size:11px;color:#999;padding-left:6px;">${brand.tagline}</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`
}

export { marketing }
