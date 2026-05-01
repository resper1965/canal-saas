CREATE TABLE IF NOT EXISTS leads (
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
