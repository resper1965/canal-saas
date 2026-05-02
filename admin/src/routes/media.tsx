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
    <div className="max-w-[1750px] w-full px-6 md:px-10 py-8 space-y-8 overflow-hidden flex flex-col h-full bg-background">
      
      {/* ── High-Fidelity Segmented Ecosystem Controls ── */}
      <div className="flex p-1 bg-card rounded-lg border border-border w-fit h-10 shrink-0">
        {[
          { id: 'public', label: 'Depósito Público', icon: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></> },
          { id: 'knowledge', label: 'Cérebro RAG / Memória', icon: <><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></> }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex items-center gap-2 px-4 rounded-md text-sm font-medium transition-colors z-10 ${
              activeTab === item.id 
                ? 'bg-muted text-white' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{item.icon}</svg>
            <span className="hidden md:block">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        
        {/* ── Binary Ingestion Perimeter (Dropzone) ── */}
        <div className="xl:col-span-4 space-y-6">
           <div
            className={`relative w-full h-[400px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors cursor-pointer overflow-hidden ${
               dragOver 
                ? "border-brand-primary bg-brand-primary/5" 
                : "border-border bg-card hover:bg-muted hover:border-border"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*,video/*,application/pdf"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
            
            {uploading ? (
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-border border-t-brand-primary animate-spin" />
                <div className="text-center space-y-1">
                   <span className="text-sm font-semibold text-brand-primary block">Fazendo Upload...</span>
                   <span className="text-xs font-medium text-zinc-500">Processando e enviando arquivos</span>
                </div>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
                <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center text-zinc-400">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <div className="space-y-1">
                   <p className="text-lg font-bold text-white leading-none">Upload de Arquivos</p>
                   <p className="text-sm text-zinc-500 leading-tight">Arraste os arquivos ou selecione.</p>
                </div>
                <div className="h-10 px-6 mt-4 rounded-md bg-muted hover:bg-muted text-sm font-medium text-white transition-colors flex items-center justify-center">
                   Explorar Computador
                </div>
              </div>
            )}
           </div>

           <div className="p-4 bg-card border border-border rounded-xl flex items-start gap-4">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-muted flex items-center justify-center text-zinc-400">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </div>
              <div className="space-y-1">
                 <h4 className="text-sm font-bold text-white">Armazenamento</h4>
                 <p className="text-xs text-zinc-500">Enviado diretamente ao repositório público (Cloudflare R2).</p>
              </div>
           </div>
        </div>

        {/* ── Global Resource Ledger ── */}
        <div className="xl:col-span-8 bg-background border border-border rounded-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border bg-card flex flex-wrap items-center justify-between gap-4 shrink-0">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white uppercase leading-none">Resource Index</h3>
              <span className="text-sm font-medium text-zinc-500 block">{activeTab === 'public' ? 'Arquivos Estáticos (CDN Endpoint)' : 'Memória Vetorizada Intelligence'}</span>
            </div>
            <div className="h-10 px-4 rounded-md bg-muted flex items-center gap-4">
               <span className="text-xs font-semibold uppercase text-zinc-400">Filtragem Core:</span>
               <div className="flex items-center gap-2 bg-brand-primary/10 px-2 py-1 rounded border border-brand-primary/20">
                  <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                  <span className="text-xs font-bold text-brand-primary uppercase">{activeTab === 'public' ? 'Images' : 'PDF/MD Hub'}</span>
               </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 opacity-50">
                 <div className="w-12 h-12 rounded-full border-4 border-border border-t-brand-primary animate-spin" />
                 <div className="text-center space-y-1">
                    <span className="text-sm font-bold text-white uppercase block">Carregando Media</span>
                    <span className="text-xs font-medium text-zinc-500">Recuperando catálogo do S3</span>
                 </div>
              </div>
            ) : items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-20">
                 <div className="w-20 h-20 rounded-xl border border-border bg-card flex items-center justify-center mb-6 text-zinc-600">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                 </div>
                 <h4 className="text-lg font-bold text-white uppercase">Nenhum Arquivo</h4>
                 <p className="mt-2 text-sm text-zinc-500 text-center max-w-sm">Faça o upload do primeiro arquivo para popular a biblioteca.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <div key={item.id} className="group relative bg-card rounded-xl border border-border overflow-hidden transition-all hover:border-brand-primary/50">
                    <div className="aspect-square relative bg-background overflow-hidden flex items-center justify-center">
                      {isImage(item.content_type) ? (
                        <img src={item.url} alt={item.filename} loading="lazy" className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity group-hover:scale-105 duration-500" />
                      ) : (
                        <div className="text-muted-foreground group-hover:text-brand-primary transition-colors flex flex-col items-center gap-4">
                           <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                           <span className="text-xs font-bold uppercase text-zinc-500">{item.content_type.split('/')[1] || "FILE"}</span>
                        </div>
                      )}

                      {activeTab === 'knowledge' && (
                        <div className="absolute top-4 left-4 bg-card text-emerald-500 text-xs font-bold uppercase px-2 py-1 rounded border border-emerald-500/20 flex items-center gap-2 z-10">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          INDEXED
                        </div>
                      )}

                      {/* ── Interaction Command Overlay ── */}
                      <div className="absolute inset-0 bg-background opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-6">
                         <div className="space-y-1 px-4 text-center">
                            <p className="text-sm font-bold text-white uppercase line-clamp-1">{item.filename}</p>
                            <p className="text-xs font-medium text-brand-primary">{formatSize(item.size)}</p>
                         </div>
                         <div className="flex gap-4">
                            <button 
                              onClick={(e) => { e.stopPropagation(); copyUrl(item.url); }}
                              className="w-10 h-10 rounded-md bg-muted hover:bg-brand-primary text-white border border-border flex items-center justify-center transition-colors"
                              title="Copiar URL"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                              className="w-10 h-10 rounded-md bg-muted hover:bg-red-500 text-red-500 hover:text-white border border-border flex items-center justify-center transition-colors"
                              title="Remover"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                         </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border-t border-border bg-card z-10 relative">
                       <div className="flex justify-between items-center text-xs text-zinc-500 font-medium">
                          <span>{formatSize(item.size)}</span>
                          <span className="uppercase">{item.content_type.split('/')[1] || item.content_type}</span>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 border-t border-border bg-card flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
              <button 
                className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-muted px-6 text-xs font-bold uppercase transition-colors hover:bg-white hover:text-black disabled:opacity-50 disabled:pointer-events-none"
                disabled={page <= 1} 
                onClick={() => setPage(page - 1)}
              >
                <svg className="mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg> Anterior
              </button>
              
              <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-md">
                 <span className="text-xs font-semibold text-zinc-400 uppercase">Página {page} de {meta?.totalPages || 1}</span>
              </div>

              <button 
                className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-muted px-6 text-xs font-bold uppercase transition-colors hover:bg-white hover:text-black disabled:opacity-50 disabled:pointer-events-none"
                disabled={page >= (meta?.totalPages || 1)} 
                onClick={() => setPage(page + 1)}
              >
                Próxima <svg className="ml-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
