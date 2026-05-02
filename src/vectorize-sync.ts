/**
 * vectorize-sync.ts — Auto-sync entries to Cloudflare Vectorize
 *
 * Provides helper functions to upsert/delete vectors whenever
 * CMS entries are created, updated, or deleted.
 * Fire-and-forget: errors are logged but don't block the response.
 */

export async function upsertVector(
  env: { AI: Ai; VECTORIZE: VectorizeIndex },
  entryId: string,
  data: Record<string, unknown>,
  collectionSlug: string,
  tenantId?: string
) {
  try {
    const title = (data.title as string) || (data.name as string) || collectionSlug
    const content = (data.content as string) || (data.desc as string) || (data.description as string) || ''
    const tags = (data.tags as string) || ''
    const services = (data.services as string) || ''

    // Build a rich text representation for embedding
    const text = [
      `[${collectionSlug}] ${title}`,
      content,
      tags,
      services,
    ]
      .filter(Boolean)
      .join('\n')
      .slice(0, 4000) // embedding input cap

    if (text.length < 10) return // skip near-empty entries

    const embedding = (await env.AI.run('@cf/baai/bge-base-en-v1.5', {
      text: [text],
    })) as { data: number[][] }

    await env.VECTORIZE.upsert([
      {
        id: `entry-${entryId}`,
        values: embedding.data[0],
        metadata: {
          title,
          collection: collectionSlug,
          content: text.slice(0, 1000), // metadata cap
          ...(tenantId ? { tenant_id: tenantId } : {}),
        },
      },
    ])
  } catch (err) {
    console.error(`[vectorize-sync] upsert failed for ${entryId}:`, err)
  }
}

export async function deleteVector(
  env: { VECTORIZE: VectorizeIndex },
  entryId: string
) {
  try {
    await env.VECTORIZE.deleteByIds([`entry-${entryId}`])
  } catch (err) {
    console.error(`[vectorize-sync] delete failed for ${entryId}:`, err)
  }
}
