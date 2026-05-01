import { useState, useEffect, useRef } from "react";
import { fetchMedia, uploadMedia, deleteMedia, type EntryMeta } from "../lib/api";

type MediaItem = {
  id: string;
  key: string;
  filename: string;
  content_type: string;
  size: number;
  url: string;
  uploaded_at: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${((bytes / 1024)).toFixed(1)} KB`;
  return `${((bytes / 1048576)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [activeTab, setActiveTab] = useState<'public' | 'knowledge'>('public');
  const [meta, setMeta] = useState<EntryMeta | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetchMedia({ page });
      setItems((res.data ?? []) as MediaItem[]);
      setMeta(res.meta);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [page]);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      await uploadMedia(file);
    }
    setUploading(false);
    await load();
  }

  async function handleDelete(item: MediaItem) {
    if (!confirm(`Erradicar permanente o arquivo "${item.filename}"?`)) return;
    await deleteMedia(item.id);
    await load();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
  }

  const isImage = (type: string) => type?.startsWith("image/");
  const filteredItems = items.filter(item => activeTab === 'public' ? isImage(item.content_type) : (!isImage(item.content_type) || item.content_type === "application/pdf"));

  return (
    <div className="max-w-[1750px] w-full px-10 md:px-16 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 overflow-hidden flex flex-col h-full text-white">
      
      {/* ── High-Fidelity Segmented Ecosystem Controls ── */}
      <div className="flex p-1.5 bg-black/40 backdrop-blur-3xl rounded-2xl border border-white/5 radial-gradient-glass w-fit h-14 shrink-0 shadow-2xl relative overflow-hidden group">
        <div className="absolute -inset-10 bg-brand-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
        {[
          { id: 'public', label: 'Depósito Público', icon: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></> },
          { id: 'knowledge', label: 'Cérebro RAG / Memória', icon: <><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></> }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex items-center gap-5 px-10 rounded-[18px] text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 italic z-10 ${
              activeTab === item.id 
                ? 'bg-brand-primary text-white shadow-[0_10px_30px_rgba(0,173,232,0.3)] scale-[1.05]' 
                : 'text-zinc-600 hover:text-zinc-300'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">{item.icon}</svg>
            <span className="hidden md:block">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-10">
        
        {/* ── Binary Ingestion Perimeter (Dropzone) ── */}
        <div className="xl:col-span-4 space-y-8">
           <div
            className={`group relative w-full h-[480px] rounded-[56px] border-2 border-dashed flex flex-col items-center justify-center transition-all duration-1000 cursor-pointer overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.5)] ${
               dragOver 
                ? "border-brand-primary bg-brand-primary/10 scale-[1.02] shadow-[0_0_80px_rgba(0,173,232,0.2)]" 
                : "border-white/5 bg-black/40 hover:bg-black/60 hover:border-white/20"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,173,232,0.05),transparent_70%)]" />
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
            
            {uploading ? (
              <div className="relative z-10 flex flex-col items-center gap-8">
                <div className="relative">
                   <div className="w-24 h-24 rounded-full border-4 border-white/5 border-t-brand-primary animate-spin" />
                   <div className="absolute inset-0 flex items-center justify-center">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="text-brand-primary/40"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                   </div>
                </div>
                <div className="text-center space-y-2">
                   <span className="text-[11px] font-black uppercase tracking-[0.5em] text-brand-primary animate-pulse block">Sincronizando CDN</span>
                   <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest italic">Payload Transfer in Progress</span>
                </div>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col items-center gap-8 text-center px-12">
                <div className="w-20 h-20 rounded-[32px] bg-white/2 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-1000 shadow-2xl">
                   <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <div className="space-y-4">
                   <p className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">Ingestão de Binários</p>
                   <p className="text-[11px] font-black text-zinc-700 uppercase tracking-[0.4em] italic leading-tight">Arraste os artefatos para o perímetro orbital ou selecione via prompt local.</p>
                </div>
                <div className="h-14 px-10 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-4 group-hover:bg-white group-hover:text-black transition-all duration-500 italic">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                   Explorar Sistema
                </div>
              </div>
            )}
           </div>

           <div className="p-8 bg-brand-primary/5 border border-brand-primary/10 rounded-[40px] flex items-start gap-6 shadow-2xl radial-gradient-glass">
              <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:rotate-360 transition-transform duration-1000 shadow-2xl border border-brand-primary/20">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </div>
              <div className="space-y-2">
                 <h4 className="text-[11px] font-black text-white uppercase tracking-widest italic">Protocolo de Armazenagem</h4>
                 <p className="text-[10px] font-bold text-zinc-600 leading-relaxed italic">Ativos acima de 50MB serão processados via pipeline de compressão adaptativa Ness.Brain.</p>
              </div>
           </div>
        </div>

        {/* ── Global Resource Ledger ── */}
        <div className="xl:col-span-8 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[56px] radial-gradient-glass overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.6)] flex flex-col">
          <div className="p-12 border-b border-white/5 bg-white/2 flex items-center justify-between shrink-0">
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase leading-none">Resource Index</h3>
              <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] italic leading-none block">{activeTab === 'public' ? 'Arquivos Estáticos (CDN Endpoint)' : 'Memória Vetorizada Intelligence'}</span>
            </div>
            <div className="h-14 px-8 rounded-2xl bg-white/2 border border-white/5 flex items-center gap-6 shadow-2xl">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 italic">Filtragem Core:</span>
               <div className="flex items-center gap-3 bg-brand-primary/10 px-4 py-2 rounded-xl border border-brand-primary/20">
                  <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                  <span className="text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] italic">{activeTab === 'public' ? 'Images' : 'PDF/MD Hub'}</span>
               </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-10 opacity-30">
                 <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-brand-primary animate-spin" />
                 <div className="text-center space-y-3">
                    <span className="text-lg font-black text-white uppercase italic tracking-widest block">Analisando Blocos S3</span>
                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em] italic">Reconstruindo Ledger Binário...</span>
                 </div>
              </div>
            ) : items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 py-20">
                 <div className="w-32 h-32 rounded-[40px] border border-white/5 bg-white/2 flex items-center justify-center mb-10 shadow-inner">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                 </div>
                 <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic">Bucket Deserto</h4>
                 <p className="mt-4 text-[11px] font-black text-zinc-800 uppercase tracking-[0.4em] italic text-center max-w-xs">Inicie a alimentação do ecossistema Ness através do terminal de ingestão.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {filteredItems.map((item) => (
                  <div key={item.id} className="group relative bg-black/60 rounded-[48px] border border-white/5 overflow-hidden transition-all duration-1000 hover:scale-[1.05] hover:border-brand-primary/30 shadow-[0_40px_80px_rgba(0,0,0,0.4)] radial-gradient-glass">
                    <div className="aspect-square relative bg-black/60 overflow-hidden flex items-center justify-center group-hover:shadow-[inset_0_4px_40px_rgba(0,173,232,0.1)] transition-all duration-1000">
                      {isImage(item.content_type) ? (
                        <img src={item.url} alt={item.filename} loading="lazy" className="object-cover w-full h-full opacity-40 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-110" />
                      ) : (
                        <div className="text-zinc-800 group-hover:text-brand-primary transition-all duration-1000 flex flex-col items-center gap-6 group-hover:scale-110 group-hover:rotate-6">
                           <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                           <span className="text-[11px] font-black uppercase tracking-[0.4em] opacity-40 italic">.DOC NODE</span>
                        </div>
                      )}

                      {activeTab === 'knowledge' && (
                        <div className="absolute top-6 left-6 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-2xl flex items-center gap-3 shadow-[0_20px_40px_rgba(16,185,129,0.3)] z-10 border border-emerald-400/30 italic">
                          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                          INDEXED
                        </div>
                      )}

                      {/* ── Interaction Command Overlay ── */}
                      <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-700 backdrop-blur-md flex flex-col items-center justify-center gap-8 translate-y-10 group-hover:translate-y-0">
                         <div className="space-y-4 px-10 text-center">
                            <p className="text-[11px] font-black text-white uppercase tracking-[0.3em] italic line-clamp-1">{item.filename}</p>
                            <p className="text-[9px] font-mono font-black text-brand-primary uppercase tracking-widest">{formatSize(item.size)} // {item.content_type.split('/')[1]}</p>
                         </div>
                         <div className="flex gap-6">
                            <button 
                              onClick={(e) => { e.stopPropagation(); copyUrl(item.url); }}
                              className="w-16 h-16 rounded-[22px] bg-white/10 hover:bg-brand-primary text-white border border-white/10 flex items-center justify-center transition-all duration-500 shadow-2xl active:scale-90 group/btn-copy"
                              title="Clone CDN Asset Link"
                            >
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="group-hover/btn-copy:scale-110 transition-transform"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                              className="w-16 h-16 rounded-[22px] bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-500 hover:text-white flex items-center justify-center transition-all duration-500 shadow-2xl active:scale-90 group/btn-del"
                              title="Erraticate Permanently"
                            >
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="group-hover/btn-del:rotate-90 transition-transform"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                         </div>
                      </div>
                    </div>
                    
                    <div className="p-8 space-y-4 border-t border-white/5 bg-white/2 relative z-10">
                       <div className="flex justify-between items-center group-hover:translate-x-2 transition-transform duration-700">
                          <div className="font-mono text-[10px] font-black uppercase text-zinc-700 tracking-widest">{formatSize(item.size)}</div>
                          <div className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] italic bg-brand-primary/5 px-3 py-1 rounded-lg">{item.content_type.split('/')[1] || item.content_type}</div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-10 border-t border-white/5 bg-white/2 flex flex-col md:flex-row justify-between items-center gap-8 shrink-0">
              <button 
                className="inline-flex h-16 items-center justify-center rounded-[22px] border border-white/5 bg-white/5 px-12 text-[11px] font-black uppercase tracking-[0.4em] transition-all hover:bg-white hover:text-black shadow-2xl disabled:opacity-10 italic active:scale-95 group/prev"
                disabled={page <= 1} 
                onClick={() => setPage(page - 1)}
              >
                <svg className="mr-5 group-hover:-translate-x-2 transition-transform" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="m15 18-6-6 6-6"/></svg> Back Protocol
              </button>
              
              <div className="flex items-center gap-6 bg-black/40 px-8 py-4 rounded-[28px] border border-white/5 shadow-inner">
                 <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                 <span className="font-mono text-[12px] tracking-[0.5em] font-black text-zinc-500 uppercase italic">Ledger Vol. {page} / {meta?.totalPages || 1}</span>
              </div>

              <button 
                className="inline-flex h-16 items-center justify-center rounded-[22px] border border-white/5 bg-white/5 px-12 text-[11px] font-black uppercase tracking-[0.4em] transition-all hover:bg-brand-primary hover:text-white shadow-2xl disabled:opacity-10 italic active:scale-95 group/next"
                disabled={page >= (meta?.totalPages || 1)} 
                onClick={() => setPage(page + 1)}
              >
                Next Segment <svg className="ml-5 group-hover:translate-x-2 transition-transform" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="m9 18 6-6-6-6"/></svg>
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
