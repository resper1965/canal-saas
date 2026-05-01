# Dependências — canal-admin

> 🟢 **CONFIRMADO** — Extraído de `package.json` em 2026-05-01

---

## Dependências de Produção

| Pacote | Versão | Propósito |
|:-------|:-------|:----------|
| `react` | ^19.1.0 | Framework UI (React 19) |
| `react-dom` | ^19.1.0 | Renderização DOM |
| `react-router` | ^7.5.1 | Roteamento SPA |
| `better-auth` | ^1.6.5 | Autenticação (email/password, OAuth, sessions) |
| `@better-auth/agent-auth` | ^0.4.5 | Plugin de auth para agentes IA |
| `@better-auth/api-key` | ^1.6.5 | Plugin de API Keys |
| `@react-pdf/renderer` | ^4.5.1 | Geração de PDFs (Decks) |
| `react-markdown` | ^10.1.0 | Renderização de Markdown |

## Dependências de Desenvolvimento

| Pacote | Versão | Propósito |
|:-------|:-------|:----------|
| `vite` | ^6.3.3 | Build tool & dev server |
| `@vitejs/plugin-react` | ^4.4.1 | JSX/TSX transform |
| `typescript` | ^5.8.3 | Type checking |
| `tailwindcss` | ^4.2.4 | CSS framework (v4, CSS-first) |
| `@tailwindcss/vite` | ^4.2.4 | Tailwind Vite plugin |
| `@playwright/test` | ^1.59.1 | E2E testing |
| `vitest` | ^4.1.4 | Unit testing |
| `jsdom` | ^29.0.2 | DOM environment para Vitest |
| `@testing-library/react` | ^16.3.2 | React test utils |
| `@testing-library/jest-dom` | ^6.9.1 | DOM matchers |
| `@types/react` | ^19.1.2 | React type definitions |
| `@types/react-dom` | ^19.1.2 | ReactDOM type definitions |
| `@types/node` | ^25.6.0 | Node.js type definitions |

## Stack Resumida

| Layer | Tecnologia |
|:------|:-----------|
| **Runtime** | React 19 + TypeScript 5.8 |
| **Routing** | React Router v7 |
| **Styling** | Tailwind CSS v4 (CSS-first config) |
| **Auth** | Better Auth v1.6 (multi-tenant) |
| **Build** | Vite 6 |
| **PDF** | @react-pdf/renderer |
| **Testing** | Vitest (unit) + Playwright (E2E) |
| **CI/CD** | GitHub Actions |

## Dependências Externas (Backend — via proxy)

O admin consome um backend Cloudflare Workers (Hono) via proxy Vite (`/api → localhost:8787`):
- **D1** — Database SQLite at the edge
- **R2** — Object storage (media, PDFs)
- **Workers AI** — LLM (Llama 3.1, embeddings)
- **Vectorize** — RAG vector storage
- **Resend** — Email transacional
