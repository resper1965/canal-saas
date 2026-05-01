-- Seed extra de Insights e Recriação Enriquecida de Cases.
-- Baseado nas expertises: Ricardo Esper, Agnaldo Silva, Ismael Araujo, Barbara Alencar, Monica Yoshida, Thiago Bertuzzi, Daniel Ajzen, Rogério Salerno. 
-- Clientes originais: Alupar/TBE/Nova Energia, ionic.health, Comercial Esperança, Leite Tosto e Barros, Target Trading, Cavan S/A.

-- ====================================================
-- INSIGHTS: NOVOS E MAIS PROFUNDOS
-- ====================================================

-- 1. Engenharia & SecOps (Thiago Bertuzzi + Agnaldo Silva)
INSERT OR REPLACE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'ins-eng-sec-001', NULL, c.id, 'nuvem-hibrida-e-resiliencia', 'pt', 'published',
  json('{"title":"Nuvem Híbrida e Resiliência: Quando Engenharia e SecOps Falam o Mesmo Idioma","tag":"Cloud","icon":"Server","date":"2026-03-01","desc":"O desafio de orquestrar código escalável sem criar falhas de segurança. Uma visão da liderança da ness.","featured":true,"body":"## Quebrando Silos entre Desenvolvimento e Segurança\n\nNo ambiente de nuvem moderno, a velha divisão entre operações de segurança e engenharia de software cria fricção. Na ness., nossa abordagem atua nas duas pontas.\n\n**Thiago Bertuzzi**, especialista em Desenvolvimento e Arquitetura Cloud, enfatiza a flexibilidade: ''Sistemas resilientes não nascem apenas de código bom, mas da fundação cloud-native estruturada, muitas vezes em cenários híbridos onde on-premise conversa com edge.''\n\nDesse lado vital, a fundação precisa de tranca forte.\n\n**Agnaldo Silva**, liderando n.secops e PMO, aponta: ''SecOps só é efetivo se for invisível e habilitador. Nossa gestão alinha pipelines CI/CD perfeitamente ao ZTNA (Zero Trust), tornando a alta performance tão segura quanto um cofre offline.''"}'),
  datetime('now', '-5 days'), datetime('now', '-5 days'), datetime('now', '-5 days')
FROM collections c WHERE c.slug = 'insights';

-- 2. FinOps e Gestão (Daniel Ajzen)
INSERT OR REPLACE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'ins-finops-001', NULL, c.id, 'finops-estrategico-o-custo-invisivel', 'pt', 'published',
  json('{"title":"FinOps Estratégico: O custo invisível de não otimizar sua TI","tag":"Gestão","icon":"TrendingUp","date":"2026-02-28","desc":"Como o modelo de precificação reflete a qualidade do código e da operação de TI.","featured":false,"body":"## Transparência Financeira na TI\n\nMuitas empresas tratam a nuvem como uma utilidade cega, faturada e paga sem análise. Isso é um equívoco letal para as margens do negócio.\n\n**Daniel Ajzen**, focado no pilar de modelos de precificação e gestão da ness., decodifica esse enigma corporativo: ''Na ness., nosso modelo é desenhado para clarificar onde cada centavo atua. O verdadeiro parceiro de TI não lucra com sua ineficiência, pelo contrário, traz um TCO que brilha aos olhos do CFO. Um software rápido roda menos, custa menos, rende mais.''"}'),
  datetime('now', '-10 days'), datetime('now', '-10 days'), datetime('now', '-10 days')
FROM collections c WHERE c.slug = 'insights';

-- 3. IA no Suporte (Ismael Araujo)
INSERT OR REPLACE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'ins-suporte-ia-001', NULL, c.id, 'gabi-em-acao-automa-360-no-itsm', 'pt', 'published',
  json('{"title":"Gabi em Ação: Automação 360 e Resiliência no Service Desk","tag":"Suporte","icon":"Bot","date":"2026-02-15","desc":"O futuro do ITSM é ágil, preditivo e não dorme. Veja a revolução dos nossos assistentes autônomos.","featured":false,"body":"## A Morte dos SLA Lentos\n\nA resolução de tickets de infraestrutura não precisa mais ser um longo ciclo iterativo de perguntas. \n\n**Ismael Araujo**, com sua vasta experiência em Suporte e ITSM, capitaneou a integração da IA Gabi nos workflows da ness. ''Nossa IA não apenas lê manuais. Ela provisiona scripts seguros e antecipa quedas interpretando logs das plataformas. O tempo de triagem caiu verticalmente e as análises hoje são proativas, resolvendo a dor do usuário antes dele nem saber que tem um problema.''"}'),
  datetime('now', '-20 days'), datetime('now', '-20 days'), datetime('now', '-20 days')
