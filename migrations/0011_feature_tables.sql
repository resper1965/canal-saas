-- Migration 0011: New feature tables
-- Notifications, Entry Versions, Comments (Approval Workflow)

-- ── Notifications ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  action_url TEXT,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read_at, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON notifications(tenant_id, created_at);

-- ── Entry Versions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS entry_versions (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  data TEXT NOT NULL,
  changed_by TEXT,
  diff_summary TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_entry_versions_entry ON entry_versions(entry_id, version);

-- ── Comments (Approval Workflow) ────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  entry_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_name TEXT,
  body TEXT NOT NULL,
  resolved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_comments_entry ON comments(entry_id, created_at);
