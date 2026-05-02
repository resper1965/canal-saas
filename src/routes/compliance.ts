import { Hono } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import { eq, desc, and, sql, count } from 'drizzle-orm'
import { dsar_requests, whistleblower_cases, policies, consent_logs, audit_logs } from '../db/schema'
import { DEFAULT_BRAND } from '../config'
import { safeParse, CreateDsarSchema, UpdateDsarSchema, CreateWhistleblowerSchema, UpdateWhistleblowerSchema, CreatePolicySchema, UpdatePolicySchema, LogConsentSchema } from '../schemas'

type Env = {
  Bindings: {
    DB: D1Database
    MEDIA: R2Bucket
    RESEND_API_KEY: string
  }
}

const app = new Hono<Env>()

// ── DSAR (Data Subject Access Requests) ─────────────────────────

// POST /api/dsar — Public submission
app.post('/dsar', async (c) => {
  const db = drizzle(c.env.DB)
  const parsed = safeParse(CreateDsarSchema, await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error }, 400)
  const body = parsed.data
  const now = new Date().toISOString()
  const id = crypto.randomUUID()

  // SLA: 15 business days (≈21 calendar days)
  const deadline = new Date()
  deadline.setDate(deadline.getDate() + 21)

  await db.insert(dsar_requests).values({
    id,
    tenant_id: body.tenant_id,
    requester_name: body.name,
    requester_email: body.email,
    requester_document: body.document,
    request_type: body.type,
    description: body.description,
    status: 'received',
    deadline: deadline.toISOString(),
    created_at: now,
    updated_at: now,
  })

  // Send acknowledgment email
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: DEFAULT_BRAND.dpo_email,
        to: body.email,
        subject: `[DSAR] Solicitação recebida — Protocolo ${id.substring(0, 8).toUpperCase()}`,
        html: `
          <h2>Confirmação de Recebimento</h2>
          <p>Olá ${body.name},</p>
          <p>Sua solicitação de <strong>${body.type}</strong> foi recebida com sucesso.</p>
          <p><strong>Protocolo:</strong> ${id.substring(0, 8).toUpperCase()}</p>
          <p><strong>Prazo SLA:</strong> ${deadline.toLocaleDateString('pt-BR')} (15 dias úteis)</p>
          <p>Entraremos em contato em breve.</p>
          <br><p>Equipe de Privacidade — ness.</p>
        `,
      }),
    })
  } catch (e) {
    // console.error('[DSAR] Email error:', e)
  }

  return c.json({ success: true, protocol: id.substring(0, 8).toUpperCase(), sla_deadline: deadline.toISOString() })
})

// GET /api/admin/dsar — List all requests
app.get('/admin/dsar', async (c) => {
  const db = drizzle(c.env.DB)
  const tenantId = c.req.query('tenant_id') || 'ness'
  const requests = await db.select().from(dsar_requests)
    .where(eq(dsar_requests.tenant_id, tenantId))
    .orderBy(desc(dsar_requests.created_at))
  return c.json(requests)
})

// PUT /api/admin/dsar/:id — Update status
app.put('/admin/dsar/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const parsed = safeParse(UpdateDsarSchema, await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error }, 400)
  const body = parsed.data
  const now = new Date().toISOString()

  await db.update(dsar_requests).set({
    status: body.status,
    response_package_url: body.response_package_url,
    resolved_at: body.status === 'resolved' ? now : undefined,
    updated_at: now,
  }).where(eq(dsar_requests.id, id))

  // Audit log
  await db.insert(audit_logs).values({
    id: crypto.randomUUID(),
    tenant_id: body.tenant_id || 'ness',
    user_id: body.actor_id,
    action: `dsar.${body.status}`,
    resource: 'dsar_requests',
    resource_id: id,
    details: JSON.stringify({ previous_status: body.previous_status, new_status: body.status }),
    created_at: now,
  })

  return c.json({ success: true })
})

// POST /api/admin/dsar/:id/upload-response
app.post('/admin/dsar/:id/upload-response', async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const formData = await c.req.formData()
  const file = formData.get('file') as unknown as File
  if (!file) return c.json({ error: 'No file provided' }, 400)

  const key = `dsar/${id}/${file.name}`
  await c.env.MEDIA.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type },
  })

  await db.update(dsar_requests).set({
    response_package_url: key,
    updated_at: new Date().toISOString(),
  }).where(eq(dsar_requests.id, id))

  return c.json({ success: true, key })
})