FROM collections c WHERE c.slug = 'insights';

-- 4. Privacidade e Compliance (Monica Yoshida + Barbara Alencar)
INSERT OR REPLACE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'ins-comp-001', NULL, c.id, 'cultura-de-compliance-certificacoes', 'pt', 'published',
  json('{"title":"Da LGPD à Cultura de Compliance: Blindagem Regulatória","tag":"Compliance","icon":"Scale","date":"2026-01-20","desc":"Por que auditorias rigorosas e standards como ISO 27001 salvam reputações.","featured":true,"body":"## Confiança não é Sorte, é Protocolo\n\n**Barbara Alencar**, especialista no cenário jurídico da LGPD, pontua: ''Empresas perdem milhões a cada dado mal gerido. Quando estruturamos privacidade by design, protegemos não apenas informações, mas as raízes da empresa contra sanções brutais da ANPD.'' \n\nMas não acaba aí. Como avalisar juridicamente a técnica operacional? \n\nA resposta vem da orquestração de **Monica Yoshida**. ''Alinhar os standards, gerar relatórios fidedignos sob padrões ISO e SOC e manter a conformidade internacional transforma um risco legal em ativo estratégico de venda. O nosso compliance abre portas de negócios para os nossos clientes.''"}'),
  datetime('now', '-30 days'), datetime('now', '-30 days'), datetime('now', '-30 days')
FROM collections c WHERE c.slug = 'insights';

-- 5. Forense Avançada e Cibersegurança (Ricardo Esper + Rogério Salerno)
INSERT OR REPLACE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'ins-forense-002', NULL, c.id, 'contrainteligencia-defesa-ativa', 'pt', 'published',
  json('{"title":"Contrainteligência Tecnológica e Defesa Ativa","tag":"CIRT","icon":"Crosshair","date":"2025-12-05","desc":"Sair do modo passivo e entender os passos do atacante cibernético antes do ataque crasso.","featured":true,"body":"## Entendendo a Mente do Atacante\n\nNíveis avançados de segurança não são feitos apenas de firewalls de última geração, mas de inteligência.\n\n**Ricardo Esper**, expert em Cibersegurança e Inteligência Artificial, explica a tese: ''Defesa nativa não é apenas se defender, mas saber exatamente os padrões anômalos que cruzam as redes. Aplicar métodos de contrainteligência nas respostas automatizadas cria o temido ''honey-maze''.'' \n\nNo campo pericial militar e digital, atuando nas trincheiras de war rooms, **Rogério Salerno** complementa: ''A Forense não atua apenas pós-morte do sistema. Ao ler táticas em andamento através das nossas plataformas e análises preditivas, nós isolamos invasores retendo artefatos cruciais, preservando a capacidade dos clientes de expurgá-los completamente e legalmente processá-los.''"}'),
  datetime('now', '-60 days'), datetime('now', '-60 days'), datetime('now', '-60 days')
FROM collections c WHERE c.slug = 'insights';


-- ====================================================
-- CASES ENRIQUECIDOS: Reconstrução Completa 
-- ====================================================
-- Atualizamos os casos originais que eu havia inserido adicionando a propriedade "body".
-- Dessa forma, as páginas de caso viram páginas ricas, com muito contexto.

-- 1. Alupar, TBE e Nova Energia
INSERT OR REPLACE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'case-energia-001', NULL, c.id, 'suporte-ot-energia', 'pt', 'published',
  json('{"client":"Alupar, TBE e Nova Energia","category":"infraestrutura","project":"Suporte Técnico e Segurança em Redes OT","result":"Governança crítica e cibersegurança em redes OT no Setor Elétrico.","desc":"Grandes corporações não param. A ness. unificou o suporte técnico integrando segurança profunda nas redes OT (Operational Technology) e IT para Alupar, TBE e Nova Energia. O ambiente SCADA protegido garantiu compliance operacional sem gargalos.","stats":"0 Downtime | OT/IT Resilience | Atendimento 24/7","featured":true,"image":"https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800","body":"## Desafio do Setor Elétrico\nIndústrias super-reguladas possuem uma premissa fundamental: a operação nunca pode ser desconectada. As redes OT (Operational Technology) de Alupar, TBE e Nova Energia precisavam ser robustecidas contra ciberataques de estados-nação, mas ao mesmo tempo demandavam um suporte técnico impecável 24x7.\n\n## Solução ness.\nAo inserir os rigorosos padrões do **n.secops**, o time liderado por *Agnaldo Silva* implementou camadas de abstração entre a TI e a TO (Tecnologia Operacional).\nAliado ao painel de infraestrutura, mantivemos total visibilidade proativa das válvulas de controle a redes remotas.\n\n* **Governança Unificada**: Consolidação das políticas de acesso.\n* **Orquestração ITSM**: Suporte aéreo aos técnicos de campo assistidos por IA (Gabi).\n\n## Resultado Consolidado\nConfiabilidade plena, auditoria constante validada pelas normas da ONS e imunidade documentada contra tentativas diárias de invasão às redes industriais."}'),
  '2025-05-10 08:30:00', '2025-05-10 08:30:00', '2025-05-10 08:30:00'
