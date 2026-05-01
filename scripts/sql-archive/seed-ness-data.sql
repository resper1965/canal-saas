-- ════════════════════════════════════════════════════════════════
-- Canal CMS — Seed Data: ness. (dados de teste para o site)
-- Roda sobre o schema v3 (tabela entries com tenant_id)
-- ════════════════════════════════════════════════════════════════

-- Primeiro, buscar os collection_ids
-- (Assumindo que seed-collections já rodou e as collections existem)

-- ── BRANDBOOK: Cores Corporativas ───────────────────────────────

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'bb-cor-001', NULL,
  c.id, 'azul-ness-primario', 'pt', 'published',
  json('{"title":"Azul Ness Primary","category":"cor","brand":"ness","hex_value":"#0A84FF","desc":"Cor primária institucional. Usada em CTAs, links e elementos de destaque.","usage_notes":"Usar sobre fundo escuro para máximo contraste. Nunca aplicar sobre fundos claros sem contorno."}'),
  datetime('now'), datetime('now'), datetime('now')
FROM collections c WHERE c.slug = 'brandbook';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'bb-cor-002', NULL,
  c.id, 'cinza-surface', 'pt', 'published',
  json('{"title":"Surface Dark","category":"cor","brand":"ness","hex_value":"#1A1A2E","desc":"Cor de fundo principal do site e dashboard. Base do dark mode.","usage_notes":"Aplicar como background principal. Evitar texto longo diretamente sobre — usar surface-2 (#242442) para cards."}'),
  datetime('now'), datetime('now'), datetime('now')
FROM collections c WHERE c.slug = 'brandbook';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'bb-cor-003', NULL,
  c.id, 'accent-cyan', 'pt', 'published',
  json('{"title":"Accent Cyan","category":"cor","brand":"ness","hex_value":"#00D4AA","desc":"Cor de acento para badges, indicadores de sucesso e highlights.","usage_notes":"Usar com parcimônia — máximo 10% da superfície visual."}'),
  datetime('now'), datetime('now'), datetime('now')
FROM collections c WHERE c.slug = 'brandbook';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'bb-cor-004', NULL,
  c.id, 'vermelho-alerta', 'pt', 'published',
  json('{"title":"Alert Red","category":"cor","brand":"ness","hex_value":"#FF453A","desc":"Cor de alerta e ações destrutivas (deletar, erro, aviso crítico).","usage_notes":"Exclusivo para estados de erro e danger zones. Nunca usar decorativamente."}'),
  datetime('now'), datetime('now'), datetime('now')
FROM collections c WHERE c.slug = 'brandbook';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'bb-cor-005', NULL,
  c.id, 'branco-texto', 'pt', 'published',
  json('{"title":"Text White","category":"cor","brand":"ness","hex_value":"#F0F0F5","desc":"Cor principal de texto sobre fundos escuros.","usage_notes":"Usar para headings e body text. Para texto secundário, usar #A0A0B8."}'),
  datetime('now'), datetime('now'), datetime('now')
FROM collections c WHERE c.slug = 'brandbook';

-- ── BRANDBOOK: Tipografia ───────────────────────────────────────

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'bb-tipo-001', NULL,
  c.id, 'inter-sans', 'pt', 'published',
  json('{"title":"Inter","category":"tipografia","brand":"ness","desc":"Fonte principal para UI, dashboards e interfaces administrativas. Pesos: 400, 500, 600, 700. Excelente legibilidade em telas.","usage_notes":"Usar em todo o admin panel, formulários e tabelas. Sempre com font-feature-settings: cv02, cv03, cv04 para diferenciação de caracteres."}'),
  datetime('now'), datetime('now'), datetime('now')
FROM collections c WHERE c.slug = 'brandbook';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'bb-tipo-002', NULL,
  c.id, 'jetbrains-mono', 'pt', 'published',
  json('{"title":"JetBrains Mono","category":"tipografia","brand":"ness","desc":"Fonte monospace para código, IDs, hashes e dados técnicos. Pesos: 400, 700.","usage_notes":"Usar exclusivamente para: IDs de entry, hashes, code blocks, logs e outputs de terminal."}'),
  datetime('now'), datetime('now'), datetime('now')
FROM collections c WHERE c.slug = 'brandbook';

