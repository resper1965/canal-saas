-- Tenta inserir a collection se ela não existir
INSERT INTO collections (id, slug, label, label_plural, icon, has_locale, has_slug, has_status, created_at, updated_at)
SELECT 'col-brandbook-' || lower(hex(randomblob(4))), 'brandbook', 'Brand Asset', 'Brand Assets', 'Palette', 0, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM collections WHERE slug = 'brandbook');

-- Limpa assets anteriores 
DELETE FROM entries WHERE collection_id = (SELECT id FROM collections WHERE slug = 'brandbook');

-- CORES
INSERT INTO entries (id, collection_id, data, slug, status, created_at, updated_at) VALUES 
('entry-bbk-' || lower(hex(randomblob(4))), (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"Branco Contraste","category":"cor","brand":"global","hex_value":"#FFFFFF","desc":"Cor para texto e logos sobre fundos escuros/surface.","usage_notes":"Para legibilidade máxima em dark mode."}', 'branco-texto', 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('entry-bbk-' || lower(hex(randomblob(4))), (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"Preto Contraste","category":"cor","brand":"global","hex_value":"#000000","desc":"Cor para texto e logos sobre fundos claros.","usage_notes":"Para legibilidade máxima em temas claros."}', 'preto-texto', 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('entry-bbk-' || lower(hex(randomblob(4))), (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"Azul Ponto","category":"cor","brand":"global","hex_value":"#00ade8","desc":"O azul nativo para o ponto (dot).","usage_notes":"O ponto deve ter SEMPRE essa cor em todas as marcas e serviços."}', 'azul-ponto', 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('entry-bbk-' || lower(hex(randomblob(4))), (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"Dark Surface","category":"cor","brand":"global","hex_value":"#0b1326","desc":"Cor de fundo base para as aplicações.","usage_notes":"Usada no corpo do site."}', 'dark-surface', 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- TIPOGRAFIA
INSERT INTO entries (id, collection_id, data, slug, status, created_at, updated_at) VALUES 
('entry-bbk-' || lower(hex(randomblob(4))), (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"Montserrat Medium 500","category":"tipografia","brand":"global","desc":"A fonte oficial para composição de MARCAS e logotipos.","usage_notes":"Usar SEMPRE em caixa baixa (lowercase) para logotipos das marcas e soluções."}', 'montserrat-medium', 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- LOGOS
INSERT INTO entries (id, collection_id, data, slug, status, created_at, updated_at) VALUES 
('entry-bbk-' || lower(hex(randomblob(4))), (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"ness.","category":"logo","brand":"ness","desc":"Marca Principal","usage_notes":"Sempre caixa baixa. Ponto na cor #00ade8. O resto varia entre branco/preto conforme o fundo."}', 'logo-ness', 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('entry-bbk-' || lower(hex(randomblob(4))), (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"trustness.","category":"logo","brand":"trustness","desc":"Marca Ecossistema Trust/Auditoria","usage_notes":"Sempre caixa baixa. Ponto na cor #00ade8."}', 'logo-trustness', 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('entry-bbk-' || lower(hex(randomblob(4))), (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"forense.io","category":"logo","brand":"forense","desc":"Marca Ecossistema Forense Digital","usage_notes":"Sempre caixa baixa. Ponto entre ''forense'' e ''io'' na cor #00ade8."}', 'logo-forense', 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- SOLUÇÕES
INSERT INTO entries (id, collection_id, data, slug, status, created_at, updated_at) VALUES 
('entry-bbk-' || lower(hex(randomblob(4))), (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"n.secops.","category":"logo","brand":"ness","desc":"Serviço: Resiliência Operacional & Continuidade","usage_notes":"Sempre caixa baixa. Ponto na cor #00ade8."}', 'logo-nsecops', 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('entry-bbk-' || lower(hex(randomblob(4))), (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"n.infraops.","category":"logo","brand":"ness","desc":"Serviço: Infraestrutura Inteligente & Suporte","usage_notes":"Sempre caixa baixa. Ponto na cor #00ade8."}', 'logo-ninfraops', 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('entry-bbk-' || lower(hex(randomblob(4))), (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"n.devarch.","category":"logo","brand":"ness","desc":"Serviço: Arquitetura Orientada ao Engenheiro","usage_notes":"Sempre caixa baixa. Ponto na cor #00ade8."}', 'logo-ndevarch', 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('entry-bbk-' || lower(hex(randomblob(4))), (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"n.autoops.","category":"logo","brand":"ness","desc":"Serviço: Eficiência Operacional & Automação","usage_notes":"Sempre caixa baixa. Ponto na cor #00ade8."}', 'logo-nautoops', 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('entry-bbk-' || lower(hex(randomblob(4))), (SELECT id FROM collections WHERE slug = 'brandbook'), '{"title":"n.cirt.","category":"logo","brand":"ness","desc":"Serviço: Resposta a Incidentes Críticos","usage_notes":"Sempre caixa baixa. Ponto na cor #00ade8."}', 'logo-ncirt', 'published', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
