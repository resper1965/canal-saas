/**
 * Canal SaaS — Auth Middleware
 * 
 * Centralized auth middleware functions extracted from index.ts
 */
import { Context } from 'hono'
import type { Bindings, Variables } from '../index'
import { getAuth } from './context'
import { hashApiKey } from '../security'

type Ctx = Context<{ Bindings: Bindings; Variables: Variables }>

/** Requires a valid session. Sets tenantId + session on context. */
export async function requireSession(c: Ctx, next: () => Promise<void>) {
  const auth = getAuth(c)
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Unauthorized' }, 401)

  const tenantId = c.req.header('x-tenant-id') || session?.session?.activeOrganizationId || undefined
  c.set('tenantId', tenantId)
  c.set('session', session)
  await next()
}

/** Requires admin session, API key, or agent session. */
export async function requireAdminOrKey(c: Ctx, next: () => Promise<void>) {
  const setupKey = c.req.header('x-setup-key')
  if (setupKey === c.env.ADMIN_SETUP_KEY) {
    await next()
    return
  }

  const auth = getAuth(c)

  const agentSession = await auth.api.getAgentSession?.({ headers: c.req.raw.headers }).catch(() => null)
  if (agentSession) {
    c.set('agentSession', agentSession)
    await next()
    return
  }

  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  const tenantId = c.req.header('x-tenant-id') || session?.session?.activeOrganizationId || undefined
  c.set('tenantId', tenantId)
  c.set('session', session)
  await next()
}

/** Resolves tenant via API key (Bearer pk_xxx) or session cookie. */
export async function resolveApiKeyOrSession(c: Ctx, next: () => Promise<void>) {
  const authHeader = c.req.header('Authorization')
  if (authHeader?.startsWith('Bearer pk_')) {
    const rawKey = authHeader.replace('Bearer ', '')
    try {
      const hashedKey = await hashApiKey(rawKey)
      const row = await c.env.DB.prepare(
        'SELECT id, metadata FROM apikey WHERE key = ? LIMIT 1'
      ).bind(hashedKey).first<{ id: string; metadata: string }>()

      if (row) {
        const meta = JSON.parse(row.metadata || '{}')
        c.set('tenantId', meta.orgId || undefined)
        await next()
        return
      }

      // Fallback: check unhashed (migration compat)
      const legacyRow = await c.env.DB.prepare(
        'SELECT id, metadata, key FROM apikey WHERE key = ? LIMIT 1'
      ).bind(rawKey).first<{ id: string; metadata: string; key: string }>()

      if (legacyRow) {
        const meta = JSON.parse(legacyRow.metadata || '{}')
        c.set('tenantId', meta.orgId || undefined)
        c.executionCtx.waitUntil(
          c.env.DB.prepare('UPDATE apikey SET key = ? WHERE id = ?').bind(hashedKey, legacyRow.id).run()
        )
        await next()
        return
      }
    } catch {
      // Key lookup failed
    }
    return c.json({ error: 'Invalid API key' }, 401)
  }

  // Fallback to session cookie
  const auth = getAuth(c)
  const session = await auth.api.getSession({ headers: c.req.raw.headers }).catch(() => null)
  if (session) {
    const tenantId = session?.session?.activeOrganizationId || undefined
    c.set('tenantId', tenantId)
    c.set('session', session)
  }
  await next()
}
