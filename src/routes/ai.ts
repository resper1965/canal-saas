import { Hono } from 'hono'
import { MODEL_HEAVY } from '../ai/models'
import { runAI } from '../ai/client'
import { z } from 'zod'

type Env = {
  Bindings: {
    AI: any
    QUEUE: Queue
  }
}

const aiRoutes = new Hono<Env>()

const draftSchema = z.object({
  topic: z.string().min(1).max(500),
  bulletPoints: z.array(z.string()).min(1).max(10),
  tone: z.string().optional().default('formal')
})

aiRoutes.post('/draft', async (c) => {
  let rawBody: unknown
  try {
    rawBody = await c.req.json()
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400)
  }

  const parsed = draftSchema.safeParse(rawBody)
  if (!parsed.success) {
    return c.json({ error: 'Invalid request', details: parsed.error.issues }, 400)
  }

  const { topic, bulletPoints, tone } = parsed.data

  const systemPrompt = `Você é um Redator Especialista de Comunicação Corporativa da Ness.
Seu objetivo é redigir um rascunho completo de um Comunicado Institucional.
Tom exigido: ${tone}.
Escreva um texto claro, evitando jargões excessivos, focando na objetividade. Formate a saída diretamente em texto.`

  const userPrompt = `Tópico: ${topic}\nPontos principais a serem incluídos:\n${bulletPoints.map(bp => `- ${bp}`).join('\n')}\nRedija o comunicado:\n`

  try {
    const jobId = crypto.randomUUID()
    
    // Dispatch para a fila processar asiduamente o Llama 70B
    await c.env.QUEUE.send({
      type: 'generate-draft',
      payload: {
        jobId,
        topic,
        systemPrompt,
        userPrompt
      }
    })

    return c.json({ 
      status: 'queued', 
      jobId, 
      message: 'Draft request accepted. It will be processed in the background.' 
    }, 202)
  } catch (err: any) {
    return c.json({ error: 'Erro ao despachar rascunho para fila', details: err.message }, 500)
  }
})



export { aiRoutes }
