import { useState, useRef } from "react";
import { BRANDS } from "../components/decks/brands";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export default function DecksPage() {
  const [brand, setBrand] = useState("ness");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<{ title: string; brand: string; date: string; filename: string }[]>([
    { title: "Proposta Corporativa", brand: "ness", date: "10 de outubro de 2026", filename: "proposal-corporativo-v1.pdf" }
  ]);

  const handleUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setTimeout(() => {
      setHistory(prev => [{ title: title || files[0].name, brand, date: new Date().toLocaleDateString("pt-BR", { year: "numeric", month: "long" }), filename: files[0].name }, ...prev]);
      setUploading(false);
      setTitle("");
    }, 1200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  return (
    <div className="max-w-[1750px] w-full px-6 md:px-10 py-8 space-y-8 overflow-hidden flex flex-col h-full bg-background">
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start overflow-y-auto custom-scrollbar h-full">
         {/* ── Asset Configuration Node ── */}
         <div className="xl:col-span-4 bg-card border border-border rounded-xl p-6 space-y-8">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white uppercase leading-none">Asset Protocol</h2>
              <span className="text-sm font-medium text-zinc-500 block">Ness Central Intelligence Decks</span>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-semibold text-zinc-400 uppercase">Tenant / Marca Core</label>
                   <div className="relative group/sel">
                      <select 
                        value={brand} 
                        onChange={(e) => setBrand(e.target.value)} 
                        className="h-12 w-full bg-background border border-border rounded-md px-4 text-sm font-semibold uppercase text-zinc-300 focus:text-white focus:border-border outline-none transition-colors cursor-pointer appearance-none"
                      >
                        {Object.entries(BRANDS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
                      </select>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none group-hover/sel:text-white transition-colors"><path d="m6 9 6 6 6-6"/></svg>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-semibold text-zinc-400 uppercase">Título do Artefato</label>
                   <input 
                     type="text" 
                     value={title} 
                     onChange={(e) => setTitle(e.target.value)} 
                     placeholder="Ex: Q3 MASTER STRATEGY DECK"
                     className="h-12 w-full bg-background border border-border rounded-md px-4 text-sm font-bold text-white placeholder:text-zinc-600 focus:border-border outline-none transition-colors uppercase"
                   />
                </div>
            </div>
         </div>

         {/* ── Intelligence Extraction Node ── */}
         <div className="xl:col-span-8 space-y-8">
            <div
              className={`relative group h-[320px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-12 transition-colors overflow-hidden cursor-pointer ${
                 dragOver ? "border-brand-primary bg-brand-primary/5" : "border-border bg-card hover:bg-muted hover:border-border"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
              
              {uploading ? (
                <div className="flex flex-col items-center gap-4 relative z-10">
                   <div className="w-12 h-12 rounded-full border-4 border-border border-t-brand-primary animate-spin" />
                   <div className="space-y-1 text-center">
                      <span className="block text-sm font-bold uppercase text-brand-primary">Processando Upload...</span>
                      <span className="block text-xs font-medium text-zinc-500">Sincronizando documento</span>
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 relative z-10 text-center">
                   <div className="w-16 h-16 rounded-xl bg-muted border border-border flex items-center justify-center text-zinc-400">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-xl font-bold text-white uppercase leading-none">Drop Asset Architecture</h3>
                      <p className="text-sm font-medium text-zinc-500">Somente PDF corporativo suportado</p>
                   </div>
                </div>
              )}
            </div>

            {history.length > 0 && (
              <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col min-h-[300px]">
                 <div className="p-6 border-b border-border bg-background flex items-center justify-between shrink-0">
                    <div className="flex flex-col space-y-1">
                       <h2 className="text-lg font-bold text-white uppercase leading-none">Distribuição de Ativos</h2>
                       <span className="text-xs font-semibold text-zinc-500 uppercase">Active Presentation Ledger</span>
                    </div>
                    <div className="h-10 px-4 rounded-md bg-muted flex items-center gap-2">
                       <span className="text-lg font-bold text-brand-primary">{history.length}</span>
                       <span className="text-xs font-semibold text-zinc-400 uppercase">Ativos</span>
                    </div>
                 </div>

                 <div className="divide-y divide-[#222222]">
                   {history.map((h, i) => (
                     <div key={i} className="group p-6 hover:bg-muted transition-colors flex items-center justify-between gap-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-muted border border-border flex items-center justify-center text-brand-primary">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          </div>
                          <div className="flex flex-col gap-1.5">
                             <span className="text-sm font-bold text-white uppercase group-hover:text-brand-primary transition-colors line-clamp-1">{h.title}</span>
                             <div className="flex gap-3 items-center">
                                <span className="inline-flex items-center h-6 px-2 rounded bg-muted text-xs font-bold text-zinc-400 uppercase">
                                   NODE: {BRANDS[h.brand as keyof typeof BRANDS]?.name || h.brand}
                                </span>
                                <span className="text-xs font-medium text-zinc-500 uppercase">{h.date}</span>
                             </div>
                          </div>
                       </div>
                       
                       <button className="h-10 px-6 rounded-md border border-border bg-muted text-white text-xs font-bold uppercase hover:bg-card hover:text-foreground transition-colors shrink-0">
                          Deploy Asset
                       </button>
                     </div>
                   ))}
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>

  );
}
