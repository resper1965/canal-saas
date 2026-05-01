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
      <div className="bg-black/40 backdrop-blur-3xl rounded-[40px] border border-white/5 shadow-2xl overflow-hidden min-h-[400px] flex flex-col items-center justify-center gap-6">
         <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-brand-primary animate-spin" />
         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Scan em curso...</span>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-center bg-black/40 backdrop-blur-3xl rounded-[48px] border border-white/5 shadow-2xl radial-gradient-glass group relative overflow-hidden">
        <div className="absolute -inset-20 bg-brand-primary/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="w-24 h-24 rounded-3xl bg-white/2 border border-white/10 flex items-center justify-center text-zinc-700 mb-10 group-hover:scale-110 group-hover:text-brand-primary transition-all duration-700 shadow-2xl relative z-10">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
        </div>
        <div className="space-y-3 relative z-10">
           <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Protocolo de Dados Vazio</h3>
           <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest max-w-[280px] leading-relaxed">Nenhum ativo detectado nesta coleção. Inicie a ingestão de registros para popular este node.</p>
        </div>
        <button 
          className="mt-12 h-12 px-10 rounded-2xl bg-brand-primary text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_-10px_rgba(0,173,232,0.4)] relative z-10" 
          onClick={onCreateFirst}
        >
          Inject First Entry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="bg-transparent overflow-x-auto w-full custom-scrollbar pr-2">
        <table className="w-full text-left border-separate border-spacing-y-4">
          <thead>
            <tr className="bg-transparent">
              {tableFields.map((f, i) => (
                <th key={f.name} className={`pb-2 font-black text-[10px] uppercase tracking-[0.2em] text-zinc-600 italic ${i === 0 ? 'pl-10' : 'px-4'}`}>
                  {f.label ?? f.name}
                </th>
              ))}
              {hasFeatured && <th className="px-4 pb-2 font-black text-[10px] uppercase tracking-[0.2em] text-zinc-600 italic">Contexto</th>}
              {collection.has_status && <th className="px-4 pb-2 font-black text-[10px] uppercase tracking-[0.2em] text-zinc-600 italic">Liveness</th>}
              <th className="px-4 pb-2 font-black text-[10px] uppercase tracking-[0.2em] text-zinc-600 italic">Snapshot</th>
              <th className="pr-10 pl-4 pb-2 font-black text-[10px] uppercase tracking-[0.2em] text-zinc-600 italic text-right">Operational</th>
            </tr>
          </thead>
          <tbody className="divide-y-0">
            {items.map((item) => (
              <tr key={item.id as string} className="group transition-all duration-500">
                {tableFields.map((f, i) => {
                  const isPrimary = f.name === "title" || f.name === "client" || f.name === "name";
                  const cellValue = f.type === "boolean"
                    ? null
                    : String(item[f.name] ?? "—");
                  return (
                    <td
                      key={f.name}
                      title={cellValue ? cellValue : undefined}
                      className={`h-20 bg-black/40 backdrop-blur-3xl border-y border-white/5 first:border-l first:rounded-l-[24px] last:border-r last:rounded-r-[24px] first:pl-10 px-4 group-hover:bg-white/4 group-hover:border-white/10 transition-all duration-500`}
                    >
                      <div className={`truncate max-w-[240px] text-sm tracking-tight ${isPrimary ? 'font-black text-white italic uppercase' : 'font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors'}`}>
                        {f.type === "boolean"
                          ? item[f.name] ? (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="text-brand-primary"><polyline points="20 6 9 17 4 12"/></svg>
                            ) : <span className="opacity-20">—</span>
                          : cellValue}
                      </div>
                    </td>
                  );
                })}
                
                {hasFeatured && (
                  <td className="h-20 bg-black/40 backdrop-blur-3xl border-y border-white/5 group-hover:bg-white/4 group-hover:border-white/10 px-4 transition-all duration-500">
                    <button
                      onClick={() => onToggleFeatured(item)}
                      disabled={togglingFeaturedId === (item.id as string)}
                      className={`
                        h-11 px-5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2
                        ${item.featured 
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                          : 'bg-white/2 text-zinc-700 border-white/5 hover:border-white/20 hover:text-zinc-500'}
                      `}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill={item.featured ? "currentColor" : "none"} stroke="currentColor" strokeWidth="3"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {item.featured ? "Destaque" : "Fixar"}
                    </button>
                  </td>
                )}

                {collection.has_status && (
                  <td className="h-20 bg-black/40 backdrop-blur-3xl border-y border-white/5 group-hover:bg-white/4 group-hover:border-white/10 px-4 transition-all duration-500">
                    <button
                      onClick={() => onToggleStatus(item)}
                      disabled={togglingId === (item.id as string)}
                      className={`
                        h-11 px-5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-3
                        ${item.status === "published" 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                          : 'bg-white/2 text-zinc-700 border-white/5 hover:border-white/10 hover:text-zinc-500'}
                      `}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.status === "published" ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-800'}`} />
                      {item.status === "published" ? "Live" : "Draft Mode"}
                    </button>
                  </td>
                )}

                <td className="h-20 bg-black/40 backdrop-blur-3xl border-y border-white/5 group-hover:bg-white/4 group-hover:border-white/10 px-4 transition-all duration-500">
                  <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest font-mono italic">
                    {((item.createdAt ?? item.publishedAt ?? "") as string).slice(0, 10).replace(/-/g, '.')}
                  </span>
                </td>

                <td className="h-20 bg-black/40 backdrop-blur-3xl border-y border-white/5 last:border-r last:rounded-r-[24px] pr-10 pl-4 group-hover:bg-white/4 group-hover:border-white/10 transition-all duration-500 text-right">
                  <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-700">
                    <button 
                       className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/2 border border-white/5 text-zinc-600 hover:text-brand-primary hover:bg-brand-primary/10 hover:border-brand-primary/20 transition-all shadow-2xl active:scale-95" 
                       onClick={() => onEdit(item)}
                    >
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    </button>
                    <button 
                       className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/2 border border-white/5 text-zinc-800 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all shadow-2xl active:scale-95" 
                       onClick={() => onDelete(item.id as string)}
                    >
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-3xl border border-white/5 shadow-2xl p-2 rounded-[24px] radial-gradient-glass">
            <button
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/2 text-white font-black hover:bg-white hover:text-black disabled:opacity-20 transition-all active:scale-90"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div className="px-8 h-12 flex items-center text-[10px] font-black font-mono tracking-[0.3em] text-zinc-500 uppercase italic">
              Segment {page} <span className="mx-4 opacity-20">/</span> Total {meta.totalPages}
            </div>
            <button
              className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/2 text-white font-black hover:bg-white hover:text-black disabled:opacity-20 transition-all active:scale-90"
              disabled={page >= meta.totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
