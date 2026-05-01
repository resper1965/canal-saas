-- Fix: adicionar collections faltantes + seed data
INSERT OR IGNORE INTO collections (id, slug, label, has_locale, has_slug, has_status, fields, created_at)
VALUES ('col-brandbook', 'brandbook', 'Brand Assets', 0, 1, 1, '[]', datetime('now'));

INSERT OR IGNORE INTO collections (id, slug, label, has_locale, has_slug, has_status, fields, created_at)
VALUES ('col-signatures', 'signatures', 'Assinaturas', 0, 1, 1, '[]', datetime('now'));

INSERT OR IGNORE INTO collections (id, slug, label, has_locale, has_slug, has_status, fields, created_at)
VALUES ('col-forms', 'forms', 'Formularios', 0, 0, 1, '[]', datetime('now'));
