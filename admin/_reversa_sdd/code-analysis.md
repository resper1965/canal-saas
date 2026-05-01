# Análise de Código — canal-admin

> 🟢 **CONFIRMADO** — Gerado pelo Arqueólogo em 2026-05-01
> Nível de documentação: **Completo**

---

## Módulo: auth

**Propósito:** Autenticação multi-tenant via Better Auth (email/password, OAuth, API Keys).

### Arquivos Principais
- `src/lib/auth-client.ts` — Client SDK (session, org, admin, apiKey plugins)
- `src/routes/login.tsx` — Página de login

### Fluxo de Controle 🟢
1. `createAuthClient()` com `baseURL = ${window.location.origin}/api/auth`
2. Plugins carregados: `adminClient()`, `organizationClient()`, `apiKeyClient()`
3. Exports: `signIn`, `signUp`, `signOut`, `useSession`, `organization`, `admin`, `apiKey`
4. Dashboard (`dashboard.tsx`) verifica `useSession()` → redireciona `/login` se não autenticado

### Regras de Negócio 🟢
- **Super Admin**: definido por lista hardcoded `SUPER_ADMIN_EMAILS` = `["resper@bekaa.eu", "admin@ness.com.br", "resper@ness.com.br"]`
- **RBAC**: `isSuperAdmin` || `myRole === "owner"` || `myRole === "admin"` → acesso total
- **Roteamento**: rotas `/organizations`, `/users` só visíveis para super admin
- **Logout**: `signOut({ fetchOptions: { onSuccess: () => navigate("/login") } })`

---

## Módulo: collections (CRUD Genérico)

**Propósito:** Engine CRUD universal que renderiza qualquer collection com base na definição de schema.

### Arquivos Principais
- `src/lib/api.ts` — 13 funções de API client
- `src/routes/collection.tsx` — Rota genérica de CRUD
- `src/components/collection/EntryTable.tsx` — Tabela de entries
- `src/components/collection/EntryModal.tsx` — Modal de criação/edição
- `src/components/collection/FieldInput.tsx` — Renderizador dinâmico de campos
- `src/components/collection/getTableFields.ts` — Seletor de colunas visíveis

### API Client (`api.ts`) 🟢

| Função | Método | Endpoint | Propósito |
|:-------|:-------|:---------|:----------|
| `fetchCollections()` | GET | `/api/v1/collections` | Lista collections |
| `fetchCollection(slug)` | GET | `/api/v1/collections/:slug` | Schema de uma collection |
| `fetchEntries(slug, params)` | GET | `/api/v1/collections/:slug/entries` | Lista entries paginada |
| `fetchEntry(slug, id)` | GET | `/api/v1/collections/:slug/entries/:id` | Entry individual |
| `createEntry(slug, body)` | POST | `/api/v1/collections/:slug/entries` | Cria entry |
| `updateEntry(slug, id, body)` | PUT | `/api/v1/collections/:slug/entries/:id` | Atualiza entry |
| `deleteEntry(slug, id)` | DELETE | `/api/v1/collections/:slug/entries/:id` | Remove entry |
| `fetchMedia(params)` | GET | `/api/v1/media` | Lista media |
| `uploadMedia(file)` | POST | `/api/v1/media` | Upload para R2 |
| `deleteMedia(id)` | DELETE | `/api/v1/media/:id` | Remove media |
| `toggleEntryStatus(slug, id, status)` | PUT | `/api/v1/collections/:slug/entries/:id` | Alterna draft/published |
| `toggleEntryFeatured(slug, id, featured)` | PUT | `/api/v1/collections/:slug/entries/:id` | Alterna destaque |
| `forwardForm(id, emails)` | POST | `/api/v1/collections/forms/entries/:id/forward` | Encaminha formulário |
| `generateWithAI(params)` | POST | `/api/content-agent/write` | IA Content (streaming) |

### Algoritmo: Renderização Dinâmica 🟢
```
collection.fields → para cada field:
  switch(field.type):
    'text'     → <input type="text">
    'textarea' → <textarea>
    'select'   → <select> com field.options[]
    'date'     → <input type="date">
    'image'    → <input type="text"> (URL)
    'boolean'  → <input type="checkbox">
    'richtext' → <textarea> com markdown
```

