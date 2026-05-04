-- Migration 0012: Lead Pipeline & Scoring
-- Adds pipeline stages, scoring, ownership, and enrichment to leads table

-- Add pipeline columns to leads
ALTER TABLE leads ADD COLUMN stage TEXT NOT NULL DEFAULT 'new';
ALTER TABLE leads ADD COLUMN score INTEGER DEFAULT 0;
ALTER TABLE leads ADD COLUMN owner_id TEXT;
ALTER TABLE leads ADD COLUMN owner_name TEXT;
ALTER TABLE leads ADD COLUMN company TEXT;
ALTER TABLE leads ADD COLUMN notes TEXT;
ALTER TABLE leads ADD COLUMN last_activity TEXT;
ALTER TABLE leads ADD COLUMN tags TEXT DEFAULT '[]';

-- Index for pipeline queries
CREATE INDEX IF NOT EXISTS idx_leads_pipeline ON leads(tenant_id, stage, score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_owner ON leads(tenant_id, owner_id);