// ── Whistleblower / Canal de Denúncia ───────────────────────────

function generateCaseCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  const array = new Uint8Array(12)
  crypto.getRandomValues(array)
  for (let i = 0; i < 12; i++) {
    code += chars[array[i] % chars.length]
  }
  return code
}

// POST /api/whistleblower — Anonymous public submission
app.post('/whistleblower', async (c) => {
  const db = drizzle(c.env.DB)
  const parsed = safeParse(CreateWhistleblowerSchema, await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error }, 400)
  const body = parsed.data
  const now = new Date().toISOString()
  const id = crypto.randomUUID()
  const caseCode = generateCaseCode()

  // Encrypt payload using AES-GCM
  const encoder = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode((body.tenant_id || 'ness').padEnd(32, '0').substring(0, 32)),
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  )

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    keyMaterial,
    encoder.encode(JSON.stringify({
      description: body.description,
      category: body.category,
      evidence: body.evidence,
      submitted_at: now,
    }))
  )

  const encryptedPayload = JSON.stringify({
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(encrypted)),
  })

  // SLA: 5 business days (≈7 calendar days)
  const deadline = new Date()
  deadline.setDate(deadline.getDate() + 7)

  await db.insert(whistleblower_cases).values({
    id,
    tenant_id: body.tenant_id || 'ness',
    case_code: caseCode,
    encrypted_payload: encryptedPayload,
    category: body.category,
    status: 'new',
    sla_deadline: deadline.toISOString(),
    created_at: now,
    updated_at: now,
  })

  // NO IP, NO identity — return only case code
  return c.json({ case_code: caseCode, message: 'Report submitted anonymously. Use this code to check status.' })
})

// GET /api/whistleblower/:code — Public status check
app.get('/whistleblower/:code', async (c) => {
  const db = drizzle(c.env.DB)
  const code = c.req.param('code')
  const [kase] = await db.select({
    case_code: whistleblower_cases.case_code,
    status: whistleblower_cases.status,
    category: whistleblower_cases.category,
    created_at: whistleblower_cases.created_at,
  }).from(whistleblower_cases).where(eq(whistleblower_cases.case_code, code)).limit(1)

  if (!kase) return c.json({ error: 'Case not found' }, 404)
  return c.json(kase)
})

// POST /api/whistleblower/:code/followup — Add follow-up info
app.post('/whistleblower/:code/followup', async (c) => {
  const db = drizzle(c.env.DB)
  const code = c.req.param('code')
  const body = await c.req.json()

  const [kase] = await db.select().from(whistleblower_cases).where(eq(whistleblower_cases.case_code, code)).limit(1)
  if (!kase) return c.json({ error: 'Case not found' }, 404)

  // Append follow-up — store as officer_notes (encrypted in production; simplified for MVP)
  const notes = kase.officer_notes ? `${kase.officer_notes}\n---\n[Follow-up ${new Date().toISOString()}]: ${body.message}` : `[Follow-up ${new Date().toISOString()}]: ${body.message}`
  await db.update(whistleblower_cases).set({
    officer_notes: notes,
    updated_at: new Date().toISOString(),
  }).where(eq(whistleblower_cases.case_code, code))

  return c.json({ success: true })
})

// GET /api/admin/whistleblower — List all cases
app.get('/admin/whistleblower', async (c) => {
  const db = drizzle(c.env.DB)
  const tenantId = c.req.query('tenant_id') || 'ness'
  const cases = await db.select({
    id: whistleblower_cases.id,
    case_code: whistleblower_cases.case_code,
    category: whistleblower_cases.category,
    status: whistleblower_cases.status,
    sla_deadline: whistleblower_cases.sla_deadline,
    created_at: whistleblower_cases.created_at,
    updated_at: whistleblower_cases.updated_at,
  }).from(whistleblower_cases)
    .where(eq(whistleblower_cases.tenant_id, tenantId))
    .orderBy(desc(whistleblower_cases.created_at))

  return c.json(cases)
})

// PUT /api/admin/whistleblower/:id — Update status
app.put('/admin/whistleblower/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const parsed = safeParse(UpdateWhistleblowerSchema, await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error }, 400)
  const body = parsed.data

  await db.update(whistleblower_cases).set({
    status: body.status,
    officer_notes: body.officer_notes,
    updated_at: new Date().toISOString(),
  }).where(eq(whistleblower_cases.id, id))

  return c.json({ success: true })
})

