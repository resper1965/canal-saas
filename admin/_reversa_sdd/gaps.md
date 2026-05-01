# Lacunas — canal-admin

> Gerado pelo Revisor em 2026-05-01

---

## Críticas

### GAP-001: Backend RBAC Enforcement

**Impacto:** Segurança
**Severidade:** 🔴 CRÍTICA — CONFIRMADA via código backend
**Descrição:** O middleware `requireSession` (L120-130 em `index.ts`) verifica apenas se a sessão é válida (`auth.api.getSession()`), mas **não verifica roles**. Todas as rotas `/api/admin/*` são protegidas por `requireSession`, significando que qualquer usuário autenticado (inclusive `member`) pode acessar endpoints administrativos via API direta.
**Evidência:** `app.use('/api/admin/*', requireSession)` na L419 — sem check de `user.role`, `isSuperAdmin`, ou membership role.
**Ação Recomendada:** Implementar middleware `requireAdmin` que verifique `session.user.role === 'admin'` ou membership role `owner`/`admin` antes de processar rotas sensíveis.


---

## Moderadas

### GAP-002: Schema D1 vs Frontend Interfaces
**Impacto:** Integridade de dados
**Descrição:** Interfaces TypeScript no frontend podem divergir do schema real do D1.
**Ação:** Cruzar com `schema.sql` ou migrations no backend.

### GAP-003: Rotas Sem SDD
**Impacto:** Documentação
**Descrição:** 12 rotas sem spec dedicada (brandbook, signatures, decks, newsletters, communications, chats, emergency, social-calendar, applicants, users, organizations, account).
**Ação:** Gerar SDDs adicionais se reimplementação for necessária.

### GAP-004: Cobertura de Testes Baixa
**Impacto:** Confiabilidade
**Descrição:** 11 arquivos de teste para 97 arquivos de código (~11%).
**Ação:** Priorizar testes para módulos core (auth, collections, compliance).

---

## Cosméticas

### GAP-005: Super Admin Hardcoded
**Impacto:** Manutenibilidade
**Descrição:** Lista de emails de super admin está no código fonte em vez de configuração.
**Ação:** Mover para environment variable ou KV store.

### GAP-006: API Client Sem Tipagem Forte
**Impacto:** Developer Experience
**Descrição:** Muitos retornos tipados como `Record<string, unknown>` em vez de interfaces específicas.
**Ação:** Criar interfaces tipadas para cada endpoint.
