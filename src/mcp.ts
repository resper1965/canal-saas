import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js'
import { z } from 'zod'
import { enforceGovernance, ASSISTED_TOPICS, AUTONOMOUS_TOPICS } from './governance'
import { collections, getCollection } from './collections'
import { drizzle } from 'drizzle-orm/d1'
import { eq, and, isNull } from 'drizzle-orm'
import * as dbSchema from './db/schema'

declare global {
  var __MCP_DB: D1Database | undefined;
  var __MCP_TENANT: string | undefined;
  var __MCP_ENV: any | undefined;
}

const server = new McpServer({
  name: "canal-cms",
  version: "1.0.0"
})

// ── Helper: extrair texto legível do JSON de dados ──────────────
function extractTextFromData(dataStr: string): string {
  try {
    const obj = JSON.parse(dataStr)
    return Object.values(obj)
      .filter((v): v is string => typeof v === 'string')
      .join(' ')
  } catch {
    return dataStr
  }
}

// ── Ferramenta 1: Listar coleções ───────────────────────────────
server.tool(
  "list_collections",
  "Lista o schema e política de governança de todas as collections disponíveis no CMS",
  {},
  async () => {
    try {
      return {
        content: [{ type: "text", text: JSON.stringify(collections.map(c => ({
          slug: c.slug,
          label: c.label,
          governance: c.governance,
          fields: c.fields.map(f => f.name),
        })), null, 2) }]
      }
    } catch (e: unknown) {
      return { content: [{ type: "text", text: `Erro: ${e.message}` }] }
    }
  }
)

// ── Ferramenta 2: Listar entradas ───────────────────────────────
server.tool(
  "list_entries",
  "Lista as entries de uma collection específica pelo slug",
  {
    slug: z.string().describe("Slug da collection (ex: insights, jobs, cases, comunicados, social_posts, newsletters)"),
    limit: z.number().optional().describe("Limite de resultados (max 50, default 50)")
  },
  async (args) => {
    const db = globalThis.__MCP_DB
    if (!db) return { content: [{ type: "text", text: "BD não conectado" }] }

    try {
      const tenantId = globalThis.__MCP_TENANT
      const drizzleDb = drizzle(db, { schema: dbSchema })
      
      const coll = await drizzleDb.query.collections.findFirst({
        where: eq(dbSchema.collections.slug, args.slug)
      })
      
      if (!coll) {
        return { content: [{ type: "text", text: `Collection não encontrada: ${args.slug}` }] }
      }

      const results = await drizzleDb.query.entries.findMany({
        where: and(
          eq(dbSchema.entries.collection_id, coll.id),
          tenantId ? eq(dbSchema.entries.tenant_id, tenantId) : isNull(dbSchema.entries.tenant_id)
        ),
        limit: args.limit || 50
      })

      const parsed = results.map((r) => ({
        ...r,
        data: typeof r.data === 'string' ? JSON.parse(r.data) : r.data
      }))

      return {
        content: [{ type: "text", text: JSON.stringify(parsed, null, 2) }]
      }
    } catch (err: unknown) {
      return {
        content: [{ type: "text", text: `Error fetching entries: ${err.message}` }]
      }
    }
  }
)