FROM collections c WHERE c.slug = 'cases';

-- 2. ionic.health
INSERT OR REPLACE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'case-ionic-health', NULL, c.id, 'soc-global-ionic-health', 'pt', 'published',
  json('{"client":"ionic.health","category":"segurança","project":"IT em Health Tech e SOC n.secops Global","result":"Operações e SOC de Health Tech rodando em mais de 40 países.","desc":"A ionic.health trabalhava com regulação profunda, protegendo segredos e diagnósticos de pacientes internacionalmente. A ness. orquestrou a defesa avançada e SOC internacional da infraestrutura médica.","stats":"+40 Países | HIPAA/GDPR Conformidade | 24/7 Global","featured":true,"image":"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800","body":"## Desafio Internacional de HealthTech\nA interconexão contínua com hospitais do mundo inteiro trazia dois mundos muito delicados para a ionic.health: saúde e latência global. \nSendo uma organização do segmento saúde, era inevitável enfrentar normativas pesadas (HIPAA, LGPD, GDPR) cruzando fronteiras e gerindo endpoints dispersos.\n\n## Arquitetura de Defesa e Suporte\nSob o alinhamento de *Barbara Alencar* nas conformidades de privacidade e da arquitetura base de *Thiago Bertuzzi*, criamos o tecido de telemetria base:\n- SOC n.secops ativo inspecionando cada arquivo de log de imagens médicas exportadas.\n- Conformidade imediata usando relatórios que nossa gestão liderada por *Monica Yoshida* organizou de ponta a ponta.\n- Respostas ágeis geridas pelos processos de ITSM estruturados propostos pela equipe de *Ismael Araujo*.\n\n## Impacto Operacional\nMonitoramento de mais de 40 países e suporte ágil a radiologistas, com vazamento nulo e certificação legal internacional blindada."}'),
  '2025-09-05 10:45:00', '2025-09-05 10:45:00', '2025-09-05 10:45:00'
FROM collections c WHERE c.slug = 'cases';

-- 3. Comercial Esperança
INSERT OR REPLACE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'case-comercial-001', NULL, c.id, 'privacidade-lgpd-comercial-esperanca', 'pt', 'published',
  json('{"client":"Comercial Esperança","category":"compliance","project":"Adequação LGPD e Gestão de Privacidade","result":"Estrutura interna voltada para proteção total ao consumidor final.","desc":"O Comercial Esperança contou com a ness. para identificar pontos cegos e construir uma cultura rígida de Privacidade. Criamos rastreabilidade para funcionários desde a matriz ao PDV.","stats":"Adequação Certificada | ROPA Centralizado","featured":false,"image":"https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800","body":"## Desafio de Pontos de Venda e Dados Massivos\nVarejo implica uma teia caótica gigantesca. No caso do Comercial Esperança, o controle de dados precisava se espalhar por diversas lojas de atacado e varejo com uma governança central de recursos humanos e programas de clientes.\n\n## Mão na Massa pela Privacidade\nLiderada por nossos profissionais de Compliance Legal, o projeto não instalou apenas firewalls, mas moldou processos departamentais:\n1. Mapeamento Profundo (ROPA) em dezenas de sessões consultivas.\n2. Integração de Segurança de Dados para inibir uso indevido de pendrives ou e-mails corporativos.\n3. Treinamentos intensivos para os gerentes e operadores dos caixas.\n\nA responsabilidade jurídica aliou-se ao viés de precificação otimizado de *Daniel Ajzen*, provando que segurança robusta no varejo pode manter um TCO altamente agressivo a favor do cliente."}'),
  '2025-12-01 11:00:00', '2025-12-01 11:00:00', '2025-12-01 11:00:00'
FROM collections c WHERE c.slug = 'cases';

