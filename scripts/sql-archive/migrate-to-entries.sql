-- ============================================================
--  Canal CMS — Migrar dados legados para entries
--  Pré-requisito: migration-v3.sql + seed-collections já executados
-- ============================================================

-- ── Insights → Entries ──────────────────────────────────────────
INSERT INTO entries (id, collection_id, data, slug, locale, status, published_at, created_at, updated_at)
SELECT
  lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6))),
  (SELECT id FROM collections WHERE slug = 'insights' LIMIT 1),
  json_object(
    'title', i.title,
    'tag', i.tag,
    'icon', i.icon,
    'date', i.date,
    'desc', i.desc,
    'featured', CASE WHEN i.featured = 1 THEN json('true') ELSE json('false') END
  ),
  i.slug,
  i.lang,
  CASE WHEN i.published = 1 THEN 'published' ELSE 'draft' END,
  CASE WHEN i.published = 1 THEN i.created_at ELSE NULL END,
  i.created_at,
  i.created_at
FROM insights i
WHERE NOT EXISTS (
  SELECT 1 FROM entries e
  WHERE e.slug = i.slug AND e.locale = i.lang
    AND e.collection_id = (SELECT id FROM collections WHERE slug = 'insights' LIMIT 1)
);

-- ── Cases → Entries ─────────────────────────────────────────────
INSERT INTO entries (id, collection_id, data, slug, locale, status, published_at, created_at, updated_at)
SELECT
  lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6))),
  (SELECT id FROM collections WHERE slug = 'cases' LIMIT 1),
  json_object(
    'client', cs.client,
    'category', cs.category,
    'project', cs.project,
    'result', cs.result,
    'desc', cs.desc,
    'stats', cs.stats,
    'image', cs.image,
    'featured', CASE WHEN cs.featured = 1 THEN json('true') ELSE json('false') END
  ),
  cs.slug,
  cs.lang,
  CASE WHEN cs.published = 1 THEN 'published' ELSE 'draft' END,
  CASE WHEN cs.published = 1 THEN cs.created_at ELSE NULL END,
  cs.created_at,
  cs.created_at
FROM cases cs
WHERE NOT EXISTS (
  SELECT 1 FROM entries e
  WHERE e.slug = cs.slug AND e.locale = cs.lang
    AND e.collection_id = (SELECT id FROM collections WHERE slug = 'cases' LIMIT 1)
);

-- ── Jobs → Entries ──────────────────────────────────────────────
INSERT INTO entries (id, collection_id, data, slug, locale, status, published_at, created_at, updated_at)
SELECT
  lower(hex(randomblob(4)) || '-' || hex(randomblob(2)) || '-4' || substr(hex(randomblob(2)),2) || '-' || substr('89ab', abs(random()) % 4 + 1, 1) || substr(hex(randomblob(2)),2) || '-' || hex(randomblob(6))),
  (SELECT id FROM collections WHERE slug = 'jobs' LIMIT 1),
  json_object(
    'title', j.title,
    'vertical', j.vertical,
    'location', j.location,
    'type', j.type,
    'desc', j.desc,
    'requirements', json(j.requirements)
  ),
  NULL,
  j.lang,
  CASE WHEN j.published = 1 THEN 'published' ELSE 'draft' END,
  CASE WHEN j.published = 1 THEN j.created_at ELSE NULL END,
  j.created_at,
  j.created_at
FROM jobs j
WHERE NOT EXISTS (
  SELECT 1 FROM entries e
  WHERE e.locale = j.lang
    AND e.collection_id = (SELECT id FROM collections WHERE slug = 'jobs' LIMIT 1)
    AND json_extract(e.data, '$.title') = j.title
);
