/**
 * Canal CMS — AI Writer Agent
 * Agente Redator de Conteúdo Empresarial
 * POST /api/ai/write
 */

import { Hono } from 'hono'
import { streamText } from 'ai'
import { createWorkersAI } from 'workers-ai-provider'
import { z } from 'zod'

type Env = {
  Bindings: {
    AI: Ai
    DB: D1Database
  }
}

type WriteRequest = {
  brief: string         // Contexto/brief do usuário
  field: string         // Nome do campo (title, desc, body, result...)
  collection: string    // Coleção (insights, cases, jobs...)
  tone: 'tecnico' | 'consultivo' | 'executivo'
  locale?: string       // Idioma alvo (default: pt)
}

const FIELD_INSTRUCTIONS: Record<string, string> = {
  title: 'um título conciso e impactante (máx. 12 palavras)',
  desc: 'um parágrafo de descrição executiva (2-3 frases, foco em outcome)',
  body: 'um artigo completo estruturado com introdução, desenvolvimento e conclusão',
  result: 'uma frase de resultado mensurável (ex: "Redução de 40% no MTTR com ROI positivo em 6 meses")',
  tag: 'uma tag curta de categoria (1-3 palavras, ex: "Segurança", "IA", "Cloud")',
  stats: 'uma métrica-chave de impacto resumida (ex: "89% faster | 24/7 | 15M events/day")',
  client: 'um nome de cliente anonimizado por setor (ex: "Instituição Financeira Nacional")',
  overview: 'um parágrafo de visão geral da solução/serviço (3-4 frases)',
}

const TONE_INSTRUCTIONS: Record<string, string> = {
  tecnico: `Use linguagem técnica precisa. Mencione tecnologias, frameworks, métricas e arquiteturas quando relevante.
Audience: CTOs, arquitetos, engenheiros sênior.`,
  consultivo: `Foque em outcomes de negócio e ROI. Conecte tecnologia com impacto financeiro e operacional.
Audience: C-level, diretores de TI, tomadores de decisão.`,
  executivo: `Seja extremamente conciso e direto. Uma frase = uma ideia. Sem jargão técnico excessivo.
Audience: CEO, Board, investidores.`,
}

const COLLECTION_CONTEXT: Record<string, string> = {
  insights: 'artigos de thought leadership sobre tecnologia, segurança e inovação empresarial',
  cases: 'cases de sucesso de projetos de tecnologia e segurança para empresas',
  jobs: 'descrições de vagas de emprego para profissionais de tecnologia e segurança',
  solutions: 'descrições de soluções e serviços B2B de tecnologia empresarial',
  pages: 'conteúdo de páginas institucionais de empresa de tecnologia',
}

const TONES = ['tecnico', 'consultivo', 'executivo'] as const
const LOCALES = ['pt', 'en', 'es'] as const

const writeSchema = z.object({
  brief:      z.string().min(1).max(2000),
  field:      z.string().min(1).max(50),
  collection: z.string().min(1).max(50),
  tone:       z.enum(TONES).default('consultivo'),
  locale:     z.enum(LOCALES).default('pt'),
}).strip()

const aiWriter = new Hono<Env>()

aiWriter.post('/write', async (c) => {
  let rawBody: unknown
  try {
    rawBody = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400)
  }

  const parsed = writeSchema.safeParse(rawBody)
  if (!parsed.success) {
    return c.json({ error: 'Invalid request', details: parsed.error.issues }, 400)
  }

  const { brief, field, collection, tone, locale } = parsed.data

  const fieldInstruction = FIELD_INSTRUCTIONS[field] ?? `conteúdo adequado para o campo "${field}"`
  const toneInstruction = TONE_INSTRUCTIONS[tone] ?? TONE_INSTRUCTIONS.consultivo
  const collectionCtx = COLLECTION_CONTEXT[collection] ?? 'conteúdo corporativo empresarial'

  const targetLocale = locale === 'en' ? 'inglês' : locale === 'es' ? 'espanhol' : 'português brasileiro'

  const systemPrompt = `Você é o Redator Sênior de Conteúdo da ness., empresa de tecnologia e segurança B2B fundada em 1991.

CONTEXTO DA EMPRESA:
- Especializada em segurança cibernética, infraestrutura e engenharia digital de precisão
- Clientes: médias e grandes empresas, bancos, hospitais, varejo enterprise
- Posicionamento: invisíveis quando tudo funciona, presentes quando mais importa
- Tom da marca: preciso, confiante, sem sensacionalismo

TAREFA:
Você deve criar ${fieldInstruction} para ${collectionCtx}.
Escreva em ${targetLocale}.

REGRAS DE QUALIDADE:
- NUNCA use clichês corporativos ("inovador", "disruptivo", "ecossistema", "jornada")
- Seja específico: dados concretos > afirmações vazias
- Voz ativa, presente
- Máximo de um adjetivo por frase
- O texto deve poder ser publicado imediatamente, sem edição

TOM A USAR:
${toneInstruction}

Responda APENAS com o texto solicitado, sem explicações, aspas ou formatação extra.`

  try {
    const workersai = createWorkersAI({ binding: c.env.AI })

    const result = await streamText({
      model: workersai('@cf/meta/llama-3.1-8b-instruct'),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Brief do conteúdo:\n${brief.trim()}`,
        },
      ],
    })

    return result.toTextStreamResponse()
  } catch (err) {
    return c.json({ error: 'Falha na geração. Tente novamente.' }, 500)
  }
})

export { aiWriter }
