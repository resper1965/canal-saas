# Spec Impact Matrix — canal-admin

> Qual componente impacta qual. Gerado pelo Arquiteto.

---

| Componente Origem | Componente Impactado | Tipo de Impacto | Confiança |
|:------------------|:---------------------|:----------------|:----------|
| `auth-client.ts` | TODOS os módulos | Auth dependency (session, org) | 🟢 |
| `api.ts` | collection, content, media, publications, ai | CRUD operations | 🟢 |
| `nav-config.tsx` | dashboard.tsx | Route visibility / RBAC | 🟢 |
| `dashboard.tsx` | TODOS os child routes | Layout wrapper (sidebar, header) | 🟢 |
| `App.tsx` | TODOS os módulos | Router registration | 🟢 |
| `index.css` | TODOS os componentes | Design tokens, glassmorphism | 🟢 |
| `collection.tsx` | insights, cases, jobs, pages | Generic CRUD rendering | 🟢 |
| `EntryTable.tsx` | collection.tsx | Table rendering | 🟢 |
| `EntryModal.tsx` | collection.tsx | Create/Edit modal | 🟢 |
| `FieldInput.tsx` | EntryModal.tsx | Dynamic field rendering | 🟢 |
| `ui/Card.tsx` | compliance, saas, dashboard-home | Shared Card component | 🟢 |
| `ui/Table.tsx` | compliance, collection | Shared Table component | 🟢 |
| `ui/Tabs.tsx` | compliance, saas | Tab navigation | 🟢 |
| `saas/MembersTab.tsx` | saas.tsx | Member management | 🟢 |
| `saas/ApiKeysTab.tsx` | saas.tsx | API key management | 🟢 |
| `AIWriterModal.tsx` | EntryModal.tsx | AI content generation | 🟡 |
| `chats.tsx` | ai-settings.tsx | Embedded chat history | 🟢 |

## Dependência Circular
Nenhuma dependência circular detectada. Grafo é DAG (Directed Acyclic Graph).

## Componentes Isolados (Sem Dependentes)
- `emergency.tsx` — Sem dependentes internos
- `social-calendar.tsx` — Sem dependentes internos
- `brandbook.tsx` — Sem dependentes internos (exceto API)