// ── Ferramenta 3: Criar Entrada (com Governança) ────────────────
server.tool(
  "create_entry",
  "Cria uma nova entry em uma collection. A política de governança da collection determina se o conteúdo será publicado automaticamente (autonomous) ou ficará como rascunho para aprovação humana (assisted). Collections 'protected' rejeitam a operação.",
  {
    slug: z.string().describe("Slug da collection"),
    data: z.string().describe("Objeto JSON em formato string com os dados de conteúdo"),
  },
  async (args) => {
    const db = globalThis.__MCP_DB
    if (!db) return { content: [{ type: "text", text: "BD não conectado" }] }

    try {
      // Aplicar governança
      const contentText = extractTextFromData(args.data)
      const env = globalThis.__MCP_ENV
      const governance = await enforceGovernance(args.slug, contentText, env)

      if (governance.decision === 'blocked') {
        return {
          content: [{ type: "text", text: `🚫 BLOQUEADO: ${governance.reason}` }]
        }
      }

      const tenantId = globalThis.__MCP_TENANT
      const drizzleDb = drizzle(db, { schema: dbSchema })
      const id = crypto.randomUUID()
      const now = new Date().toISOString()
      const publishedAt = governance.status === 'published' ? now : null

      const coll = await drizzleDb.query.collections.findFirst({
        where: eq(dbSchema.collections.slug, args.slug)
      })

      if (!coll) {
        return { content: [{ type: "text", text: `Collection não encontrada: ${args.slug}` }] }
      }

      await drizzleDb.insert(dbSchema.entries).values({
        id,
        tenant_id: tenantId || null,
        collection_id: coll.id,
        data: args.data,
        status: governance.status,
        created_by: 'agent:mcp',
        governance_decision: governance.decision,
        classification_reason: governance.reason,
        published_at: publishedAt,
        created_at: now,
        updated_at: now
      })

      const statusEmoji = governance.status === 'published' ? '✅' : '⏳'
      return {
        content: [{ type: "text", text: `${statusEmoji} Criado com sucesso.\nID: ${id}\nStatus: ${governance.status}\nGovernança: ${governance.decision}\nRazão: ${governance.reason}` }]
      }
    } catch (err: unknown) {
      return {
        content: [{ type: "text", text: `Erro: ${err.message}` }]
      }
    }
  }
)

// ── Ferramenta 4: Atualizar Entrada (com Reclassificação) ───────
server.tool(
  "update_entry",
  "Atualiza os dados JSON de uma entry existente pelo ID. Reclassifica a governança se o conteúdo mudar.",
  {
    id: z.string(),
    data: z.string().describe("Novo objeto JSON em formato string com os dados"),
  },
  async (args) => {
    const db = globalThis.__MCP_DB
    if (!db) return { content: [{ type: "text", text: "BD não conectado" }] }

    try {
      const tenantId = globalThis.__MCP_TENANT
      const drizzleDb = drizzle(db, { schema: dbSchema })

      // Buscar entry existente para saber a collection
      const existing = await drizzleDb
        .select({ id: dbSchema.entries.id, col_slug: dbSchema.collections.slug })
        .from(dbSchema.entries)
        .innerJoin(dbSchema.collections, eq(dbSchema.entries.collection_id, dbSchema.collections.id))
        .where(
          and(
            eq(dbSchema.entries.id, args.id),
            tenantId ? eq(dbSchema.entries.tenant_id, tenantId) : isNull(dbSchema.entries.tenant_id)
          )
        )
        .limit(1)

      if (!existing.length) {
        return { content: [{ type: "text", text: `Entry não encontrada: ${args.id}` }] }
      }

      const existingRecord = existing[0]

      // Verificar governança da collection
      const col = getCollection(existingRecord.col_slug)
      if (col?.governance === 'protected') {
        return {
          content: [{ type: "text", text: `🚫 BLOQUEADO: Collection "${existingRecord.col_slug}" é protegida. Apenas humanos podem editar.` }]
        }
      }

      // Reclassificar conteúdo
      const contentText = extractTextFromData(args.data)
      const env = globalThis.__MCP_ENV
      const governance = await enforceGovernance(existingRecord.col_slug, contentText, env)

      await drizzleDb.update(dbSchema.entries)
        .set({
          data: args.data,
          status: governance.status,
          governance_decision: governance.decision,
          classification_reason: governance.reason,
          updated_at: new Date().toISOString()
        })
        .where(
          and(
            eq(dbSchema.entries.id, args.id),
            tenantId ? eq(dbSchema.entries.tenant_id, tenantId) : isNull(dbSchema.entries.tenant_id)
          )
        )

      const statusEmoji = governance.status === 'published' ? '✅' : '⏳'
      return {
        content: [{ type: "text", text: `${statusEmoji} Atualizado.\nID: ${args.id}\nStatus: ${governance.status}\nGovernança: ${governance.decision}\nRazão: ${governance.reason}` }]
      }
    } catch (err: unknown) {
      return {
        content: [{ type: "text", text: `Erro ao atualizar: ${err.message}` }]
      }
    }
  }
)

