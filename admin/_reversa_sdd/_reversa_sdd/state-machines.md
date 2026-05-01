# Máquinas de Estado — canal-admin

> Gerado pelo Detetive em 2026-05-01

---

## Entry (Content Lifecycle)

```mermaid
stateDiagram-v2
    [*] --> draft : Criação
    draft --> published : toggleEntryStatus
    published --> draft : toggleEntryStatus
    draft --> [*] : deleteEntry
    published --> [*] : deleteEntry

    state draft {
        [*] --> unfeatured
        unfeatured --> featured : toggleEntryFeatured
        featured --> unfeatured : toggleEntryFeatured
    }
```

**Confiança:** 🟢 CONFIRMADO — extraído de `api.ts` e `collection.tsx`

---

## DSAR Request

```mermaid
stateDiagram-v2
    [*] --> received : Solicitação recebida
    received --> in_progress : Iniciar análise
    in_progress --> resolved : Deferir
    in_progress --> rejected : Indeferir
    received --> rejected : Indeferir direto
```

**Confiança:** 🟢 CONFIRMADO — extraído de `compliance.tsx:211-215`

---

## Whistleblower Case

```mermaid
stateDiagram-v2
    [*] --> new : Reporte recebido
    new --> investigating : Iniciar apuração
    investigating --> closed : Arquivar
```

**Confiança:** 🟢 CONFIRMADO — extraído de `compliance.tsx:298-301`

---

## Policy

```mermaid
stateDiagram-v2
    [*] --> draft : createPolicy
    draft --> published : Publicar (backend)
    note right of draft : v1.0 auto-assigned
```

**Confiança:** 🟡 INFERIDO — transição para `published` não visível no frontend

---

## AI Agent (Bot)

```mermaid
stateDiagram-v2
    [*] --> Ativo : config.enabled = true
    Ativo --> Silenciado : Toggle off
    Silenciado --> Ativo : Toggle on
```

**Confiança:** 🟢 CONFIRMADO — extraído de `ai-settings.tsx:137`
