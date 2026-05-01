-- ============================================================
--  Canal CMS — Prune Legacy Tables (Option A Convergence)
--  Tables dropped: insights, jobs, cases
-- ============================================================

DROP TABLE IF EXISTS insights;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS cases;

-- Remove from sqlite_sequence to clean up completely
DELETE FROM sqlite_sequence WHERE name IN ('insights', 'jobs', 'cases');
