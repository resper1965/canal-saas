import type { FieldDef } from "../../lib/api";

/** Colunas visíveis na tabela (max 4 + status + ações) */
export function getTableFields(fields: FieldDef[]): FieldDef[] {
  if (!fields) return [];
  const priority = ["title", "client", "name", "slug", "tag", "category", "location", "date"];
  const sorted = [...fields].sort((a, b) => {
    const ai = priority.indexOf(a.name);
    const bi = priority.indexOf(b.name);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
  return sorted.slice(0, 4);
}
