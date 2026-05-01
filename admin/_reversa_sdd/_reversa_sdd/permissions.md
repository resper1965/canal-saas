# Matriz de Permissões (RBAC) — canal-admin

> Gerado pelo Detetive em 2026-05-01

---

## Papéis

| Papel | Definição | Confiança |
|:------|:----------|:----------|
| **Super Admin** | Email na lista `SUPER_ADMIN_EMAILS` OU `session.user.role === 'admin'` | 🟢 |
| **Owner** | `membership.role === 'owner'` na org ativa | 🟢 |
| **Admin** | `membership.role === 'admin'` na org ativa | 🟡 |
| **Member** | `membership.role === 'member'` (default) | 🟢 |

## Hierarquia
```
Super Admin > Owner > Admin > Member
```

## Matriz de Acesso

| Funcionalidade | Member | Admin | Owner | Super Admin |
|:---------------|:-------|:------|:------|:------------|
| Dashboard Home | ✅ | ✅ | ✅ | ✅ |
| Insights/Cases/Jobs/Pages | ✅ | ✅ | ✅ | ✅ |
| Publications | ✅ | ✅ | ✅ | ✅ |
| Brandbook/Signatures/Decks | ✅ | ✅ | ✅ | ✅ |
| Newsletters | ✅ | ✅ | ✅ | ✅ |
| Media | ✅ | ✅ | ✅ | ✅ |
| Communications | ✅ | ✅ | ✅ | ✅ |
| AI Settings | ✅ | ✅ | ✅ | ✅ |
| Knowledge Base | ✅ | ✅ | ✅ | ✅ |
| Compliance | ✅ | ✅ | ✅ | ✅ |
| Automation | ✅ | ✅ | ✅ | ✅ |
| Social Calendar | ✅ | ✅ | ✅ | ✅ |
| Account | ✅ | ✅ | ✅ | ✅ |
| **SaaS Overview** | ✅ | ✅ | ✅ | ✅ |
| **SaaS Members** | ✅ | ✅ | ✅ | ✅ |
| **SaaS Plan** | ✅ | ✅ | ✅ | ✅ |
| **SaaS API Keys** | ❌ | ✅ | ✅ | ✅ |
| **SaaS Settings** | ❌ | ✅ | ✅ | ✅ |
| **Users** (list all users) | ❌ | ❌ | ❌ | ✅ |
| **Organizations** (manage all orgs) | ❌ | ❌ | ❌ | ✅ |
| **Emergency** | ❌ | ❌ | ✅ | ✅ |

**Confiança:** 🟢/🟡 — Lógica de visibilidade extraída de `nav-config.tsx` e `saas.tsx`. Enforcement de backend não verificável pelo frontend.

## Nota de Segurança 🟡
O controle de acesso no frontend é **visual** (esconde/mostra rotas). A proteção real depende de middleware no backend. Não foi possível verificar se o backend replica as mesmas regras de RBAC.
