-- ============================================================
--  Canal CMS — Better Auth Multi-tenant & Agent Auth Script
-- ============================================================

-- ── Organization & Teams (SaaS Extension) ───────────────────────
CREATE TABLE IF NOT EXISTS "organization" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "logo" TEXT,
  "createdAt" TEXT NOT NULL,
  "metadata" TEXT,
  "plan" TEXT DEFAULT 'free',
  "usageLimit" INTEGER DEFAULT 100,
  "stripeCustomerId" TEXT
);

CREATE TABLE IF NOT EXISTS "member" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL DEFAULT 'member',
  "createdAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "invitation" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organizationId" TEXT NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "email" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "expiresAt" TEXT NOT NULL,
  "inviterId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "team" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "createdAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "teamMember" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "teamId" TEXT NOT NULL REFERENCES "team"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL DEFAULT 'member',
  "createdAt" TEXT NOT NULL
);

-- Active Organization mapping on session
-- D1 workaround for ADD COLUMN:
-- ALTER TABLE "session" ADD COLUMN "activeOrganizationId" TEXT;
-- ALTER TABLE "session" ADD COLUMN "activeTeamId" TEXT;

-- ── Agent Auth Protocol ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "agent" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "kid" TEXT NOT NULL,
  "credentialPublicKey" TEXT NOT NULL,
  "userId" TEXT REFERENCES "user"("id") ON DELETE CASCADE,
  "hostId" TEXT,
  "mode" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL,
  "activatedAt" TEXT,
  "expiresAt" TEXT
);

CREATE TABLE IF NOT EXISTS "agentHost" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "kid" TEXT NOT NULL,
  "credentialPublicKey" TEXT NOT NULL,
  "userId" TEXT REFERENCES "user"("id") ON DELETE SET NULL,
  "mode" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL,
  "activatedAt" TEXT,
  "defaultCapabilities" TEXT
);

CREATE TABLE IF NOT EXISTS "agentCapabilityGrant" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "agentId" TEXT NOT NULL REFERENCES "agent"("id") ON DELETE CASCADE,
  "capability" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL,
  "expiresAt" TEXT,
  "grantedBy" TEXT REFERENCES "user"("id") ON DELETE SET NULL,
  "deniedBy" TEXT,
  "constraints" TEXT,
  "reason" TEXT
);

CREATE TABLE IF NOT EXISTS "approvalRequest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "method" TEXT NOT NULL,
  "agentId" TEXT NOT NULL REFERENCES "agent"("id") ON DELETE CASCADE,
  "hostId" TEXT,
  "userId" TEXT REFERENCES "user"("id") ON DELETE SET NULL,
  "status" TEXT NOT NULL,
  "capabilities" TEXT,
  "userCodeHash" TEXT,
  "loginHint" TEXT,
  "bindingMessage" TEXT,
  "clientNotificationToken" TEXT,
  "clientNotificationEndpoint" TEXT,
  "deliveryMode" TEXT,
  "interval" INTEGER,
  "lastPolledAt" TEXT,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL,
  "expiresAt" TEXT
);
