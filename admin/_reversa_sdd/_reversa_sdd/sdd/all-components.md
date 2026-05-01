# SDD — Auth Module

> Spec ID: `SDD-AUTH-001`
> Confiança Geral: 🟢 92%

## 1. Propósito
Prover autenticação multi-tenant via Better Auth com RBAC baseado em roles e super admin hardcoded por email. 🟢

## 2. Responsabilidades (MoSCoW)
| Prioridade | Responsabilidade |
|:-----------|:-----------------|
| **Must** | Gerenciar sessão (login/logout/useSession) 🟢 |
| **Must** | Expor hooks de organização (useActiveOrganization) 🟢 |
| **Must** | Definir hierarquia RBAC (superAdmin > owner > admin > member) 🟢 |
| **Should** | Expor plugin de API Keys 🟢 |

## 3. Fluxos Principais
### Login
1. Usuário acessa `/login` 🟢
2. Submete credenciais via `signIn()` 🟢
3. Backend retorna session cookie 🟡
4. Redirect para `/` (dashboard) 🟢
5. `useSession()` valida sessão ativa 🟢

### Logout
1. `signOut()` com callback `onSuccess` 🟢
2. Navigate para `/login` 🟢

## 4. Regras de Negócio
- RN-AUTH-01: Super Admin = email na lista `SUPER_ADMIN_EMAILS` OU `user.role === 'admin'` 🟢
- RN-AUTH-02: Rotas `/organizations`, `/users` visíveis apenas para Super Admin 🟢
- RN-AUTH-03: Session via cookie (`credentials: 'include'`), sem JWT no client 🟢

## 5. Requisitos Não Funcionais
- Segurança: Cookie httpOnly + SameSite (delegado ao Better Auth backend) 🟡
- Performance: Auth client inicializado uma vez, sem re-renders 🟢

## 6. Critérios de Aceitação
- **Dado** um usuário autenticado, **Quando** acessa `/`, **Então** vê o dashboard com sidebar 🟢
- **Dado** um usuário não autenticado, **Quando** acessa `/`, **Então** é redirecionado para `/login` 🟢
- **Dado** um super admin, **Quando** acessa sidebar, **Então** vê rotas de Users e Organizations 🟢
- **Dado** um member comum, **Quando** acessa sidebar, **Então** NÃO vê rotas de Users e Organizations 🟢

---

# SDD — Collections Engine

> Spec ID: `SDD-COLLECTIONS-001`
> Confiança Geral: 🟢 95%

## 1. Propósito
Engine CRUD universal que renderiza qualquer collection com base na definição de schema dinâmico (code-first). 🟢

## 2. Responsabilidades (MoSCoW)
| Prioridade | Responsabilidade |
|:-----------|:-----------------|
| **Must** | Renderizar tabela de entries com paginação 🟢 |
| **Must** | Modal de criação/edição com campos dinâmicos 🟢 |
| **Must** | Toggle de status (draft/published) 🟢 |
| **Must** | Toggle de featured 🟢 |
| **Must** | Delete com confirmação 🟢 |
| **Should** | Locale switcher (pt/en/es) 🟢 |
| **Could** | AI Writer integration via modal 🟡 |

## 3. Fluxos Principais
### CRUD Lifecycle
1. Carregar collection schema via `fetchCollection(slug)` 🟢
2. Listar entries via `fetchEntries(slug, { locale, page })` 🟢
3. Criar: modal com defaults → `createEntry(slug, body)` 🟢
4. Editar: modal preenchido → `updateEntry(slug, id, body)` 🟢
5. Deletar: `confirm()` → `deleteEntry(slug, id)` 🟢
6. Reload automático após operação 🟢

## 4. Regras de Negócio
- RN-COL-01: Campos renderizados dinamicamente por `field.type` 🟢
- RN-COL-02: `has_locale` habilita switcher de 3 idiomas 🟢
- RN-COL-03: Troca de locale reseta paginação para page 1 🟢
- RN-COL-04: `field.defaultValue` aplicado ao criar nova entry 🟢

## 5. Critérios de Aceitação
- **Dado** a collection "insights", **Quando** listo entries, **Então** vejo tabela paginada 🟢
- **Dado** um click em "Criar", **Quando** modal abre, **Então** campos refletem schema da collection 🟢
- **Dado** uma entry draft, **Quando** clico toggle, **Então** status muda para published 🟢

