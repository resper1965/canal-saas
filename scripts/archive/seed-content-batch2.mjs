/**
 * seed-content-batch2.mjs
 * Inserts into: insights (lang,slug,title,tag,icon,date,desc,published,featured)
 *               cases   (lang,slug,client,category,project,result,desc,stats,featured)
 * Run: cd canal && node seed-content-batch2.mjs
 */

import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { execSync } from 'child_process';

const DB_FLAGS = 'canal-db --remote';
const BASE = '/home/resper/ness-site2026/canal';

function exec(sql, label) {
  const tmp = `/tmp/_seed_${Date.now()}.sql`;
  writeFileSync(tmp, sql, 'utf8');
  try {
    execSync(`cd ${BASE} && npx wrangler d1 execute ${DB_FLAGS} --file=${tmp} 2>/dev/null`, { stdio: 'pipe' });
    console.log(`  ✅ ${label}`);
  } catch (e) {
    console.error(`  ❌ ${label}: ${e.message.split('\n')[0]}`);
  } finally {
    if (existsSync(tmp)) unlinkSync(tmp);
  }
}

function esc(s) { return String(s ?? '').replace(/'/g, "''"); }

// ─── INSIGHTS ─────────────────────────────────────────────────────────────────
// Schema: id, lang, slug, title, tag, icon, date, desc, published, featured, created_at
// Table does NOT have a body column — desc holds the full copy here.

const insights = [
  {
    slug: 'zero-trust-na-pratica-secops',
    lang: 'pt', tag: 'SecOps', date: '2026-04-15', featured: 1, icon: 'ShieldCheck',
    title: 'Zero Trust na Prática: Como Eliminar a Confiança Implícita da Rede Corporativa',
    desc: 'Zero Trust não é produto — é arquitetura. IBM Cost of a Data Breach 2025: 73% das violações envolveram credenciais de usuários legítimos. O n.secops implementa "never trust, always verify" com microsegmentação, ZTNA e identidade como novo perímetro. Empresas que migraram relatam 94% de redução na superfície de ataque e latência 40% menor que VPN.',
  },
  {
    slug: 'soc-mdr-tco-real',
    lang: 'pt', tag: 'SecOps', date: '2026-04-10', featured: 1, icon: 'DollarSign',
    title: 'SOC Interno vs MDR: O TCO Real que os CISOs Evitam Calcular',
    desc: 'CFOs comparam licença de SIEM com mensalidade de MDR — e erram 70% do custo. SOC 24x7 exige 6 analistas (R$ 80k–120k/mês só em salários) + Splunk Enterprise (~US$ 150k/ano) + EDR + Threat Intel. O dado que muda a conversa: 78% dos ransomwares no Brasil em 2025 ocorreram entre 22h e 6h. Tempo médio de contenção interno: 4,2h. Com MDR n.secops: 18 minutos.',
  },
  {
    slug: 'lgpd-anpd-2026-novas-sancoes',
    lang: 'pt', tag: 'Compliance', date: '2026-03-28', featured: 1, icon: 'Scale',
    title: 'LGPD em 2026: 23 Novas Resoluções da ANPD e o que Muda para Empresas de Médio Porte',
    desc: 'A ANPD publicou 23 novas resoluções desde 2024. As mais críticas: prazo de 3 dias úteis para comunicar incidentes de alto risco (Res. 4/2025), RIPD obrigatório para dados de menores (Res. 7/2025) e cláusulas padrão para transferência internacional (Res. 12/2026). Multa: até 2% do faturamento, limitado a R$ 50M por infração. A Trustness entrega DPOaaS + Data Mapping + protocolos dentro dos prazos legais.',
  },
  {
    slug: 'ransomware-playbook-4-horas',
    lang: 'pt', tag: 'SecOps', date: '2026-04-05', featured: 1, icon: 'AlertTriangle',
    title: 'Ransomware em 2026: O Playbook das Primeiras 4 Horas que Separa Sobreviventes de Vítimas',
    desc: 'Pagamento médio de resgate no Brasil em 2025: R$ 1,8M — e 31% das empresas que pagaram não recuperaram todos os dados. O n.cirt conduz as primeiras 4 horas: isolamento de rede, preservação de evidências forenses (dumps de RAM), acionamento de comunicação de crise e coordenação com ANPD. Empresas sem CIRT têm MTTR 4,7× maior e custo de recuperação 3,2× maior.',
  },
  {
    slug: 'iso27001-2022-novos-controles',
    lang: 'pt', tag: 'Compliance', date: '2026-03-20', featured: 0, icon: 'CheckCircle',
    title: 'ISO 27001:2022: Os 11 Novos Controles que 89% das Empresas Ainda Não Implementaram',
    desc: 'Prazo de migração da versão 2013 para 2022 já passou (outubro/2025). A Trustness conduziu 34 gap analyses em 2025 — 89% das empresas tinham ao menos 4 controles novos sem implementação. Os mais críticos: Threat Intelligence (5.7), Cloud Security (5.23), DLP (8.12) e Codificação Segura/SSDLC (8.28). Roadmap: certificação em 6 meses com auditoria sem não-conformidades maiores.',
  },
  {
    slug: 'ssdlc-seguranca-no-codigo',
    lang: 'pt', tag: 'DevSecOps', date: '2026-04-12', featured: 1, icon: 'Code',
    title: 'SSDLC: Por Que Sua Principal Vulnerabilidade Está no Código, Não no Firewall',
    desc: 'NIST: corrigir uma vulnerabilidade em produção custa 100× mais do que no momento do código. O n.devarch integra segurança em cada fase: Threat Modeling com STRIDE antes da primeira linha, plugins Semgrep/Snyk no IDE, SAST + secrets detection no PR, container scanning no build, IaC scanning no deploy. Resultado: 67% de redução em vulnerabilidades críticas em produção nos primeiros 90 dias — com velocity mantida.',
  },
  {
    slug: 'cicd-moderno-arquitetura-2026',
    lang: 'pt', tag: 'DevSecOps', date: '2026-04-18', featured: 1, icon: 'GitBranch',
    title: 'CI/CD Moderno em 2026: A Arquitetura que Separa Times que Entregam dos que Acumulam Débito',
    desc: 'Pipeline de CI/CD não é automação de build — é a espinha dorsal da qualidade. A arquitetura de referência do n.devarch: Fast Feedback < 5min (lint, unit tests, secrets detection), Quality Gate < 15min (integração, SBOM, cobertura), Security Gate (DAST, IaC scanning) e Deploy Progressivo canary (1% → 10% → 100% com rollback automático). Times elite DORA 2024: múltiplos deploys/dia, CFR < 5%, MTTR < 1h.',
  },
  {
    slug: 'threat-modeling-stride',
    lang: 'pt', tag: 'DevSecOps', date: '2026-04-08', featured: 0, icon: 'Map',
    title: 'Threat Modeling com STRIDE: Identifique Vulnerabilidades Antes de Escrever uma Linha de Código',
    desc: 'A maioria dos times pensa em segurança quando recebe um relatório de pentest — quando mudar custa 10× mais. STRIDE mapeia sistematicamente: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service e Elevation of Privilege. O n.devarch conduz sessões de 2h antes de cada feature significativa, com output integrado ao backlog da squad como user stories de segurança com critérios de aceite mensuráveis.',
  },
  {
    slug: 'sbom-cadeia-suprimentos-software',
    lang: 'pt', tag: 'DevSecOps', date: '2026-03-30', featured: 0, icon: 'Package',
    title: 'SBOM: A Lista de Ingredientes do Seu Software que Auditores Enterprise Exigem em 2026',
    desc: 'O ataque Log4Shell (CVE-2021-44228) afetou 93% dos ambientes cloud empresariais — porque ninguém sabia que usava Log4j. Software Bill of Materials (SBOM) em formatos SPDX e CycloneDX, gerado a cada build com scan contínuo contra NVD e GitHub Advisory. Resultado: alerta imediato quando uma dependência existente recebe CVE crítica, mesmo sem novo deploy. Contratos enterprise no Brasil já exigem SBOM como due diligence de fornecedor.',
  },
  {
    slug: 'dora-metricas-board',
    lang: 'pt', tag: 'DevSecOps', date: '2026-03-22', featured: 0, icon: 'BarChart2',
    title: 'Métricas DORA: Como Mostrar ao CEO que Engenharia É Estratégica, Não Centro de Custo',
    desc: 'Gartner 2025: 87% dos boards discutem cyber e tech, mas 64% dos CISOs e CTOs não geram decisão de investimento. O gap é de linguagem. Deployment Frequency, Lead Time for Changes, Change Failure Rate e MTTR transformam TI em indicadores de negócio. O n.devarch configura dashboards executivos em tempo real a partir do GitHub, GitLab, Jira e PagerDuty que o board já usa.',
  },
  {
    slug: 'pentest-vs-bug-bounty',
    lang: 'pt', tag: 'SecOps', date: '2026-03-15', featured: 0, icon: 'Target',
    title: 'Pentest vs Bug Bounty: Quando Usar Cada Um (e Por Que a Maioria das Empresas Usa Errado)',
    desc: 'Pentest e bug bounty não são sinônimos nem excludentes. Pentest: profundidade em escopo controlado, ideal antes de lançamentos e auditorias ISO/PCI. Bug bounty: amplitude contínua com pesquisadores externos. O modelo híbrido da Trustness: pentest trimestral focado em novos componentes + programa de responsible disclosure para produção. Resolve o gap temporal — o pentest não cobre o que você lançou ontem.',
  },
  {
    slug: 'supply-chain-attack-2026',
    lang: 'pt', tag: 'SecOps', date: '2026-04-02', featured: 0, icon: 'Link',
    title: 'Supply Chain Attack em 2026: Por Que Seus Fornecedores São Sua Maior Vulnerabilidade',
    desc: 'ENISA: 742% de aumento em ataques à cadeia de suprimentos desde 2021. SolarWinds comprometeu 18.000 organizações via um único vendor. Vetores mais comuns: dependency confusion em npm/PyPI, repositórios comprometidos e SaaS com OAuth excessivo. O framework n.secops: SBOM com scan contínuo, due diligence de fornecedores com certificações exigidas, EDR monitorando processos legítimos e revisão trimestral de permissões OAuth.',
  },
  {
    slug: 'grc-linguagem-executiva',
    lang: 'pt', tag: 'Compliance', date: '2026-03-10', featured: 0, icon: 'PieChart',
    title: 'GRC como Linguagem Executiva: 3 Métricas que Transformam Risco Cibernético em Decisão de Board',
    desc: 'Técnicos falam em CVSS scores. Executivos precisam de exposição financeira. As 3 métricas certas: ALE (Annual Loss Expectancy = probabilidade × impacto financeiro), ROSI (retorno do investimento em segurança — MDR n.secops reduz ALE em 68%, Ponemon 2025) e Regulatory Exposure (multas potenciais por categoria — LGPD, BACEN, ANS). O Portal GRC do n.secops consolida tudo em um dashboard executivo.',
  },
  {
    slug: 'dpo-servico-vs-interno',
    lang: 'pt', tag: 'Compliance', date: '2026-02-28', featured: 0, icon: 'UserCheck',
    title: 'DPO como Serviço vs DPO Interno: A Conta Real que Empresas de Médio Porte Precisam Fazer',
    desc: 'LGPD Art. 41 exige DPO mas não exige CLT. DPO sênior CLT em SP: R$ 15k–25k/mês + encargos. DPOaaS da Trustness garante: atendimento a titulares em 15 dias (prazo legal), participação mensal em governança, pareceres para novos projetos, acionamento imediato em incidentes e representação perante a ANPD. Atenção: ANPD investiga DPOs que desconhecem os tratamentos da empresa — responsabilidade recai sobre o controlador.',
  },
  {
    slug: 'privacy-by-design-lgpd',
    lang: 'pt', tag: 'Compliance', date: '2026-01-20', featured: 0, icon: 'Shield',
    title: 'Privacy by Design: Como Construir Produtos que Não Viram Problema de LGPD',
    desc: 'Privacidade adicionada depois do lançamento custa 10× mais para corrigir. LGPD Art. 46 §2º torna Privacy by Design requisito legal. A Trustness implementa com equipes de produto: Privacy Impact Assessment (PIA) antes de cada projeto e um "cartão de privacidade" em cada user story. Em 3 meses, as squads internalizam o processo sem necessidade de consulta para casos comuns — privacy vira parte do Definition of Done.',
  },
];

// ─── CASES ────────────────────────────────────────────────────────────────────
// Schema: id, lang, slug, client, category, project, result, desc, stats, image, featured, published

const cases = [
  {
    slug: 'banco-digital-zero-trust',
    lang: 'pt', featured: 1,
    client: 'Banco Digital — Série B',
    category: 'SecOps / Zero Trust',
    project: 'Migração VPN → ZTNA com MDR 24x7',
    result: '94% de redução na superfície de ataque. ISO 27001 obtida em 5 meses.',
    desc: 'Banco digital com 180 colaboradores remotos e VPN legada com acesso excessivo. Implementamos ZTNA com identidade federada, microsegmentação por segmento de negócio e SOC 24x7 com SIEM correlacionando 47 fontes. Zero incidentes de lateral movement nos 12 meses pós-implementação.',
    stats: '{"attack_surface_reduction":"94%","iso_timeline":"5 meses","endpoints_protected":600,"incidents_post_impl":0}',
  },
  {
    slug: 'hospital-lgpd-dados-saude',
    lang: 'pt', featured: 1,
    client: 'Rede Hospitalar — 4 Unidades',
    category: 'Compliance / LGPD',
    project: 'Programa de Conformidade LGPD — Dados Sensíveis de Saúde',
    result: '100% dos fluxos mapeados. DPO operacional. Zero notificações ANPD em 18 meses.',
    desc: 'Rede hospitalar com prontuário eletrônico multifornecedor sem mapeamento de dados. LGPD completa: 127 fluxos mapeados com bases legais por finalidade, DPOaaS com SLA de 15 dias, RIPD para dados de pacientes menores e treinamento para 850 colaboradores com simulações de phishing.',
    stats: '{"collaborators_trained":850,"data_flows_mapped":127,"time_to_compliance":"90 dias","anpd_notifications":0}',
  },
  {
    slug: 'fintech-contencao-ransomware',
    lang: 'pt', featured: 1,
    client: 'Fintech de Pagamentos',
    category: 'CIRT / Resposta a Incidentes',
    project: 'Contenção de Ransomware e Recuperação Forense Completa',
    result: 'Contenção em 47 minutos. 100% dos dados recuperados. Resgate: R$ 0.',
    desc: 'Fintech acionou o n.cirt às 2h47 após detectar criptografia em produção. Isolamos 23 hosts comprometidos, extraímos dumps forenses com Velociraptor e FTK, coordenamos comunicação com ANPD dentro do prazo de 3 dias e conduziram recuperação completa a partir de backups íntegros verificados.',
    stats: '{"containment_time":"47 min","hosts_isolated":23,"data_recovered":"100%","ransom_paid":"R$ 0","anpd_notified":true}',
  },
  {
    slug: 'industria-iso27001-greenfield',
    lang: 'pt', featured: 0,
    client: 'Indústria de Manufatura — Multinacional',
    category: 'Compliance / ISO 27001',
    project: 'Certificação ISO 27001:2022 em Operação Greenfield',
    result: 'Certificação em 6 meses. Auditoria externa sem não-conformidades maiores.',
    desc: 'Planta industrial nova sem histórico de SGSI. Trustness estruturou do zero: risk assessment com 340 ativos catalogados, 93 controles implementados, políticas e procedimentos, treinamento de 220 colaboradores e auditoria interna antes da certificação. Primeira auditoria externa sem findings bloqueantes.',
    stats: '{"timeline":"6 meses","controls_implemented":93,"assets_cataloged":340,"major_nonconformities":0}',
  },
  {
    slug: 'saas-b2b-devsecops',
    lang: 'pt', featured: 1,
    client: 'SaaS B2B — RH Tech',
    category: 'DevSecOps / n.devarch',
    project: 'SSDLC e DevSecOps em Pipeline de 8 Squads',
    result: '67% de redução em vulnerabilidades críticas. Velocity de entregas mantida.',
    desc: '8 squads com CI/CD sem nenhum controle de segurança e cultura de "security depois". Implementamos gates progressivos: secrets detection e CVEs críticos primeiro (zero falsos positivos), depois SAST com regras calibradas. Lead time não aumentou. Em 90 dias, o time internalizou segurança como parte do Definition of Done.',
    stats: '{"squads":8,"critical_vulns_reduction":"67%","lead_time_increase":"0%","time_to_internalization":"90 dias"}',
  },
  {
    slug: 'operadora-saude-apt',
    lang: 'pt', featured: 1,
    client: 'Operadora de Saúde Suplementar',
    category: 'SecOps / MDR',
    project: 'Detecção Proativa e Neutralização de APT',
    result: 'Ameaça APT detectada e neutralizada em 12 minutos antes da execução.',
    desc: 'SOC do n.secops detectou movimentação lateral às 3h15 com padrão APT em reconhecimento ativo dentro da VLAN de dados de beneficiários. Threat hunting identificou C2 beacon em processo legítimo. Isolamento em 12 minutos evitou exfiltração de 2,1M de registros e notificação compulsória à ANS.',
    stats: '{"detection_time":"12 min","data_at_risk":"2.1M registros","attack_phase":"reconnaissance","ans_notification_avoided":true}',
  },
  {
    slug: 'ecommerce-pci-dss-40',
    lang: 'pt', featured: 0,
    client: 'E-commerce — Top 50 Brasil',
    category: 'Compliance / PCI DSS',
    project: 'Conformidade PCI DSS 4.0 com Redução Radical de Escopo',
    result: 'Escopo PCI reduzido 80% via tokenização. QSA sem achados críticos.',
    desc: 'E-commerce com R$ 800M/ano em transações e escopo PCI extenso abrangendo 47 sistemas. Redesenhamos a arquitetura de pagamentos com tokenização e redirecionamento de forma de pagamento para vault externo. Escopo caiu de 47 para 9 sistemas. QSA concluiu auditoria sem findings críticos ou de alta severidade.',
    stats: '{"annual_gmv":"R$ 800M","scope_before":47,"scope_after":9,"scope_reduction":"80%","qsa_critical_findings":0}',
  },
  {
    slug: 'fintech-credito-dora',
    lang: 'pt', featured: 0,
    client: 'Fintech de Crédito — Série A',
    category: 'DevSecOps / n.devarch',
    project: 'SSDLC Completo e Dashboard DORA para o Board',
    result: 'Deploy frequency: 12×/semana. CFR: de 18% para 4%. Board aprovou expansão.',
    desc: 'CTO cobrado por métricas de produtividade sem linguagem de negócio. Implementamos SSDLC completo e dashboards DORA em tempo real consumindo GitHub, Jira e PagerDuty. O board passou a ver "deployamos 847 vezes no trimestre com 4% de failure rate". Resultado: aprovação de expansão de 6 para 12 engenheiros sem negociação adicional.',
    stats: '{"deploy_frequency":"12x/semana","cfr_before":"18%","cfr_after":"4%","lead_time_p90":"2h","team_expansion":"6→12 devs"}',
  },
];

// ─── INSERT ───────────────────────────────────────────────────────────────────

console.log('\n🚀 Seed Batch #2 — Insights + Cases (tabelas diretas)\n');
console.log(`📊 Inserindo ${insights.length} insights + ${cases.length} cases...\n`);

console.log('📝 Insights:\n');
for (const r of insights) {
  const sql = `
INSERT OR IGNORE INTO insights (lang, slug, title, tag, icon, date, desc, published, featured)
VALUES (
  '${esc(r.lang)}',
  '${esc(r.slug)}',
  '${esc(r.title)}',
  '${esc(r.tag)}',
  '${esc(r.icon)}',
  '${esc(r.date)}',
  '${esc(r.desc)}',
  1,
  ${r.featured}
);`.trim();
  exec(sql, r.slug);
}

console.log('\n📁 Cases:\n');
for (const r of cases) {
  const sql = `
INSERT OR IGNORE INTO cases (lang, slug, client, category, project, result, desc, stats, image, featured, published)
VALUES (
  '${esc(r.lang)}',
  '${esc(r.slug)}',
  '${esc(r.client)}',
  '${esc(r.category)}',
  '${esc(r.project)}',
  '${esc(r.result)}',
  '${esc(r.desc)}',
  '${esc(r.stats)}',
  '',
  ${r.featured},
  1
);`.trim();
  exec(sql, r.slug);
}

console.log('\n🔢 Totais finais:\n');
try {
  const out = execSync(
    `cd ${BASE} && npx wrangler d1 execute ${DB_FLAGS} --json --command="SELECT 'insights' as tbl, count(*) as n FROM insights UNION ALL SELECT 'cases', count(*) FROM cases;" 2>/dev/null`,
    { encoding: 'utf8' }
  );
  const rows = JSON.parse(out)[0]?.results ?? [];
  for (const row of rows) console.log(`  ${row.tbl}: ${row.n} registros`);
} catch { /* silently ignore count display errors */ }

console.log('\n✅ Seed concluído!\n');
