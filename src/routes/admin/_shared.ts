/**
 * Admin Module — Shared types and helpers
 */
import { Context } from 'hono'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../../db/schema'
import type { Bindings } from '../../index'

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

export { schema }
