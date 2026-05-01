CREATE TABLE IF NOT EXISTS "user" (
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "emailVerified" INTEGER NOT NULL,
  "image" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "banned" INTEGER NOT NULL,
  "banReason" TEXT NOT NULL,
  "banExpires" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
  "expiresAt" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL,
  "ipAddress" TEXT NOT NULL,
  "userAgent" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "impersonatedBy" TEXT NOT NULL,
  "activeOrganizationId" TEXT NOT NULL,
  "activeTeamId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "account" (
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" TEXT NOT NULL,
  "refreshToken" TEXT NOT NULL,
  "idToken" TEXT NOT NULL,
  "accessTokenExpiresAt" TEXT NOT NULL,
  "refreshTokenExpiresAt" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "verification" (
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "organization" (
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "logo" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "metadata" TEXT NOT NULL,
  "plan" TEXT NOT NULL,
  "usageLimit" INTEGER NOT NULL,
  "stripeCustomerId" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "organizationRole" (
  "organizationId" TEXT NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL,
  "permission" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "team" (
  "name" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "teamMember" (
  "teamId" TEXT NOT NULL REFERENCES "team"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "createdAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "member" (
  "organizationId" TEXT NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "role" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "invitation" (
  "organizationId" TEXT NOT NULL REFERENCES "organization"("id") ON DELETE CASCADE,
  "email" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "expiresAt" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "inviterId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "agentHost" (
  "name" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "defaultCapabilities" TEXT NOT NULL,
  "publicKey" TEXT NOT NULL,
  "kid" TEXT NOT NULL,
  "jwksUrl" TEXT NOT NULL,
  "enrollmentTokenHash" TEXT NOT NULL,
  "enrollmentTokenExpiresAt" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "activatedAt" TEXT NOT NULL,
  "expiresAt" TEXT NOT NULL,
  "lastUsedAt" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "agent" (
  "name" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "hostId" TEXT NOT NULL REFERENCES "agentHost"("id") ON DELETE CASCADE,
  "status" TEXT NOT NULL,
  "mode" TEXT NOT NULL,
  "publicKey" TEXT NOT NULL,
  "kid" TEXT NOT NULL,
  "jwksUrl" TEXT NOT NULL,
  "lastUsedAt" TEXT NOT NULL,
  "activatedAt" TEXT NOT NULL,
  "expiresAt" TEXT NOT NULL,
  "metadata" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "agentCapabilityGrant" (
  "agentId" TEXT NOT NULL REFERENCES "agent"("id") ON DELETE CASCADE,
  "capability" TEXT NOT NULL,
  "deniedBy" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "grantedBy" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "expiresAt" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "constraints" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "approvalRequest" (
  "method" TEXT NOT NULL,
  "agentId" TEXT NOT NULL REFERENCES "agent"("id") ON DELETE CASCADE,
  "hostId" TEXT NOT NULL REFERENCES "agentHost"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "capabilities" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "userCodeHash" TEXT NOT NULL,
  "loginHint" TEXT NOT NULL,
  "bindingMessage" TEXT NOT NULL,
  "clientNotificationToken" TEXT NOT NULL,
  "clientNotificationEndpoint" TEXT NOT NULL,
  "deliveryMode" TEXT NOT NULL,
  "interval" INTEGER NOT NULL,
  "lastPolledAt" TEXT NOT NULL,
  "expiresAt" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "apikey" (
  "configId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "start" TEXT NOT NULL,
  "referenceId" TEXT NOT NULL,
  "prefix" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "refillInterval" INTEGER NOT NULL,
  "refillAmount" INTEGER NOT NULL,
  "lastRefillAt" TEXT NOT NULL,
  "enabled" INTEGER NOT NULL,
  "rateLimitEnabled" INTEGER NOT NULL,
  "rateLimitTimeWindow" INTEGER NOT NULL,
  "rateLimitMax" INTEGER NOT NULL,
  "requestCount" INTEGER NOT NULL,
  "remaining" INTEGER NOT NULL,
  "lastRequest" TEXT NOT NULL,
  "expiresAt" TEXT NOT NULL,
  "createdAt" TEXT NOT NULL,
  "updatedAt" TEXT NOT NULL,
  "permissions" TEXT NOT NULL,
  "metadata" TEXT NOT NULL
);

