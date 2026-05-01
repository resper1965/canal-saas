# Canal CMS — Cloudflare Worker Backend

> Backend headless SaaS multi-tenant para o ecossistema ness.

---

## Quick Start

```bash
npm install
npx wrangler dev       # Desenvolvimento local
npx wrangler deploy    # Deploy para produção
```

## Arquitetura

```
canal/
├── src/
│   ├── index.ts          # Entry point (Hono app, exports Worker)
│   ├── auth.ts           # Better Auth (admin, organization, agent-auth)
│   ├── agent.ts          # GabiAgent Durable Object (chatbot RAG)
│   ├── mcp.ts            # MCP Server (agentes externos)
│   ├── queue.ts          # Queue consumer (vectorize, traduções)
│   ├── cron.ts           # Scheduled triggers (newsletter digest)
│   ├── governance.ts     # AI-assisted content governance
│   ├── collections.ts    # Collection definitions
│   ├── seed-vectors.ts   # Vectorize seeding
│   ├── vectorize-sync.ts # Auto-sync on CRUD
│   ├── types.ts          # Shared types
│   ├── ai/
│   │   └── models.ts     # Workers AI model IDs
│   ├── db/
│   │   └── schema.ts     # Drizzle ORM schema (D1)
│   └── routes/
│       ├── entries.ts    # /api/v1 — CRUD collections & entries
│       ├── media.ts      # /api/v1 — Upload/retrieve media (R2)
│       ├── marketing.ts  # /api/v1 — Leads, forms, newsletters
│       ├── legacy.ts     # /api   — Backward-compat routes (site)
│       ├── admin.ts      # /api/admin — Protected admin operations
│       ├── ai.ts         # /api/ai — AI governance routes
│       ├── ai-writer.ts  # /api/content-agent — AI content generation
│       └── webhooks-api.ts # /api/admin/webhooks — Webhook targets CRUD
├── admin/                # Backoffice SPA (React + Vite)
├── migrations/           # SQL migration files
├── wrangler.jsonc        # Cloudflare Workers config
└── package.json
```

## Cloudflare Bindings

| Binding | Tipo | Recurso |
|---------|------|---------|
| `DB` | D1 Database | `canal-db` |
| `MEDIA` | R2 Bucket | `canal-media` |
| `VECTORIZE` | Vectorize Index | `canal-vectors` |
| `AI` | Workers AI | Llama 3.3 70B / 8B / BGE embeddings |
| `CANAL_KV` | KV Namespace | Cache, configurações |
| `QUEUE` | Queue | `canal-tasks-queue` (vectorize, traduções) |
| `AGENT_DO` | Durable Object | `GabiAgent` (chatbot sessions) |

## Secrets (Cloudflare Dashboard)

| Secret | Descrição |
|--------|-----------|
| `BETTER_AUTH_SECRET` | JWT signing key (≥ 32 chars aleatórios) |
| `ADMIN_SETUP_KEY` | Chave bootstrap para criar admin inicial |
| `RESEND_API_KEY` | API key do Resend para envio de emails |
| `SLACK_WEBHOOK_URL` | (Opcional) Webhook para alertas de incidentes |

## Database Schema (D1/Drizzle)

### Core Tables

| Tabela | Descrição |
|--------|-----------|
| `collections` | Definições de collections (slug, label, fields JSON) |
| `entries` | Entries genéricas com `tenant_id`, `collection_id`, `data` JSON |
| `webhooks_targets` | Webhook targets configuráveis por tenant |
| `audit_logs` | Trail de auditoria (ator, ação, recurso, timestamp) |

### Legacy Tables (retrocompat)

| Tabela | Uso |
|--------|-----|
| `insights`, `jobs`, `cases` | Rotas `/api/insights`, `/api/jobs`, `/api/cases` |
| `forms`, `newsletter`, `leads` | Formulários e CRM |
| `chats` | Logs do chatbot |

### Better Auth Tables

Gerenciadas automaticamente: `user`, `session`, `account`, `verification`, `organization`, `member`, `invitation`

## API Routes

### Públicas (sem auth)

```
GET  /api/insights[/:slug]     # Blog posts
GET  /api/jobs                  # Vagas ativas
GET  /api/cases[/:slug]         # Portfolio
POST /api/chat                  # Chat RAG (rate limited: 20/min/IP)
POST /api/forms                 # Formulário de contato
POST /api/newsletter            # Newsletter signup
POST /api/incidents             # Reporte de incidente n.cirt
```

### Autenticadas (session required)

```
GET    /api/v1/collections                          # List collections
GET    /api/v1/collections/:slug/entries             # List entries
POST   /api/v1/collections/:slug/entries             # Create entry
PUT    /api/v1/collections/:collSlug/entries/:id     # Update entry
DELETE /api/v1/collections/:collSlug/entries/:id     # Delete entry
POST   /api/v1/media/upload                          # Upload to R2
GET    /api/v1/media                                 # List media
```

### Admin (session + admin role)

```
POST /api/admin/seed-vectors       # Indexar conteúdo no Vectorize
POST /api/admin/seed-collections   # Registrar collection definitions
POST /api/setup/admin              # Bootstrap admin (x-setup-key)
*    /api/admin/webhooks/*         # CRUD webhook targets
*    /api/mcp/*                    # MCP Server
```

## Workers AI Models

| Constante | Modelo | Uso |
|-----------|--------|-----|
| `MODEL_HEAVY` | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Governance, drafts, análise complexa |
| `MODEL_FAST` | `@cf/meta/llama-3.1-8b-instruct-fast` | Resumos, SEO tags, traduções rápidas |
| Embeddings | `@cf/baai/bge-base-en-v1.5` | Vectorize (RAG) |

## Roadmap

> Ver [`docs/PLAN-epics-roadmap.md`](../docs/PLAN-epics-roadmap.md) para o roadmap completo.
