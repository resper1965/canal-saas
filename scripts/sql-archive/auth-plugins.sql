-- ============================================================
--  Better Auth — Plugin Tables (Admin + Organization + API Key)
--  Referência: better-auth.com/docs/plugins
-- ============================================================

-- ── Admin Plugin ────────────────────────────────────────────────
-- Adiciona role + banned ao user (ALTER TABLE)
-- D1/SQLite não suporta ADD COLUMN IF NOT EXISTS, então usamos BEGIN/EXCEPTION
-- Para primeira execução, altera a tabela user

-- Coluna "role" na tabela user
ALTER TABLE "user" ADD COLUMN "role" TEXT DEFAULT 'user';

-- Coluna "banned" na tabela user
ALTER TABLE "user" ADD COLUMN "banned" INTEGER DEFAULT 0;

-- Coluna "banReason" na tabela user
ALTER TABLE "user" ADD COLUMN "banReason" TEXT;

-- Coluna "banExpires" na tabela user  
ALTER TABLE "user" ADD COLUMN "banExpires" TEXT;

-- Coluna "impersonatedBy" na sessão
ALTER TABLE "session" ADD COLUMN "impersonatedBy" TEXT;

-- ── Organization Plugin ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "organization" (
  "id"        TEXT NOT NULL PRIMARY KEY,
  "name"      TEXT NOT NULL,
  "slug"      TEXT NOT NULL UNIQUE,
  "logo"      TEXT,
  "metadata"  TEXT,
  "createdAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "member" (
  "id"             TEXT NOT NULL PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "userId"         TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "role"           TEXT NOT NULL DEFAULT 'member',
  "teamId"         TEXT,
  "createdAt"      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "invitation" (
  "id"             TEXT NOT NULL PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "email"          TEXT NOT NULL,
  "role"           TEXT NOT NULL DEFAULT 'member',
  "teamId"         TEXT,
  "status"         TEXT NOT NULL DEFAULT 'pending',
  "expiresAt"      TEXT NOT NULL,
  "inviterId"      TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "team" (
  "id"             TEXT NOT NULL PRIMARY KEY,
  "name"           TEXT NOT NULL,
  "organizationId" TEXT NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "createdAt"      TEXT NOT NULL
);

-- Coluna activeOrganizationId na sessão
ALTER TABLE "session" ADD COLUMN "activeOrganizationId" TEXT;

-- Indexes
CREATE INDEX IF NOT EXISTS "member_orgId_idx" ON "member"("organizationId");
CREATE INDEX IF NOT EXISTS "member_userId_idx" ON "member"("userId");
CREATE INDEX IF NOT EXISTS "invitation_orgId_idx" ON "invitation"("organizationId");
CREATE INDEX IF NOT EXISTS "team_orgId_idx" ON "team"("organizationId");

-- ── API Key Plugin ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "apiKey" (
  "id"          TEXT NOT NULL PRIMARY KEY,
  "name"        TEXT,
  "start"       TEXT,
  "prefix"      TEXT,
  "key"         TEXT NOT NULL,
  "userId"      TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "refillAmount" INTEGER,
  "refillInterval" INTEGER,
  "lastRefillAt" TEXT,
  "enabled"     INTEGER NOT NULL DEFAULT 1,
  "rateLimitEnabled" INTEGER NOT NULL DEFAULT 0,
  "rateLimitTimeWindow" INTEGER,
  "rateLimitMax" INTEGER,
  "requestCount" INTEGER NOT NULL DEFAULT 0,
  "remaining"   INTEGER,
  "lastRequest"  TEXT,
  "expiresAt"   TEXT,
  "createdAt"   TEXT NOT NULL,
  "updatedAt"   TEXT NOT NULL,
  "permissions" TEXT,
  "metadata"    TEXT
);

CREATE INDEX IF NOT EXISTS "apiKey_userId_idx" ON "apiKey"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "apiKey_key_idx" ON "apiKey"("key");
