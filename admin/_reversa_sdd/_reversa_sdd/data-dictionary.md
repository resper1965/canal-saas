# Dicionário de Dados — canal-admin

> 🟢 **CONFIRMADO** — Gerado pelo Arqueólogo em 2026-05-01

---

## Interfaces do API Client

### EntryMeta
| Campo | Tipo | Obrigatório | Descrição |
|:------|:-----|:------------|:----------|
| `total` | number | ✅ | Total de registros |
| `page` | number | ✅ | Página atual |
| `perPage` | number | ✅ | Items por página |
| `totalPages` | number | ✅ | Total de páginas |

### CollectionDef
| Campo | Tipo | Obrigatório | Descrição |
|:------|:-----|:------------|:----------|
| `id` | string | ✅ | UUID da collection |
| `slug` | string | ✅ | Identificador único |
| `label` | string | ✅ | Nome singular |
| `label_plural` | string | ✅ | Nome plural |
| `icon` | string | ✅ | Ícone Lucide |
| `has_locale` | number | ✅ | Suporte i18n (0/1) |
| `has_slug` | number | ✅ | Campo slug (0/1) |
| `has_status` | number | ✅ | Status draft/published (0/1) |
| `fields` | FieldDef[] | ✅ | Definição de campos |

### FieldDef
| Campo | Tipo | Obrigatório | Descrição |
|:------|:-----|:------------|:----------|
| `name` | string | ✅ | Nome do campo |
| `type` | string | ✅ | Tipo: text, textarea, select, date, image, boolean, richtext |
| `label` | string | ❌ | Label de exibição |
| `required` | boolean | ❌ | Obrigatório |
| `defaultValue` | unknown | ❌ | Valor padrão |
| `options` | string[] | ❌ | Opções para selects |

---

## Entidades de Domínio

### AIConfig
| Campo | Tipo | Default | Descrição |
|:------|:-----|:--------|:----------|
| `enabled` | boolean | true | Agente ativo |
| `bot_name` | string | "Gabi.OS" | Nome do bot |
| `avatar_url` | string | "" | URL do avatar |
| `welcome_message` | string | "Olá! Como posso ajudar?" | Mensagem inicial |
| `system_prompt` | string | "" | Diretiva de sistema |
| `theme_color` | string | "#00E5A0" | Cor do widget |
| `max_turns` | number | 20 | Limite de turnos |

### AIStats
| Campo | Tipo | Descrição |
|:------|:-----|:----------|
| `totalChats` | number | Total de conversas |
| `totalLeads` | number | Leads capturados |
| `recentChats` | number | Chats nas últimas 72h |

### AIWriteParams
| Campo | Tipo | Obrigatório | Descrição |
|:------|:-----|:------------|:----------|
| `brief` | string | ✅ | Briefing do conteúdo |
| `field` | string | ✅ | Campo alvo |
| `collection` | string | ✅ | Collection alvo |
| `tone` | enum | ✅ | tecnico, consultivo, executivo |
| `locale` | string | ❌ | Idioma |

### DSARRequest
| Campo | Tipo | Obrigatório | Descrição |
|:------|:-----|:------------|:----------|
| `id` | string | ✅ | UUID |
| `requester_name` | string | ✅ | Nome do titular |
| `requester_email` | string | ✅ | Email do titular |
| `request_type` | enum | ✅ | access, deletion, portability, correction, revocation |
| `status` | string | ✅ | received, in-progress, resolved, rejected |
| `sla_deadline` | string | ✅ | ISO date do prazo |
| `created_at` | string | ✅ | ISO date de criação |
| `description` | string | ❌ | Descrição |

### WhistleblowerCase
| Campo | Tipo | Obrigatório | Descrição |
|:------|:-----|:------------|:----------|
| `id` | string | ✅ | UUID |
| `case_code` | string | ✅ | Código do caso |
| `category` | enum | ✅ | harassment, corruption, security, discrimination, other |
| `status` | string | ✅ | new, investigating, closed |
| `sla_deadline` | string | ✅ | ISO date do SLA |
| `created_at` | string | ✅ | ISO date |

### Policy
| Campo | Tipo | Obrigatório | Descrição |
|:------|:-----|:------------|:----------|
| `id` | string | ✅ | UUID |
| `type` | enum | ✅ | privacy, terms, cookie, lgpd |
| `locale` | string | ✅ | pt, en, es |
| `title` | string | ✅ | Título do documento |
| `body_md` | string | ✅ | Conteúdo markdown |
| `version` | number | ✅ | Versão (auto-increment) |
| `status` | string | ✅ | draft, published |
| `effective_date` | string | ❌ | Data de vigência |
| `created_at` | string | ✅ | ISO date |

### Stats (Dashboard Home)
| Campo | Tipo | Descrição |
|:------|:-----|:----------|
| `totalLeads` | number | Total de leads |
| `newLeads` | number | Leads novos |
| `totalForms` | number | Total de formulários |
| `newForms` | number | Formulários pendentes |
| `totalChats` | number | Total de conversas |
| `publishedEntries` | number | Entries publicadas |
| `totalPosts` | number | Total de posts |
| `totalCases` | number | Total de cases |
| `totalJobs` | number | Total de vagas |
| `totalUsers` | number | Total de usuários |
| `weeklyLeads` | Array<{day, count}> | Leads por dia (sparkline) |

### HealthStatus
| Campo | Tipo | Descrição |
|:------|:-----|:----------|
| `db` | ServiceHealth | D1 database |
| `kv` | ServiceHealth | KV store |
| `ai` | ServiceHealth | Workers AI |
| `storage` | ServiceHealth | R2 storage |
| `queue` | ServiceHealth | Queue |
| `checked_at` | string | Timestamp da verificação |

### ServiceHealth
| Campo | Tipo | Descrição |
|:------|:-----|:----------|
| `status` | enum | ok, degraded, error |
| `latency_ms` | number | Latência em ms |

---

## Constantes de Domínio

### DSAR_TYPES
| Chave | Label |
|:------|:------|
| access | Acesso aos Dados |
| deletion | Exclusão/Esquecimento |
| portability | Portabilidade |
| correction | Correção de Dados |
| revocation | Revogação de Consentimento |

### CASE_CATEGORIES
| Chave | Label |
|:------|:------|
| harassment | Assédio/Conduta |
| corruption | Corrupção/Fraude |
| security | Segurança/Vulnerabilidade |
| discrimination | Discriminação |
| other | Outros Incidentes |

### SUPER_ADMIN_EMAILS 🟢
`["resper@bekaa.eu", "admin@ness.com.br", "resper@ness.com.br"]`

### LOCALES 🟢
`["pt", "en", "es"]`
