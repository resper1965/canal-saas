-- ============================================================
--  canal. — Seed v2  (ness. site 2026)
--  Dados reais em PT + EN + ES
--  Extraídos dos mocks do front-end para tornar Canal a
--  fonte de verdade da aplicação.
-- ============================================================

-- ── INSIGHTS (Blog) ─────────────────────────────────────────

INSERT INTO insights (lang, slug, title, tag, icon, date, desc, published, featured) VALUES

-- PT
('pt', 'resiliencia-cibernetica-2026', 'A Nova Era da Resiliência Cibernética',
  'Segurança', 'ShieldCheck',
  '2026-04-12',
  'Como as empresas estão se preparando para ameaças invisíveis em 2026.',
  1, 1),

('pt', 'ia-generativa-operacoes-criticas', 'IA Generativa em Operações Críticas',
  'IA', 'Brain',
  '2026-04-10',
  'O papel dos agentes autônomos na eficiência operacional moderna.',
  1, 0),

('pt', 'arquiteturas-serverless-escalabilidade', 'Arquiteturas Serverless e Escalabilidade',
  'Cloud', 'Cloud',
  '2026-04-08',
  'Maximizando a performance com infraestrutura sob demanda.',
  1, 0),

-- EN
('en', 'cyber-resilience-2026', 'The New Era of Cyber Resilience',
  'Security', 'ShieldCheck',
  '2026-04-12',
  'How companies are preparing for invisible threats in 2026.',
  1, 1),

('en', 'generative-ai-critical-operations', 'Generative AI in Critical Operations',
  'AI', 'Brain',
  '2026-04-10',
  'The role of autonomous agents in modern operational efficiency.',
  1, 0),

('en', 'serverless-architectures-scalability', 'Serverless Architectures and Scalability',
  'Cloud', 'Cloud',
  '2026-04-08',
  'Maximizing performance with on-demand infrastructure.',
  1, 0),

-- ES
('es', 'resiliencia-cibernetica-2026', 'La Nueva Era de la Resiliencia Cibernética',
  'Seguridad', 'ShieldCheck',
  '2026-04-12',
  'Cómo las empresas se preparan para amenazas invisibles en 2026.',
  1, 1),

('es', 'ia-generativa-operaciones-criticas', 'IA Generativa en Operaciones Críticas',
  'IA', 'Brain',
  '2026-04-10',
  'El papel de los agentes autónomos en la eficiencia operacional moderna.',
  1, 0),

('es', 'arquitecturas-serverless-escalabilidad', 'Arquitecturas Serverless y Escalabilidad',
  'Cloud', 'Cloud',
  '2026-04-08',
  'Maximizando el rendimiento con infraestructura bajo demanda.',
  1, 0);

-- ── JOBS (Careers) ──────────────────────────────────────────

INSERT INTO jobs (lang, title, vertical, location, type, desc, requirements, published) VALUES

-- PT
('pt', 'Engenheiro de Software Sênior (Fullstack)', 'engenharia',
  'Remoto / São Paulo', 'Full-time',
  'Buscamos especialistas em React e Node.js para atuar em projetos de alta escala e resiliência.',
  '["5+ anos de experiência","Domínio de TypeScript","Vivência com arquiteturas distribuídas"]',
  1),

('pt', 'Analista de Segurança Ofensiva (Red Team)', 'segurança',
  'Remoto / Portugal', 'Full-time',
  'Foco em testes de intrusão, análise de vulnerabilidades e fortalecimento de perímetros digitais.',
  '["Experiência com Pentest","Certificações OSCP/CEH","Conhecimento em Cloud Security"]',
  1),

('pt', 'Arquiteto de Soluções Cloud', 'infraestrutura',
  'Híbrido / Chile', 'Full-time',
  'Desenho e implementação de infraestruturas resilientes e escaláveis em ambientes multi-cloud.',
  '["Domínio de AWS/Azure/GCP","Experiência com IaC (Terraform)","Foco em FinOps"]',
  1),

