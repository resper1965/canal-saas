# PLAN: Component Library Migration — O Que Falta

## Situação Atual

### ✅ Concluído
- **Component Library** criada (`admin/src/components/ui/`) com 7 componentes
- **4 rotas migradas** para componentes: `dashboard-home`, `users`, `emergency`, `ai-settings`
- **Tipografia normalizada** em 15/19 rotas (sem `font-black`, sem `uppercase tracking-wider`)
- **Espaçamento** normalizado em 13/19 rotas (`p-8 pt-6` → `p-6`)

### ⚠️ Pendente

---

## Tarefa 1: Inline Card → `<Card>` Component (32 ocorrências em 10 rotas)

| Rota | Cards inline | Complexidade |
|---|---|---|
| `brandbook.tsx` | 5 | Média |
| `compliance.tsx` | 4 | Alta (formulários + tabelas) |
| `account.tsx` | 4 | Média |
| `automation.tsx` | 4 | Média |
| `communications.tsx` | 4 | Alta (chat + thread UI) |
| `newsletters.tsx` | 3 | Média |
| `media.tsx` | 2 | Baixa |
| `organizations.tsx` | 2 | Baixa |
| `signatures.tsx` | 2 | Baixa |
| `decks.tsx` | 2 | Baixa |

**Padrão de substituição:**
```diff
- <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
-   <div className="bg-muted/30 p-5 border-b border-border/40">
-     <h3 className="font-semibold leading-none">Título</h3>
-   </div>
-   <div className="p-6">conteúdo</div>
- </div>
+ <Card>
+   <CardHeader><CardTitle>Título</CardTitle></CardHeader>
+   <CardContent>conteúdo</CardContent>
+ </Card>
```

**Esforço estimado:** ~5 min/rota × 10 = **50 min**

---

## Tarefa 2: Limpar `font-black` restantes (2 arquivos)

| Arquivo | Ocorrências | Contexto |
|---|---|---|
| `dashboard.tsx` | 1 | Logo "canal." no sidebar |
| `login.tsx` | 2 | Tela de login (título + branding) |

**Decisão necessária:** `login.tsx` pode ter `font-black` intencional para branding. Manter ou normalizar?

---

## Tarefa 3: Normalizar `p-8` restantes (4 arquivos)

| Arquivo | Ocorrências | Contexto |
|---|---|---|
| `brandbook.tsx` | 4 | Containers de preview |
| `automation.tsx` | 1 | Wrapper principal |
| `signatures.tsx` | 1 | Container de assinaturas |
| `emergency.tsx` | 1 | Empty state (interno, ok) |

**Esforço:** 5 min total (sed)

---

## Tarefa 4: Adicionar `import Card` nas 10 rotas (junto com Tarefa 1)

Cada rota precisa:
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
```

---

## Tarefa 5 (Opcional): `dashboard.tsx` shell cleanup

- 1 `font-black` restante (logo)
- 1 `uppercase tracking` no sidebar  
- Considerar mover sidebar nav config para usar componentes

---

## Ordem de Execução Recomendada

| Fase | Rotas | Tempo |
|---|---|---|
| **Batch 1** (simples) | `media`, `organizations`, `decks`, `signatures` | 15 min |
| **Batch 2** (médias) | `brandbook`, `account`, `automation`, `newsletters` | 25 min |
| **Batch 3** (complexas) | `compliance`, `communications` | 20 min |
| **Cleanup final** | `p-8` sed + `dashboard.tsx` shell | 5 min |
| **Total** | | **~65 min** |

---

## Verificação Final

```bash
# Zero inline cards
grep -c "rounded-xl border bg-card" admin/src/routes/*.tsx
# Todos devem retornar 0

# Todos importam componentes
grep -c "from.*components/ui" admin/src/routes/*.tsx
# Todos (exceto login, collection, saas*) devem retornar ≥1

# Build limpo
cd admin && npx vite build

# Deploy
npx wrangler deploy --minify
```
