# Arquitetura — canal-admin

> Gerado pelo Arquiteto em 2026-05-01

---

## Visão Geral

O **Canal Admin** é uma Single Page Application (SPA) React que funciona como backoffice multi-tenant para websites corporativos. Consome um backend Cloudflare Workers (Hono) via proxy reverso, utilizando D1 (SQLite edge) como database e R2 como object storage.

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|:-------|:-----------|:-------|
| Framework | React | 19.1 |
| Routing | React Router | 7.5 |
| Styling | Tailwind CSS (CSS-first) | 4.2 |
| Auth | Better Auth | 1.6 |
| Build | Vite | 6.3 |
| PDF | @react-pdf/renderer | 4.5 |
| E2E Test | Playwright | 1.59 |
| Unit Test | Vitest | 4.1 |
| CI/CD | GitHub Actions | — |

## Decisões Arquiteturais Chave

1. **CRUD Genérico**: Todas as collections usam a mesma rota (`collection.tsx`) + API client genérico (`api.ts`). Exceções especializadas: `publications.tsx`.
2. **Code-First Collections**: Schema definido no backend via `collections.ts`, sem migrações de DB por tipo de conteúdo.
3. **Lazy Loading**: Todas as 25 rotas são `React.lazy()` com `Suspense` global.
4. **Cookie Auth**: `credentials: 'include'` em todas as requests, sem JWT no client.
5. **VisionOS Design System**: Glassmorphism consistente (`bg-black/40 backdrop-blur-3xl rounded-[56px]`).

## Dívidas Técnicas 🟡

1. **RBAC apenas visual** — Frontend esconde rotas mas não há evidência de enforcement no backend
2. **Super Admin hardcoded** — Lista de emails no código fonte ao invés de config
3. **Sem error boundaries por rota** — Apenas `GlobalErrorBoundary` no topo
4. **API client sem tipagem forte** — `Record<string, unknown>` em muitos retornos
5. **Sem cache/SWR** — Cada navegação refaz fetch (sem stale-while-revalidate)