-- ── BRANDBOOK: Logos ────────────────────────────────────────────

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'bb-logo-001', NULL,
  c.id, 'ness-logo-dark', 'pt', 'published',
  json('{"title":"ness. Logo Dark","category":"logo","brand":"ness","desc":"Logo principal da ness. para fundo escuro. Formato SVG.","usage_notes":"Usar sobre fundos #1A1A2E ou mais escuros. Mínimo 120px de largura. Sempre com o ponto final.","preview_url":"data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20180%2056%22%20width%3D%22110%22%20height%3D%2256%22%3E%3Ctext%20x%3D%220%22%20y%3D%2244%22%20font-family%3D%22Arial%2CHelvetica%2Csans-serif%22%20font-size%3D%2244%22%20font-weight%3D%22400%22%20fill%3D%22%23F0F0F5%22%20letter-spacing%3D%22-2%22%3Eness%3C%2Ftext%3E%3Ccircle%20cx%3D%22166%22%20cy%3D%2240%22%20r%3D%228%22%20fill%3D%22%2300D4AA%22%2F%3E%3C%2Fsvg%3E"}'),
  datetime('now'), datetime('now'), datetime('now')
FROM collections c WHERE c.slug = 'brandbook';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'bb-logo-002', NULL,
  c.id, 'ness-logo', 'pt', 'published',
  json('{"title":"ness. Shield","category":"logo","brand":"ness","desc":"Logo da vertical ness. (cibersegurança e privacidade). Ícone de escudo com shield gradient.","usage_notes":"Usar apenas em contextos de segurança, LGPD, SOC e compliance. Nunca misturar com logo ness. no mesmo espaço.","preview_url":"data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%230A84FF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M12%2022s8-4%208-10V5l-8-3-8%203v7c0%206%208%2010%208%2010z%22%2F%3E%3C%2Fsvg%3E"}'),
  datetime('now'), datetime('now'), datetime('now')
FROM collections c WHERE c.slug = 'brandbook';

-- ── SIGNATURES: Equipe ness. ────────────────────────────────────

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'sig-001', NULL,
  c.id, 'ricardo-esperanca', 'pt', 'published',
  json('{"name":"Ricardo Esperança","role":"CEO & Founder","email":"resper@bekaa.eu","phone":"+351 912 345 678","brand":"ness","department":"Diretoria","linkedin":"https://linkedin.com/in/ricardoesperanca"}'),
  datetime('now'), datetime('now'), datetime('now')
FROM collections c WHERE c.slug = 'signatures';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'sig-002', NULL,
  c.id, 'ana-silva', 'pt', 'published',
  json('{"name":"Ana Silva","role":"Head of Design","email":"ana@ness.com.br","phone":"+55 11 99999-9999","brand":"ness","department":"Design"}'),
  datetime('now'), datetime('now'), datetime('now')
FROM collections c WHERE c.slug = 'signatures';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'sig-003', NULL,
  c.id, 'marcos-oliveira', 'pt', 'published',
  json('{"name":"Marcos Oliveira","role":"CTO","email":"marcos@ness.com.br","phone":"+55 11 99999-9999","brand":"ness","department":"Tech"}'),
  datetime('now'), datetime('now'), datetime('now')
FROM collections c WHERE c.slug = 'signatures';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'sig-004', NULL,
  c.id, 'carla-mendes', 'pt', 'published',
  json('{"name":"Carla Mendes","role":"COO","email":"carla@ness.com.br","phone":"+55 11 99999-9999","brand":"ness","department":"Operações"}'),
  datetime('now'), datetime('now'), datetime('now')
FROM collections c WHERE c.slug = 'signatures';

