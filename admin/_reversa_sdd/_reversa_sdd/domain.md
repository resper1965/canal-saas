# Domínio e Regras de Negócio — canal-admin

> Gerado pelo Detetive em 2026-05-01

---

## Glossário de Domínio

| Termo | Definição | Confiança |
|:------|:----------|:----------|
| **Canal** | CMS/backoffice multi-tenant para websites corporativos | 🟢 |
| **Collection** | Tipo de conteúdo com schema dinâmico (code-first) | 🟢 |
| **Entry** | Registro individual dentro de uma collection | 🟢 |
| **Slug** | Identificador URL-friendly de uma collection ou entry | 🟢 |
| **Locale** | Idioma de uma entry (pt, en, es) | 🟢 |
| **Organization** | Tenant no modelo multi-org (Better Auth) | 🟢 |
| **Super Admin** | Usuário com acesso irrestrito, definido por email | 🟢 |
| **Gabi** | Assistente IA conversacional (chatbot) baseada em LLM | 🟢 |
| **RAG** | Retrieval-Augmented Generation — base de conhecimento vetorial | 🟢 |
| **DSAR** | Data Subject Access Request (LGPD) | 🟢 |
| **ROPA** | Record of Processing Activities (LGPD) | 🟡 |
| **Deck** | Apresentação PDF gerada dinamicamente | 🟢 |
| **Brandbook** | Manual de identidade visual da organização | 🟢 |
| **VisionOS** | Design system interno (glassmorphism, micro-animations) | 🟢 |

## Regras de Negócio Críticas

### RN-001: Autenticação e Autorização 🟢
- Login via Better Auth (email/password + OAuth Google)
- Session cookie-based (`credentials: 'include'`)
- Super admin hardcoded por lista de emails
- RBAC: `admin` > `owner` > `member`

### RN-002: Multi-Tenancy 🟢
- Cada organização é um tenant isolado
- `OrgSwitcher` permite trocar entre organizações
- Dados segregados por `tenant_id` no backend

### RN-003: Content Lifecycle 🟢
- Entries seguem fluxo: `draft` → `published`
- Toggle de status é operação atômica (PUT com body `{ status }`)
- Entries podem ser marcadas como `featured`

### RN-004: Locale Management 🟢
- 3 idiomas suportados: `pt`, `en`, `es`
- Troca de locale reseta paginação para página 1
- Locale é salvo como campo da entry, não versão separada

### RN-005: SLA Compliance 🟢
- DSAR tem prazo legal (SLA) com cálculo automático
- `< 0 dias` = atrasado (crítico) | `≤ 3 dias` = urgente | `> 3` = ok
- 5 tipos: access, deletion, portability, correction, revocation

### RN-006: AI Content Generation 🟢
- Streaming via ReadableStream (chunked transfer)
- 3 tons: técnico, consultivo, executivo
- Campo `system_prompt` personalizável por tenant
- Limite de `max_turns` (default: 20)

---

## ADRs Retroativos

### ADR-001: Migração de Layout Específico para CRUD Genérico 🟡
**Data estimada:** ~commit `69121cb` a `c72076c`
**Contexto:** Sistema inicialmente tinha rotas específicas por tipo de conteúdo (insights, cases, jobs). Refatorado para CRUD genérico baseado em collections com schema dinâmico.
**Decisão:** Adotar padrão code-first collections → `CollectionPage({ slug })` renderiza qualquer tipo.
**Consequência:** Simplicidade de manutenção, mas perda de UI especializada para types específicos (mitigado por rotas dedicadas como `publications.tsx`).

### ADR-002: Design System — Apple HIG → VisionOS Glassmorphism 🟢
**Data:** commits `d7bfbe9` → `8cb6fbd` → `c72076c`
**Contexto:** Interface originalmente Apple Dense UI, evoluiu para glassmorphism VisionOS com `backdrop-blur-3xl`, `rounded-[56px]`, micro-animations.
**Decisão:** Padrão visual VisionOS Pro-Max unificado em todas as rotas.

### ADR-003: Tailwind v3 → v4 CSS-First 🟢
**Data:** commit `014430a`
**Contexto:** Migração de Tailwind CDN para build pipeline oficial Vite para resolver CSP issues no edge (Cloudflare).
**Decisão:** `@tailwindcss/vite` plugin com CSS-first config.

### ADR-004: Better Auth como Identity Provider 🟡
**Contexto:** Escolha de Better Auth ao invés de Clerk, Auth0, etc.
**Decisão:** Better Auth com plugins `admin`, `organization`, `apiKey` para controle total multi-tenant.
**Consequência:** Auto-hosted, sem vendor lock-in, mas exige manutenção de schema de auth.
