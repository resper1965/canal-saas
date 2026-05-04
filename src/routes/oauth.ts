/**
 * Canal SaaS — OAuth Workaround Routes
 * 
 * Google OAuth redirect flow with KV-based state persistence.
 * Extracted from index.ts for maintainability.
 */

import { Hono } from 'hono'
import { getAuth } from '../middleware/context'
import type { Bindings, Variables } from '../index'

const oauth = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// ── OAuth Redirect (GET) ──────────────────────────────────────────
oauth.get('/google', async (c) => {
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
    await c.env.CANAL_KV.put(`oauth-state:${stateParam}`, stateCookieValue, { expirationTtl: 60 })
  }

  const redirectResponse = new Response(null, { status: 302, headers: { Location: body.url } })
  for (const part of rawCookies.split(/,(?=\s*(?:__Secure-|better-auth\.))/)) {
    if (part.trim()) redirectResponse.headers.append('Set-Cookie', part.trim())
  }
  return redirectResponse
})

export { oauth }