// ── Ferramenta 5: Deletar Entrada (bloqueada para protected) ────
server.tool(
  "delete_entry",
  "Remove uma entry pelo seu ID. Collections 'protected' rejeitam a operação.",
  {
    id: z.string().describe("ID da entry a ser deletada"),
  },
  async (args) => {
    const db = globalThis.__MCP_DB
    if (!db) return { content: [{ type: "text", text: "BD não conectado" }] }

    try {
      const tenantId = globalThis.__MCP_TENANT
      const drizzleDb = drizzle(db, { schema: dbSchema })

      // Verificar se a collection é protected
      const existing = await drizzleDb
        .select({ id: dbSchema.entries.id, col_slug: dbSchema.collections.slug })
        .from(dbSchema.entries)
        .innerJoin(dbSchema.collections, eq(dbSchema.entries.collection_id, dbSchema.collections.id))
        .where(
          and(
            eq(dbSchema.entries.id, args.id),
            tenantId ? eq(dbSchema.entries.tenant_id, tenantId) : isNull(dbSchema.entries.tenant_id)
          )
        )
        .limit(1)

      if (!existing.length) {
        return { content: [{ type: "text", text: `Entry não encontrada: ${args.id}` }] }
      }

      const existingRecord = existing[0]

      const col = getCollection(existingRecord.col_slug)
      if (col?.governance === 'protected') {
        return {
          content: [{ type: "text", text: `🚫 BLOQUEADO: Collection "${existingRecord.col_slug}" é protegida. Apenas humanos podem deletar.` }]
        }
      }

      await drizzleDb.delete(dbSchema.entries)
        .where(
          and(
            eq(dbSchema.entries.id, args.id),
            tenantId ? eq(dbSchema.entries.tenant_id, tenantId) : isNull(dbSchema.entries.tenant_id)
          )
        )

      return {
        content: [{ type: "text", text: `✅ Deletado com sucesso. ID: ${args.id}` }]
      }
    } catch (err: unknown) {
      return {
        content: [{ type: "text", text: `Erro ao deletar: ${err.message}` }]
      }
    }
  }
)

// ── Ferramenta 6: Consultar Política de Governança ──────────────
server.tool(
  "get_governance_policy",
  "Retorna a política de governança de cada collection e as listas de tópicos sensíveis/seguros. Use antes de criar conteúdo para entender o que será publicado automaticamente vs o que vai para revisão humana.",
  {},
  async () => {
    const policies = collections.map(c => ({
      collection: c.slug,
      governance: c.governance,
      description: c.governance === 'autonomous'
        ? 'Agente pode publicar diretamente (exceto temas sensíveis)'
        : c.governance === 'assisted'
        ? 'Conteúdo vai como rascunho para aprovação humana'
        : 'Apenas humanos podem gerenciar esta collection',
    }))

    return {
      content: [{ type: "text", text: JSON.stringify({
        policies,
        sensitive_topics: ASSISTED_TOPICS,
        safe_topics: AUTONOMOUS_TOPICS,
        fail_safe: 'Na dúvida, conteúdo fica como rascunho (draft) para revisão humana.',
      }, null, 2) }]
    }
  }
)

// ── Transport & Connection ──────────────────────────────────────
const transport = new WebStandardStreamableHTTPServerTransport({
  sessionIdGenerator: () => crypto.randomUUID()
})

server.connect(transport).catch(console.error)

export async function handleMcpRequest(req: Request, db: D1Database, tenantId?: string, env?: any) {
  globalThis.__MCP_DB = db;
  globalThis.__MCP_TENANT = tenantId;
  globalThis.__MCP_ENV = env;
  return transport.handleRequest(req)
}
