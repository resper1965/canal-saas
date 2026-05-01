/**
 * Canal CMS — Main Worker Entry Point (v3)
 *
 * Arquitetura modular:
 *   /api/*          → Rotas legadas (retrocompat site público)
 *   /api/v1/*       → API CMS genérica (collections, entries, media)
 *   /api/auth/*     → Better Auth
 *   /api/chat       → RAG chatbot
 *   /api/admin/*    → Rotas administrativas protegidas
 */

import { Hono, Context } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { streamText } from 'ai'
import { z } from 'zod'
import { createWorkersAI } from 'workers-ai-provider'
import { createAuth } from './auth'
import { seedVectors } from './seed-vectors'
import { entries } from './routes/entries'
import { media } from './routes/media'
import { marketing } from './routes/marketing'
import { legacy } from './routes/legacy'
import { aiWriter } from './routes/ai-writer'
import { handleMcpRequest } from './mcp'
import { MODEL_HEAVY } from './ai/models'

export type Bindings = {
  DB: D1Database
  AI: Ai
  VECTORIZE: VectorizeIndex
  MEDIA: R2Bucket
  CANAL_KV: KVNamespace
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL: string
  ADMIN_SETUP_KEY: string
  RESEND_API_KEY: string
  SLACK_WEBHOOK_URL?: string
  AGENT_DO: DurableObjectNamespace
  QUEUE: Queue
  ANALYTICS: any
}

type Variables = {
  tenantId?: string;
  agentSession?: any;
  session?: any;
}

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>()

// ── Observability & Telemetry (Fase 6) ────────────────────────────
app.use('*', async (c, next) => {
  const start = Date.now()
  await next()
  
  if (c.env.ANALYTICS) {
    const elapsed = Date.now() - start
    const path = c.req.path
    const tenantId = c.get('tenantId') || 'unknown'
    const status = c.res.status

    c.env.ANALYTICS.writeDataPoint({
      blobs: [tenantId, path, c.req.method],
      doubles: [elapsed, status],
      indexes: [tenantId]
    })
  }
})

// ── CORS & Security ───────────────────────────────────────────────
app.use('/*', secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://static.cloudflareinsights.com", "https://unpkg.com", "https://cdn.tailwindcss.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "blob:", "https://*.ness.com.br", "https://*.r2.dev"],
    connectSrc: ["'self'", "https://api.resend.com", "https://canal.ness.com.br"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
  },
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
    payment: [],
    usb: [],
    fullscreen: ["self"],
  },
}))
app.use('/*', cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8787',
    'https://canal.ness.com.br',
    'https://ness-site2026.pages.dev',
    'https://ness.com.br',
    'https://www.ness.com.br',
    'https://forense.io',
    'https://www.forense.io',
    'https://trustness.com.br',
    'https://www.trustness.com.br',
  ],
  allowHeaders: ['Content-Type', 'Authorization', 'x-setup-key', 'x-session-id', 'x-tenant-id'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}))

// ── Better Auth ─────────────────────────────────────────────────
app.all('/api/auth/*', (c) => {
  const auth = createAuth(c.env.DB, c.env.BETTER_AUTH_SECRET, c.env.BETTER_AUTH_URL)
  return auth.handler(c.req.raw)
})

// ── Auth Middleware (SaaS / Tenant Isolator) ───────────────────
async function requireSession(c: Context<{ Bindings: Bindings, Variables: Variables }>, next: () => Promise<void>) {
  const auth = createAuth(c.env.DB, c.env.BETTER_AUTH_SECRET, c.env.BETTER_AUTH_URL)
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  
  // Extrai Tenant explícito, ou da sessão ativa do usuário
  const tenantId = c.req.header('x-tenant-id') || session?.session?.activeOrganizationId || undefined;
  c.set('tenantId', tenantId);
  c.set('session', session)
  await next()
}

