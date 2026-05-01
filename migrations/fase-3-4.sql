-- Fase 3 + Fase 4 Schema Migration
-- Execute via: npx wrangler d1 execute canal-db --remote --file=./migrations/fase-3-4.sql

-- Fase 3: Chatbot Configuration per Tenant
CREATE TABLE IF NOT EXISTS chatbot_config (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  bot_name TEXT DEFAULT 'Gabi.OS',
  avatar_url TEXT,
  welcome_message TEXT,
  system_prompt TEXT,
  theme_color TEXT DEFAULT '#00E5A0',
  enabled INTEGER DEFAULT 1,
  max_turns INTEGER DEFAULT 20,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_chatbot_config_tenant ON chatbot_config(tenant_id);

-- Fase 3: Chat Sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  visitor_id TEXT,
  locale TEXT DEFAULT 'pt',
  turn_count INTEGER DEFAULT 0,
  csat_score INTEGER,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now')),
  ended_at TEXT
);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_tenant ON chat_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created ON chat_sessions(created_at);

-- Fase 3: Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id);

-- Fase 4: DSAR (Data Subject Access Requests)
CREATE TABLE IF NOT EXISTS dsar_requests (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_document TEXT,
  request_type TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'received',
  response_file_key TEXT,
  assigned_to TEXT,
  sla_deadline TEXT,
  resolved_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_dsar_tenant ON dsar_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dsar_status ON dsar_requests(status);

-- Fase 4: Whistleblower / Canal de Denúncia
CREATE TABLE IF NOT EXISTS whistleblower_cases (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  case_code TEXT NOT NULL UNIQUE,
  encrypted_payload TEXT NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'new',
  officer_notes TEXT,
  sla_deadline TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_whistleblower_code ON whistleblower_cases(case_code);

-- Fase 4: Policies & Terms
CREATE TABLE IF NOT EXISTS policies (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  type TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'pt',
  title TEXT NOT NULL,
  body_md TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT DEFAULT 'draft',
  effective_date TEXT,
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_policies_type_locale ON policies(type, locale);

-- Fase 4: Consent Logs
CREATE TABLE IF NOT EXISTS consent_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT,
  user_identifier TEXT,
  policy_id TEXT REFERENCES policies(id),
  policy_version INTEGER,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_consent_policy ON consent_logs(policy_id);
