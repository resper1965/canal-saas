-- Migration: 0004_add_tenant_id_to_entries
-- Adds tenant_id column to entries table for multi-tenant data isolation.
-- NULL = platform-level (ness. internal) entries; assigned = org-scoped entries.

-- ALTER TABLE entries ADD COLUMN tenant_id TEXT REFERENCES organization(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_entries_tenant_id ON entries (tenant_id);
CREATE INDEX IF NOT EXISTS idx_entries_collection_tenant ON entries (collection_id, tenant_id);
