import { EnvWithAI } from './ai/client'
import { upsertVector } from './vectorize-sync'

import { drizzle } from 'drizzle-orm/d1'
import { webhooks_targets, entries, knowledge_base } from './db/schema'
import * as schema from './db/schema'
import { eq } from 'drizzle-orm'

export interface QueueMessage {
  type: 'generate-draft' | 'audit-content' | 'translate' | 'vectorize-entry' | 'webhook-dispatch' | 'SCORE_CV' | 'SEND_NEWSLETTER' | 'SOCIAL_POST_DISPATCH' | 'vectorize-document' | 'generate-seo' | 'generate-social-caption' | 'send-email' | 'process-resume'
  payload: any
}

export async function queueHandler(batch: MessageBatch<QueueMessage>, env: EnvWithAI & { DB: any; VECTORIZE: VectorizeIndex; MEDIA: R2Bucket; RESEND_API_KEY?: string }) {
  for (const message of batch.messages) {
    try {
      console.log(`[Queue] Processing message type: ${message.body.type}`)
      
      switch (message.body.type) {
        case 'send-email': {
          const { to, subject, body } = message.body.payload;
          if (env.RESEND_API_KEY) {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from: 'Privacidade <privacidade@ness.com.br>',
                to,
                subject,
                text: body
              })
            }).catch(e => console.error('[Queue] External Email API Error:', e));
          } else {
            console.log(`[Queue] Simulated Email to: ${to} | Subject: ${subject}`);
          }
          break;
        }
        case 'process-resume': {
          const { applicant_id, r2_key } = message.body.payload;
          console.log(`[Queue] Processing resume for applicant ${applicant_id}`);
          try {
            // 1. Fetch file from R2
            const r2Obj = await env.MEDIA.get(r2_key);
            if (!r2Obj) throw new Error(`Resume not found in R2: ${r2_key}`);
            
            // For MVP: assume PDF text can be extracted or it is a simple markdown/text. 
            // Since Llama 3 on Workers AI doesn't read binaries out-of-the-box, we'll extract as text if possible.
            // *Real PDF parsing* would use pdf.js compiled for edge, but here we fallback to raw text parsing for POC.
            let fileContent = await r2Obj.text();
            
            // Limit to 3000 chars to avoid prompt overflow on Llama-3-8b
            const prompt = `Você é um bot ATS (Applicant Tracking System) de RH. Leia o texto deste currículo e extraia um JSON estrito contendo: 'ai_score' (número de 0 a 100 baseado na clareza e impacto), e 'ai_summary' (parágrafo de 3 linhas com os maiores destaques e skills). Currículo: ${fileContent.substring(0, 3000)}`;

            const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
              messages: [{ role: 'system', content: prompt }]
            });
            
            const rawResponse = String((aiResponse as any).response);
            const jsonText = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
            
            let parsedData = { ai_score: 50, ai_summary: 'Falha ao extrair sumário.' };
            try {
              parsedData = JSON.parse(jsonText);
            } catch (e) {
              parsedData.ai_summary = jsonText.substring(0, 500);
            }

            const db = drizzle(env.DB);
            await db.update(schema.applicants)
              .set({ 
                ai_score: parsedData.ai_score || 50, 
                ai_summary: parsedData.ai_summary, 
                status: 'analyzed' 
              })
              .where(eq(schema.applicants.id, applicant_id));
              
            console.log(`[Queue] Resume processed for ${applicant_id}. Score: ${parsedData.ai_score}`);
          } catch (e) {
            console.error('[Queue] Failed to process resume:', e);
            const db = drizzle(env.DB);
            await db.update(schema.applicants)
              .set({ status: 'error', ai_summary: 'Erro na leitura do arquivo via IA.' })
              .where(eq(schema.applicants.id, applicant_id));
          }
          break;
        }
        case 'vectorize-document': {
          const { id, tenantId, r2_key } = message.body.payload
          console.log(`[Queue] Vectorizing document ${id} [${tenantId}]`)
          try {
            // 1. Fetch text from R2
            const r2Obj = await env.MEDIA.get(r2_key)
            if (!r2Obj) throw new Error('File not found in R2: ' + r2_key)
            const textContent = await r2Obj.text()

            // 2. Chunking (naive 500 words split for MVP)
            const words = textContent.split(/\s+/)
            const chunks: string[] = []
            let currentChunk = []
            for (const word of words) {
              currentChunk.push(word)
              if (currentChunk.length >= 500) {
                chunks.push(currentChunk.join(' '))
                currentChunk = []
              }
            }
            if (currentChunk.length > 0) chunks.push(currentChunk.join(' '))

            // 3. Embed & Insert into Vectorize
            if (!env.VECTORIZE) throw new Error('Vectorize binding not found')
            
            const aiModel = '@cf/baai/bge-base-en-v1.5'
            const embeddingsObj = await env.AI.run(aiModel, {
              text: chunks
            })
            // data is Array of arrays
            const embeddings = (embeddingsObj as any).data
            
            const vectors = chunks.map((chunk, index) => ({
              id: `${id}-chunk-${index}`,
              values: embeddings[index],
              namespace: tenantId, // Using tenantId as namespace for strict isolation!
              metadata: {
                docId: id,
                tenantId: tenantId,
                text_chunk: chunk.substring(0, 5000) // Ensure below limits (Vectorize metadata limit)
              }
            }))

            await env.VECTORIZE.insert(vectors)
            
            // 4. Mark D1 as indexed
            const db = drizzle(env.DB)
            await db.update(schema.knowledge_base)
              .set({ status: 'indexed', chunk_count: chunks.length, updated_at: new Date().toISOString() })
              .where(eq(schema.knowledge_base.id, id))
              
            console.log(`[Queue] Document ${id} indexed with ${chunks.length} chunks.`)
          } catch (e) {
            console.error('[Queue] Vectorize document failed:', e)
            const db = drizzle(env.DB)
            await db.update(schema.knowledge_base)
              .set({ status: 'error', updated_at: new Date().toISOString() })
              .where(eq(schema.knowledge_base.id, id))
          }
          break
        }
        case 'vectorize-entry': {
          const { entryId, data, collectionSlug } = message.body.payload
          await upsertVector(env, entryId, data, collectionSlug)
          console.log(`[Queue] Vectorized entry-${entryId} [${collectionSlug}]`)
          break
        }
        case 'generate-draft':
          console.log('Generating draft for:', message.body.payload.topic)
          break;
        case 'generate-seo': {
          const { entryId, data, tenantId } = message.body.payload
          console.log(`[Queue] Generating SEO for entry ${entryId}`)
          try {
            const contentToAnalyze = data.content || data.body || JSON.stringify(data)
            const prompt = `Você é um especialista em SEO. Baseado no conteúdo fornecido, retorne APENAS um objeto JSON válido com duas chaves: "seo_title" (máx 60 caracteres) e "seo_description" (máx 160 caracteres). Conteúdo: ${contentToAnalyze.substring(0, 3000)}`
            
            const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
              messages: [{ role: 'system', content: prompt }]
            })
            
            const jsonText = String((aiResponse as any).response).replace(/```json/g, '').replace(/```/g, '').trim()
            let seoData = { seo_title: '', seo_description: '' }
            try {
              seoData = JSON.parse(jsonText)
            } catch (err) {
              console.warn('[Queue] Falha no parse do SEO JSON', jsonText)
            }
            
            if (seoData.seo_title || seoData.seo_description) {
              const db = drizzle(env.DB)
              const [originalRow] = await db.select().from(entries).where(eq(entries.id, entryId)).limit(1)
              
              if (originalRow) {
                const currentData = typeof originalRow.data === 'string' ? JSON.parse(originalRow.data) : (originalRow.data || {})
                const updatedData = { ...currentData, seo_title: seoData.seo_title || currentData.seo_title, seo_description: seoData.seo_description || currentData.seo_description }
                
                await db.update(entries)
                  .set({ data: JSON.stringify(updatedData), updated_at: new Date().toISOString() })
                  .where(eq(entries.id, entryId))
                  
                console.log(`[Queue] SEO auto-gerado e salvo no Entry-${entryId}`)
              }
            }
          } catch (e) {
            console.error('[Queue] Gerar SEO falhou:', e)
          }
          break;
        }
        case 'translate': {
          const { entryId, data, targetLocale, tenantId } = message.body.payload
          console.log(`[Queue] Translating entry ${entryId} to ${targetLocale}`)
          try {
            const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
              messages: [
                { role: 'system', content: `Você é um tradutor do Aegis. Formate a saída APENAS como JSON válido. Traduza o conteúdo do objeto abaixo para o idioma ${targetLocale}.` },
                { role: 'user', content: JSON.stringify(data) }
              ]
            })

            // Aqui você processaria o aiResponse.response, extrairia o JSON limpo e inseriria como nova entrada
            const jsonText = String(aiResponse.response).replace(/```json/g, '').replace(/```/g, '').trim()
            let parsedData = data
            try {
              parsedData = JSON.parse(jsonText)
            } catch (jsonErr) {
              console.warn('[Queue] Falha no parse do LLM JSON. Salvando raw string...', jsonText)
            }

            console.log(`[Queue] Translation ready. Inserting into D1...`)
            
            const db = drizzle(env.DB)
            const [originalRow] = await db.select().from(entries).where(eq(entries.id, entryId)).limit(1)

            if (originalRow) {
              const newId = crypto.randomUUID()
              await db.insert(entries).values({
                id: newId,
                tenant_id: originalRow.tenant_id,
                collection_id: originalRow.collection_id,
                data: typeof parsedData === 'string' ? parsedData : JSON.stringify(parsedData), // Save the translated JSON
                slug: originalRow.slug,
                locale: targetLocale,
                status: 'draft', // Saved as draft for review
                created_by: 'ai-worker',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              console.log(`[Queue] Saved Entry-${newId} for locale: ${targetLocale}`)
            }
          } catch (e) {
            console.error('[Queue] Translate falhou:', e)
          }
          break;
        }
        case 'generate-social-caption': {
          const { entryId, data, tenantId, platform } = message.body.payload
          console.log(`[Queue] Generating social caption (${platform}) for entry ${entryId}`)
          try {
            const contentToAnalyze = data.content || data.body || JSON.stringify(data)
            let systemPrompt = `Você é um Social Media Manager. Leia o texto abaixo e crie uma legenda para o LinkedIn B2B. Tom profissional, engajador, sem exagerar nos emojis.`
            if (platform === 'instagram') {
              systemPrompt = `Você é um Social Media Manager. Leia o texto abaixo e crie uma legenda para o Instagram do escritório. Tom mais leve, visual, use hashtags adequadas.`
            }

            const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: contentToAnalyze.substring(0, 3000) }
              ]
            })

            const caption = String((aiResponse as any).response).trim()
            
            const db = drizzle(env.DB)
            const [originalRow] = await db.select().from(entries).where(eq(entries.id, entryId)).limit(1)
            
            if (originalRow) {
              const currentData = typeof originalRow.data === 'string' ? JSON.parse(originalRow.data) : (originalRow.data || {})
              // Anexar no array ou string de social_captions dentro do JSON da entry
              const socialCaptions = currentData.social_captions || {}
              socialCaptions[platform] = caption
              
              const updatedData = { ...currentData, social_captions: socialCaptions }
              
              await db.update(entries)
                .set({ data: JSON.stringify(updatedData), updated_at: new Date().toISOString() })
                .where(eq(entries.id, entryId))
                
              console.log(`[Queue] Social caption para ${platform} salvo no Entry-${entryId}`)
            }
          } catch (e) {
            console.error('[Queue] Gerar caption social falhou:', e)
          }
          break;
        }
        case 'SCORE_CV': {
          const { applicantId, fileKey } = message.body.payload;
          console.log(`[Queue] Scoring CV for applicant ${applicantId}`);
          
          try {
            const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
              messages: [
                { role: 'system', content: 'You are a technical recruiter AI. Analyze this candidate application and return a strict JSON with "score" (0-100) and "summary" (short reason).' },
                { role: 'user', content: 'Attached resume: ' + fileKey }
              ]
            } as any);
            
            const jsonText = String(aiResponse.response).replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(jsonText);
            
            await env.DB.prepare('UPDATE applicants SET ai_score = ?, ai_summary = ? WHERE id = ?').bind(result.score || 50, result.summary || 'Summary not provided', applicantId).run();
            console.log(`[Queue] Scored ${applicantId}: ${result.score}`);
          } catch(e) {
            console.error('[Queue] Scoring CV failed:', e);
          }
          break;
        }
        case 'SOCIAL_POST_DISPATCH': {
          const { postId, platform } = message.body.payload;
          console.log(`[Queue] Dispatching social post ${postId} to platform ${platform}`);
          // Simulate actual publishing delay and logic
          try {
            await new Promise(r => setTimeout(r, 1000));
            await env.DB.prepare('UPDATE social_posts SET status = ? WHERE id = ?').bind('published', postId).run();
            console.log(`[Queue] Successfully published post ${postId} to ${platform}`);
          } catch(e) {
            console.error('[Queue] Dispatching post failed:', e);
          }
          break;
        }
        case 'audit-content':
          console.log('Auditing content ID:', message.body.payload.entryId)
          break;
        case 'webhook-dispatch': {
          const { event, collectionSlug, entryId, tenantId, payloadData } = message.body.payload
          const db = drizzle(env.DB)
          const allTargets = await db.select().from(webhooks_targets).all()
          
          for (const target of allTargets) {
            if (target.active && target.events.includes(event) && (!target.tenant_id || target.tenant_id === tenantId)) {
              try {
                await fetch(target.url, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(target.secret ? { 'x-webhook-secret': target.secret } : {})
                  },
                  body: JSON.stringify({
                    event,
                    collection: collectionSlug,
                    entry_id: entryId,
                    data: payloadData,
                    timestamp: new Date().toISOString()
                  })
                })
                console.log(`[Queue] Webhook fired to ${target.url}`)
              } catch (e) {
                console.error(`[Queue] Failed to fire webhook to ${target.url}:`, e)
              }
            }
          }
          break;
        }
        default:
          console.warn('Unknown message type:', message.body.type)
      }
      
      message.ack()
    } catch (err) {
      console.error(`[Queue] Error processing message (attempt ${message.attempts}):`, err)
      message.retry()
    }
  }
}