-- ── INSIGHTS: ZTNA e n.secops ────────────────────────────────
DELETE FROM entries WHERE collection_id = (SELECT id FROM collections WHERE slug = 'insights');

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'ins-ztna-001', NULL, c.id, 'ztna-e-o-fim-das-vpns', 'pt', 'published',
  json('{"title":"ZTNA e o Fim das VPNs: O Padrão n.secops","tag":"Segurança","icon":"Shield","date":"2025-06-15","desc":"A transição para Zero Trust Network Access (ZTNA) redefiniu a segurança corporativa. Veja como Ricardo Esper e Agnaldo Silva lideram essa mudança na ness.","featured":true,"body":"## A Segurança Sem Perímetro\n\nOperar com VPNs convencionais provou ser o calcanhar de Aquiles das corporações. Com a adoção de ZTNA (Zero Trust Network Access), a filosofia muda de ''confie e verifique'' para ''nunca confie, sempre verifique''.\n\nSegundo **Ricardo Esper**, especialista em IA, Cybersegurança e Contrainteligência da ness., ''A arquitetura Zero Trust não apenas mitiga movimentos laterais de malware, mas transforma a postura de defesa em algo orgânico.''\n\n### O Papel do n.secops e Implantação\n\n**Agnaldo Silva**, responsável pelo SecOps, PMO e Implantação, reforça que a implementação do n.secops com ZTNA exige governança clara. ''Não se trata apenas de software. É uma mudança cultural gerenciada que implementamos camada por camada, garantindo máxima segurança sem atrito operacional.''\n\nCom o n.secops, a implantação de ZTNA torna-se previsível e letal contra ameaças."}'),
  '2025-06-15 10:00:00', '2025-06-15 10:00:00', '2025-06-15 10:00:00'
FROM collections c WHERE c.slug = 'insights';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'ins-agent-001', NULL, c.id, 'modelos-agenticos-no-suporte', 'pt', 'published',
  json('{"title":"Modelos Agênticos no Suporte e a IA Gabi","tag":"IA","icon":"Brain","date":"2025-08-20","desc":"A Inteligência Artificial Gabi transformou a resolução de chamados e a segurança usando tecnologias de modelos agênticos autônomos.","featured":true,"body":"## IA que Resolve\n\nA tecnologia de modelos agênticos na segurança da informação marca a virada onde a IA deixa de ser passiva para atuar autonomamente.\n\n### A Gabi na ness.\n\nNa ness., temos a **Gabi**, uma IA nativa projetada para o ecossistema cibernético.\n\n**Ismael Araujo**, especialista em Infraestrutura, ITSM e Suporte, observa: ''Com a Gabi operando os modelos agênticos, chamados de infraestrutura e incidentes de segurança são triados e frequentemente resolvidos autonomamente na nossa base. A automação no suporte não é o futuro, é a realidade atual que entregamos.''"}'),
  '2025-08-20 14:30:00', '2025-08-20 14:30:00', '2025-08-20 14:30:00'
FROM collections c WHERE c.slug = 'insights';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'ins-priv-001', NULL, c.id, 'privacidade-como-diferencial', 'pt', 'published',
  json('{"title":"Privacidade, Compliance e Standards","tag":"Compliance","icon":"FileCheck","date":"2025-10-10","desc":"Por que a conformidade vai além de documentos? Como a governança e LGPD criam um escudo de confiança nos negócios modernos.","featured":false,"body":"## A Maturidade da LGPD\n\n**Barbara Alencar**, especialista em Privacidade e LGPD, aborda a importância contínua: ''A adequação falha quando é tratada como projeto com data fim. Ela deve ser um ciclo.'' Para isso, os sistemas são auditados rigorosamente.\n\nA governança orquestrada por **Monica Yoshida**, focada em Standards e Compliance, alinha essas regras. ''Mapeamos a aderência a normas como a ISO 27001 junto da LGPD, trazendo resiliência jurídica e operacional.''"}'),
  '2025-10-10 09:00:00', '2025-10-10 09:00:00', '2025-10-10 09:00:00'
FROM collections c WHERE c.slug = 'insights';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'ins-dev-001', NULL, c.id, 'modelos-de-gestao-e-dev-agil', 'pt', 'published',
  json('{"title":"Software de Alta Performance, Gestão e Modelos de Precificação","tag":"Desenvolvimento","icon":"Code","date":"2025-11-25","desc":"Alinhando engenharia refinada à previsibilidade financeira de curto e longo prazo.","featured":false,"body":"## Construindo Pontes entre Técnico e Financeiro\n\n**Thiago Bertuzzi**, especialista em Desenvolvimento, eleva o patamar técnico dos produtos que rodam na edge e infraestruturas complexas. O código ágil otimiza o uso de nuvem.\n\nComplementando isso, **Daniel Ajzen**, focado em modelos de precificação e gestão, garante sustentação financeira: ''Nossos modelos trazem clareza. Você paga pelo que escala, evitando excessos de licenciamentos ineficientes e TCO flácido.''"}'),
  '2025-11-25 11:30:00', '2025-11-25 11:30:00', '2025-11-25 11:30:00'
