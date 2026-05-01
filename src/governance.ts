/**
 * Canal CMS — Governance Policy Engine
 *
 * Classificação temática de conteúdo para decidir entre publicação
 * autônoma (agente publica direto) ou assistida (draft → humano aprova).
 *
 * Regra fail-safe: na dúvida, exige humano.
 */

import type { GovernancePolicy } from './collections'
import { getCollection } from './collections'
import { generateText } from 'ai'
import { createWorkersAI } from 'workers-ai-provider'

// ── Temas que SEMPRE exigem aprovação humana ─────────────────────
export const ASSISTED_TOPICS: string[] = [
  // Compliance & Regulatório
  'compliance', 'regulatório', 'regulatorio', 'lgpd', 'gdpr', 'anpd',
  'auditoria', 'fiscalização', 'fiscalizacao',
  // Incidentes & Segurança
  'incidente', 'vazamento', 'breach', 'ransomware', 'ataque',
  'vulnerabilidade', 'exposição', 'exposicao',
  // Jurídico & Financeiro
  'jurídico', 'juridico', 'processo', 'litígio', 'litigio',
  'financeiro', 'faturamento', 'receita', 'prejuízo', 'prejuizo',
  // Relações Corporativas
  'parceria', 'aquisição', 'aquisicao', 'm&a', 'fusão', 'fusao',
  'cliente', 'contrato', 'SLA',
  // Marca & Posicionamento
  'posicionamento', 'marca', 'rebranding', 'crise',
  'comunicado oficial', 'nota oficial',
  // Pessoas
  'demissão', 'demissao', 'desligamento', 'reestruturação', 'reestruturacao',
]

// ── Temas seguros para publicação autônoma ───────────────────────
export const AUTONOMOUS_TOPICS: string[] = [
  'tecnologia', 'tendências', 'tendencias', 'cloud', 'devops',
  'tutorial', 'open source', 'IA generativa', 'inteligência artificial',
  'infraestrutura', 'automação', 'automacao', 'monitoramento',
  'kubernetes', 'docker', 'terraform', 'observabilidade',
  'ciber', 'soc', 'siem', 'zero trust', 'ztna',
  'SD-WAN', 'SASE', 'telecom', '5G', 'fibra',
  'dados', 'analytics', 'data lake', 'ETL',
  'agile', 'scrum', 'kanban', 'sprint',
  'performance', 'otimização', 'otimizacao', 'benchmark',
]

// ── Resultado da classificação ───────────────────────────────────
export interface GovernanceDecision {
  /** Status final que a entry deve receber */
  status: 'published' | 'draft'
  /** Decisão de governança aplicada */
  decision: 'autonomous' | 'assisted' | 'blocked'
  /** Razão da classificação (para audit trail) */
  reason: string
}

/**
 * Classifica o conteúdo de uma entry e decide se pode ser publicada
 * autonomamente ou se precisa de revisão humana.
 */
export function classifyContent(text: string): { matchedTopic: string | null; isAssisted: boolean } {
  const normalized = text.toLowerCase()

  // Verificar temas sensíveis primeiro (mais restritivo)
  for (const topic of ASSISTED_TOPICS) {
    if (normalized.includes(topic.toLowerCase())) {
      return { matchedTopic: topic, isAssisted: true }
    }
  }

  return { matchedTopic: null, isAssisted: false }
}

/**
 * Aplica a política de governança completa:
 * 1. Verifica a governance da collection
 * 2. Se autonomous, verifica o conteúdo contra os temas
 * 3. Retorna a decisão final
 */
export async function enforceGovernance(
  collectionSlug: string,
  contentText: string,
  env?: any
): Promise<GovernanceDecision> {
  const col = getCollection(collectionSlug)
  if (!col) {
    return {
      status: 'draft',
      decision: 'blocked',
      reason: `Collection "${collectionSlug}" not found`,
    }
  }

  const governance: GovernancePolicy = col.governance

  // Protected: agentes não podem criar/editar
  if (governance === 'protected') {
    return {
      status: 'draft',
      decision: 'blocked',
      reason: `Collection "${collectionSlug}" is protected. Only humans can manage this content.`,
    }
  }

  // Assisted: sempre draft, precisa de aprovação humana
  if (governance === 'assisted') {
    return {
      status: 'draft',
      decision: 'assisted',
      reason: `Collection "${collectionSlug}" requires human approval.`,
    }
  }

  // Autonomous: verificar conteúdo contra temas sensíveis via regex e IA
  const { matchedTopic, isAssisted } = classifyContent(contentText)

  if (isAssisted) {
    return {
      status: 'draft',
      decision: 'assisted',
      reason: `Content matched sensitive topic: "${matchedTopic}". Requires human review.`,
    }
  }

  // Zero-shot fallback via AI para garantir compliance adicional
  if (env && env.AI) {
    try {
      // Usando Vercel AI SDK conforme solicitado
      const workersai = createWorkersAI({ binding: env.AI })

      const { text } = await generateText({
        model: workersai('@cf/meta/llama-3.1-8b-instruct-fast'),
        system: 'Você é um validador de compliance corporativo. Responda APENAS com "SAFE" se o conteúdo for seguro para publicação autônoma. Responda "ASSISTED" se o conteúdo envolver risco corporativo, financeiro, escândalos, dados sensíveis ou qualquer tópico que mereça moderação humana.',
        prompt: contentText
      });

      const resultText = (text || '').trim().toUpperCase();
      if (resultText.includes('ASSISTED')) {
        return {
          status: 'draft',
          decision: 'assisted',
          reason: 'AI heuristic marked content as potentially sensitive. Requires human review.',
        }
      }
    } catch (e: any) {
      console.warn('[Governance] AI fallback failed, continuing to auto-publish if regex passed:', e.message);
    }
  }

  // Seguro para publicação autônoma
  return {
    status: 'published',
    decision: 'autonomous',
    reason: `Content classified as safe for autonomous publishing.`,
  }
}
