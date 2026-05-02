/**
 * Canal SaaS — Zod Validation Schemas
 *
 * Centralized input validation for all API endpoints.
 * Import and use with: schema.parse(await c.req.json())
 * On failure, Zod throws ZodError which the error handler catches.
 */

import { z } from 'zod'

// ── Primitives ──────────────────────────────────────────────────

const email = z.string().email()
const uuid = z.string().uuid()
const nonEmpty = z.string().min(1)

// ── Admin: Organizations ────────────────────────────────────────

export const UpdateOrgSchema = z.object({
  metadata: z.record(z.string(), z.unknown()).optional(),
})

// ── Admin: API Keys ─────────────────────────────────────────────

export const CreateApiKeySchema = z.object({
  name: nonEmpty,
  orgId: nonEmpty,
})

// ── Admin: Domains ──────────────────────────────────────────────

export const CreateDomainSchema = z.object({
  domain: nonEmpty,
})

// ── Admin: Applicants / Leads ───────────────────────────────────

export const UpdateStatusSchema = z.object({
  status: nonEmpty,
})

// ── Admin: Newsletter ───────────────────────────────────────────

export const AddSubscriberSchema = z.object({
  email: email,
})

export const SendNewsletterSchema = z.object({
  subject: nonEmpty,
  preheader: z.string().optional().default(''),
  body: nonEmpty,
})

// ── Admin: AI Settings ──────────────────────────────────────────

export const UpdateAiSettingsSchema = z.object({
  enabled: z.boolean().optional(),
  bot_name: z.string().optional(),
  avatar_url: z.string().optional(),
  welcome_message: z.string().optional(),
  system_prompt: z.string().optional(),
  theme_color: z.string().optional(),
  max_turns: z.number().int().min(1).max(100).optional(),
})

// ── Admin: Communications ───────────────────────────────────────

export const ForwardMessageSchema = z.object({
  messageId: z.number().int(),
  messageType: z.enum(['form', 'lead']),
  to: email,
})

// ── Admin: Knowledge Base ───────────────────────────────────────

export const CreateKnowledgeBaseSchema = z.object({
  title: nonEmpty,
  text_payload: nonEmpty,
})

// ── Admin: Translate ────────────────────────────────────────────

export const TranslateSchema = z.object({
  targetLocale: z.string().default('en'),
}).partial()

// ── Entries CRUD ────────────────────────────────────────────────

export const CreateEntrySchema = z.object({
  title: z.string().optional(),
  slug: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
  locale: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
}).passthrough()

export const UpdateEntrySchema = CreateEntrySchema.partial()

// ── Compliance: DSAR ────────────────────────────────────────────

export const CreateDsarSchema = z.object({
  tenant_id: z.string().optional().default('ness'),
  name: nonEmpty,
  email: email,
  document: z.string().optional(),
  type: z.enum(['access', 'deletion', 'correction', 'portability']),
  description: z.string().optional(),
})

export const UpdateDsarSchema = z.object({
  status: z.enum(['received', 'in_progress', 'resolved', 'rejected']),
  response_package_url: z.string().optional(),
  tenant_id: z.string().optional(),
  actor_id: z.string().optional(),
  previous_status: z.string().optional(),
})

// ── Compliance: Whistleblower ───────────────────────────────────

export const CreateWhistleblowerSchema = z.object({
  tenant_id: z.string().optional().default('ness'),
  description: nonEmpty,
  category: nonEmpty,
  evidence: z.string().optional(),
})

export const UpdateWhistleblowerSchema = z.object({
  status: z.enum(['new', 'investigating', 'resolved', 'dismissed']),
  officer_notes: z.string().optional(),
})

// ── Compliance: Policies ────────────────────────────────────────

export const CreatePolicySchema = z.object({
  tenant_id: z.string().optional().default('ness'),
  type: nonEmpty,
  locale: z.string().optional().default('pt'),
  title: nonEmpty,
  body_md: nonEmpty,
  version: z.number().int().optional().default(1),
  status: z.enum(['draft', 'published']).optional().default('draft'),
  effective_date: z.string().optional(),
  created_by: z.string().optional(),
})

export const UpdatePolicySchema = z.object({
  title: z.string().optional(),
  body_md: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
  effective_date: z.string().optional(),
})

// ── Compliance: Consent ─────────────────────────────────────────

export const LogConsentSchema = z.object({
  tenant_id: z.string().optional().default('ness'),
  user_id: z.string().optional(),
  fingerprint: z.string().optional(),
  policy_id: nonEmpty,
  policy_version: z.number().int(),
  action: z.enum(['accepted', 'rejected', 'withdrawn']),
})

// ── SaaS: Onboarding ───────────────────────────────────────────

export const CheckoutSchema = z.object({
  tenantId: nonEmpty,
  plan: z.enum(['free', 'pro', 'enterprise']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
})

// ── AI / Chat ───────────────────────────────────────────────────

export const ChatMessageSchema = z.object({
  message: nonEmpty,
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional().default([]),
  sessionId: z.string().optional(),
  locale: z.string().optional().default('pt'),
})

// ── Shared error handler ────────────────────────────────────────

/** Wraps Zod parse with a safe JSON error response */
export function safeParse<T>(schema: z.ZodType<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (result.success) return { success: true, data: result.data }
  const message = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
  return { success: false, error: message }
}