FROM collections c WHERE c.slug = 'insights';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'ins-cirt-001', NULL, c.id, 'n-cirt-crises-ciberneticas-e-forense', 'pt', 'published',
  json('{"title":"Atendimento n.cirt e Forense nas Crises Cibernéticas","tag":"CIRT","icon":"Activity","date":"2026-02-12","desc":"O plano de contingência e preservação legal essenciais em um incidente cibernético.","featured":true,"body":"## The Breach\n\nOs primeiros 30 minutos ditam o impacto de um ataque de ransomware ou exfiltração.\n\nSegundo **Rogério Salerno**, especialista em Forense da ness.: ''O atendimento com *n.cirt* foca não só em conter a ameaça rapidamente, mas em assegurar que cada passo mantenha a cadeia de custódia inquebrável para fins legais e de seguro cibernético. A análise forense ocorre em linha com a resposta ao incidente.''"}'),
  '2026-02-12 16:20:00', '2026-02-12 16:20:00', '2026-02-12 16:20:00'
FROM collections c WHERE c.slug = 'insights';

-- ── CASES: Projetos clientes ────────────────────────────────────
DELETE FROM entries WHERE collection_id = (SELECT id FROM collections WHERE slug = 'cases');

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'case-energia-001', NULL, c.id, 'suporte-ot-energia', 'pt', 'published',
  json('{"client":"Alupar, TBE e Nova Energia","category":"infraestrutura","project":"Suporte Técnico e Segurança em Redes OT","result":"Governança crítica e cibersegurança em redes OT no Setor Elétrico.","desc":"Grandes corporações não param. A ness. unificou o suporte técnico integrando segurança profunda nas redes OT (Operational Technology) e IT para Alupar, TBE e Nova Energia. O ambiente SCADA protegido garantiu compliance operacional sem gargalos.","stats":"0 Downtime | OT/IT Resilience | Atendimento 24/7","featured":true}'),
  '2025-05-10 08:30:00', '2025-05-10 08:30:00', '2025-05-10 08:30:00'
FROM collections c WHERE c.slug = 'cases';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'case-ionic-health', NULL, c.id, 'soc-global-ionic-health', 'pt', 'published',
  json('{"client":"ionic.health","category":"segurança","project":"IT em Health Tech e SOC n.secops Global","result":"Operações e SOC de Health Tech rodando em mais de 40 países.","desc":"A ionic.health, atuando com dados críticos de saúde, demandava proteção blindada internacionalmente. A ness. aplicou o n.secops, coordenando defesas preditivas, acesso e suporte em IT para dispositivos em mais de 40 países de forma orquestrada.","stats":"+40 Países | 100% Compliance Médico | 24/7 Global","featured":true}'),
  '2025-09-05 10:45:00', '2025-09-05 10:45:00', '2025-09-05 10:45:00'
FROM collections c WHERE c.slug = 'cases';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'case-comercial-001', NULL, c.id, 'privacidade-lgpd-comercial-esperanca', 'pt', 'published',
  json('{"client":"Comercial Esperança","category":"compliance","project":"Adequação LGPD e Gestão de Privacidade","result":"Estrutura interna voltada para proteção total ao consumidor final.","desc":"O Comercial Esperança contou com a ness. para identificar pontos cegos e construir uma cultura rígida de Privacidade e LGPD. Criamos rastreabilidade e treinamos funcionários da matriz ao PDV, mitigando vazamentos e atendendo as demandas da ANPD.","stats":"Adequação Certificada | ROPA Centralizado","featured":false}'),
  '2025-12-01 11:00:00', '2025-12-01 11:00:00', '2025-12-01 11:00:00'
FROM collections c WHERE c.slug = 'cases';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'case-leite-tosto', NULL, c.id, 'gestao-nsecops-leite-tosto-barros', 'pt', 'published',
  json('{"client":"Leite Tosto e Barros Associados","category":"segurança","project":"Gestão de n.secops e Blindagem","result":"Segregação estanque via n.secops para dados sigilosos na área jurídica.","desc":"Lidando com segredos de justiça, a Leite Tosto e Barros requereu máxima fortificação. A ness. aplicou o framework n.secops estruturado, implementando controles de acesso profundos e um combate automatizado contra ransomware no escritório.","stats":"Dados Segregados | Mitigação Autônoma","featured":false}'),
  '2026-01-20 13:20:00', '2026-01-20 13:20:00', '2026-01-20 13:20:00'