async function requireAdminOrKey(c: Context<{ Bindings: Bindings, Variables: Variables }>, next: () => Promise<void>) {
  const setupKey = c.req.header('x-setup-key')
  if (setupKey === c.env.ADMIN_SETUP_KEY) {
    await next()
    return
  }
  const auth = createAuth(c.env.DB, c.env.BETTER_AUTH_SECRET, c.env.BETTER_AUTH_URL)
  
  // Se for AI Agent usando Token (MCP via Agent Auth)
  const agentSession = await auth.api.getAgentSession?.({ headers: c.req.raw.headers }).catch(() => null)
  if (agentSession) {
    c.set('agentSession', agentSession);
    await next();
    return;
  }

  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  const tenantId = c.req.header('x-tenant-id') || session?.session?.activeOrganizationId || undefined;
  c.set('tenantId', tenantId);
  c.set('session', session)
  await next()
}

// ── Root (A05: no info disclosure) ──────────────────────────────
app.get('/', (c) => c.json({ name: 'Canal CMS', status: 'ok' }))


// ── Agent Discovery (/.well-known) ──────────────────────────────
app.all('/.well-known/agent-configuration', (c) => {
  const auth = createAuth(c.env.DB, c.env.BETTER_AUTH_SECRET, c.env.BETTER_AUTH_URL)
  return auth.handler(c.req.raw)
})

// ── Mount: Rotas legadas (retrocompat site) ─────────────────────
app.route('/api', legacy)

