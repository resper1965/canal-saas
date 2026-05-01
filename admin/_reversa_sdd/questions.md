# Perguntas para Validação — canal-admin

> Gerado pelo Revisor em 2026-05-01
> ✅ **RESOLVIDAS** — Verificadas via análise direta do código backend

---

### Q-001 🟡 → PARCIALMENTE CONFIRMADO
**Spec:** SDD-AUTH-001
**Pergunta:** O backend tem middleware de RBAC que bloqueia requisições não autorizadas?

**RESPOSTA (via `canal/src/index.ts:119-154`):**

O backend implementa **2 middlewares de auth**:

1. **`requireSession`** (L120-130) — Verifica sessão ativa via `auth.api.getSession()`. Retorna `401` se não autenticada. Extrai `tenantId` do header ou da sessão.
2. **`requireAdminOrKey`** (L132-154) — Aceita `x-setup-key` OU sessão ativa OU `agentSession` (MCP).

**Aplicação:** `app.use('/api/admin/*', requireSession)` (L419) — Todas as rotas admin exigem sessão.

**⚠️ LACUNA CONFIRMADA:** O middleware verifica **autenticação** (sessão válida), mas **NÃO verifica roles**. Qualquer usuário autenticado (mesmo `member`) pode acessar rotas `/api/admin/*`. O RBAC do frontend é **visual apenas**.

**Severidade:** 🔴 CRÍTICA — Qualquer member pode chamar endpoints admin via fetch/curl.

---

### Q-002 🟢 → CONFIRMADO COM DELTA
**Spec:** ERD
**Pergunta:** O schema D1 real corresponde às interfaces do frontend?

**RESPOSTA (via `canal/src/db/schema.ts`):**

O schema D1 (Drizzle ORM) corresponde às interfaces do frontend com os seguintes **deltas**:

| Entidade | Frontend Interface | D1 Schema | Delta |
|:---------|:------------------|:----------|:------|
| `collections` | `has_locale`, `has_slug`, `has_status` | ✅ Idêntico | + `sort_order`, `governance` no D1 |
| `entries` | `id`, `status`, `locale`, `data` | ✅ Idêntico | + `tenant_id`, `governance_decision`, `classification_reason`, `created_by`, `updated_by` no D1 |
| `dsar_requests` | `sla_deadline` | `deadline` | ⚠️ Campo renomeado (`sla_deadline` → `deadline`) |
| `dsar_requests` | 5 campos | 13 campos | + `requester_document`, `details`, `response_package_url`, `assigned_to`, `resolved_at` no D1 |
| `whistleblower_cases` | 6 campos | 8 campos | + `encrypted_payload`, `officer_notes` no D1 |
| `policies` | 8 campos | 11 campos | + `created_by` no D1 |
| `media` | `url` | `r2_key` | ⚠️ Frontend assume URL, backend armazena R2 key |
| `chatbot_config` | ✅ | ✅ | Correspondência exata |

**Tabelas extras no D1 não visíveis no frontend:**
- `leads`, `forms`, `chats`, `audit_logs`, `webhooks_targets`
- `ropa_records`, `incidents`, `consent_logs`
- `social_posts`, `newsletter_campaigns`, `comunicados`
- `applicants`, `brand_assets`, `knowledge_base`
- Better Auth managed: `user`, `organization`, `member`, `invitation`, `apikey`

**Total D1:** 26 tabelas | **Frontend interfaces:** 11 entidades | **Cobertura:** ~42%