// ── Policies & Terms ────────────────────────────────────────────

// GET /api/policies/:type?lang=pt — Public
app.get('/policies/:type', async (c) => {
  const db = drizzle(c.env.DB)
  const type = c.req.param('type')
  const locale = c.req.query('lang') || 'pt'

  const [policy] = await db.select().from(policies)
    .where(and(
      eq(policies.type, type),
      eq(policies.locale, locale),
      eq(policies.status, 'published'),
    ))
    .orderBy(desc(policies.version))
    .limit(1)

  if (!policy) return c.json({ error: 'Policy not found' }, 404)
  c.header('Cache-Control', 'public, max-age=3600')
  return c.json(policy)
})

// GET /api/admin/policies — List all
app.get('/admin/policies', async (c) => {
  const db = drizzle(c.env.DB)
  const tenantId = c.req.query('tenant_id') || 'ness'
  const all = await db.select().from(policies)
    .where(eq(policies.tenant_id, tenantId))
    .orderBy(desc(policies.updated_at))
  return c.json(all)
})

// POST /api/admin/policies — Create
app.post('/admin/policies', async (c) => {
  const db = drizzle(c.env.DB)
  const parsed = safeParse(CreatePolicySchema, await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error }, 400)
  const body = parsed.data
  const now = new Date().toISOString()
  const id = crypto.randomUUID()

  await db.insert(policies).values({
    id,
    tenant_id: body.tenant_id,
    type: body.type,
    locale: body.locale,
    title: body.title,
    body_md: body.body_md,
    version: body.version,
    status: body.status,
    effective_date: body.effective_date,
    created_by: body.created_by,
    created_at: now,
    updated_at: now,
  })

  return c.json({ success: true, id })
})

// PUT /api/admin/policies/:id — Update
app.put('/admin/policies/:id', async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const parsed = safeParse(UpdatePolicySchema, await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error }, 400)
  const body = parsed.data
  const now = new Date().toISOString()

  await db.update(policies).set({
    title: body.title,
    body_md: body.body_md,
    status: body.status,
    effective_date: body.effective_date,
    updated_at: now,
  }).where(eq(policies.id, id))

  return c.json({ success: true })
})

// POST /api/admin/policies/:id/publish — Publish with new version
app.post('/admin/policies/:id/publish', async (c) => {
  const db = drizzle(c.env.DB)
  const id = c.req.param('id')
  const now = new Date().toISOString()

  const [current] = await db.select().from(policies).where(eq(policies.id, id)).limit(1)
  if (!current) return c.json({ error: 'Policy not found' }, 404)

  // Create immutable version snapshot
  const newId = crypto.randomUUID()
  await db.insert(policies).values({
    ...current,
    id: newId,
    version: current.version + 1,
    status: 'published',
    effective_date: now,
    updated_at: now,
  })

  // Update original to published
  await db.update(policies).set({
    status: 'published',
    version: current.version + 1,
    effective_date: now,
    updated_at: now,
  }).where(eq(policies.id, id))

  return c.json({ success: true, new_version: current.version + 1 })
})

// ── Consent Logging ─────────────────────────────────────────────

// POST /api/consent — Public
app.post('/consent', async (c) => {
  const db = drizzle(c.env.DB)
  const parsed = safeParse(LogConsentSchema, await c.req.json())
  if (!parsed.success) return c.json({ error: parsed.error }, 400)
  const body = parsed.data

  await db.insert(consent_logs).values({
    tenant_id: body.tenant_id,
    user_identifier: body.user_id || body.fingerprint,
    policy_id: body.policy_id,
    policy_version: body.policy_version,
    action: body.action,
    ip_address: c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for'),
    user_agent: c.req.header('user-agent'),
    created_at: new Date().toISOString(),
  })

  return c.json({ success: true })
})

// GET /api/admin/consent-logs
app.get('/admin/consent-logs', async (c) => {
  const db = drizzle(c.env.DB)
  const tenantId = c.req.query('tenant_id') || 'ness'
  const logs = await db.select().from(consent_logs)
    .where(eq(consent_logs.tenant_id, tenantId))
    .orderBy(desc(consent_logs.created_at))
    .limit(100)
  return c.json(logs)
})

export default app