-- EN
('en', 'Senior Software Engineer (Fullstack)', 'engineering',
  'Remote / São Paulo', 'Full-time',
  'We seek specialists in React and Node.js to work on high-scale and resilient projects.',
  '["5+ years of experience","Proficiency in TypeScript","Experience with distributed architectures"]',
  1),

('en', 'Offensive Security Analyst (Red Team)', 'security',
  'Remote / Portugal', 'Full-time',
  'Focus on penetration testing, vulnerability analysis and digital perimeter hardening.',
  '["Penetration testing experience","OSCP/CEH certifications","Knowledge in Cloud Security"]',
  1),

('en', 'Cloud Solutions Architect', 'infrastructure',
  'Hybrid / Chile', 'Full-time',
  'Design and implementation of resilient and scalable infrastructures in multi-cloud environments.',
  '["Proficiency in AWS/Azure/GCP","Experience with IaC (Terraform)","FinOps focus"]',
  1),

-- ES
('es', 'Ingeniero de Software Senior (Fullstack)', 'ingeniería',
  'Remoto / São Paulo', 'Full-time',
  'Buscamos especialistas en React y Node.js para trabajar en proyectos de alta escala y resiliencia.',
  '["5+ años de experiencia","Dominio de TypeScript","Experiencia con arquitecturas distribuidas"]',
  1),

('es', 'Analista de Seguridad Ofensiva (Red Team)', 'seguridad',
  'Remoto / Portugal', 'Full-time',
  'Enfoque en pruebas de intrusión, análisis de vulnerabilidades y fortalecimiento de perímetros digitales.',
  '["Experiencia en Pentest","Certificaciones OSCP/CEH","Conocimiento en Cloud Security"]',
  1),

('es', 'Arquitecto de Soluciones Cloud', 'infraestructura',
  'Híbrido / Chile', 'Full-time',
  'Diseño e implementación de infraestructuras resilientes y escalables en entornos multi-cloud.',
  '["Dominio de AWS/Azure/GCP","Experiencia con IaC (Terraform)","Enfoque en FinOps"]',
  1);

-- ── CASES (Portfolio) ───────────────────────────────────────
-- Colunas: lang, slug, client, category, project, result, desc, stats, image, featured, published

INSERT INTO cases (lang, slug, client, category, project, result, desc, stats, image, featured, published) VALUES

-- PT
('pt', 'grupo-industrial-global', 'Grupo Industrial Global', 'segurança',
  'Resposta a Ransomware Global',
  'Contenção em 6h com zero pagamento de resgate.',
  'Coordenação de crise em 3 continentes após ataque massivo de ransomware, restaurando operações críticas sem perda de dados.',
  '6h Resposta',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
  1, 1),

('pt', 'varejo-de-larga-escala', 'Varejo de Larga Escala', 'ia',
  'Gabi.OS - Copiloto Logístico',
  'Redução de 40% no tempo de resposta logística.',
  'Implementação de IA generativa para orquestração de conhecimento e tomada de decisão em tempo real na cadeia de suprimentos.',
  '-40% Tempo',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
  1, 1),

('pt', 'e-commerce-unicornio', 'E-commerce Unicórnio', 'infraestrutura',
  'Escala Black Friday',
  '99.99% de disponibilidade com tráfego 10x maior.',
  'Modernização de infraestrutura cloud-native para suportar picos extremos de tráfego, garantindo performance e estabilidade.',
  '99.99% Uptime',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
  0, 1),

('pt', 'instituicao-financeira', 'Instituição Financeira', 'segurança',
  'Vazamento de Dados Críticos',
  'Mitigação total de multas regulatórias.',
  'Gestão técnica e estratégica de incidente de vazamento, incluindo forense avançada e conformidade com LGPD/BACEN.',
  'Zero Multas',
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
  0, 1),

('pt', 'logistica-integrada', 'Logística Integrada', 'infraestrutura',
  'Orquestração Híbrida',
  'Otimização de 25% nos custos operacionais.',
  'Migração e gestão de ambientes híbridos complexos, unificando a governança de TI e reduzindo desperdícios de recursos.',
  '-25% Custos',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
  0, 1),

