-- Seed: primeiro usuário administrador do Canal
-- Senha: Ness@2026!  (trocar após primeiro login)
-- Hash gerado com scrypt (formato Better-Auth: "salt:hash_base64")

INSERT OR IGNORE INTO "user" (
  "id", "name", "email", "emailVerified", "createdAt", "updatedAt"
) VALUES (
  'admin-ness-01',
  'Admin Ness',
  'admin@ness.com.br',
  1,
  datetime('now'),
  datetime('now')
);

INSERT OR IGNORE INTO "account" (
  "id", "accountId", "providerId", "userId",
  "password", "createdAt", "updatedAt"
) VALUES (
  'account-admin-01',
  'admin@ness.com.br',
  'credential',
  'admin-ness-01',
  '201d52482cc6236b8ad03c82726ec9f1:QUnTeXnAE5mrHYiYM3ehw1cbNR7eOkQ2/LPFC3pv0X+zpQv5Qmw7JedHEmXr288JWmI9k8DdXmEd0D2x0Ne+hQ==',
  datetime('now'),
  datetime('now')
);

INSERT OR IGNORE INTO "organization" (
  "id", "name", "slug", "createdAt", "plan", "usageLimit"
) VALUES (
  'org-ness-admin',
  'Ness Admin',
  'ness-admin',
  datetime('now'),
  'enterprise',
  9999
);

INSERT OR IGNORE INTO "member" (
  "id", "organizationId", "userId", "role", "createdAt"
) VALUES (
  'member-admin-01',
  'org-ness-admin',
  'admin-ness-01',
  'owner',
  datetime('now')
);
