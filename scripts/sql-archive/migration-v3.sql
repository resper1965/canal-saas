-- Canal CMS — Migration v3
-- Adiciona tabelas de CMS genérico (collections + entries + media)
-- NÃO remove tabelas legadas — elas continuam funcionando

-- ── Collections (tipo de conteúdo) ──────────────────────────────
CREATE TABLE IF NOT EXISTS collections (
  id          TEXT PRIMARY KEY,
  slug        TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  label_plural TEXT,
  icon        TEXT DEFAULT 'FileText',
  has_locale  INTEGER NOT NULL DEFAULT 1,
  has_slug    INTEGER NOT NULL DEFAULT 1,
  has_status  INTEGER NOT NULL DEFAULT 1,
  fields      TEXT NOT NULL DEFAULT '[]',
  sort_order  INTEGER DEFAULT 0,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ── Entries (documentos genéricos) ──────────────────────────────
CREATE TABLE IF NOT EXISTS entries (
  id            TEXT PRIMARY KEY,
  tenant_id     TEXT, -- Referência à organização no Better Auth
  collection_id TEXT NOT NULL,
  data          TEXT NOT NULL DEFAULT '{}',
  slug          TEXT,
  locale        TEXT NOT NULL DEFAULT 'pt',
  status        TEXT NOT NULL DEFAULT 'draft',
  created_by    TEXT,
  updated_by    TEXT,
  published_at  DATETIME,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);

-- Índices para queries frequentes
CREATE INDEX IF NOT EXISTS idx_entries_tenant ON entries(tenant_id);
CREATE INDEX IF NOT EXISTS idx_entries_collection ON entries(collection_id);
CREATE INDEX IF NOT EXISTS idx_entries_slug ON entries(slug);
CREATE INDEX IF NOT EXISTS idx_entries_locale ON entries(locale);
CREATE INDEX IF NOT EXISTS idx_entries_status ON entries(status);
CREATE INDEX IF NOT EXISTS idx_entries_tenant_collection ON entries(tenant_id, collection_id);
CREATE INDEX IF NOT EXISTS idx_entries_collection_locale ON entries(collection_id, locale, status);

-- ── Media (uploads R2) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS media (
  id          TEXT PRIMARY KEY,
  filename    TEXT NOT NULL,
  mime_type   TEXT NOT NULL,
  size_bytes  INTEGER DEFAULT 0,
  r2_key      TEXT NOT NULL,
  alt_text    TEXT,
  width       INTEGER,
  height      INTEGER,
  created_by  TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
