-- Fase 6: Growth & Incidentes

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