### Regras de Negócio 🟢
- **Locale**: collection.has_locale → switcher PT/EN/ES
- **Status**: collection.has_status → toggle draft/published
- **Defaults**: field.defaultValue aplicado ao criar
- **Paginação**: `meta.totalPages` com 20 items/página (backend)

---

## Módulo: dashboard

**Propósito:** Layout principal SPA com sidebar colapsável, org switcher multi-tenant, e toolbar global.

### Arquivos Principais
- `src/routes/dashboard.tsx` — Layout (sidebar + header + outlet)
- `src/routes/dashboard-home.tsx` — Home com KPIs e health check
- `src/components/dashboard/nav-config.tsx` — Configuração de navegação
- `src/components/dashboard/OrgSwitcher.tsx` — Seletor de organização
- `src/components/dashboard/UserDropdown.tsx` — Menu do usuário
- `src/components/dashboard/Sparkline.tsx` — Mini gráfico

### Hooks Customizados 🟢
- `useSidebarCollapse()` — Estado em `localStorage('canal_sidebar_minimized')`
- `useTheme()` — Dark/light em `localStorage('canal_theme')` + `prefers-color-scheme`

### Dashboard Home: APIs Consumidas 🟢
- `GET /api/admin/stats` → Stats (leads, forms, chats, posts, users, etc.)
- `GET /api/admin/health` → Status de infraestrutura (D1, KV, AI, R2, Queue)

### KPIs Exibidos 🟢
Total Leads, Form Ingestion, Identity Nodes, Deployment Cases, Market Protocols, Synapse Chats, Insight Matrix, Cloud Core Assets

### Health Services 🟢
D1 (database), KV (key-value), AI (Workers AI), R2 (storage), Queue

---

## Módulo: content

**Propósito:** Gestão de conteúdo especializado (Insights, Cases, Jobs, Publications, Applicants).

### Arquivos Principais
- `src/routes/collection.tsx` — Usado para insights, cases, jobs via `<CollectionRoute slug="X">`
- `src/routes/publications.tsx` — UI especializada com timeline agrupada
- `src/routes/applicants.tsx` — Gestão de candidatos

### Padrão Arquitetural 🟢
- **insights/cases/jobs**: Usam a rota genérica `collection.tsx`
- **publications**: UI especializada com agrupamento por ano/período + PDF preview
- **applicants**: Rota dedicada

---

## Módulo: marketing

**Propósito:** Ferramentas de branding, assinaturas de email, decks PDF e newsletters.

### Arquivos Principais
- `src/routes/brandbook.tsx` — Gestão de brand guidelines
- `src/routes/signatures.tsx` — Assinaturas de email corporativo
- `src/routes/decks.tsx` — Geração de PDFs (via @react-pdf/renderer)
- `src/routes/newsletters.tsx` — Campanhas de email

---

## Módulo: communications

**Propósito:** Inbox unificado e histórico de conversas.

### Arquivos Principais
- `src/routes/communications.tsx` — Inbox unificado
- `src/routes/chats.tsx` — Histórico de chats do chatbot IA

---

## Módulo: ai

**Propósito:** Configuração do chatbot IA (Gabi), RAG knowledge base, AI Writer, automações.

### Arquivos Principais
- `src/routes/ai-settings.tsx` — Config do agente IA + histórico
- `src/routes/knowledge-base.tsx` — RAG ingestion
- `src/components/AIWriterModal.tsx` — Geração de conteúdo assistida
- `src/routes/automation.tsx` — Automações IA

### Entidades 🟢
```typescript
type AIConfig = {
  enabled: boolean;        // Toggle on/off
  bot_name: string;        // Ex: "Gabi.OS"
  avatar_url: string;      // URL do avatar
  welcome_message: string; // Mensagem de boas-vindas
  system_prompt: string;   // Diretiva cognitiva
  theme_color: string;     // Hex cor do widget
  max_turns: number;       // Limite de interações
};
```

### APIs 🟢
- `GET/PUT /api/admin/ai-settings` — Config do agente
- `GET /api/admin/ai-stats` — Métricas (totalChats, totalLeads, recentChats)
- `POST /api/content-agent/write` — Streaming de conteúdo IA

