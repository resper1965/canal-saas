# PLAN — Simplificação Global do Canal SaaS Admin

> **Objetivo:** Eliminar ~950 linhas de duplicação, consolidar padrões e reduzir a complexidade de manutenção do frontend + backend.

---

## Estado Atual (Pós Fase 1)

### ✅ Já Implementado
| Item | Status |
|---|---|
| `<Spinner />` + `<PageSpinner />` | ✅ Criados, migrados em 6 rotas |
| `<Toast />` + `useToast()` + `<ToastProvider>` | ✅ Criados, App integrado, signatures migrado |
| `<SearchInput />` | ✅ Criado (não migrado nas rotas ainda) |
| `useApiResource()` | ✅ Criado (não adotado nas rotas ainda) |
| `useSearchFilter()` | ✅ Criado (não adotado nas rotas ainda) |

### ⏳ Pendente
| Proposta | Impacto | Risco |
|---|---|---|
| **C.2** Migrar SearchInput nas 6 rotas | -60 linhas | Baixo |
| **C.3** Migrar tabs inline → TabGroup | -30 linhas | Baixo |
| **B.1** Adotar useApiResource em 11 rotas | -200 linhas | Médio |
| **A** Consolidar publications → collection | -500 linhas | Médio-Alto |
| **D** Merge backend routes duplicados | -100 linhas | Médio |

---

## Fase 2: Migrar SharedComponents nas Rotas (~2h)

### 2.1 — SearchInput Migration
**Rotas alvo:** `applicants`, `communications`, `media`, `users`, `organizations`, `publications`

Cada rota tem algo como:
```tsx
const [search, setSearch] = useState("");
// ...
<input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="h-10 w-full pl-10 ..." />
```

**Ação:** Substituir por:
```tsx
import { SearchInput } from "../components/ui/SearchInput";
// ...
<SearchInput value={search} onChange={setSearch} placeholder="Buscar..." />
```

**Arquivos:**
- [ ] `admin/src/routes/applicants.tsx`
- [ ] `admin/src/routes/communications.tsx`
- [ ] `admin/src/routes/media.tsx`
- [ ] `admin/src/routes/users.tsx`
- [ ] `admin/src/routes/organizations.tsx`
- [ ] `admin/src/routes/publications.tsx`

### 2.2 — Tab Migration
**Rotas com tabs inline:** `newsletters.tsx`, `emergency.tsx`

**Ação:** Substituir tabs inline por `<TabGroup />` componente existente.

**Arquivos:**
- [ ] `admin/src/routes/newsletters.tsx`
- [ ] `admin/src/routes/emergency.tsx`

### 2.3 — Remaining Spinner Migration
**Rotas com spinner inline:** `media.tsx` (2 spinners), `onboarding-wizard.tsx`, `login.tsx`

**Ação:** Importar `<Spinner />` e substituir divs de loading.

**Arquivos:**
- [ ] `admin/src/routes/media.tsx`
- [ ] `admin/src/routes/onboarding-wizard.tsx`

---

## Fase 3: Adotar useApiResource (~3h)

### Conceito
11 rotas fazem `fetch("/api/admin/...")` inline com state `loading/error/data` manual. Cada uma tem ~15-20 linhas de boilerplate que pode virar 1 linha:

**Antes (15 linhas):**
```tsx
const [items, setItems] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch("/api/admin/applicants")
    .then(r => r.json())
    .then(data => setItems(data))
    .catch(() => {})
    .finally(() => setLoading(false));
}, []);
```

**Depois (1 linha):**
```tsx
const { data: items, loading, error, refetch } = useApiResource<Applicant[]>("/api/admin/applicants");
```

### Rotas alvo (por prioridade)
- [ ] `admin/src/routes/applicants.tsx` — 2 fetch calls
- [ ] `admin/src/routes/social-calendar.tsx` — 2 fetch calls
- [ ] `admin/src/routes/newsletters.tsx` — 3 fetch calls
- [ ] `admin/src/routes/communications.tsx` — 1 fetch call
- [ ] `admin/src/routes/knowledge-base.tsx` — 2 fetch calls
- [ ] `admin/src/routes/ai-settings.tsx` — 2 fetch calls
- [ ] `admin/src/routes/emergency.tsx` — custom state
- [ ] `admin/src/routes/compliance.tsx` — 1 fetch call
- [ ] `admin/src/routes/onboarding-wizard.tsx` — 1 hardcoded URL (⚠️ fix too)

