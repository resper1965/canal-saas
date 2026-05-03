/**
 * Canal CMS — Main Worker Entry Point (v4)
 *
 * Refactored: extracted middleware, auth, chat, public-api, setup → modules.
 * This file is now the routing orchestrator only (~250 lines).
 *
 *   /api/*          → Rotas legadas (retrocompat site público)
 *   /api/v1/*       → API CMS genérica (collections, entries, media)
 *   /api/auth/*     → Better Auth
 *   /api/chat       → RAG chatbot (chat.ts)
 *   /api/admin/*    → Rotas administrativas protegidas
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { createAuth } from './auth'
import { getAuth } from './middleware/context'
import { DEFAULT_TENANT_ID } from './config'
import type { AnalyticsEngineDataset, AuthSession, AgentSession } from './types/bindings'
import { isValidOrigin } from './security'
import { rateLimiter } from './middleware/rate-limit'
import { requireSession, requireAdminOrKey, resolveApiKeyOrSession } from './middleware/auth'

// ── Route modules ─────────────────────────────────────────────────
import { entries } from './routes/entries'
import { media } from './routes/media'
import { marketing } from './routes/marketing'
import { legacy } from './routes/legacy'
import { aiWriter } from './routes/ai-writer'
import { aiRoutes } from './routes/ai'
import { chatRoutes } from './routes/chat'
import { publicApi } from './routes/public-api'
import { setupRoutes } from './routes/setup'
import { handleMcpRequest } from './mcp'
import contentRoutes from './routes/content'
import complianceRoutes from './routes/compliance'
import automationRoutes from './routes/automation'
import { saasRoutes } from './routes/saas-onboarding'
import { onboarding } from './routes/onboarding'
import { widgetRoute } from './routes/widget'
import { docs } from './routes/docs'
import { developerPortal } from './routes/developer-portal'
import { admin } from './routes/admin'
import { webhooksApi } from './routes/webhooks-api'
import { brandRouter } from './routes/brand'

import { drizzle } from 'drizzle-orm/d1'
import { eq as eqOp } from 'drizzle-orm'
import { chatbot_config } from './db/schema'

export type Bindings = {
  DB: D1Database
  AI: Ai
  VECTORIZE: VectorizeIndex
  MEDIA: R2Bucket
  CANAL_KV: KVNamespace
  BETTER_AUTH_SECRET: string
  BETTER_AUTH_URL: string
  ADMIN_SETUP_KEY: string
  RESEND_API_KEY?: string
  GOOGLE_CLIENT_ID?: string
  GOOGLE_CLIENT_SECRET?: string
  SLACK_WEBHOOK_URL?: string
  AGENT_DO: DurableObjectNamespace
  QUEUE: Queue
  ANALYTICS: AnalyticsEngineDataset
  ASSETS: Fetcher
  SEND_EMAIL: { send(message: { from: string; to: string; subject: string; html?: string }) : Promise<void> }
  EMAIL?: { send(message: { from: string; to: string; subject: string; html?: string }) : Promise<void> }
}

export type Variables = {
  tenantId?: string;
  agentSession?: AgentSession;
  session?: AuthSession;
}

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>()

// ── Global Error Handler ──────────────────────────────────────────
app.onError((err, c) => {
  if (err.name === 'ZodError') {
    const issues = (err as { issues?: { path: string[]; message: string }[] }).issues?.map((i: { path: string[]; message: string }) => `${i.path.join('.')}: ${i.message}`).join('; ') || 'Invalid input'
    return c.json({ error: issues }, 400)
  }
  return c.json({ error: 'Internal Server Error' }, 500)
})

// ── Observability & Telemetry ─────────────────────────────────────
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

// ── Plan-based Rate Limiting ──────────────────────────────────────
const PLAN_LIMITS: Record<string, number> = { free: 20, pro: 100, enterprise: 999999 }

app.use('/api/v1/*', async (c, next) => {
  const tenantId = c.get('tenantId')
  if (!tenantId) return next()

  try {
    const minute = Math.floor(Date.now() / 60000)
    const key = `rl:${tenantId}:${minute}`
    const current = await c.env.CANAL_KV.get(key)
    const count = current ? parseInt(current, 10) : 0

    // Look up plan from org metadata
    const org = await c.env.DB.prepare(
      'SELECT metadata FROM organization WHERE id = ? LIMIT 1'
    ).bind(tenantId).first<{ metadata: string }>()

    const meta = org?.metadata ? JSON.parse(org.metadata) : {}
    const plan = meta.plan || 'free'
    const limit = PLAN_LIMITS[plan] || PLAN_LIMITS.free

    if (count >= limit) {
      return c.json({
        error: 'Rate limit exceeded',
        plan,
        limit: `${limit} requests/minute`,
        retryAfter: 60 - (Math.floor(Date.now() / 1000) % 60),
      }, 429)
    }

    await c.env.CANAL_KV.put(key, String(count + 1), { expirationTtl: 120 })
    c.header('X-RateLimit-Limit', String(limit))
    c.header('X-RateLimit-Remaining', String(Math.max(0, limit - count - 1)))
  } catch {
    // Rate limit check failed, proceed anyway
  }

  return next()
})

// ── CORS & Security ───────────────────────────────────────────────
app.use('/*', secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "https://static.cloudflareinsights.com", "https://unpkg.com", "https://cdn.tailwindcss.com"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "blob:", "https://*.ness.com.br", "https://*.r2.dev"],
    connectSrc: ["'self'", "https://api.resend.com", "https://canal.bekaa.eu"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'", "https://accounts.google.com"],
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
  origin: async (origin, c) => {
    if (!origin) return '*'
    const devOrigins = ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:8787', 'http://localhost:5174']
    if (devOrigins.includes(origin)) return origin

    try {
      const cached = await c.env.CANAL_KV.get(`cors:${origin}`)
      if (cached) return origin

      const hostname = new URL(origin).hostname
      const row = await c.env.DB.prepare(
        'SELECT tenant_id FROM tenant_domains WHERE domain = ? AND verified = 1 LIMIT 1'
      ).bind(hostname).first<{ tenant_id: string }>()

      if (row) {
        c.executionCtx.waitUntil(c.env.CANAL_KV.put(`cors:${origin}`, row.tenant_id, { expirationTtl: 300 }))
        return origin
      }
    } catch {
      // CORS check failed
    }
    return null
  },
  allowHeaders: ['Content-Type', 'Authorization', 'x-setup-key', 'x-session-id', 'x-tenant-id', 'x-api-key'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}))

// ── OAuth Redirect (GET) ──────────────────────────────────────────
app.get('/api/oauth/google', async (c) => {
  const auth = getAuth(c)
  const fakeReq = new Request(`${c.env.BETTER_AUTH_URL}/api/auth/sign-in/social`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider: 'google', callbackURL: c.req.query('callbackURL') || '/' }),
  })
  const response = await auth.handler(fakeReq)
  const body = await response.json() as { url?: string }
  if (!body.url) return c.redirect('/login?error=oauth_init_failed')

  const googleUrl = new URL(body.url)
  const stateParam = googleUrl.searchParams.get('state') || ''

  const rawCookies = response.headers.get('set-cookie') || ''
  const stateMatch = rawCookies.match(/(?:__Secure-)?better-auth\.state=([^;]+)/)
  const stateCookieValue = stateMatch ? stateMatch[1] : ''

  if (stateParam && stateCookieValue) {
    await c.env.CANAL_KV.put(`oauth-state:${stateParam}`, stateCookieValue, { expirationTtl: 300 })
  }

  const redirectResponse = new Response(null, { status: 302, headers: { Location: body.url } })
  for (const part of rawCookies.split(/,(?=\s*(?:__Secure-|better-auth\.))/)) {
    if (part.trim()) redirectResponse.headers.append('Set-Cookie', part.trim())
  }
  return redirectResponse
})

// ── Better Auth ───────────────────────────────────────────────────
app.all('/api/auth/*', async (c) => {
  const isCallback = c.req.path.includes('/callback/')
  try {
    const auth = getAuth(c)
    let reqToHandle = c.req.raw

    if (isCallback) {
      const existingCookies = c.req.header('cookie') || ''
      const hasStateCookie = existingCookies.includes('better-auth.state=') || existingCookies.includes('state=')

      if (!hasStateCookie) {
        const stateParam = new URL(c.req.url).searchParams.get('state')
        if (stateParam) {
          const storedValue = await c.env.CANAL_KV.get(`oauth-state:${stateParam}`)
          if (storedValue) {
            const newHeaders = new Headers(reqToHandle.headers)
            const cookieName = c.env.BETTER_AUTH_URL?.startsWith('https')
              ? '__Secure-better-auth.state'
              : 'better-auth.state'
            newHeaders.set('cookie', `${existingCookies}${existingCookies ? '; ' : ''}${cookieName}=${storedValue}`)
            reqToHandle = new Request(reqToHandle.url, {
              method: reqToHandle.method,
              headers: newHeaders,
              body: reqToHandle.body,
            })
          }
        }
      }
    }

    const response = await auth.handler(reqToHandle)

    if (isCallback) {
      const status = response.status
      if (status >= 400) {
        const body = await response.clone().text()
        return c.redirect(`/login?error=${encodeURIComponent(body.substring(0, 200))}`)
      }
    }

    return response
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : 'unknown'
    if (isCallback) {
      return c.redirect(`/login?error=${encodeURIComponent(errMsg)}`)
    }
    return c.json({ error: 'Auth error', message: errMsg }, 500)
  }
})

// ── Root ─────────────────────────────────────────────────────────
app.get('/', (c) => c.json({ name: 'Canal CMS', status: 'ok' }))

// ── Agent Discovery ─────────────────────────────────────────────
app.all('/.well-known/agent-configuration', (c) => {
  const auth = getAuth(c)
  return auth.handler(c.req.raw)
})

// ── Mount: Legacy Routes ────────────────────────────────────────
app.route('/api', legacy)

// ── Mount: Public API (incidents, DSAR, apply, omnichannel) ─────
app.route('/api', publicApi)

// ── Mount: API v1 (CMS genérico) ───────────────────────────────
app.use('/api/v1/*', rateLimiter())
app.use('/api/v1/*', async (c, next) => {
  const method = c.req.method
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    await next(); return
  }
  const origin = c.req.header('Origin')
  if (origin && !isValidOrigin(origin)) {
    return c.json({ error: 'Forbidden: invalid origin' }, 403)
  }
  await next()
})
app.use('/api/v1/*', resolveApiKeyOrSession)
app.route('/api/v1', entries)
app.route('/api/v1', marketing)
app.use('/api/v1/media/upload', requireSession)
app.route('/api/v1', media)

// ── Mount: AI Writer + AI Routes ────────────────────────────────
app.use('/api/content-agent/*', requireSession)
app.route('/api/content-agent', aiWriter)
app.use('/api/ai/*', requireSession)
app.route('/api/ai', aiRoutes)

// ── Mount: MCP Server ───────────────────────────────────────────
app.all('/api/mcp/*', requireAdminOrKey, async (c) => {
  let tenantId = c.get('tenantId') as string | undefined
  const agentSession = c.get('agentSession') as { agent?: { organizationId?: string } } | undefined
  if (agentSession) {
    tenantId = c.req.header('x-tenant-id') || agentSession.agent?.organizationId || tenantId
  }
  return handleMcpRequest(c.req.raw, c.env.DB, tenantId, c.env)
})

// ── Mount: Setup (protected by setup-key) ───────────────────────
app.route('/api/setup', setupRoutes)
app.post('/api/admin/seed-vectors', requireAdminOrKey, async (c) => {
  const { seedVectors } = await import('./seed-vectors')
  try {
    const results = await seedVectors(c.env)
    return c.json({ success: true, results })
  } catch (e: unknown) {
    return c.json({ success: false, error: e instanceof Error ? e.message : String(e) }, 500)
  }
})
app.post('/api/admin/seed-collections', requireAdminOrKey, async (c) => {
  const { collections } = await import('./collections')
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

// ── Mount: Public Compliance & Content ──────────────────────────
app.get('/api/chatbot-config', async (c) => {
  const db = drizzle(c.env.DB)
  const tenantId = c.req.query('tenant') || DEFAULT_TENANT_ID
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

app.route('/api', complianceRoutes)
app.route('/api/automation', automationRoutes)
app.route('/api/saas', saasRoutes)
app.route('/api/onboarding', onboarding)
app.route('/', widgetRoute)
app.route('/api', docs)
app.route('/api', developerPortal)

// ── Mount: Admin Routes ─────────────────────────────────────────
app.use('/api/admin/*', requireSession)
app.route('/api/admin', admin)
app.route('/api/admin/webhooks', webhooksApi)
app.route('/api/admin/brand', brandRouter)
app.route('/api/admin', contentRoutes)

// ── Mount: Chat RAG (public) ────────────────────────────────────
app.route('/api/chat', chatRoutes)

// ── Edge Image Delivery ─────────────────────────────────────────
app.get('/media/:filename', async (c) => {
  const filename = c.req.param('filename')
  const imageUrl = new URL(`https://media.seucdn.com/${filename}`)
  const width = c.req.query('w') || '1200'
  const quality = c.req.query('q') || '85'

  const imageRequest = new Request(imageUrl, {
    headers: c.req.raw.headers,
    // @ts-ignore — cf.image requires Workers Pro/Business
    cf: {
      image: {
        width: parseInt(width),
        format: 'auto',
        quality: parseInt(quality),
      }
    }
  } as RequestInit)

  try {
    const res = await fetch(imageRequest)
    const newHeaders = new Headers(res.headers)
    newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable')
    return new Response(res.body, { status: res.status, headers: newHeaders })
  } catch {
    return c.json({ error: 'Falha no processamento de Imagem Edge' }, 500)
  }
})

// ── OG Image Generator ──────────────────────────────────────────
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

// ── SPA Fallback ────────────────────────────────────────────────
app.notFound(async (c) => {
  const path = c.req.path
  if (path.startsWith('/api/') || path.startsWith('/widget')) {
    return c.text('Not Found', 404)
  }
  try {
    const asset = await c.env.ASSETS.fetch(new Request(new URL('/', c.req.url)))
    return new Response(asset.body, {
      headers: { ...Object.fromEntries(asset.headers), 'content-type': 'text/html; charset=utf-8' }
    })
  } catch {
    return c.text('Not Found', 404)
  }
})

import { queueHandler } from './queue'
import { cronHandler } from './cron'

export { GabiAgent } from './agent'

export default {
  fetch: app.fetch,
  queue: queueHandler,
  scheduled: cronHandler
}