-- 4. Leite Tosto e Barros
INSERT OR REPLACE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'case-leite-tosto', NULL, c.id, 'gestao-nsecops-leite-tosto-barros', 'pt', 'published',
  json('{"client":"Leite Tosto e Barros Associados","category":"segurança","project":"Gestão de n.secops e Blindagem","result":"Segregação estanque via n.secops para dados sigilosos na área jurídica.","desc":"Lidando com segredos de justiça em fusões e litigâncias de alto escalão, o escrtório necessitou de mitigação blindada contra resgates hackers na era do ransomware moderno.","stats":"Muralha Digital Ativa | 100% Retenção Forense","featured":true,"image":"https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800","body":"## Desafio Jurídico Sigiloso\nBancas de advocacia corporativas como a Leite Tosto e Barros estão no alvo principal de criminosos buscando extorsão por segredos judiciais milionários. Era necessário um ecossistema estanque e forense pronto.\n\n## Postura Preditiva Total\nA equipe da ness. interveio trazendo a expertise em arquiteturas isoladas ZTNA. O arquiteto cibernético do projeto isolou a documentação de casos críticos, limitou privilégios contextuais diários e permitiu auditorias passivas para casos que requieressem prova. *Rogério Salerno* guiou requisitos pré-aprovados pela matriz em relação a Forense antecipada, desenhando um ambiente onde malwares de exfiltração sequer iniciam sua rotina sem sofrerem \"kill\" autônomo.\n\nO resultado foi um escritório de advocacia ultra-modernizado com paz de espírito integral."}'),
  '2026-01-20 13:20:00', '2026-01-20 13:20:00', '2026-01-20 13:20:00'
FROM collections c WHERE c.slug = 'cases';

-- 5. Target Trading
INSERT OR REPLACE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'case-target-trading', NULL, c.id, 'gestao-ti-target-trading', 'pt', 'published',
  json('{"client":"Target Trading","category":"infraestrutura","project":"Gestão de TI de Alta Performance","result":"Latência mínima e segurança cibernética extrema para operações financeiras globais.","desc":"A Target Trading requeria zero falha nas operações diretas com a B3 e plataformas de clearing, sob um regime de TI impecável focado na mínima latência de routing.","stats":"Low Latency Core | Zero Falhas em Ordens | Conformidade BACEN","featured":false,"image":"https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800","body":"## Desafio do Mercado Financeiro\nPara mesas proprietárias operacionais de volumes vultosos, milissegundos significam milhões.\nA infraestrutura antiga engessava e ameaçava a liquidação nas pontas devidos gargalos de roteamento clássico.\n\n## Solução de Alto Giro\nA ness., encabeçada pelos visionários de redes e infraestrutura (*Thiago Bertuzzi* e parceiros do ecossistema), estruturou conexões BGP robustas aliadas à aceleração cloud. A governança do suporte operou hand-offs perfeitamente com SLAs incisivos medidos pela IA Gabi e gestão operacional liderada por metodologias de resiliência. O ambiente entregou as latências exigidas contra as corretoras integradas enquanto os endpoints dos traders alcançaram níveis de compliance restritos ditados pela gestão de *Ricardo Esper*."}'),
  '2026-03-05 15:30:00', '2026-03-05 15:30:00', '2026-03-05 15:30:00'
FROM collections c WHERE c.slug = 'cases';

-- 6. Cavan S/A
INSERT OR REPLACE INTO entries (id, tenant_id, collection_id, slug, locale, status, data, published_at, created_at, updated_at)
SELECT 
  'case-cavan-001', NULL, c.id, 'gestao-e-atendimento-cavan', 'pt', 'published',
  json('{"client":"Cavan S/A","category":"suporte","project":"Gestão e Atendimento de TI (Desde 1991)","result":"De on-premise raiz para a nuvem híbrida ao longo das décadas.","desc":"A Cavan S/A atesta a dedicação no longo prazo da ness. Nós fomos responsáveis por toda a evolução de infraestrutura e gestão e atendimento de TI do cliente industriário.","stats":"+30 Anos de Parceria | Resiliência | Nuvem Central","featured":true,"image":"https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800","body":"## Parceria além do Código\nO relacionamento tecnológico construído através do tempo ensina muito sobre lealdade com o core business do cliente. A evolução de datacenters monolíticos em porões nos anos 90 até data-lakes hospedados na cloud prova nosso comprometimento como consultoria e provedores de segurança.\n\n## Estratégia Adotada\nCada transição geracional (Mainframe -> Client-Server -> Cloud) foi guiada pela liderança do time da ness. \nGraças ao braço forte das modelagens financeiras orquestradas por *Daniel Ajzen*, a CAVAN transitou de grandes OpEx legados para estruturas enxutas SaaS. A operação de TI e suporte local, continuamente treinada pelas visões de *Ismael Araujo*, serviu aos funcionários não importando em qual gerência assumisse o bastão. É o nosso case máximo de resiliência mútua."}'),
  '2026-04-10 09:00:00', '2026-04-10 09:00:00', '2026-04-10 09:00:00'
FROM collections c WHERE c.slug = 'cases';
