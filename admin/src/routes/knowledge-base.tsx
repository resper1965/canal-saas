import { useState, useEffect } from "react";
import { authClient } from "../lib/auth-client";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";

type Document = {
  id: string;
  title: string;
  status: 'pending' | 'indexed' | 'error';
  chunk_count: number;
  created_at: string;
};

export default function KnowledgeBasePage() {
  const { data: activeOrg } = authClient.useActiveOrganization();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetch("/api/admin/knowledge-base", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setDocs(data as Document[]);
      })
      .finally(() => setLoading(false));
  }, [activeOrg?.id, refreshKey]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !rawText) return;
    setUploading(true);

    try {
      await fetch("/api/admin/knowledge-base", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, text_payload: rawText }),
      });
      setTitle('');
      setRawText('');
      setRefreshKey(k => k + 1); // trigger list refresh
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este documento da base de inteligência? (Os vetores podem demorar até 1h para sumirem completamente em cache)")) return;
    try {
      await fetch(`/api/admin/knowledge-base/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setRefreshKey(k => k + 1);
    } catch(e) {
       console.error(e)
    }
  };

  if (loading) {
    return <div className="flex justify-center p-16"><div className="loader-inline" /></div>;
  }

  const indexedCount = docs.filter(d => d.status === 'indexed').length;
  const pendingCount = docs.filter(d => d.status === 'pending').length;
  const chunkCount = docs.reduce((acc, d) => acc + (d.chunk_count || 0), 0);

  return (
    <div className="max-w-[1750px] w-full px-10 md:px-12 py-10 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 overflow-hidden flex flex-col">
      
      {/* ── RAG Infrastructure Telemetry ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: "Documentos Indexados", value: indexedCount, icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>, color: "text-emerald-500", glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]" },
          { label: "Memória Vetorial (Chunks)", value: chunkCount, icon: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>, color: "text-brand-primary", glow: "shadow-[0_0_20px_rgba(0,173,232,0.2)]" },
          { label: "Pipeline de Sincronia", value: pendingCount, icon: <><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></>, color: "text-amber-500", glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)]" }
        ].map((kpi, i) => (
          <div key={i} className="group relative">
             <div className="absolute -inset-1 bg-white/5 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
             <div className={`relative p-10 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[40px] radial-gradient-glass shadow-2xl overflow-hidden h-full flex flex-col justify-between ${kpi.glow}`}>
                <div className="flex justify-between items-start">
                   <div className={`w-14 h-14 rounded-2xl bg-white/2 border border-white/10 flex items-center justify-center ${kpi.color} group-hover:scale-110 transition-transform duration-700`}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">{kpi.icon}</svg>
                   </div>
                   <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] font-mono">Vectorize.v4</span>
                </div>
                <div className="mt-8 space-y-2">
                   <span className="block text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 italic">{kpi.label}</span>
                   <span className="block text-5xl font-black tracking-tighter text-white italic">{kpi.value}</span>
                </div>
                <div className="absolute -right-6 -bottom-6 w-40 h-40 bg-white/1 rounded-full blur-[80px] group-hover:bg-brand-primary/5 transition-colors pointer-events-none" />
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start flex-1 min-h-0">
        
        {/* ── Ingestion Form ── */}
        <div className="xl:col-span-4 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[48px] radial-gradient-glass shadow-2xl overflow-hidden p-10 space-y-10">
             <div className="space-y-2">
               <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">RAG Ingestion</h2>
               <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic leading-none">Alimentação Contextual de Longo Prazo</span>
             </div>

             <form onSubmit={handleUpload} className="space-y-8">
                <div className="space-y-3">
                   <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] px-1 italic">Título do Documento</label>
                   <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Blueprint Operacional 2026"
                    className="h-12 w-full bg-black/40 border border-white/5 rounded-2xl px-5 text-sm font-black text-white italic placeholder:text-zinc-800 focus:ring-2 focus:ring-brand-primary/40 outline-none transition-all uppercase tracking-tighter"
                    required
                  />
                </div>

                <div className="space-y-3">
                   <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] px-1 italic flex justify-between">
                      <span>Payload (Raw Content)</span>
                      <span className="text-brand-primary italic opacity-60">Llama-3.1 Ready</span>
                   </label>
                   <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    rows={12}
                    placeholder="Cole aqui as transcrições, políticas ou documentação técnica..."
                    className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-[13px] font-bold italic font-mono text-zinc-400 placeholder:text-zinc-800 focus:ring-2 focus:ring-brand-primary/40 outline-none resize-none leading-relaxed transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="relative group w-full h-14 rounded-2xl bg-brand-primary text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(0,173,232,0.4)] hover:scale-[1.05] active:scale-95 transition-all overflow-hidden disabled:opacity-50 italic"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  {uploading ? "Indexando Vetores..." : "Alimentar Inteligência Pro-Max"}
                </button>
             </form>
        </div>

        {/* ── Corporate Memory List ── */}
        <div className="xl:col-span-8 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[48px] radial-gradient-glass overflow-hidden shadow-2xl flex flex-col h-fit min-h-[600px]">
           <div className="p-10 border-b border-white/5 bg-white/2 flex items-center justify-between shrink-0">
             <div className="flex flex-col">
               <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Memória Corporativa</h2>
               <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic leading-none">Active Knowledge Nodes Database</span>
             </div>
             <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic">
                <span className="flex items-center gap-3"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-2xl shadow-emerald-500/50" /> Live</span>
                <span className="flex items-center gap-3"><span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse shadow-2xl shadow-brand-primary/50" /> Protocol Sync</span>
             </div>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[800px]">
             {docs.length === 0 ? (
               <div className="p-32 text-center opacity-20 flex flex-col items-center group">
                  <div className="w-24 h-24 rounded-[40px] bg-white/2 border border-white/5 mb-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-1000 shadow-2xl">
                     <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-zinc-600 italic">Cérebro Desconectado</h4>
                  <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-zinc-800 italic max-w-[400px] leading-loose">Indexe o primeiro nó de conhecimento para mapear vetores RAG.</p>
               </div>
             ) : (
               <div className="divide-y divide-white/5">
                 {docs.map(doc => (
                   <div key={doc.id} className="p-8 hover:bg-white/2 transition-all flex items-center justify-between group relative overflow-hidden">
                     <div className="flex gap-8 items-center flex-1">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border relative z-10 transition-transform group-hover:scale-110 ${
                          doc.status === 'indexed' ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10 shadow-2xl shadow-emerald-500/10' :
                          doc.status === 'pending' ? 'bg-brand-primary/5 text-brand-primary border-brand-primary/10' :
                          'bg-red-500/5 text-red-500 border-red-500/10 shadow-2xl shadow-red-500/10'
                        }`}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            {doc.status === 'indexed' ? <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></> :
                             doc.status === 'pending' ? <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" className="animate-spin origin-center"/> :
                             <line x1="18" y1="6" x2="6" y2="18"/>}
                          </svg>
                        </div>
                        <div className="flex flex-col gap-2">
                           <h4 className="text-base font-black text-white italic tracking-tighter uppercase group-hover:text-brand-primary transition-colors">{doc.title}</h4>
                           <div className="flex items-center gap-4">
                              <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] italic">{new Date(doc.created_at).toLocaleDateString('pt-BR')}</span>
                              <span className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                              <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] italic">{doc.chunk_count} VETORES</span>
                              {doc.status === 'pending' && <span className="text-[9px] px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary font-black uppercase tracking-[0.4em] animate-pulse italic">Index Protocol</span>}
                              {doc.status === 'error' && <span className="text-[9px] px-3 py-1 rounded-full bg-red-500/10 text-red-500 font-black uppercase tracking-[0.4em] italic">Edge Fault</span>}
                           </div>
                        </div>
                     </div>

                     <button
                       onClick={() => handleDelete(doc.id)}
                       className="opacity-0 group-hover:opacity-100 transition-all h-12 w-12 flex items-center justify-center text-zinc-700 hover:text-red-500 hover:bg-red-500/5 rounded-2xl border border-transparent hover:border-red-500/20 active:scale-95"
                       title="Remover Nó de Memória"
                     >
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                     </button>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>


  );
}
