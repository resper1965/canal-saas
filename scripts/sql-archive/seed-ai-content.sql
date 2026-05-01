-- Seed de Conteúdos (Gerados por IA)
-- Popula as collections insights, cases e jobs com conteúdo realista do ecossistema Ness.

-- ===========================
-- COLLECTION REGISTRY (Garante que existem)
-- ===========================
INSERT INTO collections (id, slug, label, label_plural, icon, has_locale, has_slug, has_status, created_at) 
SELECT 'col-insights', 'insights', 'Insight', 'Insights', 'FileText', 1, 1, 1, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM collections WHERE slug = 'insights');

INSERT INTO collections (id, slug, label, label_plural, icon, has_locale, has_slug, has_status, created_at) 
SELECT 'col-cases', 'cases', 'Case', 'Cases', 'Briefcase', 1, 1, 1, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM collections WHERE slug = 'cases');

INSERT INTO collections (id, slug, label, label_plural, icon, has_locale, has_slug, has_status, created_at) 
SELECT 'col-jobs', 'jobs', 'Vaga', 'Vagas', 'Users', 1, 0, 1, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM collections WHERE slug = 'jobs');

-- ===========================
-- INSIGHTS (As entries de insight ficam no seed-ness-data.sql para evitar duplicidade temática com SEO avançado)
-- ===========================
DELETE FROM entries WHERE collection_id = (SELECT id FROM collections WHERE slug = 'insights');

-- ===========================
-- CASES (As entries de cases ficam no seed-ness-data.sql para evitar duplicidade temática com SEO avançado)
-- ===========================
DELETE FROM entries WHERE collection_id = (SELECT id FROM collections WHERE slug = 'cases');

-- ===========================
-- JOBS (Vagas)
-- ===========================
DELETE FROM entries WHERE collection_id = (SELECT id FROM collections WHERE slug = 'jobs');

INSERT INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at) VALUES 
('job-1', NULL, (SELECT id FROM collections WHERE slug = 'jobs'), 
 'sre-pleno', 'pt', 'published', 
 '{"title":"Engenheiro de SRE Pleno (n.infraops)","vertical":"engenharia","location":"Remoto / São Paulo, SP","type":"Full-time","desc":"Buscamos um talento em infraestrutura e código para atuar em missões críticas, garantindo a sustentabilidade de ambientes cloud complexos de nossos clientes.","requirements":"[\"Kubernetes avançado\",\"Terraform / Pulumi\",\"Python ou Go\",\"Cultura Cloud Native e CI/CD\"]","published":true}', 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('job-2', NULL, (SELECT id FROM collections WHERE slug = 'jobs'), 
 'forense-digital-cirt', 'pt', 'published', 
 '{"title":"Especialista em Forense Digital (CIRT)","vertical":"segurança","location":"Remoto / Global","type":"Full-time","desc":"Atuação em war-rooms e cenários de post-mortem. Integração ao time de resposta a incidentes críticos e preservação de cadeia de custódia utilizando práticas do forense.io.","requirements":"[\"Disposição para plantões 24x7\",\"Certificação GCIH ou similar\",\"Reversing de malware e análise de memória (Volatility)\"]","published":true}', 
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