> [!WARNING]
> `onboarding-wizard.tsx` tem URL hardcoded `https://canal.bekaa.eu/api/...` que deve ser corrigido para `/api/...` relativo.

---

## Fase 4: Consolidar Publications → Collection (~2h)

### Diagnóstico
`publications.tsx` (520 linhas) replica **todo** o CRUD de `collection.tsx` (340 linhas) e adiciona:
1. **Filtro por ano** — `useState("year")` + dropdown
2. **Filtro por tipo** — `useState("type")` + badges  
3. **PDF viewer** — componente de preview inline

### Estratégia: Extensão via Props
Ao invés de reescrever, tornar `collection.tsx` extensível:

```tsx
// collection.tsx ← aceita props de extensão
interface CollectionPageProps {
  slug: string;
  extraFilters?: (entries: Entry[], setFiltered: Function) => ReactNode;
  renderPreview?: (entry: Entry) => ReactNode;
  customColumns?: Column[];
}
```

**Então `publications` vira:**
```tsx
// publications.tsx ← 80 linhas ao invés de 520
export default function PublicationsPage() {
  return (
    <CollectionPage
      slug="publications"
      extraFilters={(entries, setFiltered) => <YearFilter ... />}
      renderPreview={(entry) => <PDFViewer url={entry.file_url} />}
    />
  );
}
```

### Tarefas
- [ ] Refatorar `collection.tsx` para aceitar `extraFilters` e `renderPreview` props
- [ ] Extrair `<YearFilter />` e `<TypeFilter />` de publications
- [ ] Extrair `<PDFViewer />` como componente standalone
- [ ] Reescrever `publications.tsx` usando collection extensível
- [ ] Testar CRUD: create, edit, delete, filter
- [ ] Avaliar: `social-calendar` e `applicants` podem usar collection?

---

## Fase 5: Consolidar Backend Routes (~1h)

### 5.1 — Merge `onboarding.ts` + `saas-onboarding.ts`
Dois arquivos para o mesmo domínio funcional.

**Tarefas:**
- [ ] Mapear todos endpoints de ambos arquivos
- [ ] Identificar sobreposições
- [ ] Mover tudo para `onboarding.ts` (ou `saas-onboarding.ts`)
- [ ] Atualizar imports no `src/index.ts`
- [ ] Deletar arquivo redundante

### 5.2 — Merge `ai.ts` + `ai-writer.ts`
Mesma lógica: dois arquivos para AI.

**Tarefas:**
- [ ] Mapear endpoints
- [ ] Consolidar em `ai.ts`
- [ ] Atualizar `src/index.ts`
- [ ] Deletar `ai-writer.ts`

### 5.3 — Avaliar `legacy.ts` vs `admin.ts`
Possível sobreposição de endpoints legacy.

**Tarefas:**
- [ ] Listar todos endpoints de ambos
- [ ] Identificar duplicatas
- [ ] Decidir: deprecar `legacy.ts` ou manter por compatibility?

---

## Verificação

### Build
```bash
cd admin && npm run build
```

### Deploy
```bash
npm run deploy
```

### Smoke Test
- [ ] Dashboard carrega ✅
- [ ] Collection CRUD funciona (insights, cases, jobs) ✅
- [ ] Publications funciona com filtros ✅
- [ ] Compliance sub-rotas carregam ✅
- [ ] Toast notifications aparecem globalmente ✅

---

## Cronograma

| Fase | Duração | Dependências |
|---|---|---|
| **2** SharedComponents migration | ~30min | Nenhuma |
| **3** useApiResource adoption | ~1h | Nenhuma |
| **4** Publications consolidation | ~2h | Fase 2 |
| **5** Backend merge | ~1h | Nenhuma |
| **Total** | **~4.5h** | — |

---

## Agentes Necessários

| Fase | Agente |
|---|---|
| 2, 3 | `frontend-specialist` |
| 4 | `frontend-specialist` + `backend-specialist` |
| 5 | `backend-specialist` |

---

> **Próximo passo:** Aprovação do plano → Execução Fase 2 → Build → Fase 3 → ... → Deploy final
