/**
 * Canal SaaS — Telemetry Middleware
 * 
 * Writes request metrics to Cloudflare Analytics Engine.
 * Extracted from index.ts for modularity and testability.
 */

import type { Context, Next } from 'hono'
import type { Bindings, Variables } from '../index'

type AppContext = Context<{ Bindings: Bindings; Variables: Variables }>

export function telemetry() {
  return async (c: AppContext, next: Next) => {
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
  }
}
