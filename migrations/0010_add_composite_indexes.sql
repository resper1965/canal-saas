-- Migration 0010: Quick Wins - Schema hardening
-- 1. Create missing tables (audit_logs, webhooks_targets)
-- 2. Add scheduled_at to entries
-- 3. Composite indexes for all tenant-scoped queries

-- ── Missing Tables ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  user_id TEXT,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS webhooks_targets (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  url TEXT NOT NULL,
  secret TEXT,
  events TEXT NOT NULL DEFAULT '["entry.published"]',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- ── Scheduled Publishing ────────────────────────────────────────
ALTER TABLE entries ADD COLUMN scheduled_at TEXT;

-- ── Composite Indexes ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_entries_tenant_status ON entries(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_entries_tenant_collection ON entries(tenant_id, collection_id, created_at);
CREATE INDEX IF NOT EXISTS idx_entries_tenant_scheduled ON entries(tenant_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_created ON leads(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_status ON leads(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_created ON audit_logs(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_action ON audit_logs(tenant_id, action, created_at);
CREATE INDEX IF NOT EXISTS idx_social_tenant_status ON social_posts(tenant_id, status, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_forms_tenant_status ON forms(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_dsar_tenant_status ON dsar_requests(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_newsletter_campaigns_tenant ON newsletter_campaigns(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_tenant ON chat_sessions(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_incidents_tenant ON incidents(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_ropa_tenant ON ropa_records(tenant_id);