FROM collections c WHERE c.slug = 'cases';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'case-target-trading', NULL, c.id, 'gestao-ti-target-trading', 'pt', 'published',
  json('{"client":"Target Trading","category":"infraestrutura","project":"Gestão de TI de Alta Performance","result":"Latência mínima e segurança cibernética para operações financeiras.","desc":"Os ecossistemas de trading não toleram delays. A ness. operou a gestão profunda de TI da Target Trading, modernizando conexões vitais e trazendo o suporte estruturado para orquestrar as movimentações com compliance global irretocável.","stats":"Low Latency | Zero Falhas em Ordens Críticas","featured":false}'),
  '2026-03-05 15:30:00', '2026-03-05 15:30:00', '2026-03-05 15:30:00'
FROM collections c WHERE c.slug = 'cases';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'case-cavan-001', NULL, c.id, 'gestao-e-atendimento-cavan', 'pt', 'published',
  json('{"client":"Cavan S/A","category":"suporte","project":"Gestão e Atendimento de TI (Desde 1991)","result":"De on-premise raiz para a nuvem híbrida ao longo das décadas.","desc":"Desde 1991 a Cavan S/A atesta a dedicação no longo prazo da ness. Nós fomos responsáveis por toda a evolução de infraestrutura e gestão e atendimento de TI do cliente, renovando arquiteturas de dados e suporte tático ininterruptamente.","stats":"35 Anos de Suporte | Renovação Constante","featured":true}'),
  '2026-04-02 09:00:00', '2026-04-02 09:00:00', '2026-04-02 09:00:00'
FROM collections c WHERE c.slug = 'cases';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'case-abes-001', NULL, c.id, 'n-secops-abes', 'pt', 'published',
  json('{"client":"ABES","category":"segurança","project":"Implementação do n.secops Institucional","result":"Plataforma segura e robusta para os maiores players de software.","desc":"A Associação Brasileira das Empresas de Software (ABES) exigiu o estado-da-arte na adoção do n.secops. Mais do que alertas na borda, a gestão contínua fortificou o seu back-office para atuar adequadamente nas frentes corporativas e industriais.","stats":"Nível Governamental | Detecção L1 Autônoma","featured":true}'),
  '2026-04-18 10:15:00', '2026-04-18 10:15:00', '2026-04-18 10:15:00'
FROM collections c WHERE c.slug = 'cases';

-- ── JOBS: Vagas abertas ─────────────────────────────────────────

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'job-001', NULL,
  c.id, NULL, 'pt', 'published',
  json('{"title":"Engenheiro(a) de Segurança Sênior","vertical":"segurança","location":"São Paulo, SP (Híbrido)","type":"Full-time","desc":"Buscamos profissional sênior para liderar operações de segurança ofensiva e defensiva para nossos clientes enterprise. Atuação no SOC ness. com gestão de incidentes e threat hunting.","requirements":["5+ anos em cibersegurança","Certificação CISSP, CEH ou equivalente","Experiência com SIEM/SOAR","Conhecimento em cloud security (AWS/Azure/GCP)","Inglês avançado"]}'),
  datetime('now'), datetime('now'), datetime('now')
FROM collections c WHERE c.slug = 'jobs';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'job-002', NULL,
  c.id, NULL, 'pt', 'published',
  json('{"title":"Desenvolvedor(a) Full-Stack (Edge/Workers)","vertical":"engenharia","location":"Remoto (Brasil/Portugal)","type":"Full-time","desc":"Desenvolvimento de plataformas SaaS na edge com Cloudflare Workers, D1 e Hono. Projetos incluem Canal CMS e ness. Platform. Stack: TypeScript, React, Workers AI.","requirements":["3+ anos com TypeScript","Experiência com Cloudflare Workers ou edge computing","React/Next.js","SQL (D1/PostgreSQL)","Familiaridade com AI/LLM é diferencial"]}'),
  datetime('now'), datetime('now'), datetime('now')
