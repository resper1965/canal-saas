/**
 * Canal CMS — Self-Service Onboarding
 * 
 * Permite que clientes externos criem conta, organização,
 * e recebam sua primeira API key automaticamente.
 * 
 * POST /api/onboarding/signup → cria user + org + seed collections + API key
 */

import { Hono } from 'hono'
import { z } from 'zod'
import { createAuth } from '../auth'
import { collections } from '../collections'
import { hashApiKey } from '../security'
import type { Bindings } from '../index'

type OnboardingEnv = { Bindings: Bindings }

export const onboarding = new Hono<OnboardingEnv>()

const signupSchema = z.object({
  // User
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  // Organization
  companyName: z.string().min(2).max(100),
  domain: z.string().max(255).optional(),
  // Plan
  plan: z.enum(['free', 'pro', 'enterprise']).default('free'),
  // Chatbot (optional initial config)
  botName: z.string().max(50).optional(),
  themeColor: z.string().max(7).optional(),
}).strip()

onboarding.post('/signup', async (c) => {
  const parsed = signupSchema.safeParse(await c.req.json())
  if (!parsed.success) {
    return c.json({ error: 'Invalid payload', details: parsed.error.issues }, 400)
  }

  const { name, email, password, companyName, domain, plan, botName, themeColor } = parsed.data
  const auth = createAuth(c.env.DB, c.env.BETTER_AUTH_SECRET, c.env.BETTER_AUTH_URL)

  try {
    // 1. Create user
    const signupResult = await auth.api.signUpEmail({
      body: { email, password, name },
    })

    if (!signupResult?.user?.id) {
      return c.json({ error: 'Failed to create user' }, 400)
    }

    const userId = signupResult.user.id

    // 2. Create organization directly in D1 (Better Auth API requires session which we don't have here)
    const slug = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 50)

    const orgId = crypto.randomUUID()
    const now = new Date().toISOString()
    const orgMeta = JSON.stringify({ plan, usageLimit: plan === 'free' ? 100 : plan === 'pro' ? 10000 : 999999 })

    await c.env.DB.prepare(
      `INSERT INTO organization (id, name, slug, metadata, createdAt) VALUES (?, ?, ?, ?, ?)`
    ).bind(orgId, companyName, slug, orgMeta, now).run()

    // Add user as owner
    await c.env.DB.prepare(
      `INSERT INTO member (id, organizationId, userId, role, createdAt) VALUES (?, ?, ?, 'owner', ?)`
    ).bind(crypto.randomUUID(), orgId, userId, now).run()

    // Set as active org for the user session
    await c.env.DB.prepare(
      `UPDATE session SET activeOrganizationId = ? WHERE userId = ?`
    ).bind(orgId, userId).run()

    // 3. Seed default collections for this tenant
    const seedResults = []
    for (const col of collections) {
      const id = crypto.randomUUID()
      try {
        await c.env.DB.prepare(
          `INSERT INTO collections (id, slug, label, label_plural, icon, has_locale, has_slug, has_status, governance, fields, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(slug) DO NOTHING`
        ).bind(
          id, col.slug, col.label, col.labelPlural ?? col.label + 's',
          col.icon, col.hasLocale ? 1 : 0, col.hasSlug ? 1 : 0, col.hasStatus ? 1 : 0,
          col.governance, JSON.stringify(col.fields), collections.indexOf(col)
        ).run()
        seedResults.push({ slug: col.slug, status: 'ok' })
      } catch {
        seedResults.push({ slug: col.slug, status: 'exists' })
      }
    }

    // 4. Generate first API key
    const rawKey = `pk_${crypto.randomUUID().replace(/-/g, '')}`
    const keyId = crypto.randomUUID()
    const prefix = rawKey.substring(0, 7)
    const hashedKey = await hashApiKey(rawKey)

    await c.env.DB.prepare(
      `INSERT INTO apikey (id, name, prefix, key, userId, enabled, rateLimitEnabled, requestCount, metadata, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 1, 0, 0, ?, ?, ?)`
    ).bind(keyId, `${companyName} - Default Key`, prefix, hashedKey, userId, JSON.stringify({ orgId }), now, now).run()

    // 5. Register domain if provided
    if (domain) {
      const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0].toLowerCase()
      const domainId = crypto.randomUUID()
      const verifyToken = crypto.randomUUID()
      try {
        await c.env.DB.prepare(
          'INSERT INTO tenant_domains (id, tenant_id, domain, verified, verification_token, created_at) VALUES (?, ?, ?, 0, ?, ?)'
        ).bind(domainId, orgId, cleanDomain, verifyToken, now).run()
      } catch { /* domain may already exist */ }
    }

    // 6. Seed chatbot config
    if (botName || themeColor) {
      const configId = crypto.randomUUID()
      await c.env.DB.prepare(
        `INSERT INTO chatbot_config (id, tenant_id, enabled, bot_name, welcome_message, theme_color, max_turns, created_at)
         VALUES (?, ?, 1, ?, 'Olá! 👋 Como posso ajudar?', ?, 20, ?)`
      ).bind(configId, orgId, botName || 'Assistente', themeColor || '#00E5A0', now).run()
    }

    // 7. Return everything the client needs
    return c.json({
      success: true,
      user: { id: userId, email },
      organization: { id: orgId, name: companyName, slug, plan },
      apiKey: {
        id: keyId,
        key: rawKey,  // Only shown once!
        prefix,
      },
      domain: domain || null,
      dashboardUrl: `${c.env.BETTER_AUTH_URL || 'https://canal.bekaa.eu'}`,
      quickStart: {
        step1: 'Copy your API key (it will not be shown again)',
        step2: `Add to your site: fetch("${c.env.BETTER_AUTH_URL || 'https://canal.bekaa.eu'}/api/v1/collections/insights/entries?status=published", { headers: { "Authorization": "Bearer ${rawKey}" } })`,
        step3: `For the chatbot widget: <script src="${c.env.BETTER_AUTH_URL || 'https://canal.bekaa.eu'}/widget.js" data-key="${rawKey}"></script>`,
      },
      collections: seedResults.length,
    }, 201)

  } catch (err: unknown) {
    // Handle duplicate email
    if (err.message?.includes('UNIQUE') || err.message?.includes('already exists')) {
      return c.json({ error: 'Email already registered' }, 409)
    }
    return c.json({ error: err.message || 'Internal error' }, 500)
  }
})
