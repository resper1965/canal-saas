/**
 * Canal CMS — Admin Routes (Modular)
 *
 * Refactored from monolithic admin.ts (897 lines) into 5 sub-modules.
 * This file re-exports a composed Hono router.
 */
import { Hono } from 'hono'
import type { AdminEnv } from './_shared'
import { organizationsRouter } from './organizations'
import { settingsRouter } from './settings'
import { leadsRouter } from './leads'
import { communicationsRouter } from './communications'
import { contentOpsRouter } from './content-ops'
import { features } from './features'
import { pipeline } from './pipeline'

const admin = new Hono<AdminEnv>()

// Organizations & Usage — /api/admin/organizations/*
admin.route('/organizations', organizationsRouter)
// Usage lives under organizations but has its own path prefix
admin.get('/usage/:orgId', (c) => {
  // Delegate to organizations router's usage handler
  return organizationsRouter.fetch(
    new Request(new URL(`/usage/${c.req.param('orgId')}`, c.req.url), { headers: c.req.raw.headers }),
    c.env, c.executionCtx
  )
})

// Settings — /api/admin/api-keys/*, /api/admin/domains/*, /api/admin/health, /api/admin/ai-*
admin.route('/', settingsRouter)

// Leads — /api/admin/applicants/*, /api/admin/leads/*, /api/admin/forms, /api/admin/chats, /api/admin/stats, /api/admin/activity
admin.route('/', leadsRouter)

// Lead Pipeline — /api/admin/pipeline/*
admin.route('/', pipeline)

// Communications — /api/admin/newsletter-*, /api/admin/newsletters/*, /api/admin/communications/*, /api/admin/knowledge-base/*, /api/admin/chat-sessions/*
admin.route('/', communicationsRouter)

// Content Ops — /api/admin/entries/:id/translate, /api/admin/entries/:id/social, /api/admin/social-posts/*, /api/admin/compliance/*
admin.route('/', contentOpsRouter)

// Platform Features — /api/admin/activity, /api/admin/notifications, /api/admin/entries/:id/versions, /api/admin/entries/:id/comments, /api/admin/search
admin.route('/', features)

export { admin }
