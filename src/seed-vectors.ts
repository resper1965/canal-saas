interface SeedEnv {
  DB: D1Database;
  QUEUE: Queue;
}

interface VectorRow {
  id: string;
  payload: string;
  collection_slug: string;
}

export async function seedVectors(env: SeedEnv) {
  const dbRes = await env.DB.prepare(`
    SELECT e.id, e.data as payload, c.slug as collection_slug
    FROM entries e
    JOIN collections c ON e.collection_id = c.id
    WHERE e.status = 'published'
    ORDER BY e.updated_at DESC
  `).all()

  const rows = dbRes.results as unknown as VectorRow[]

  if (!rows || rows.length === 0) {
    return ['⚠️ Nenhum dado publicado encontrado para indexar.']
  }

  // Enqueue each entry for async processing (batches of 25)
  const batchSize = 25
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    await env.QUEUE.sendBatch(
      batch.map((row) => ({
        body: {
          type: 'vectorize-entry' as const,
          payload: {
            entryId: row.id,
            data: JSON.parse(row.payload || '{}'),
            collectionSlug: row.collection_slug,
          },
        },
      }))
    )
  }

  return [`📊 Enqueued ${rows.length} entries for vectorization (async via queue)`]
}
