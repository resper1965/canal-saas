/**
 * Admin Module — Shared types, helpers, and RBAC middleware
 */
import { Context } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../../db/schema'
import type { Bindings } from '../../index'
import { createAuth } from '../../auth'
import { SUPER_ADMIN_EMAILS } from '../../config'
import type { statement } from '../../auth/permissions'

export const DEFAULT_TENANT_ID = 'ness'

export type Variables = {
  tenantId?: string;
  session?: { user: { id: string; role: string; email: string }; session: { activeOrganizationId?: string } };
}

export type AdminEnv = { Bindings: Bindings; Variables: Variables }

/**
 * Permission descriptor — keys are resource names, values are arrays of actions.
 * Example: { entry: ["create"], lead: ["read"] }
 */
type PermissionCheck = Partial<{
  [K in keyof typeof statement]: (typeof statement)[K][number][]
}>

// ── Super Admin Check ──────────────────────────────────────────────

const SUPER_ADMIN_DOMAIN = 'bekaa.eu'

function isSuperAdmin(email: string | undefined): boolean {
  if (!email) return false
  if (email.endsWith(`@${SUPER_ADMIN_DOMAIN}`)) return true
  return (SUPER_ADMIN_EMAILS as readonly string[]).includes(email)
}

// ── Legacy: assertAdmin (Super Admin only) ─────────────────────────

export function assertAdmin(c: Context<AdminEnv>): boolean {
  const session = c.get('session')
  return session?.user?.role === 'admin' || isSuperAdmin(session?.user?.email)
}

// ── RBAC: requirePermission ────────────────────────────────────────

/**
 * Checks if the current user has the required permissions in their active org.
 * Super Admins bypass all permission checks.
 *
 * Usage:
 *   if (!(await requirePermission(c, { entry: ['create'] }))) return c.json({ error: 'Forbidden' }, 403)
 */
export async function requirePermission(
  c: Context<AdminEnv>,
  permissions: PermissionCheck
): Promise<boolean> {
  const session = c.get('session')
  if (!session) return false

  // Super Admin bypass
  if (isSuperAdmin(session.user?.email)) return true

  // Global admin role bypass (Better Auth admin plugin)
  if (session.user?.role === 'admin') return true

  // Check org-level permission via Better Auth
  const orgId = session.session?.activeOrganizationId
  if (!orgId) return false

  try {
    const auth = createAuth(
      c.env.DB,
      c.env.BETTER_AUTH_SECRET,
      c.env.BETTER_AUTH_URL,
      {
        googleClientId: c.env.GOOGLE_CLIENT_ID,
        googleClientSecret: c.env.GOOGLE_CLIENT_SECRET,
        sendEmailBinding: c.env.SEND_EMAIL,
        EMAIL: c.env.EMAIL,
        kv: c.env.CANAL_KV,
      }
    )
    const result = await auth.api.hasPermission({
      headers: c.req.raw.headers,
      body: { permissions },
    })
    return !!(result as { success?: boolean })?.success
  } catch {
    return false
  }
}

// ── Database ───────────────────────────────────────────────────────

export function getDb(c: Context<AdminEnv>) {
  return drizzle(c.env.DB, { schema })
}

/** Extract tenantId from session, with fallback to default */
export function getTenantId(c: Context<AdminEnv>): string {
  return c.get('tenantId') || DEFAULT_TENANT_ID
}

// ── Audit Log ──────────────────────────────────────────────────────

export function logAudit(
  c: Context<AdminEnv>,
  action: string,
  resource: string,
  resourceId?: string,
  details?: string
) {
  const session = c.get('session')
  const tenantId = getTenantId(c)
  const userId = session?.user?.id || 'unknown'
  const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || ''

  // Fire-and-forget — don't block the response
  c.executionCtx.waitUntil(
    c.env.DB.prepare(
      `INSERT INTO audit_logs (id, tenant_id, user_id, action, resource, resource_id, details, ip_address, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      crypto.randomUUID(),
      tenantId,
      userId,
      action,
      resource,
      resourceId || null,
      details || null,
      ip,
      new Date().toISOString()
    ).run().catch(() => {}) // Silently fail — audit should never break requests
  )
}

export { schema }
