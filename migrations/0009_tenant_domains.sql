-- Canal SaaS: Tenant Domains (CORS dinâmico + custom domains)
-- Fase 1.1: Suporte a domínios verificados por tenant para CORS dinâmico

CREATE TABLE IF NOT EXISTS tenant_domains (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  verified INTEGER NOT NULL DEFAULT 0,
  verification_token TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tenant_domains_domain ON tenant_domains(domain);
CREATE INDEX IF NOT EXISTS idx_tenant_domains_tenant ON tenant_domains(tenant_id);

-- governance column already exists in production (added earlier)
-- ALTER TABLE collections ADD COLUMN governance TEXT DEFAULT 'autonomous';

-- Seed: domínios da Ness como tenant verificado
-- O tenant_id será atualizado quando a org Ness for criada no Better Auth
INSERT OR IGNORE INTO tenant_domains (id, tenant_id, domain, verified, created_at)
VALUES 
  (lower(hex(randomblob(16))), 'ness', 'ness.com.br', 1, datetime('now')),
  (lower(hex(randomblob(16))), 'ness', 'www.ness.com.br', 1, datetime('now')),
  (lower(hex(randomblob(16))), 'ness', 'canal.ness.com.br', 1, datetime('now')),
  (lower(hex(randomblob(16))), 'ness', 'forense.io', 1, datetime('now')),
  (lower(hex(randomblob(16))), 'ness', 'www.forense.io', 1, datetime('now')),
  (lower(hex(randomblob(16))), 'ness', 'trustness.com.br', 1, datetime('now')),
  (lower(hex(randomblob(16))), 'ness', 'www.trustness.com.br', 1, datetime('now'));