// ── Webhook Alerta n.cirt ───────────────────────────────────────
app.post('/api/incidents', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  
  // Alerta via Webhook gratuito isolado pra não travar a req (Free Tier)
  if (c.env.SLACK_WEBHOOK_URL) {
    c.executionCtx.waitUntil(
      fetch(c.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 *NOVO INCIDENTE REPORTADO (n.cirt)* 🚨\n\n*Contato:* ${body.contact || 'Não informado'}\n*Descrição:* ${body.description || 'Não informado'}`
        })
      }).catch(err => console.error("Slack alert failed", err))
    );
  }

  return c.json({ success: true, message: 'Equipe de resposta notificada com sucesso.' });
})

// ── DSAR Pública (LGPD) ─────────────────────────────────────────
app.post('/api/dsar', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  
  if (!body.requester_name || !body.requester_email || !body.request_type || !body.tenant_id) {
    return c.json({ error: 'Campos requeridos ausentes' }, 400);
  }

  const id = crypto.randomUUID();
  // 15 dias úteis, simplificando para 20 dias corridos
  const deadline = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();
  
  try {
    await c.env.DB.prepare(
      "INSERT INTO dsar_requests (id, tenant_id, requester_name, requester_email, request_type, status, details, deadline, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'open', ?, ?, datetime('now'), datetime('now'))"
    ).bind(id, body.tenant_id, body.requester_name, body.requester_email, body.request_type, body.details || '', deadline).run();

    // Enviar email via Fila
    if (c.env.QUEUE) {
      c.env.QUEUE.send({
        type: 'send-email',
        payload: {
          to: body.requester_email,
          subject: 'Confirmação de Solicitação LGPD (DSAR)',
          body: `Olá ${body.requester_name},\n\nRecebemos sua solicitação de privacidade do tipo "${body.request_type}" (Ticket: ${id}).\nSideraremos esta demanda e enviaremos seu pacote de resposta/relatório em até 15 dias úteis (Prazo máximo: ${new Date(deadline).toLocaleDateString('pt-BR')}).\n\nAtt,\nTime de Privacidade Ness`
        }
      });
    }

    return c.json({ success: true, ticket_id: id, deadline });
  } catch (err) {
    console.error('Failed to create DSAR', err);
    return c.json({ error: 'Falha interna' }, 500);
  }
})

// ── ATS Applicant Tracking (Upload via Fila p/ AI) ────────────────
app.post('/api/apply', async (c) => {
  try {
    const body = await c.req.parseBody();
    const name = body['name'] as string;
    const email = body['email'] as string;
    const linkedin = body['linkedin_url'] as string;
    const resumeFile = body['resume'] as File;
    const tenantId = body['tenant_id'] as string || 'default';
    const jobId = body['job_id'] as string || 'general';

    if (!name || !email || !resumeFile) {
      return c.json({ error: 'Name, email, and resume are required.' }, 400);
    }

    const id = crypto.randomUUID();
    const r2Key = `resumes/${tenantId}/${id}-${resumeFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // 1. Upload to R2 Bucket
    if (c.env.MEDIA) {
      await c.env.MEDIA.put(r2Key, await resumeFile.arrayBuffer(), {
        httpMetadata: { contentType: resumeFile.type }
      });
    }

    // 2. Insert Draft Applicant into D1 Tracker
    await c.env.DB.prepare(
      `INSERT INTO applicants (id, tenant_id, job_id, name, email, linkedin_url, resume_r2_key, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'analyzing', datetime('now'))`
    ).bind(id, tenantId, jobId, name, email, linkedin || '', r2Key).run();

    // 3. Dispatch to background Queue for AI reading
    if (c.env.QUEUE) {
      await c.env.QUEUE.send({
        type: 'process-resume',
        payload: {
          applicant_id: id,
          r2_key: r2Key,
          mime_type: resumeFile.type
        }
      });
    }

    return c.json({ success: true, applicant_id: id, message: 'Application received and digesting by AI.' }, 202);
  } catch (error) {
    console.error('Error applying to ATS:', error);
    return c.json({ error: 'Internal Server Error processing application.' }, 500);
  }
})

// ── Feedback do Chat (CSAT) ─────────────────────────────────────
app.post('/api/chat/csat', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const sessionId = c.req.header('x-session-id');
  const score = body.csat_score; // 1 (thumbs up) ou -1 (thumbs down)

  if (!sessionId || typeof score !== 'number') {
    return c.json({ error: 'Missing session_id or csat_score' }, 400);
  }

  try {
    // Utilize db/schema futuramente se importado, ou D1 nativo para leveza da borda
    await c.env.DB.prepare(
      "UPDATE chat_sessions SET csat_score = ? WHERE id = ?"
    ).bind(score, sessionId).run();
    return c.json({ success: true });
  } catch (err) {
    return c.json({ error: 'Failed to record feedback' }, 500);
  }
})

// ── Webhook Agêntico (Omnichannel / Teams / WhatsApp) ────────────────
app.post('/api/webhooks/omnichannel', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  
  // Verifica token de segurança básico do Webhook
  const authHeader = c.req.header('Authorization');
  if (authHeader !== `Bearer ${c.env.ADMIN_SETUP_KEY}`) {
    return c.json({ error: 'Unauthorized webhook' }, 401);
  }

  if (!body.message) {
    return c.json({ error: 'Malformed payload' }, 400);
  }

  // Aciona a IA do Workers em background (para não gerar Timeout na API de terceiros)
  // Futuramente, a IA pode processar a string e despachar uma API para a plataforma de destino
  c.executionCtx.waitUntil(
    (async () => {
       console.log(`[OmniChannel Agent] Processing message from ${body.source}:`, body.message)
       // AI Logic seria instanciada aqui
    })()
  );

  return c.json({ status: 'queued', agent: 'omni-triage' });
})


// ── Mount: API v1 (CMS genérico) ────────────────────────────────
// Leitura pública
app.route('/api/v1', entries)
app.route('/api/v1', marketing)
// Upload requer sessão (P0: evitar abuso do R2)
app.use('/api/v1/media/upload', requireSession)
app.route('/api/v1', media)

import { aiRoutes } from './routes/ai'

// ── Mount: AI Writer (agente redator) — protegido por auth ─────
app.use('/api/content-agent/*', requireSession)
app.route('/api/content-agent', aiWriter)

// ── Mount: AI Routes (rascunho de governança) protegidas ─────
app.use('/api/ai/*', requireSession)
app.route('/api/ai', aiRoutes)

// ── MCP Server (Agents Integration) ──────────────────────────────
app.all('/api/mcp/*', requireAdminOrKey, async (c) => {
  let tenantId = c.get('tenantId') as string | undefined;
  const agentSession = c.get('agentSession') as { agent?: { organizationId?: string } } | undefined;
  if (agentSession) {
    tenantId = c.req.header('x-tenant-id') || agentSession.agent?.organizationId || tenantId;
  }
  return handleMcpRequest(c.req.raw, c.env.DB, tenantId, c.env)
})

const setupAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
}).strip();

// ── Bootstrap admin (setup-key) ─────────────────────────────────
app.post('/api/setup/admin', async (c) => {
  const key = c.req.header('x-setup-key')
  if (!key || key !== c.env.ADMIN_SETUP_KEY) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const auth = createAuth(c.env.DB, c.env.BETTER_AUTH_SECRET, c.env.BETTER_AUTH_URL)
  
  const parsed = setupAdminSchema.safeParse(await c.req.json())
  if (!parsed.success) return c.json({ error: 'Invalid payload', details: parsed.error.issues }, 400)
  
  const { email, password, name } = parsed.data

  try {
    const result = await auth.api.signUpEmail({
      body: { email, password, name },
    })
    return c.json({ success: true, user: result.user.email })
  } catch (err: any) {
    return c.json({ error: err?.message ?? 'Failed to create user' }, 400)
  }
})

// ── Mount: Public Compliance & Content (no auth) ─────────────────
import contentRoutes from './routes/content'
import complianceRoutes from './routes/compliance'
import { drizzle } from 'drizzle-orm/d1'
import { eq as eqOp } from 'drizzle-orm'
import { chatbot_config } from './db/schema'

// Public chatbot config (cached 60s)
app.get('/api/chatbot-config', async (c) => {
  const db = drizzle(c.env.DB)
  const tenantId = c.req.query('tenant') || 'ness'
  const [config] = await db.select({
    bot_name: chatbot_config.bot_name,
    avatar_url: chatbot_config.avatar_url,
    welcome_message: chatbot_config.welcome_message,
    theme_color: chatbot_config.theme_color,
    enabled: chatbot_config.enabled,
  }).from(chatbot_config).where(eqOp(chatbot_config.tenant_id, tenantId)).limit(1)
  c.header('Cache-Control', 'public, max-age=60')
  return c.json(config || { bot_name: 'Gabi.OS', welcome_message: 'Olá! Como posso ajudar?', theme_color: '#00E5A0', enabled: 1 })
})

// Public compliance endpoints: DSAR, whistleblower, policies, consent
app.route('/api', complianceRoutes)

// Public and Protected Automation endpoints: Newsletter, Apply, Assets
import automationRoutes from './routes/automation'
app.route('/api/automation', automationRoutes)

// SaaS Provisioning and Billing endpoints
import { saasRoutes } from './routes/saas-onboarding'
app.route('/api/saas', saasRoutes)

// ── Mount: Admin Routes (modular, auth-protected) ────────────────
import { admin } from './routes/admin'
import { webhooksApi } from './routes/webhooks-api'
import { brandRouter } from './routes/brand'

app.use('/api/admin/*', requireSession)
app.route('/api/admin', admin)
app.route('/api/admin/webhooks', webhooksApi)
app.route('/api/admin/brand', brandRouter)
app.route('/api/admin', contentRoutes)

// ── Integração Edge Image Delivery (Mapeada via Explorer) ────────
app.get('/media/:filename', async (c) => {
  const filename = c.req.param('filename')
  // No Cloudflare nativo, pegamos Imagens do Bucket (via env.R2_MEDIA) ou um Storage URL Proxy.
  // Vamos encapsular em um CF Fetch para redimensionamento em borda (WebP native).
  
  // Exemplo de URL base original do arquivo no R2 publico:
  const imageUrl = new URL(`https://media.seucdn.com/${filename}`)
  
  // Parâmetros do Resize via querystring (ex: w=800&q=80)
  const width = c.req.query('w') || '1200'
  const quality = c.req.query('q') || '85'

  // Refatoramos para simular o Binding Oficial
  const imageRequest = new Request(imageUrl, {
    headers: c.req.raw.headers,
    // Note: cf.image bindings requerem Workers/Pages atrelados a Zonas Pro/Business ou opt-in Images
    // @ts-ignore
    cf: {
      image: {
        width: parseInt(width),
        format: 'auto', // AVIF/WebP automatically
        quality: parseInt(quality),
      }
    }
  } as any)

  // Se `c.env.ASSETS` for usado ou R2 Fetch nativo
  try {
    const res = await fetch(imageRequest)
    const newHeaders = new Headers(res.headers)
    newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable')
    return new Response(res.body, { status: res.status, headers: newHeaders })
  } catch(e) {
    return c.json({ error: 'Falha no processamento de Imagem Edge' }, 500)
  }
})
app.post('/api/admin/seed-vectors', requireAdminOrKey, async (c) => {
  try {
    const results = await seedVectors(c.env)
    return c.json({ success: true, results })
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500)
  }
})