FROM collections c WHERE c.slug = 'jobs';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'job-003', NULL,
  c.id, NULL, 'pt', 'published',
  json('{"title":"Consultor(a) de Privacidade e LGPD","vertical":"segurança","location":"São Paulo, SP","type":"Full-time","desc":"Consultoria em adequação LGPD para clientes enterprise. Atuação com mapeamento de dados, DPIA, ROPA e treinamentos. Uso da plataforma ness. para automação de processos de privacidade.","requirements":["Formação em Direito ou Tecnologia","Certificação DPO/CDPO","2+ anos com projetos LGPD/GDPR","Conhecimento em frameworks de privacidade (NIST, ISO 27701)","Habilidade de comunicação com C-Level"]}'),
  datetime('now'), datetime('now'), datetime('now')
FROM collections c WHERE c.slug = 'jobs';

-- ── PAGES: Páginas institucionais ───────────────────────────────

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'page-001', NULL,
  c.id, 'sobre', 'pt', 'published',
  json('{"title":"Sobre a ness.","meta_title":"Sobre a ness. | Tecnologia desde 1991","meta_description":"A ness. é uma empresa de tecnologia fundada em 1991 com mais de 34 anos de experiência em infraestrutura, segurança e cloud.","body":"## Quem Somos\n\nA **ness.** é uma empresa de tecnologia fundada em 1991, com mais de 34 anos de experiência em soluções críticas para empresas. Atuamos nas verticais de **Infraestrutura**, **Cibersegurança**, **Cloud** e **Inteligência Artificial**.\n\n## Nossas Verticais\n\n- **ness. Infrastructure** — Data center, redes, telecom\n- **ness. by ness.** — SOC, SIEM, LGPD, pentest\n- **ness. Cloud** — Multi-cloud, edge computing, serverless\n- **ness. AI** — RAG, agentes MCP, automação cognitiva\n\n## Números\n\n| Métrica | Valor |\n|---------|-------|\n| Anos de mercado | 34+ |\n| Clientes ativos | 200+ |\n| Profissionais | 150+ |\n| Uptime médio | 99.97% |"}'),
  datetime('now'), datetime('now'), datetime('now')
FROM collections c WHERE c.slug = 'pages';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'page-002', NULL,
  c.id, 'servicos', 'pt', 'published',
  json('{"title":"Nossos Serviços","meta_title":"Serviços | ness. Tecnologia","meta_description":"Conheça os serviços da ness.: infraestrutura, cibersegurança, cloud computing e inteligência artificial para empresas.","body":"## Serviços\n\n### 🏗️ Infraestrutura & Redes\nProjeto, implementação e gestão de infraestrutura corporativa. Data centers, redes complexas e telecomunicações.\n\n### 🛡️ Cibersegurança (ness.)\nSOC 24x7, SIEM, pentest, compliance LGPD/GDPR, resposta a incidentes e threat intelligence.\n\n### ☁️ Cloud & Edge Computing\nMigração cloud-first, multi-cloud (AWS/Azure/Cloudflare), edge computing com Workers e otimização de custos.\n\n### 🤖 Inteligência Artificial\nRAG corporativo, agentes MCP, automação de processos com LLMs, analytics preditivo e Workers AI.\n\n---\n\n> **Fale com um consultor:** [contato@ness.com.br](mailto:contato@ness.com.br)"}'),
  datetime('now'), datetime('now'), datetime('now')
FROM collections c WHERE c.slug = 'pages';

-- ── FORMS: Exemplos de submissões ───────────────────────────────

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'form-001', NULL,
  c.id, NULL, 'pt', 'published',
  json('{"source":"site-contato","payload":{"nome":"João Pereira","email":"joao@empresa.com.br","assunto":"Orçamento SOC","mensagem":"Gostaria de receber um orçamento para implementação de SOC 24x7 para nossa empresa. Temos 500 colaboradores e infraestrutura híbrida."}}'),
  NULL, datetime('now'), datetime('now')
FROM collections c WHERE c.slug = 'forms';

INSERT OR IGNORE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'form-002', NULL,
  c.id, NULL, 'pt', 'published',
  json('{"source":"site-newsletter","payload":{"email":"maria@startup.io","nome":"Maria Costa","interesse":"IA e Automação"}}'),
  NULL, datetime('now'), datetime('now')
FROM collections c WHERE c.slug = 'forms';
