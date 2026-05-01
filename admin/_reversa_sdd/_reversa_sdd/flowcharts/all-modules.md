# Fluxograma: auth

```mermaid
sequenceDiagram
    participant U as Usuário
    participant L as login.tsx
    participant AC as auth-client.ts
    participant BA as Better Auth API
    participant D as dashboard.tsx

    U->>L: Acessa /login
    L->>AC: signIn({ email, password })
    AC->>BA: POST /api/auth/sign-in
    BA-->>AC: Session Cookie + User Data
    AC-->>L: Session ativa
    L->>D: navigate("/")
    D->>AC: useSession()
    AC-->>D: session.user (id, email, role)
    D->>AC: useActiveOrganization()
    AC-->>D: activeOrg (id, name, members)
    D->>D: Calcula isSuperAdmin + myRole
    D->>D: Renderiza sidebar baseada em RBAC
```

# Fluxograma: collections

```mermaid
flowchart TD
    A["CollectionPage({ slug })"] --> B[fetchCollection]
    B --> C{collection existe?}
    C -->|Não| D[Loader spinner]
    C -->|Sim| E[fetchEntries com locale/page]
    E --> F[Renderiza EntryTable]

    F --> G{Ação do usuário}
    G -->|Criar| H[openCreate → defaults + locale]
    G -->|Editar| I[openEdit → form preenchido]
    G -->|Deletar| J[confirm() → deleteEntry]
    G -->|Status| K[toggleEntryStatus]
    G -->|Featured| L[toggleEntryFeatured]
    G -->|Paginar| M[setPage → reload]
    G -->|Locale| N[setLocale → reset page 1]

    H --> O[EntryModal mode=create]
    I --> O
    O --> P{Salvar?}
    P -->|Sim| Q[createEntry / updateEntry]
    Q --> R[closeModal → load()]
```

# Fluxograma: dashboard-home

```mermaid
flowchart TD
    A[DashboardHome monta] --> B["Promise.all([stats, health])"]
    B --> C{Carregou?}
    C -->|Loading| D[Spinner animado]
    C -->|Erro| E[Protocol Failure UI]
    C -->|OK| F[Renderiza KPI Grid]

    F --> G[8 KPI Cards]
    G --> H["Para cada KPI: value.toLocaleString('pt-BR')"]
    G --> I["Delta badge: emerald se > 0"]

    B --> J[Health Status Bar]
    J --> K["5 serviços: D1, KV, AI, R2, Queue"]
    K --> L["allOk = every(status === 'ok')"]
    L -->|Sim| M["Dot verde + pulse"]
    L -->|Não| N["Dot amber + pulse"]
```

# Fluxograma: compliance (DSAR)

```mermaid
flowchart TD
    A[CompliancePage] --> B[Fetch DSAR + Cases + Policies]
    B --> C[Tab Selector: dsar, whistleblower, policies]

    C -->|DSAR| D[Lista DSARs]
    D --> E{DSAR existe?}
    E -->|Não| F[EmptyState: Compliance Ativa]
    E -->|Sim| G["Tabela com SLA calculator"]
    G --> H["slaStatus(deadline)"]
    H --> I["diff < 0 → red (atrasado)"]
    H --> J["diff <= 3 → amber (urgente)"]
    H --> K["diff > 3 → green (ok)"]
    G --> L["Select: updateDsar(id, status)"]

    C -->|Whistleblower| M[Tabela de Cases]
    M --> N["updateCase(id, status)"]

    C -->|Policies| O[Grid: Creator + Directory]
    O --> P["createPolicy() → POST /api/admin/policies"]
```

# Fluxograma: saas

```mermaid
flowchart TD
    A[SaasSettingsPage] --> B{activeOrg?}
    B -->|Não| C["EmptyState: Selecione organização"]
    B -->|Sim| D[Determina RBAC]

    D --> E["isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email)"]
    D --> F["myRole = membership.role || 'member'"]
    D --> G["isAdmin = isSuperAdmin || owner || admin"]

    G --> H[Tab Controller]
    H --> I[Overview: sempre visível]
    H --> J["Members: editor+ (member, admin, owner)"]
    H --> K[Plan: sempre visível]
    H --> L["API Keys: admin+"]
    H --> M["Settings: admin+"]
```

# Fluxograma: ai-settings

```mermaid
sequenceDiagram
    participant P as AISettingsPage
    participant API as Backend API
    participant LLM as Workers AI

    P->>API: GET /api/admin/ai-settings
    P->>API: GET /api/admin/ai-stats
    API-->>P: AIConfig + AIStats
    P->>P: Renderiza form + stats cards

    P->>API: PUT /api/admin/ai-settings (config)
    Note over P: Toggle enabled, edit bot_name, system_prompt, etc.
    API-->>P: Success → "Sincronização Completa" badge

    P->>P: Renderiza ChatsHistory (embedded)
```