// ── Seed Collections (registra collections no D1) ───────────────
app.post('/api/admin/seed-collections', requireAdminOrKey, async (c) => {
  const { collections } = await import('./collections')

  const results = []
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
    } catch (e: any) {
      results.push({ slug: col.slug, status: 'error', error: e.message })
    }
  }

  return c.json({ success: true, results })
})


// ── Chat rate limiter — A04: Insecure Design ────────────────────
const chatRateMap = new Map<string, { count: number; resetAt: number }>()
const CHAT_RATE_LIMIT = 20
const CHAT_RATE_WINDOW = 60_000

function isChatRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = chatRateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    chatRateMap.set(ip, { count: 1, resetAt: now + CHAT_RATE_WINDOW })
    return false
  }
  if (entry.count >= CHAT_RATE_LIMIT) return true
  entry.count++
  return false
}

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(4000),
  })).min(1).max(20),
  locale: z.string().max(10).optional(),
})

// ── Chat RAG (público) via AGENT_DO ─────────────────────────────
app.post('/api/chat', async (c) => {
  const clientIp = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
  if (isChatRateLimited(clientIp)) {
    return c.json({ error: 'Too many requests. Please wait.' }, 429)
  }

  const rawBody = await c.req.json()
  const chatParsed = chatSchema.safeParse(rawBody)
  if (!chatParsed.success) {
    return c.json({ error: 'Invalid request' }, 400)
  }

  const { messages, locale } = chatParsed.data;
  const lastMessage = messages[messages.length - 1]?.content || '';

  // 1. Embedding da pergunta
  const queryEmbedding = await c.env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: [lastMessage]
  }) as { data: number[][] }

  // 2. Buscar contexto no Vectorize
  const vectorResults = await c.env.VECTORIZE.query(queryEmbedding.data[0], {
    topK: 3,
    returnMetadata: 'all'
  })

  const context = vectorResults.matches
    .map((m) => (m.metadata as Record<string, string> | undefined)?.content || '')
    .join('\n\n---\n\n')

  let ragContext = context.trim()
  
  if (!ragContext) {
    const fallback = await c.env.DB.prepare(`
      SELECT payload FROM entries 
      WHERE collection_id = (SELECT id FROM collections WHERE slug = 'solutions')
      LIMIT 10
    `).all()
    
    ragContext = fallback.results.map((r) => {
      const p = JSON.parse((r as { payload?: string }).payload || '{}')
      return `${p.title || ''}\n${p.content || p.desc || ''}`
    }).join('\n\n---\n\n')
  }

  const sessionId = c.req.header('x-session-id') || crypto.randomUUID()
  
  // Forward to GabiAgent (Durable Object)
  const id = c.env.AGENT_DO.idFromName("gabi_agent_" + sessionId);
  const stub = c.env.AGENT_DO.get(id);

  const agentReq = new Request(c.req.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      locale,
      ragContext,
      clientIp
    })
  });

  return stub.fetch(agentReq);
})

// ── OPEN GRAPH GENERATOR ──────────────────────────────────────────
app.get('/api/og', (c) => {
  const title = c.req.query('title') || 'Canal CMS'
  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="111" />
      <text x="600" y="315" fill="white" font-family="sans-serif" font-size="64" font-weight="900" text-anchor="middle" dominant-baseline="middle">
        ${title}
      </text>
    </svg>
  `
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  })
})
import { queueHandler } from './queue'
import { cronHandler } from './cron'

export { GabiAgent } from './agent'

export default {
  fetch: app.fetch,
  queue: queueHandler,
  scheduled: cronHandler
}