('pt', 'healthtech', 'HealthTech', 'ia',
  'Triagem Inteligente',
  'Agilidade de 60% no atendimento inicial.',
  'Uso de processamento de linguagem natural para triagem automatizada de pacientes, garantindo precisão e segurança de dados.',
  '+60% Agilidade',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
  0, 1),

-- EN
('en', 'global-industrial-group', 'Global Industrial Group', 'security',
  'Global Ransomware Response',
  'Containment in 6h with zero ransom payment.',
  'Crisis coordination across 3 continents after a massive ransomware attack, restoring critical operations without data loss.',
  '6h Response',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
  1, 1),

('en', 'large-scale-retail', 'Large-Scale Retail', 'ai',
  'Gabi.OS - Logistics Copilot',
  '40% reduction in logistics response time.',
  'Implementation of generative AI for knowledge orchestration and real-time decision-making in the supply chain.',
  '-40% Time',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
  1, 1),

('en', 'unicorn-e-commerce', 'Unicorn E-commerce', 'infrastructure',
  'Black Friday Scale',
  '99.99% availability with 10x traffic spike.',
  'Cloud-native infrastructure modernization to support extreme traffic peaks, ensuring performance and stability.',
  '99.99% Uptime',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
  0, 1),

('en', 'financial-institution', 'Financial Institution', 'security',
  'Critical Data Breach',
  'Full mitigation of regulatory fines.',
  'Technical and strategic management of a data breach incident, including advanced forensics and GDPR/BACEN compliance.',
  'Zero Fines',
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
  0, 1),

('en', 'integrated-logistics', 'Integrated Logistics', 'infrastructure',
  'Hybrid Orchestration',
  '25% optimization in operational costs.',
  'Migration and management of complex hybrid environments, unifying IT governance and reducing resource waste.',
  '-25% Costs',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
  0, 1),

('en', 'healthtech', 'HealthTech', 'ai',
  'Smart Triage',
  '60% agility in initial patient care.',
  'Use of natural language processing for automated patient triage, ensuring accuracy and data security.',
  '+60% Agility',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
  0, 1),

-- ES
('es', 'grupo-industrial-global', 'Grupo Industrial Global', 'seguridad',
  'Respuesta a Ransomware Global',
  'Contención en 6h sin pago de rescate.',
  'Coordinación de crisis en 3 continentes tras un ataque masivo de ransomware, restaurando operaciones críticas sin pérdida de datos.',
  '6h Respuesta',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
  1, 1),

('es', 'comercio-minorista', 'Comercio Minorista a Gran Escala', 'ia',
  'Gabi.OS - Copiloto Logístico',
  'Reducción del 40% en el tiempo de respuesta logística.',
  'Implementación de IA generativa para orquestación del conocimiento y toma de decisiones en tiempo real en la cadena de suministro.',
  '-40% Tiempo',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
  1, 1),

('es', 'e-commerce-unicornio', 'E-commerce Unicornio', 'infraestructura',
  'Escala Black Friday',
  '99.99% de disponibilidad con tráfico 10 veces mayor.',
  'Modernización de infraestructura cloud-native para soportar picos extremos de tráfico, garantizando rendimiento y estabilidad.',
  '99.99% Uptime',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
  0, 1),

('es', 'institucion-financiera', 'Institución Financiera', 'seguridad',
  'Filtración de Datos Críticos',
  'Mitigación total de multas regulatorias.',
  'Gestión técnica y estratégica de un incidente de filtración de datos, incluida forense avanzada y cumplimiento LGPD/BACEN.',
  'Cero Multas',
  'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
  0, 1),

('es', 'logistica-integrada', 'Logística Integrada', 'infraestructura',
  'Orquestación Híbrida',
  'Optimización del 25% en costos operativos.',
  'Migración y gestión de entornos híbridos complejos, unificando la gobernanza de TI y reduciendo el desperdicio de recursos.',
  '-25% Costos',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
  0, 1),

('es', 'healthtech', 'HealthTech', 'ia',
  'Triaje Inteligente',
  'Agilidad del 60% en la atención inicial.',
  'Uso de procesamiento de lenguaje natural para el triaje automatizado de pacientes, garantizando precisión y seguridad de datos.',
  '+60% Agilidad',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
  0, 1);
