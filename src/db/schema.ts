import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ── CMS Core ────────────────────────────────────────────────────

export const collections = sqliteTable('collections', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  label: text('label').notNull(),
  label_plural: text('label_plural'),
  icon: text('icon').default('FileText'),
  has_locale: integer('has_locale').notNull().default(1),
  has_slug: integer('has_slug').notNull().default(1),
  has_status: integer('has_status').notNull().default(1),
  governance: text('governance').default('autonomous'),
  fields: text('fields').notNull().default('[]'),
  sort_order: integer('sort_order').default(0),
  created_at: text('created_at')
});

// ── SaaS: Tenant Domains (CORS dinâmico + custom domains) ───────

export const tenant_domains = sqliteTable('tenant_domains', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull(),
  domain: text('domain').notNull().unique(),
  verified: integer('verified').notNull().default(0),
  verification_token: text('verification_token'),
  created_at: text('created_at'),
});

export const entries = sqliteTable('entries', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id'),
  collection_id: text('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
  data: text('data').notNull().default('{}'),
  slug: text('slug'),
  locale: text('locale').notNull().default('pt'),
  status: text('status').notNull().default('draft'),
  created_by: text('created_by'),
  updated_by: text('updated_by'),
  governance_decision: text('governance_decision'),
  classification_reason: text('classification_reason'),
  published_at: text('published_at'),
  created_at: text('created_at'),
  updated_at: text('updated_at')
});

// ── Engagement ──────────────────────────────────────────────────

export const leads = sqliteTable('leads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant_id: text('tenant_id'),
  name: text('name').notNull(),
  contact: text('contact').notNull(),
  source: text('source').default('web'),
  intent: text('intent'),
  urgency: text('urgency').default('media'),
  status: text('status').default('new'),
  created_at: text('created_at').default('CURRENT_TIMESTAMP'),
  updated_at: text('updated_at')
});

export const forms = sqliteTable('forms', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant_id: text('tenant_id').default('ness'),
  payload: text('payload'),
  source: text('source'),
  status: text('status').default('new'),
  created_at: text('created_at').default('CURRENT_TIMESTAMP')
});

export const chats = sqliteTable('chats', {
  session_id: text('session_id').primaryKey(),
  tenant_id: text('tenant_id').default('ness'),
  messages: text('messages'),
  created_at: text('created_at').default('CURRENT_TIMESTAMP'),
  updated_at: text('updated_at')
});

export const newsletter = sqliteTable('newsletter', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant_id: text('tenant_id'),
  email: text('email').notNull().unique(),
  token: text('token'),
  confirmed_at: text('confirmed_at'),
  created_at: text('created_at').default('CURRENT_TIMESTAMP')
});

// ── Media ───────────────────────────────────────────────────────

export const mediaTable = sqliteTable('media', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  mime_type: text('mime_type').notNull(),
  size_bytes: integer('size_bytes'),
  r2_key: text('r2_key').notNull(),
  alt_text: text('alt_text'),
  width: integer('width'),
  height: integer('height'),
  created_at: text('created_at')
});

// ── Webhooks ────────────────────────────────────────────────────

export const webhooks_targets = sqliteTable('webhooks_targets', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id'),
  url: text('url').notNull(),
  secret: text('secret'),
  events: text('events').notNull().default('["entry.published"]'),
  active: integer('active').notNull().default(1),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull()
});

// ── Audit ───────────────────────────────────────────────────────

export const audit_logs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id'),
  user_id: text('user_id'),
  action: text('action').notNull(),
  resource: text('resource').notNull(),
  resource_id: text('resource_id'),
  details: text('details'),
  ip_address: text('ip_address'),
  created_at: text('created_at').notNull()
});

// ── Better Auth (managed by library, read-only schemas) ─────────

export const organization = sqliteTable('organization', {
  id: text('id').primaryKey(),
  name: text('name'),
  slug: text('slug'),
  logo: text('logo'),
  metadata: text('metadata'),
  createdAt: text('createdAt'),
});

export const member = sqliteTable('member', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').references(() => organization.id),
  userId: text('userId'),
  role: text('role'),
  createdAt: text('createdAt'),
});

export const invitation = sqliteTable('invitation', {
  id: text('id').primaryKey(),
  organizationId: text('organizationId').references(() => organization.id),
  email: text('email'),
  role: text('role'),
  status: text('status'),
  inviterId: text('inviterId'),
  expiresAt: text('expiresAt'),
});

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  role: text('role'),
  image: text('image'),
  createdAt: text('createdAt'),
  updatedAt: text('updatedAt'),
});

export const apikey = sqliteTable('apikey', {
  id: text('id').primaryKey(),
  name: text('name'),
  prefix: text('prefix'),
  key: text('key'),
  metadata: text('metadata'),
  createdAt: text('createdAt'),
});

// ── Fase 3: Chatbot Configuration ───────────────────────────────

export const chatbot_config = sqliteTable('chatbot_config', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull(),
  bot_name: text('bot_name').default('Gabi.OS'),
  avatar_url: text('avatar_url'),
  welcome_message: text('welcome_message'),
  system_prompt: text('system_prompt'),
  theme_color: text('theme_color').default('#00E5A0'),
  enabled: integer('enabled').default(1),
  max_turns: integer('max_turns').default(20),
  created_at: text('created_at'),
  updated_at: text('updated_at'),
});

export const knowledge_base = sqliteTable('knowledge_base', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull(),
  title: text('title').notNull(),
  r2_key: text('r2_key').notNull(),
  status: text('status').default('pending'), // pending, indexed, error
  chunk_count: integer('chunk_count').default(0),
  created_by: text('created_by'),
  created_at: text('created_at'),
  updated_at: text('updated_at'),
});

