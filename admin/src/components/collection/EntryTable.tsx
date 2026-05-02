import type { CollectionDef, EntryMeta } from "../../lib/api";
import { getTableFields } from "./getTableFields";

interface EntryTableProps {
  collection: CollectionDef;
  items: Record<string, unknown>[];
  meta: EntryMeta | null;
  loading: boolean;
  page: number;
  togglingId: string | null;
  togglingFeaturedId: string | null;
  onPageChange: (p: number) => void;
  onEdit: (item: Record<string, unknown>) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (item: Record<string, unknown>) => void;
  onToggleFeatured: (item: Record<string, unknown>) => void;
  onCreateFirst: () => void;
}

export function EntryTable({
  collection,
  items,
  meta,
  loading,
  page,
  togglingId,
  togglingFeaturedId,
  onPageChange,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
  onCreateFirst,
}: EntryTableProps) {
  const tableFields = getTableFields(collection.fields).filter(f => f.name !== 'featured');
  const hasFeatured = collection.fields.some(f => f.name === 'featured');

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl min-h-[300px] flex flex-col items-center justify-center gap-4">
         <div className="w-8 h-8 rounded-full border-2 border-border border-t-brand-primary animate-spin" />
         <span className="text-xs font-medium text-zinc-500">Carregando...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border rounded-xl">
        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-zinc-500 mb-6">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
        </div>
        <div className="space-y-2">
           <h3 className="text-lg font-semibold text-white">Nenhum registro</h3>
           <p className="text-sm text-zinc-500 max-w-xs">Esta coleção ainda não possui registros. Crie o primeiro para começar.</p>
        </div>
        <button 
          className="mt-8 h-10 px-6 rounded-md bg-brand-primary text-white font-semibold text-xs uppercase hover:brightness-110 transition-all" 
          onClick={onCreateFirst}
        >
          Criar Primeiro Registro
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-card border border-border rounded-xl overflow-x-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border">
              {tableFields.map((f, i) => (
                <th key={f.name} className={`py-3 text-xs font-semibold uppercase text-zinc-500 ${i === 0 ? 'pl-6' : 'px-4'}`}>
                  {f.label ?? f.name}
                </th>
              ))}
              {hasFeatured && <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Destaque</th>}
              {collection.has_status && <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Status</th>}
              <th className="px-4 py-3 text-xs font-semibold uppercase text-zinc-500">Data</th>
              <th className="pr-6 pl-4 py-3 text-xs font-semibold uppercase text-zinc-500 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222]">
            {items.map((item) => (
              <tr key={item.id as string} className="group hover:bg-muted transition-colors">
                {tableFields.map((f, i) => {
                  const isPrimary = f.name === "title" || f.name === "client" || f.name === "name";
                  const cellValue = f.type === "boolean"
                    ? null
                    : String(item[f.name] ?? "—");
                  return (
                    <td
                      key={f.name}
                      title={cellValue ? cellValue : undefined}
                      className={`py-4 ${i === 0 ? 'pl-6' : 'px-4'}`}
                    >
                      <div className={`truncate max-w-[240px] text-sm ${isPrimary ? 'font-semibold text-white' : 'text-zinc-400'}`}>
                        {f.type === "boolean"
                          ? item[f.name] ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brand-primary"><polyline points="20 6 9 17 4 12"/></svg>
                            ) : <span className="text-zinc-700">—</span>
                          : cellValue}
                      </div>
                    </td>
                  );
                })}
                
                {hasFeatured && (
                  <td className="px-4 py-4">
                    <button
                      onClick={() => onToggleFeatured(item)}
                      disabled={togglingFeaturedId === (item.id as string)}
                      className={`
                        h-8 px-3 rounded-md text-xs font-semibold border transition-colors flex items-center gap-1.5
                        ${item.featured 
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' 
                          : 'bg-transparent text-zinc-600 border-border hover:border-border hover:text-zinc-400'}
                      `}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill={item.featured ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {item.featured ? "Destaque" : "Fixar"}
                    </button>
                  </td>
                )}

                {collection.has_status && (
                  <td className="px-4 py-4">
                    <button
                      onClick={() => onToggleStatus(item)}
                      disabled={togglingId === (item.id as string)}
                      className={`
                        h-8 px-3 rounded-md text-xs font-semibold border transition-colors flex items-center gap-2
                        ${item.status === "published" 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-transparent text-zinc-600 border-border hover:border-border hover:text-zinc-400'}
                      `}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status === "published" ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                      {item.status === "published" ? "Publicado" : "Rascunho"}
                    </button>
                  </td>
                )}

                <td className="px-4 py-4">
                  <span className="text-xs text-zinc-500 font-mono">
                    {((item.createdAt ?? item.publishedAt ?? "") as string).slice(0, 10)}
                  </span>
                </td>

                <td className="pr-6 pl-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                       className="w-9 h-9 flex items-center justify-center rounded-md border border-border text-zinc-500 hover:text-brand-primary hover:border-brand-primary/30 transition-colors" 
                       onClick={() => onEdit(item)}
                    >
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                    <button 
                       className="w-9 h-9 flex items-center justify-center rounded-md border border-border text-zinc-600 hover:text-red-500 hover:border-red-500/30 transition-colors" 
                       onClick={() => onDelete(item.id as string)}
                    >
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center gap-2 bg-card border border-border p-1.5 rounded-lg">
            <button
              className="w-9 h-9 flex items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-muted disabled:opacity-20 transition-colors"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="px-4 h-9 flex items-center text-xs font-medium text-zinc-500">
              {page} / {meta.totalPages}
            </div>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-muted disabled:opacity-20 transition-colors"
              disabled={page >= meta.totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
