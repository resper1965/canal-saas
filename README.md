# Canal SaaS

> Plataforma multi-tenant de Gestão de Conteúdo, Comunicação e Compliance.

## Stack

| Camada | Tecnologia |
|---|---|
| **Runtime** | Cloudflare Workers (Edge) |
| **Framework** | Hono v4 |
| **Database** | Cloudflare D1 (SQLite) |
| **ORM** | Drizzle ORM |
| **Auth** | Better Auth + Drizzle Adapter |
| **Storage** | Cloudflare R2 |
| **AI** | Workers AI (LLM, embeddings) |
| **Frontend** | React 19 + Vite + React Router |
| **Search** | Cloudflare Vectorize (RAG) |
| **Queue** | Cloudflare Queues |
| **Analytics** | Analytics Engine |

## Arquitetura

```
┌─────────────────────────────────────────────┐
│  Admin SPA (React)          → /admin/*      │
│  Widget.js (Web Component)  → /widget.js    │
├─────────────────────────────────────────────┤
│  Hono Worker                                │
│  ├── /api/auth/*    (Better Auth)           │
│  ├── /api/v1/*      (CMS API + Rate Limit)  │
│  ├── /api/admin/*   (Protected routes)      │
│  ├── /api/saas/*    (Billing, onboarding)   │
│  └── /api/mcp/*     (Agent integration)     │
├─────────────────────────────────────────────┤
│  D1 │ R2 │ KV │ Vectorize │ Queues │ AI    │
└─────────────────────────────────────────────┘
```

## Setup Local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis
cp .env.example .dev.vars
# Editar .dev.vars com seus secrets

# 3. Rodar DB local
npx wrangler d1 execute canal-db --local --file=migrations/0001_init.sql

# 4. Dev server
npm run dev         # Worker (porta 8787)
cd admin && npm run dev   # Admin SPA (porta 5173)
```

## Deploy

```bash
cd admin && npm run build
npm run deploy
```

## Testes

```bash
# E2E contra produção
CANAL_API_URL=https://canal.bekaa.eu npx playwright test

# E2E local
npx playwright test
```

## API Reference

Documentação interativa: `https://canal.bekaa.eu/api/docs`

## Licença

Proprietário — © Ness Tecnologia
