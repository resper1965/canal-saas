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
       // error handled by empty state
    }
  };

  if (loading) {
    return <div className="flex justify-center p-16"><div className="loader-inline" /></div>;
  }

  const indexedCount = docs.filter(d => d.status === 'indexed').length;
  const pendingCount = docs.filter(d => d.status === 'pending').length;
  const chunkCount = docs.reduce((acc, d) => acc + (d.chunk_count || 0), 0);

  return (
    <div className="max-w-[1750px] w-full px-6 md:px-10 py-8 space-y-8 overflow-hidden flex flex-col bg-background">
      
      {/* ── RAG Infrastructure Telemetry ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Documentos Indexados", value: indexedCount, icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Memória Vetorial (Chunks)", value: chunkCount, icon: <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></>, color: "text-brand-primary", bg: "bg-brand-primary/10" },
          { label: "Pipeline de Sincronia", value: pendingCount, icon: <><path d="M12 2v4"/><path d="M12 18v4"/><path d="M4.93 4.93l2.83 2.83"/><path d="M16.24 16.24l2.83 2.83"/><path d="M2 12h4"/><path d="M18 12h4"/><path d="M4.93 19.07l2.83-2.83"/><path d="M16.24 7.76l2.83-2.83"/></>, color: "text-amber-500", bg: "bg-amber-500/10" }
        ].map((kpi, i) => (
          <div key={i} className="relative p-6 bg-card border border-border rounded-xl overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{kpi.icon}</svg>
               </div>
               <span className="text-xs font-semibold text-zinc-500 uppercase">Vectorize.v4</span>
            </div>
            <div className="mt-6 space-y-1">
               <span className="block text-sm font-semibold uppercase text-zinc-400">{kpi.label}</span>
               <span className="block text-3xl font-bold text-white">{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start flex-1 min-h-0">
        
        {/* ── Ingestion Form ── */}
        <div className="xl:col-span-4 bg-card border border-border rounded-xl overflow-hidden p-6 space-y-8">
             <div className="space-y-1">
               <h2 className="text-xl font-bold text-white uppercase leading-none">RAG Ingestion</h2>
               <span className="text-sm font-medium text-zinc-500 block">Alimentação Contextual de Longo Prazo</span>
             </div>

             <form onSubmit={handleUpload} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-xs font-semibold text-zinc-400 uppercase">Título do Documento</label>
                   <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Blueprint Operacional 2026"
                    className="h-12 w-full bg-background border border-border rounded-md px-4 text-sm font-bold text-white placeholder:text-zinc-600 focus:border-brand-primary outline-none transition-colors uppercase"
                    required
                  />
                </div>

                <div className="space-y-2">
                   <label className="text-xs font-semibold text-zinc-400 uppercase flex justify-between">
                      <span>Payload (Raw Content)</span>
                      <span className="text-brand-primary">Llama-3.1 Ready</span>
                   </label>
                   <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    rows={12}
                    placeholder="Cole aqui as transcrições, políticas ou documentação técnica..."
                    className="w-full bg-background border border-border rounded-md p-4 text-sm font-medium font-mono text-zinc-300 placeholder:text-zinc-600 focus:border-brand-primary outline-none resize-none transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full h-12 rounded-md bg-muted hover:bg-brand-primary text-white text-sm font-bold uppercase transition-colors disabled:opacity-50"
                >
                  {uploading ? "Indexando Vetores..." : "Alimentar Inteligência Pro-Max"}
                </button>
             </form>
        </div>

        {/* ── Corporate Memory List ── */}
        <div className="xl:col-span-8 bg-card border border-border rounded-xl overflow-hidden flex flex-col h-fit min-h-[600px]">
           <div className="p-6 border-b border-border bg-background flex items-center justify-between shrink-0">
             <div className="flex flex-col space-y-1">
               <h2 className="text-lg font-bold text-white uppercase leading-none">Memória Corporativa</h2>
               <span className="text-xs font-semibold text-zinc-500 uppercase">Active Knowledge Nodes Database</span>
             </div>
             <div className="flex items-center gap-4 text-xs font-bold uppercase text-zinc-500">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Live</span>
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" /> Protocol Sync</span>
             </div>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[800px]">
             {docs.length === 0 ? (
               <div className="p-20 text-center flex flex-col items-center">
                  <div className="w-20 h-20 rounded-xl bg-muted border border-border mb-6 flex items-center justify-center text-zinc-600">
                     <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <h4 className="text-sm font-bold uppercase text-white">Cérebro Desconectado</h4>
                  <p className="mt-2 text-xs font-medium text-zinc-500 max-w-sm">Indexe o primeiro nó de conhecimento para mapear vetores RAG.</p>
               </div>
             ) : (
               <div className="divide-y divide-[#222222]">
                 {docs.map(doc => (
                   <div key={doc.id} className="p-6 hover:bg-muted transition-colors flex items-center justify-between group">
                     <div className="flex gap-6 items-center flex-1">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border ${
                          doc.status === 'indexed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                          doc.status === 'pending' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' :
                          'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            {doc.status === 'indexed' ? <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></> :
                             doc.status === 'pending' ? <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" className="animate-spin origin-center"/> :
                             <line x1="18" y1="6" x2="6" y2="18"/>}
                          </svg>
                        </div>
                        <div className="flex flex-col gap-1.5">
                           <h4 className="text-sm font-bold text-white uppercase group-hover:text-brand-primary transition-colors">{doc.title}</h4>
                           <div className="flex items-center gap-3">
                              <span className="text-xs font-semibold text-zinc-500 uppercase">{new Date(doc.created_at).toLocaleDateString('pt-BR')}</span>
                              <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                              <span className="text-xs font-bold text-brand-primary uppercase">{doc.chunk_count} VETORES</span>
                              {doc.status === 'pending' && <span className="text-xs px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary font-bold uppercase animate-pulse">Index Protocol</span>}
                              {doc.status === 'error' && <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-500 font-bold uppercase">Edge Fault</span>}
                           </div>
                        </div>
                     </div>

                     <button
                       onClick={() => handleDelete(doc.id)}
                       className="h-10 w-10 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-red-500 rounded-md transition-colors shrink-0"
                       title="Remover Nó de Memória"
                     >
                       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
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
