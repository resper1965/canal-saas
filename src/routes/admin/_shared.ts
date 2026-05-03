/**
 * Admin Module — Shared types and helpers
 */
import { Context } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../../db/schema'
import type { Bindings } from '../../index'

export const DEFAULT_TENANT_ID = 'ness'

export type Variables = {
  tenantId?: string;
  session?: { user: { role: string; email: string }; session: { activeOrganizationId?: string } };
}

export type AdminEnv = { Bindings: Bindings; Variables: Variables }

export function assertAdmin(c: Context<AdminEnv>): boolean {
  const session = c.get('session')
  return session?.user?.role === 'admin'
}

export function getDb(c: Context<AdminEnv>) {
  return drizzle(c.env.DB, { schema })
}

/** Extract tenantId from session, with fallback to default */
export function getTenantId(c: Context<AdminEnv>): string {
  return c.get('tenantId') || DEFAULT_TENANT_ID
}

export { schema }

