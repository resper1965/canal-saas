/**
 * Canal SaaS — Context Middleware
 *
 * Injects shared instances (auth, db) into Hono context
 * to eliminate 8x createAuth() and 35x drizzle() duplication.
 *
 * Usage in handlers:
 *   const auth = c.get('auth')
 *   const db = c.get('db')
 */

import { Context } from 'hono'
import { createAuth } from '../auth'
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../db/schema'
import type { Bindings, Variables } from '../index'

type AppContext = Context<{ Bindings: Bindings; Variables: Variables }>

/** Helper: build auth instance from env bindings */
export function getAuth(c: AppContext) {
  return createAuth(
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
}

/** Helper: build drizzle instance from env bindings */
export function getDb(c: AppContext) {
  return drizzle(c.env.DB, { schema })
}
