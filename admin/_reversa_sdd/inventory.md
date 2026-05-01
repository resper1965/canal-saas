# Inventário do Projeto — canal-admin

> 🟢 **CONFIRMADO** — Gerado pelo Scout em 2026-05-01
> Projeto: **canal** (Admin Panel / Frontend)
> Framework: Reversa v1.2.14

---

## Estrutura de Pastas

```
canal/admin/
├── .github/workflows/        # CI/CD (Playwright)
├── public/                   # Assets estáticos (logos SVG, favicon, _headers)
├── tests/                    # E2E tests (Playwright)
│   ├── *.spec.ts             # 7 spec files
│   └── *-snapshots/          # Visual regression baselines (15 PNG)
├── docs/                     # Documentação interna
├── src/
│   ├── App.tsx               # Router principal (react-router v7)
│   ├── main.tsx              # Entry point React
│   ├── index.css             # Design system global (VisionOS)
│   ├── styles/               # CSS modules (saas, auth, collection)
│   ├── lib/
│   │   ├── api.ts            # API client genérico (entries CRUD)
│   │   └── auth-client.ts    # Better Auth client (session, org, apiKey)
│   ├── components/
│   │   ├── ui/               # Design system: Card, Table, Badge, Tabs, etc.
│   │   ├── dashboard/        # Layout: nav-config, OrgSwitcher, UserDropdown, Sparkline
│   │   ├── collection/       # CRUD genérico: EntryTable, EntryModal, FieldInput
│   │   ├── brandbook/        # LogoCard
│   │   ├── decks/            # DeckDocument (PDF generation)
│   │   ├── saas/             # SaaS tabs: Settings, Plan, API Keys, Members
│   │   ├── signatures/       # SignaturePreview
│   │   └── AIWriterModal.tsx  # IA Content Assistant
│   ├── routes/               # 25 rotas (lazy-loaded)
│   │   ├── dashboard.tsx      # Layout principal (sidebar + header)
│   │   ├── dashboard-home.tsx # Home com KPIs
│   │   ├── collection.tsx     # CRUD genérico de collections
│   │   ├── publications.tsx   # Publicações & RI (especializada)
│   │   ├── insights, cases, jobs, applicants  # Conteúdo
│   │   ├── media.tsx          # Assets & RAG Base
│   │   ├── brandbook, signatures, decks       # Marketing
│   │   ├── newsletters.tsx    # Email campaigns
│   │   ├── communications.tsx # Inbox unificado
│   │   ├── ai-settings.tsx    # Assistente Gabi IA
│   │   ├── knowledge-base.tsx # RAG Memory
│   │   ├── compliance.tsx     # LGPD & Denúncias
│   │   │   └── compliance/    # Sub-rotas: dsar, incidents, ropa
│   │   ├── automation.tsx     # IA Automações
│   │   ├── emergency.tsx      # Fluxo de Emergência
│   │   ├── saas.tsx, saas-billing.tsx  # Admin SaaS
│   │   ├── social-calendar.tsx  # Posts sociais
│   │   ├── chats.tsx          # Histórico de chats
│   │   ├── users.tsx, organizations.tsx  # Super Admin
│   │   ├── account.tsx        # Perfil do usuário
│   │   └── login.tsx          # Autenticação
│   └── __tests__/             # Unit tests (Vitest)
│       ├── saas-dashboard.test.ts
│       ├── api-client.test.ts
│       ├── org-switcher.test.ts
│       ├── tenant-isolation.test.ts
│       └── setup.ts
├── index.html                 # SPA entry
├── vite.config.ts             # Vite + React + Tailwind v4
├── tsconfig.json              # TypeScript strict mode
├── playwright.config.ts       # E2E config (3 project modes)
└── package.json               # canal-admin v0.1.0
```

## Pontos de Entrada

| Arquivo | Tipo |
|:--------|:-----|
| `src/main.tsx` | App entry (React DOM) |
| `src/App.tsx` | Router root (25 lazy routes) |
| `index.html` | SPA shell |
| `vite.config.ts` | Build + dev server |

## Scripts (package.json)

| Script | Comando |
|:-------|:--------|
| `dev` | `vite --port 5173` |
| `build` | `vite build` |
| `preview` | `vite preview` |

## CI/CD

- **GitHub Actions**: `.github/workflows/playwright.yml`
  - Trigger: push/PR em `main`/`master`
  - Node LTS, Playwright E2E, upload de relatório

## Cobertura de Testes

| Tipo | Framework | Arquivos |
|:-----|:----------|:---------|
| **E2E** | Playwright | 7 spec files |
| **Unit** | Vitest + Testing Library | 4 test files |
| **Visual Regression** | Playwright snapshots | 15 baselines |

**Total: 11 arquivos de teste** (~11% do projeto)

## Módulos Identificados

| Módulo | Responsabilidade | Arquivos-Chave |
|:-------|:-----------------|:---------------|
| **auth** | Autenticação multi-tenant (Better Auth) | `auth-client.ts`, `login.tsx` |
| **collections** | CRUD genérico de conteúdo | `api.ts`, `collection.tsx`, `EntryTable`, `EntryModal`, `FieldInput` |
| **dashboard** | Layout, nav, sidebar, org switcher | `dashboard.tsx`, `nav-config.tsx`, `OrgSwitcher`, `UserDropdown` |
| **content** | Gestão de conteúdo (insights, cases, jobs, publications) | `insights`, `cases`, `jobs`, `publications.tsx` |
| **marketing** | Brandbook, assinaturas, decks, newsletters | `brandbook.tsx`, `signatures.tsx`, `decks.tsx`, `newsletters.tsx` |
| **communications** | Inbox unificado, chats | `communications.tsx`, `chats.tsx` |
| **ai** | Assistente IA, RAG, AI Writer, automações | `ai-settings.tsx`, `knowledge-base.tsx`, `AIWriterModal.tsx`, `automation.tsx` |
| **compliance** | LGPD, DSAR, ROPA, denúncias | `compliance.tsx`, `compliance/dsar.tsx`, `compliance/ropa.tsx` |
| **saas** | Multi-tenancy, billing, API keys, membros | `saas.tsx`, `saas-billing.tsx`, `saas/` components |
| **media** | Upload R2, gestão de assets | `media.tsx` |
| **design-system** | UI components VisionOS | `ui/Card`, `ui/Table`, `ui/Badge`, `index.css` |
| **emergency** | Fluxo de emergência | `emergency.tsx` |