// ── Fase 3: Chat Sessions & Messages ────────────────────────────

export const chat_sessions = sqliteTable('chat_sessions', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id'),
  visitor_id: text('visitor_id'),
  locale: text('locale').default('pt'),
  turn_count: integer('turn_count').default(0),
  csat_score: integer('csat_score'),
  status: text('status').default('active'),
  created_at: text('created_at'),
  ended_at: text('ended_at'),
});

export const chat_messages = sqliteTable('chat_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  session_id: text('session_id').notNull().references(() => chat_sessions.id, { onDelete: 'cascade' }),
  role: text('role').notNull(),
  content: text('content').notNull(),
  tokens_used: integer('tokens_used'),
  created_at: text('created_at'),
});


// ── Fase 4: Whistleblower / Canal de Denúncia ───────────────────

export const whistleblower_cases = sqliteTable('whistleblower_cases', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id'),
  case_code: text('case_code').notNull().unique(),
  encrypted_payload: text('encrypted_payload').notNull(),
  category: text('category'),
  status: text('status').default('new'),
  officer_notes: text('officer_notes'),
  sla_deadline: text('sla_deadline'),
  created_at: text('created_at'),
  updated_at: text('updated_at'),
});

// ── Fase 4: Policies & Terms ────────────────────────────────────

export const policies = sqliteTable('policies', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id'),
  type: text('type').notNull(),
  locale: text('locale').notNull().default('pt'),
  title: text('title').notNull(),
  body_md: text('body_md').notNull(),
  version: integer('version').notNull().default(1),
  status: text('status').default('draft'),
  effective_date: text('effective_date'),
  created_by: text('created_by'),
  created_at: text('created_at'),
  updated_at: text('updated_at'),
});

// ── Fase 4: Consent Logs ────────────────────────────────────────

export const consent_logs = sqliteTable('consent_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tenant_id: text('tenant_id'),
  user_identifier: text('user_identifier'),
  policy_id: text('policy_id').references(() => policies.id),
  policy_version: integer('policy_version'),
  action: text('action').notNull(),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  created_at: text('created_at'),
});

// ── Fase 5: IA & Automação ───────────────────────────────────────

export const applicants = sqliteTable('applicants', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id'),
  job_id: text('job_id'),
  name: text('name').notNull(),
  email: text('email').notNull(),
  linkedin_url: text('linkedin_url'),
  resume_r2_key: text('resume_r2_key'),
  ai_score: integer('ai_score'),
  ai_summary: text('ai_summary'),
  status: text('status').default('new'),
  created_at: text('created_at'),
});

export const social_posts = sqliteTable('social_posts', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id'),
  platform: text('platform').notNull(),
  content: text('content').notNull(),
  image_url: text('image_url'),
  scheduled_at: text('scheduled_at'),
  published_at: text('published_at'),
  status: text('status').default('draft'),
  ai_generated: integer('ai_generated').default(0),
  created_at: text('created_at'),
  updated_at: text('updated_at'),
});

export const newsletter_campaigns = sqliteTable('newsletter_campaigns', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id'),
  subject: text('subject').notNull(),
  body_html: text('body_html').notNull(),
  status: text('status').default('draft'),
  scheduled_at: text('scheduled_at'),
  sent_at: text('sent_at'),
  open_rate: integer('open_rate').default(0),
  click_rate: integer('click_rate').default(0),
  created_at: text('created_at'),
  updated_at: text('updated_at'),
});

export const comunicados = sqliteTable('comunicados', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id'),
  title: text('title').notNull(),
  body: text('body').notNull(),
  audience: text('audience').default('all'),
  status: text('status').default('draft'),
  scheduled_at: text('scheduled_at'),
  sent_at: text('sent_at'),
  created_at: text('created_at'),
  updated_at: text('updated_at'),
});

export const brand_assets = sqliteTable('brand_assets', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id'),
  name: text('name').notNull(),
  type: text('type').notNull(), // logo, font, color_palette
  r2_key: text('r2_key'),
  value: text('value'), // hex codes for colors
  created_at: text('created_at'),
});

// ── Fase 4: Compliance & Segurança ──────────────────────────────────────

export const dsar_requests = sqliteTable('dsar_requests', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull(),
  requester_name: text('requester_name').notNull(),
  requester_email: text('requester_email').notNull(),
  requester_document: text('requester_document'),
  request_type: text('request_type').notNull(),
  status: text('status').default('open'),
  description: text('description'),
  details: text('details'),
  response_package_url: text('response_package_url'),
  assigned_to: text('assigned_to'),
  deadline: text('deadline'),
  resolved_at: text('resolved_at'),
  created_at: text('created_at'),
  updated_at: text('updated_at'),
});

export const ropa_records = sqliteTable('ropa_records', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id').notNull(),
  process_name: text('process_name').notNull(),
  purpose: text('purpose').notNull(),
  data_categories: text('data_categories').notNull(), // JSON string
  data_subjects: text('data_subjects').notNull(), // JSON string
  legal_basis: text('legal_basis').notNull(),
  retention_period: text('retention_period'),
  international_transfer: integer('international_transfer').default(0),
  security_measures: text('security_measures'),
  created_at: text('created_at'),
  updated_at: text('updated_at'),
});

export const incidents = sqliteTable('incidents', {
  id: text('id').primaryKey(),
  tenant_id: text('tenant_id'),
  title: text('title').notNull(),
  severity: text('severity').default('low'),
  status: text('status').default('open'),
  timeline_events: text('timeline_events').default('[]'),
  resolution_summary: text('resolution_summary'),
  sla_deadline: text('sla_deadline'),
  created_at: text('created_at'),
  updated_at: text('updated_at'),
});
