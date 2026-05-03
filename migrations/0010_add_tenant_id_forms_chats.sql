-- Migration: Add tenant_id to forms and chats tables
-- These tables were missing tenant isolation, creating a cross-tenant data leak vector.

-- Add tenant_id to forms (nullable for backward compat, default 'ness')
ALTER TABLE forms ADD COLUMN tenant_id TEXT DEFAULT 'ness';

-- Add tenant_id to chats (nullable for backward compat, default 'ness')  
ALTER TABLE chats ADD COLUMN tenant_id TEXT DEFAULT 'ness';

-- Backfill existing rows
UPDATE forms SET tenant_id = 'ness' WHERE tenant_id IS NULL;
UPDATE chats SET tenant_id = 'ness' WHERE tenant_id IS NULL;
