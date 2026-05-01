-- Fase 5: IA & AutOMAÇÃO

-- 1. Applicants
CREATE TABLE IF NOT EXISTS `applicants` (
  `id` TEXT PRIMARY KEY,
  `tenant_id` TEXT,
  `job_id` TEXT,
  `name` TEXT NOT NULL,
  `email` TEXT NOT NULL,
  `linkedin_url` TEXT,
  `resume_r2_key` TEXT,
  `ai_score` INTEGER,
  `ai_summary` TEXT,
  `status` TEXT DEFAULT 'new',
  `created_at` TEXT
);

-- 2. Social Posts
CREATE TABLE IF NOT EXISTS `social_posts` (
  `id` TEXT PRIMARY KEY,
  `tenant_id` TEXT,
  `platform` TEXT NOT NULL,
  `content` TEXT NOT NULL,
  `image_url` TEXT,
  `scheduled_at` TEXT,
  `published_at` TEXT,
  `status` TEXT DEFAULT 'draft',
  `ai_generated` INTEGER DEFAULT 0,
  `created_at` TEXT,
  `updated_at` TEXT
);

-- 3. Newsletter Campaigns
CREATE TABLE IF NOT EXISTS `newsletter_campaigns` (
  `id` TEXT PRIMARY KEY,
  `tenant_id` TEXT,
  `subject` TEXT NOT NULL,
  `body_html` TEXT NOT NULL,
  `status` TEXT DEFAULT 'draft',
  `scheduled_at` TEXT,
  `sent_at` TEXT,
  `open_rate` INTEGER DEFAULT 0,
  `click_rate` INTEGER DEFAULT 0,
  `created_at` TEXT,
  `updated_at` TEXT
);

-- 4. Comunicados
CREATE TABLE IF NOT EXISTS `comunicados` (
  `id` TEXT PRIMARY KEY,
  `tenant_id` TEXT,
  `title` TEXT NOT NULL,
  `body` TEXT NOT NULL,
  `audience` TEXT DEFAULT 'all',
  `status` TEXT DEFAULT 'draft',
  `scheduled_at` TEXT,
  `sent_at` TEXT,
  `created_at` TEXT,
  `updated_at` TEXT
);

-- 5. Brand Assets
CREATE TABLE IF NOT EXISTS `brand_assets` (
  `id` TEXT PRIMARY KEY,
  `tenant_id` TEXT,
  `name` TEXT NOT NULL,
  `type` TEXT NOT NULL,
  `r2_key` TEXT,
  `value` TEXT,
  `created_at` TEXT
);

-- 6. Newsletter Table Updates
ALTER TABLE `newsletter` ADD COLUMN `tenant_id` TEXT;
ALTER TABLE `newsletter` ADD COLUMN `token` TEXT;
ALTER TABLE `newsletter` ADD COLUMN `confirmed_at` TEXT;