### Algoritmo: AI Content Writer 🟢
1. `generateWithAI({ brief, field, collection, tone, locale })` → POST streaming
2. `ReadableStream<string>` processado chunk a chunk via `TextDecoder`
3. Tokens disponíveis: `tecnico`, `consultivo`, `executivo`

---

## Módulo: compliance

**Propósito:** LGPD compliance — DSAR, Canal de Denúncia (whistleblower), Gestão de Políticas.

### Arquivos Principais
- `src/routes/compliance.tsx` — Hub principal (3 tabs)
- `src/routes/compliance/dsar.tsx`, `ropa.tsx`, `incidents.tsx` — Sub-rotas avançadas

### Entidades 🟢
```typescript
interface DSARRequest {
  id: string; requester_name: string; requester_email: string;
  request_type: 'access' | 'deletion' | 'portability' | 'correction' | 'revocation';
  status: string; sla_deadline: string; created_at: string;
}
interface WhistleblowerCase {
  id: string; case_code: string;
  category: 'harassment' | 'corruption' | 'security' | 'discrimination' | 'other';
  status: string; sla_deadline: string; created_at: string;
}
interface Policy {
  id: string; type: 'privacy' | 'terms' | 'cookie' | 'lgpd';
  locale: string; title: string; body_md: string;
  version: number; status: string; effective_date?: string;
}
```

### Algoritmo: SLA Calculator 🟢
```
slaStatus(deadline):
  diff = ceil((deadline - now) / 86400000)
  if diff < 0 → "Xd atrasado" (red)
  if diff <= 3 → "Xd restantes" (amber)
  else → "Xd restantes" (green)
```

---

## Módulo: saas

**Propósito:** Multi-tenancy B2B — gestão de organizações, membros, billing, API keys.

### Arquivos Principais
- `src/routes/saas.tsx` — Hub principal (5 tabs)
- `src/routes/saas-billing.tsx` — Billing dedicado
- `src/components/saas/OverviewTab.tsx`, `MembersTab.tsx`, `PlanTab.tsx`, `SettingsTab.tsx`, `ApiKeysTab.tsx`

### RBAC por Tab 🟢
| Tab | Visível para |
|:----|:-------------|
| Overview | Todos |
| Members | editor+ (member, admin, owner) |
| Plan & Billing | Todos |
| API Keys | admin+ (admin, owner, superAdmin) |
| Settings | admin+ |

---

## Módulo: media

**Propósito:** Upload/gestão de assets via Cloudflare R2.

### Arquivos Principais
- `src/routes/media.tsx` — Gallery de media
- `src/lib/api.ts` → `uploadMedia()`, `deleteMedia()`, `fetchMedia()`

---

## Módulo: design-system

**Propósito:** Componentes UI reutilizáveis no padrão VisionOS.

### Arquivos Principais
- `src/index.css` — Design tokens globais, glassmorphism, custom scrollbar
- `src/components/ui/Card.tsx` — Card, CardHeader, CardTitle, CardContent, CardAction
- `src/components/ui/Table.tsx` — Table headless
- `src/components/ui/Badge.tsx` — Status badges
- `src/components/ui/Tabs.tsx` — TabGroup, TabPanel
- `src/components/ui/EmptyState.tsx` — Estado vazio padronizado
- `src/components/ui/StatCard.tsx` — KPI card
- `src/components/ui/PageHeader.tsx` — Header
- `src/components/ui/SectionTitle.tsx` — Título de seção
- `src/components/ui/StatusDot.tsx` — Indicador de status

### Padrão de Design 🟢
- Glassmorphism: `bg-black/40 backdrop-blur-3xl border border-white/5`
- Super-rounded: `rounded-[56px]` (cards), `rounded-[22px]` (buttons)
- Typography: `font-black italic uppercase tracking-[0.3em]`
- Radial glow: `radial-gradient-glass` custom class
- Micro-animations: `group-hover:scale-110`, `transition-all duration-700`

---

## Módulo: emergency

**Propósito:** Fluxo de emergência para chamados críticos de clientes.

### Arquivos Principais
- `src/routes/emergency.tsx`
