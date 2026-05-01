-- Garante que a collection brandbook existe no D1 remoto
INSERT INTO collections (id, slug, label, label_plural, icon, has_locale, has_slug, has_status, fields, sort_order)
SELECT 'col-brandbook-001', 'brandbook', 'Brand Asset', 'Brand Assets', 'Palette', 0, 1, 1, '[]', 10
WHERE NOT EXISTS (SELECT 1 FROM collections WHERE slug = 'brandbook');

-- Limpa entries existentes de brandbook
DELETE FROM entries WHERE collection_id = (SELECT id FROM collections WHERE slug = 'brandbook');

-- CORES
INSERT INTO entries (id, collection_id, data, slug, status) VALUES
('bbk-cor-01', (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"Branco Contraste","category":"cor","brand":"global","hex_value":"#FFFFFF","desc":"Cor para texto e logos sobre fundos escuros/surface.","usage_notes":"Para legibilidade máxima em dark mode."}', 'branco-texto', 'published'),
('bbk-cor-02', (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"Preto Contraste","category":"cor","brand":"global","hex_value":"#000000","desc":"Cor para texto e logos sobre fundos claros.","usage_notes":"Para legibilidade máxima em temas claros."}', 'preto-texto', 'published'),
('bbk-cor-03', (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"Azul Ponto","category":"cor","brand":"global","hex_value":"#00ade8","desc":"O azul nativo para o ponto (dot).","usage_notes":"O ponto deve ter SEMPRE essa cor em todas as marcas e servicos."}', 'azul-ponto', 'published'),
('bbk-cor-04', (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"Dark Surface","category":"cor","brand":"global","hex_value":"#0b1326","desc":"Cor de fundo base para as aplicacoes.","usage_notes":"Usada no corpo do site."}', 'dark-surface', 'published');

-- TIPOGRAFIA
INSERT INTO entries (id, collection_id, data, slug, status) VALUES
('bbk-tip-01', (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"Montserrat Medium 500","category":"tipografia","brand":"global","desc":"A fonte oficial para composicao de MARCAS e logotipos.","usage_notes":"Usar SEMPRE em caixa baixa (lowercase) para logotipos das marcas e solucoes."}', 'montserrat-medium', 'published');

-- LOGOS
INSERT INTO entries (id, collection_id, data, slug, status) VALUES
('bbk-logo-ness',      (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"ness.","category":"logo","brand":"ness","desc":"Marca Principal","usage_notes":"Sempre caixa baixa. Ponto na cor #00ade8. O resto varia entre branco/preto conforme o fundo."}', 'logo-ness', 'published'),
('bbk-logo-trust',     (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"trustness.","category":"logo","brand":"trustness","desc":"Marca Ecossistema Trust/Auditoria","usage_notes":"Sempre caixa baixa. Ponto na cor #00ade8."}', 'logo-trustness', 'published'),
('bbk-logo-forense',   (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"forense.io","category":"logo","brand":"forense","desc":"Marca Ecossistema Forense Digital","usage_notes":"Sempre caixa baixa. Ponto entre forense e io na cor #00ade8."}', 'logo-forense', 'published');

-- SERVICOS
INSERT INTO entries (id, collection_id, data, slug, status) VALUES
('bbk-svc-secops',  (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"n.secops","category":"logo","brand":"ness","desc":"Servico: Resiliencia Operacional e Continuidade","usage_notes":"Sempre caixa baixa. Ponto na cor #00ade8."}', 'logo-nsecops', 'published'),
('bbk-svc-infra',   (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"n.infraops","category":"logo","brand":"ness","desc":"Servico: Infraestrutura Inteligente e Suporte","usage_notes":"Sempre caixa baixa. Ponto na cor #00ade8."}', 'logo-ninfraops', 'published'),
('bbk-svc-dev',     (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"n.devarch","category":"logo","brand":"ness","desc":"Servico: Arquitetura Orientada ao Engenheiro","usage_notes":"Sempre caixa baixa. Ponto na cor #00ade8."}', 'logo-ndevarch', 'published'),
('bbk-svc-auto',    (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"n.autoops","category":"logo","brand":"ness","desc":"Servico: Eficiencia Operacional e Automacao","usage_notes":"Sempre caixa baixa. Ponto na cor #00ade8."}', 'logo-nautoops', 'published'),
('bbk-svc-cirt',    (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"n.cirt","category":"logo","brand":"ness","desc":"Servico: Resposta a Incidentes Criticos","usage_notes":"Sempre caixa baixa. Ponto na cor #00ade8."}', 'logo-ncirt', 'published');
