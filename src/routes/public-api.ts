/**
 * Canal SaaS — Public API Routes
 * 
 * Public endpoints that don't require authentication:
 * - Incidents (n.cirt alert)
 * - DSAR (LGPD)
 * - ATS Apply (job application)
 * - Webhooks (omnichannel)
 */
import { Hono } from 'hono'
import type { Bindings, Variables } from '../index'

type Env = { Bindings: Bindings; Variables: Variables }

export const publicApi = new Hono<Env>()

// ── Incident Alert (n.cirt via Slack) ────────────────────────────
publicApi.post('/incidents', async (c) => {
  const body = await c.req.json().catch(() => ({}))

  if (c.env.SLACK_WEBHOOK_URL) {
    c.executionCtx.waitUntil(
      fetch(c.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 *NOVO INCIDENTE REPORTADO (n.cirt)* 🚨\n\n*Contato:* ${body.contact || 'Não informado'}\n*Descrição:* ${body.description || 'Não informado'}`
        })
      }).catch(err => console.error('Slack alert failed', err))
    )
  }

  return c.json({ success: true, message: 'Equipe de resposta notificada com sucesso.' })
})

// ── DSAR Public (LGPD) ──────────────────────────────────────────
publicApi.post('/dsar', async (c) => {
  const body = await c.req.json().catch(() => ({}))

  if (!body.requester_name || !body.requester_email || !body.request_type || !body.tenant_id) {
    return c.json({ error: 'Campos requeridos ausentes' }, 400)
  }

  const id = crypto.randomUUID()
  const deadline = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()

  try {
    await c.env.DB.prepare(
      "INSERT INTO dsar_requests (id, tenant_id, requester_name, requester_email, request_type, status, details, deadline, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'open', ?, ?, datetime('now'), datetime('now'))"
    ).bind(id, body.tenant_id, body.requester_name, body.requester_email, body.request_type, body.details || '', deadline).run()

    if (c.env.QUEUE) {
      c.env.QUEUE.send({
        type: 'send-email',
        payload: {
          to: body.requester_email,
          subject: 'Confirmação de Solicitação LGPD (DSAR)',
          body: `Olá ${body.requester_name},\n\nRecebemos sua solicitação de privacidade do tipo "${body.request_type}" (Ticket: ${id}).\nSideraremos esta demanda e enviaremos seu pacote de resposta/relatório em até 15 dias úteis (Prazo máximo: ${new Date(deadline).toLocaleDateString('pt-BR')}).\n\nAtt,\nTime de Privacidade Ness`
        }
      })
    }

    return c.json({ success: true, ticket_id: id, deadline })
  } catch {
    return c.json({ error: 'Falha interna' }, 500)
  }
})

// ── ATS Apply (public job application) ──────────────────────────
publicApi.post('/apply', async (c) => {
  try {
    const body = await c.req.parseBody()
    const name = body['name'] as string
    const email = body['email'] as string
    const linkedin = body['linkedin_url'] as string
    const resumeFile = body['resume'] as File
    const tenantId = body['tenant_id'] as string || 'default'
    const jobId = body['job_id'] as string || 'general'

    if (!name || !email || !resumeFile) {
      return c.json({ error: 'Name, email, and resume are required.' }, 400)
    }

    const id = crypto.randomUUID()
    const r2Key = `resumes/${tenantId}/${id}-${resumeFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

    if (c.env.MEDIA) {
      await c.env.MEDIA.put(r2Key, await resumeFile.arrayBuffer(), {
        httpMetadata: { contentType: resumeFile.type }
      })
    }

    await c.env.DB.prepare(
      `INSERT INTO applicants (id, tenant_id, job_id, name, email, linkedin_url, resume_r2_key, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'analyzing', datetime('now'))`
    ).bind(id, tenantId, jobId, name, email, linkedin || '', r2Key).run()

    if (c.env.QUEUE) {
      await c.env.QUEUE.send({
        type: 'process-resume',
        payload: { applicant_id: id, r2_key: r2Key, mime_type: resumeFile.type }
      })
    }

    return c.json({ success: true, applicant_id: id, message: 'Application received and digesting by AI.' }, 202)
  } catch {
    return c.json({ error: 'Internal Server Error processing application.' }, 500)
  }
})

// ── Omnichannel Webhook ─────────────────────────────────────────
publicApi.post('/webhooks/omnichannel', async (c) => {
  const body = await c.req.json().catch(() => ({}))

  const authHeader = c.req.header('Authorization')
  if (authHeader !== `Bearer ${c.env.ADMIN_SETUP_KEY}`) {
    return c.json({ error: 'Unauthorized webhook' }, 401)
  }

  if (!body.message) {
    return c.json({ error: 'Malformed payload' }, 400)
  }

  c.executionCtx.waitUntil(
    (async () => {
      // AI omnichannel triage logic
    })()
  )

  return c.json({ status: 'queued', agent: 'omni-triage' })
})
