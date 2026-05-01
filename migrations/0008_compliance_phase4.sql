-- Migration Phase 4: Compliance & Segurança

CREATE TABLE IF NOT EXISTS `dsar_requests` (
  `id` TEXT PRIMARY KEY,
  `tenant_id` TEXT NOT NULL,
  `requester_name` TEXT NOT NULL,
  `requester_email` TEXT NOT NULL,
  `request_type` TEXT NOT NULL,
  `status` TEXT DEFAULT 'open',
  `details` TEXT,
  `response_package_url` TEXT,
  `deadline` TEXT,
  `created_at` TEXT,
  `updated_at` TEXT
);

CREATE TABLE IF NOT EXISTS `ropa_records` (
  `id` TEXT PRIMARY KEY,
  `tenant_id` TEXT NOT NULL,
  `process_name` TEXT NOT NULL,
  `purpose` TEXT NOT NULL,
  `data_categories` TEXT NOT NULL,
  `data_subjects` TEXT NOT NULL,
  `legal_basis` TEXT NOT NULL,
  `retention_period` TEXT,
  `international_transfer` INTEGER DEFAULT 0,
  `security_measures` TEXT,
  `created_at` TEXT,
  `updated_at` TEXT
);

-- Note: incidents already partially existed in schema but might need creation
CREATE TABLE IF NOT EXISTS `incidents` (
  `id` TEXT PRIMARY KEY,
  `tenant_id` TEXT,
  `title` TEXT NOT NULL,
  `severity` TEXT DEFAULT 'low',
  `status` TEXT DEFAULT 'open',
  `timeline_events` TEXT DEFAULT '[]',
  `resolution_summary` TEXT,
  `sla_deadline` TEXT,
  `created_at` TEXT,
  `updated_at` TEXT
);
