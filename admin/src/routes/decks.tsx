import { useState, useRef } from "react";
import { BRANDS } from "../components/decks/DeckDocument";
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
    <div className="max-w-[1750px] w-full px-10 md:px-12 py-10 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 overflow-hidden flex flex-col">
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start overflow-y-auto custom-scrollbar pr-2 h-full">
         {/* ── Asset Configuration Node ── */}
         <div className="xl:col-span-4 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[48px] radial-gradient-glass shadow-2xl p-10 space-y-10">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Asset Protocol</h2>
              <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic leading-none">Ness Central Intelligence Decks</span>
            </div>

            <div className="space-y-8">
                <div className="space-y-3">
                   <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] px-1 italic">Tenant / Marca Core</label>
                   <div className="relative group/sel">
                      <select 
                        value={brand} 
                        onChange={(e) => setBrand(e.target.value)} 
                        className="h-14 w-full bg-black/40 border border-white/5 rounded-2xl px-5 text-[10px] font-black uppercase tracking-[0.2em] italic text-zinc-600 focus:text-white focus:ring-2 focus:ring-brand-primary/40 outline-none transition-all cursor-pointer appearance-none shadow-2xl"
                      >
                        {Object.entries(BRANDS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
                      </select>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-800 pointer-events-none group-hover/sel:text-brand-primary transition-colors"><path d="m6 9 6 6 6-6"/></svg>
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] px-1 italic">Título do Artefato</label>
                   <input 
                     type="text" 
                     value={title} 
                     onChange={(e) => setTitle(e.target.value)} 
                     placeholder="Ex: Q3 MASTER STRATEGY DECK"
                     className="h-14 w-full bg-black/40 border border-white/5 rounded-2xl px-5 text-sm font-black text-white italic placeholder:text-zinc-800 focus:ring-2 focus:ring-brand-primary/40 outline-none transition-all tracking-tighter uppercase"
                   />
                </div>
            </div>
         </div>

         {/* ── Intelligence Extraction Node ── */}
         <div className="xl:col-span-8 space-y-12">
            <div
              className={`relative group h-[450px] rounded-[56px] border-2 border-dashed flex flex-col items-center justify-center p-20 transition-all duration-700 overflow-hidden radial-gradient-glass shadow-2xl active:scale-[0.99] cursor-pointer ${
                 dragOver ? "border-brand-primary bg-brand-primary/10 shadow-[0_0_100px_rgba(0,173,232,0.2)]" : "border-white/5 bg-black/40 hover:border-white/20"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
            >
              <div className="absolute -inset-40 bg-brand-primary/5 rounded-full blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              
              <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
              
              {uploading ? (
                <div className="flex flex-col items-center gap-10 relative z-10">
                   <div className="w-24 h-24 rounded-[40px] border-4 border-white/5 border-t-brand-primary animate-spin shadow-[0_0_50px_rgba(0,173,232,0.3)]" />
                   <div className="space-y-2 text-center">
                      <span className="block text-[11px] font-black uppercase tracking-[0.6em] text-white animate-pulse italic">Sincronizando PDF Buffer...</span>
                      <span className="block text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700 italic">V-SYNC PROTOCOL v4.2</span>
                   </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-8 relative z-10 text-center">
                   <div className="w-28 h-28 rounded-[40px] bg-white/2 border border-white/10 flex items-center justify-center text-zinc-700 group-hover:text-brand-primary group-hover:scale-110 transition-all duration-700 shadow-2xl group-hover:shadow-brand-primary/20">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase">Drop Asset Architecture</h3>
                      <p className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-700 group-hover:text-zinc-500 transition-colors italic">Somente PDF de Alta Fidelidade (600 DPI Ready)</p>
                   </div>
                </div>
              )}
            </div>

            {history.length > 0 && (
              <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[48px] radial-gradient-glass shadow-2xl overflow-hidden flex flex-col min-h-[400px]">
                 <div className="p-10 border-b border-white/5 bg-white/2 flex items-center justify-between">
                    <div className="flex flex-col">
                       <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Distribuição de Ativos</h2>
                       <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic mt-2 leading-none">Active Presentation Ledger</span>
                    </div>
                    <div className="h-12 px-6 rounded-2xl bg-white/2 border border-white/5 flex items-center gap-4 shadow-2xl">
                       <span className="text-xl font-black text-brand-primary font-mono italic">{history.length}</span>
                       <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] italic">Ativos Mapeados</span>
                    </div>
                 </div>

                 <div className="divide-y divide-white/5">
                   {history.map((h, i) => (
                     <div key={i} className="group p-10 hover:bg-white/2 transition-all duration-300 flex items-center justify-between gap-10">
                       <div className="flex items-center gap-8">
                          <div className="w-16 h-16 rounded-[28px] bg-white/2 border border-white/10 flex items-center justify-center text-brand-primary shadow-2xl group-hover:scale-110 transition-transform duration-700 group-hover:border-brand-primary/30">
                             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          </div>
                          <div className="flex flex-col gap-2">
                             <span className="text-lg font-black text-white italic tracking-tighter uppercase group-hover:text-brand-primary transition-colors">{h.title}</span>
                             <div className="flex gap-4 items-center">
                                <span className="inline-flex items-center h-7 px-4 rounded-xl border border-white/5 bg-white/2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] italic">
                                   NODE: {BRANDS[h.brand as keyof typeof BRANDS]?.name || h.brand}
                                </span>
                                <span className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.3em] font-mono italic">{h.date}</span>
                             </div>
                          </div>
                       </div>
                       
                       <button className="relative group h-14 px-10 rounded-2xl bg-white/2 border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.3em] italic hover:bg-white hover:text-black transition-all duration-700 overflow-hidden shadow-2xl active:scale-95 shrink-0">
                          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          <span className="relative z-10">Deploy Asset</span>
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