---

# SDD — Dashboard & Layout

> Spec ID: `SDD-DASHBOARD-001`
> Confiança Geral: 🟢 94%

## 1. Propósito
Layout principal SPA com sidebar colapsável, org switcher multi-tenant, theme toggle e health monitoring. 🟢

## 2. Responsabilidades (MoSCoW)
| Prioridade | Responsabilidade |
|:-----------|:-----------------|
| **Must** | Sidebar com navegação baseada em RBAC 🟢 |
| **Must** | Auth guard (redirect se não autenticado) 🟢 |
| **Must** | Org switcher para multi-tenant 🟢 |
| **Should** | Sidebar colapsável com persistência 🟢 |
| **Should** | Dark/light theme toggle 🟢 |
| **Should** | Health monitoring (5 serviços) 🟢 |
| **Could** | KPI dashboard com 8 métricas 🟢 |

## 3. Regras de Negócio
- RN-DASH-01: Estado do sidebar persistido em `localStorage('canal_sidebar_minimized')` 🟢
- RN-DASH-02: Theme detecta `prefers-color-scheme` e persiste em `localStorage('canal_theme')` 🟢
- RN-DASH-03: Nav groups com `adminOnly` e `ownerOnly` para controle de visibilidade 🟢

---

# SDD — Compliance Module

> Spec ID: `SDD-COMPLIANCE-001`
> Confiança Geral: 🟢 90%

## 1. Propósito
Gestão de compliance LGPD: DSAR requests, canal de denúncia (whistleblower) e políticas jurídicas. 🟢

## 2. Responsabilidades (MoSCoW)
| Prioridade | Responsabilidade |
|:-----------|:-----------------|
| **Must** | Listar e gerenciar DSAR requests com SLA 🟢 |
| **Must** | Listar e gerenciar whistleblower cases 🟢 |
| **Should** | Criar e listar políticas de governança 🟢 |
| **Should** | SLA calculator com visual traffic light 🟢 |

## 3. Regras de Negócio
- RN-COMP-01: SLA: `< 0d` = atrasado (red), `≤ 3d` = urgente (amber), `> 3d` = ok (green) 🟢
- RN-COMP-02: DSAR transitions: received → in-progress → resolved/rejected 🟢
- RN-COMP-03: Case transitions: new → investigating → closed 🟢
- RN-COMP-04: Policy criada com `version: 1` e `status: 'draft'` 🟢

## 4. Critérios de Aceitação
- **Dado** um DSAR com SLA expirado, **Quando** listo DSARs, **Então** badge mostra "Xd atrasado" em vermelho 🟢
- **Dado** um caso novo, **Quando** mudo status para "investigating", **Então** optimistic update aplica 🟢

---

# SDD — AI Module

> Spec ID: `SDD-AI-001`
> Confiança Geral: 🟢 88%

## 1. Propósito
Configuração do chatbot IA (Gabi.OS), RAG knowledge base, AI content writer assistido e automações. 🟢

## 2. Regras de Negócio
- RN-AI-01: Config persistida via `PUT /api/admin/ai-settings` 🟢
- RN-AI-02: AI Content Writer usa streaming (`ReadableStream → TextDecoder`) 🟢
- RN-AI-03: 3 tons de conteúdo: técnico, consultivo, executivo 🟢
- RN-AI-04: `max_turns` limita interações por sessão 🟢
- RN-AI-05: Toggle `enabled` ativa/desativa o bot globalmente 🟢

---

# SDD — SaaS Module

> Spec ID: `SDD-SAAS-001`
> Confiança Geral: 🟢 91%

## 1. Propósito
Gestão multi-tenant B2B: organizações, membros, billing, API keys com RBAC por tab. 🟢

## 2. Regras de Negócio
- RN-SAAS-01: Tab visibility controlada por RBAC hierárquico 🟢
- RN-SAAS-02: SaaS page renderiza `EmptyState` se nenhuma org selecionada 🟢
- RN-SAAS-03: 5 sub-componentes: Overview, Members, Plan, API Keys, Settings 🟢
