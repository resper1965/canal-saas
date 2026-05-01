import { drizzle } from 'drizzle-orm/d1'
import { eq, sql, and } from 'drizzle-orm'
import { entries, forms } from './db/schema'

export async function cronHandler(event: ScheduledEvent, env: any) {
  console.log(`[Cron] Triggered at ${event.scheduledTime}`)
  const db = drizzle(env.DB)

  try {
    // Audit published entries periodically
    const postsToAudit = await db.select({ id: entries.id, slug: entries.slug })
      .from(entries)
      .where(eq(entries.status, 'published'))
      .limit(50)

    if (postsToAudit.length > 0) {
      console.log(`[Cron] Enqueueing ${postsToAudit.length} entries for audit.`)
      for (const entry of postsToAudit) {
        await env.QUEUE.send({ type: 'audit-content', payload: { entryId: entry.id } })
      }
    }

    // Compliance SLA — forms older than 10 days
    const formsSLA = await env.DB.prepare(
      `SELECT id FROM forms WHERE created_at <= datetime('now', '-10 days')`
    ).all().catch(() => ({ results: [] }))

    if (formsSLA.results?.length > 0 && env.SLACK_WEBHOOK_URL) {
      console.log(`[Cron] SLA Compliance Alert: ${formsSLA.results.length} forms pending`)
      await fetch(env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `⚖️ *ALERTA COMPLIANCE (SLA LGPD)*\nExistem ${formsSLA.results.length} solicitações/denúncias no sistema que superaram 10 dias de ociosidade. Ação do DPO requerida imediatamente.`
        })
      }).catch(() => {})
    }

    // Newsletter Digest (Weekly recap)
    const lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7)
    
    // Obtemos o id the collection insights primeiro (por segurança)
    const insightCol: any = await (env.DB.prepare("SELECT id FROM collections WHERE slug = 'insights' LIMIT 1") as any).first();
    if (insightCol) {
      const colId = insightCol.id;
      const recentPosts = await db.select({ title: sql`json_extract(data, '$.title')`, description: sql`json_extract(data, '$.seo_description')` })
        .from(entries)
        .where(and(eq(entries.collection_id, String(colId)), eq(entries.status, 'published'), sql`created_at >= ${lastWeek.toISOString()}`))

      if (recentPosts && recentPosts.length > 0) {
        console.log(`[Cron] Encontrou ${recentPosts.length} posts recentes para newsletter.`)
        let digestContent = `Esses são os insights publicados pelo escritório nos últimos 7 dias:\n\n`
        recentPosts.forEach((p: any) => digestContent += `- ${p.title} (${p.description || 'Sem descrição'})\n`)
        
        const summarizePrompt = `Você é um curador de conteúdo jurídico. Resuma de forma envolvente as seguintes publicações para ser enviado como um boletim informativo (newsletter) da semana. Comece com uma saudação breve e siga com highlights curtos.\n\nConteúdo bruto:\n${digestContent}`
        
        try {
          const aiResponse = await env.AI.run('@cf/meta/llama-3-8b-instruct', {
            messages: [{ role: 'system', content: summarizePrompt }]
          })
          const newsletterText = String((aiResponse as any).response).trim()
          
          console.log(`[Cron] Newsletter gerada:\n${newsletterText}`)
          
          // Notifica no Slack o Rascunho
          if (env.SLACK_WEBHOOK_URL) {
            await fetch(env.SLACK_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: `📰 *Newsletter Semanal (Rascunho por Gabi IA)*\n\n${newsletterText}`
              })
            }).catch(() => {})
          }
        } catch (err) {
          console.error('[Cron] Falha ao gerar newsletter AI:', err)
        }
      }
    }

    // Social Posts Scheduler (Fase 5 - Epic 5.2)
    // Dispatch approved posts that are past their scheduled time
    const pendingPosts = await env.DB.prepare(
      `SELECT id, platform, content FROM social_posts WHERE status = 'approved' AND scheduled_at <= datetime('now') LIMIT 20`
    ).all().catch(e => { console.error('[Cron] Error fetching social posts:', e); return { results: [] }; });

    if (pendingPosts.results && pendingPosts.results.length > 0) {
      console.log(`[Cron] Dispatching ${pendingPosts.results.length} scheduled social posts.`);
      for (const post of pendingPosts.results) {
        // Enqueue integration dispatch or process directly
        // For MVP, mark as published.
        await env.DB.prepare(
          `UPDATE social_posts SET status = 'published', published_at = datetime('now') WHERE id = ?`
        ).bind(post.id).run();
      }
    }

  } catch (err) {
    console.error('[Cron] Error during scheduled execution:', err)
  }
}
