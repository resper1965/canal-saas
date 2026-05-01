import { generateText } from 'ai'
import { createWorkersAI } from 'workers-ai-provider'

export interface EnvWithAI {
  AI: any
}

export async function runAI(env: EnvWithAI, modelId: string, systemPrompt: string, userPrompt: string) {
  try {
    const workersai = createWorkersAI({ binding: env.AI })
    
    const { text } = await generateText({
      model: workersai(modelId),
      system: systemPrompt,
      prompt: userPrompt
    })
    
    return text
  } catch (err: any) {
    console.error('[AI] Worker AI Error (Vercel SDK):', err)
    throw new Error(`Failed to process AI request: ${err.message}`)
  }
}
