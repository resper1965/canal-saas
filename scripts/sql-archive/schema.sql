-- ============================================================
--  canal. — Schema v2  (ness. site 2026)
--  Migração completa: suporte a todos os campos do front
-- ============================================================




-- ── forms (contato/lead) ────────────────────────────────────
DROP TABLE IF EXISTS forms;
CREATE TABLE forms (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  payload      TEXT    NOT NULL,
  source       TEXT    NOT NULL,
  status       TEXT    NOT NULL DEFAULT 'new',
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── newsletter ──────────────────────────────────────────────
DROP TABLE IF EXISTS newsletter;
CREATE TABLE newsletter (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── chats (ai chatbot logs) ─────────────────────────────────
DROP TABLE IF EXISTS chats;
CREATE TABLE chats (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id   TEXT    NOT NULL UNIQUE,
  messages     TEXT    NOT NULL DEFAULT '[]', -- Armazena as interações como JSON {role, content}
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── leads (CRM Triagem Bots) ────────────────────────────────
DROP TABLE IF EXISTS leads;
CREATE TABLE leads (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL,
  contact      TEXT    NOT NULL,
  source       TEXT    NOT NULL DEFAULT 'chatbot',
  intent       TEXT    NOT NULL DEFAULT 'geral',
  urgency      TEXT    NOT NULL DEFAULT 'baixa',
  status       TEXT    NOT NULL DEFAULT 'new',
  tenant_id    TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
