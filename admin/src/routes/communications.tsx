import React, { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import { TabGroup } from "../components/ui/Tabs";
import { EmptyState } from "../components/ui/EmptyState";

type Message = {
  type: string;
  id: number;
  title: string;
  data: string;
  source: string;
  status: string;
  created_at: string;
};

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; colorClass: string }> = {
  form: { 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    label: "Formulário", colorClass: "text-blue-500 bg-blue-500/10 border-blue-500/20" 
  },
  lead: { 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    label: "Lead", colorClass: "text-amber-500 bg-amber-500/10 border-amber-500/20" 
  },
  chat: { 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    label: "Chat", colorClass: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" 
  },
};

export default function CommunicationsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Message | null>(null);
  const [forwarding, setForwarding] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: "success" | "error"} | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetch("/api/admin/communications", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setMessages(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const handleForward = async (msg: Message) => {
    const email = prompt("Encaminhar para qual e-mail?");
    if (!email) return;
    setForwarding(true);
    try {
      const res = await fetch(`/api/admin/communications/forward`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messageId: msg.id, messageType: msg.type, to: email }),
      });
      const result = await res.json() as { success?: boolean; error?: string };
      if (result.success) showNotification("Mensagem encaminhada com sucesso!");
      else showNotification(`Erro: ${result.error}`, "error");
    } catch {
      showNotification("Erro de rede.", "error");
    } finally {
      setForwarding(false);
    }
  };

  const handleDelete = async (msg: Message) => {
    if (!confirm("Remover permanentemente este item?")) return;
    
    // As rotas originais usam o plural (forms, leads). Em communications, a type vem singular (form, lead, chat).
    const endpoint = `/api/admin/${msg.type}s/${msg.id}`; 
    try {
      await fetch(endpoint, { method: "DELETE", credentials: "include" });
      setMessages((prev) => prev.filter((m) => m.id !== msg.id || m.type !== msg.type));
      setSelected(null);
      showNotification("Item excluído permanentemente.");
    } catch {
      showNotification("Erro de rede ao deletar.", "error");
    }
  };

  const handleUpdateStatus = async (msg: Message, newStatus: string) => {
    const endpoint = `/api/admin/${msg.type}s/${msg.id}`; 
    try {
      await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      setMessages((prev) => prev.map((m) => (m.id === msg.id && m.type === msg.type) ? { ...m, status: newStatus } : m));
      if (selected?.id === msg.id && selected?.type === msg.type) {
         setSelected({ ...selected, status: newStatus });
      }
      showNotification("Status atualizado!");
    } catch {
      showNotification("Erro de rede ao atualizar status.", "error");
    }
  };

  const filtered = messages.filter((m) => {
    if (filter !== "all" && m.type !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (m.title || "").toLowerCase().includes(s) || (m.data || "").toLowerCase().includes(s);
    }
    return true;
  });

  const parseData = (data: string) => {
    try { return typeof data === "string" ? JSON.parse(data) : data; } catch { return { raw: data }; }
  };

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  }

  if (loading) {
    return <div className="flex justify-center p-16 animate-pulse"><div className="loader-inline" /></div>;
  }

  return (
    <div className="max-w-[1700px] w-full px-10 md:px-12 py-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 overflow-hidden h-full flex flex-col">
      <div className="flex flex-col lg:flex-row gap-10 items-stretch flex-1 min-h-0">
        
        {/* ── Dynamic Filter & List Column ── */}
        <div className="flex flex-col w-full lg:w-[450px] shrink-0 gap-8 min-h-0">
          <div className="space-y-6">
            <div className="flex p-1.5 bg-black/40 backdrop-blur-3xl rounded-2xl border border-white/5 radial-gradient-glass h-14 shadow-2xl relative overflow-hidden group">
              <div className="absolute -inset-10 bg-brand-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              {[
                { id: "all", label: "Inbox" },
                { id: "form", label: "Forms" },
                { id: "lead", label: "Leads" },
                { id: "chat", label: "Chat" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`flex-1 flex items-center justify-center rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic z-10 ${
                    filter === tab.id ? 'bg-brand-primary text-white shadow-2xl scale-[1.05]' : 'text-zinc-600 hover:text-zinc-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-brand-primary/10 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-brand-primary z-10" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="PROCURAR COMUNICAÇÕES..."
                className="flex h-14 w-full rounded-2xl border border-white/10 bg-black/40 pl-14 pr-6 text-[11px] font-black uppercase tracking-widest text-white italic placeholder:text-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 shadow-2xl transition-all relative z-10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[40px] overflow-hidden radial-gradient-glass custom-scrollbar relative shadow-2xl">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-12 opacity-20 group">
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-700">
                   <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Vault Vazio</span>
              </div>
            ) : (
               <div className="flex flex-col divide-y divide-white/5">
                {filtered.map((msg, i) => {
                  const cfg = TYPE_CONFIG[msg.type] || { icon: null, label: msg.type, colorClass: "text-zinc-500 bg-white/5 border-white/5" };
                  const isSelected = selected?.id === msg.id && selected?.type === msg.type;
                  return (
                    <button
                      key={`${msg.type}-${msg.id}-${i}`}
                      onClick={() => setSelected(msg)}
                      className={`text-left p-8 flex gap-6 items-start transition-all duration-500 relative group/item ${isSelected ? 'bg-white/5' : 'hover:bg-white/2'}`}
                    >
                      {isSelected && <div className="absolute left-0 top-8 bottom-8 w-1.5 bg-brand-primary rounded-r-full shadow-[0_0_20px_rgba(0,173,232,0.8)]" />}
                      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xl ${cfg.colorClass} opacity-80 group-hover/item:opacity-100 group-hover/item:scale-110 transition-all duration-500`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className={`font-black text-[14px] italic tracking-tight truncate uppercase ${isSelected ? 'text-white' : 'text-zinc-400 group-hover/item:text-zinc-200'}`}>
                           {msg.title || `Entry Protocol: ${msg.id}`}
                         </div>
                         <div className="flex items-center gap-2 mt-2 opacity-50">
                            <span className="text-[9px] font-black uppercase tracking-widest italic">{cfg.label}</span>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span className="text-[9px] font-black uppercase tracking-widest italic truncate">Node: {msg.source || "System"}</span>
                         </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 shrink-0">
                         <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">{msg.created_at ? timeAgo(msg.created_at) : "—"}</span>
                         {msg.status === "new" ? (
                           <span className="w-2.5 h-2.5 rounded-full bg-brand-primary shadow-[0_0_12px_rgba(0,173,232,1)] animate-pulse" />
                         ) : (
                           <span className="w-2 h-2 rounded-full bg-white/10" />
                         )}
                      </div>
                    </button>
                  );
                })}
               </div>
            )}
          </div>
        </div>

        {/* ── Detailed Context Pane ── */}
        <div className="flex-1 flex flex-col bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[48px] overflow-hidden radial-gradient-glass relative min-h-[500px] shadow-2xl">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-24 opacity-10 overflow-hidden relative group">
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,173,232,0.1),transparent_70%)] animate-pulse" />
               <div className="h-32 w-32 rounded-[40px] border border-white/10 bg-white/5 flex items-center justify-center mb-10 relative z-10 scale-150 group-hover:scale-[1.6] transition-transform duration-1000">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
               </div>
               <p className="text-[11px] font-black uppercase tracking-[0.5em] relative z-10 italic">Aguardando Ingestão de Dados</p>
            </div>
          ) : (() => {
            const cfg = TYPE_CONFIG[selected.type] || { icon: null, label: selected.type, colorClass: "text-zinc-500 bg-white/5 border-white/5" };
            const parsed = parseData(selected.data);
            return (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="p-10 border-b border-white/5 flex items-center gap-8 shrink-0 bg-white/2 relative overflow-hidden group">
                  <div className="absolute -inset-10 bg-brand-primary/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className={`w-16 h-16 rounded-[24px] border flex items-center justify-center shadow-2xl relative z-10 ${cfg.colorClass} group-hover:scale-105 transition-transform duration-700`}>
                    {cfg.icon && React.cloneElement(cfg.icon as React.ReactElement<any>, { width: 28, height: 28, strokeWidth: 3 })}
                  </div>
                  <div className="flex-1 min-w-0 relative z-10">
                     <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase">{cfg.label}</h3>
                        <span className={`inline-flex h-6 items-center rounded-xl px-4 text-[9px] font-black uppercase tracking-[0.2em] italic border transition-all ${
                          selected.status === "new" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "bg-white/5 text-zinc-600 border-white/10"
                        }`}>
                          {selected.status === "new" ? "LIVE ENTRY" : "AUDITED NODE"}
                        </span>
                     </div>
                     <div className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-4 italic">
                        <span className="text-zinc-400">{new Date(selected.created_at).toLocaleString('pt-BR')}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/40 shadow-[0_0_8px_rgba(0,173,232,0.4)]" />
                        <span>PROTOCOL SOURCE: <span className="text-brand-primary">{selected.source}</span></span>
                     </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
                   {/* Tactical Data Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 bg-white/2 border border-white/5 p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                      <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none" />
                      
                      {Object.entries(parsed).filter(([key]) => key !== 'message' && key !== 'raw').map(([key, value]) => (
                        <div key={key} className="space-y-2 group/field">
                          <span className="block text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] italic group-hover/field:text-brand-primary transition-colors">{key.replace(/_/g, ' ')}</span>
                          <span className={`block text-[15px] font-bold tracking-tight italic ${key === 'email' || key === 'phone' ? 'font-mono text-zinc-300' : 'text-white'}`}>
                            {String(value)}
                          </span>
                        </div>
                      ))}
                   </div>
                   
                   {parsed.message && (
                     <div className="space-y-6">
                       <span className="block text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] italic px-4">Intent Engine / Message Body</span>
                       <div className="bg-black/60 p-10 rounded-[40px] border border-white/5 text-[15px] font-bold italic tracking-tight whitespace-pre-wrap text-zinc-300 leading-relaxed shadow-inner backdrop-blur-3xl border-l-[3px] border-l-brand-primary/40">
                         {parsed.message}
                       </div>
                     </div>
                   )}

                   {parsed.raw && (
                     <div className="space-y-6">
                       <span className="block text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] italic px-4">Telemetry Stream (JSON)</span>
                       <div className="bg-black/80 p-8 rounded-3xl border border-white/5 text-[12px] font-mono whitespace-pre-wrap text-zinc-600 shadow-inner overflow-x-auto ring-1 ring-white/5">
                         {parsed.raw}
                       </div>
                     </div>
                   )}
                </div>

                {/* ── Contextual Action Toolbar ── */}
                <div className="p-8 border-t border-white/5 bg-white/2 flex gap-6 justify-end items-center shrink-0">
                  
                  {selected.type === "lead" && (
                    <div className="mr-auto">
                       <label className="block text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-2 ml-2 italic">LIFECYCLE STATUS</label>
                       <select
                         value={selected.status}
                         onChange={e => handleUpdateStatus(selected, e.target.value)}
                         className="h-12 w-[180px] bg-black/60 border border-white/10 rounded-2xl px-5 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer hover:bg-black/80 transition-all shadow-2xl italic appearance-none"
                       >
                         <option value="new">CORE: NOVO LEAD</option>
                         <option value="contacted">NODE: CONTATADO</option>
                         <option value="qualified">PROTOCOL: QUALIFICADO</option>
                         <option value="lost">VOID: PERDIDO</option>
                       </select>
                    </div>
                  )}

                  {selected.type === "form" && selected.status === "new" && (
                    <button 
                      className="mr-auto h-12 px-10 rounded-2xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-brand-primary/10 hover:border-brand-primary/20 transition-all shadow-2xl active:scale-95 italic"
                      onClick={() => handleUpdateStatus(selected, "read")} 
                    >
                      Audit Entry
                    </button>
                  )}

                  <button 
                    className="h-12 px-10 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all shadow-2xl active:scale-95 italic"
                    onClick={() => handleDelete(selected)} 
                  >
                    Purge Node
                  </button>

                  {selected.type !== "chat" && (
                    <button 
                      className="h-12 px-12 rounded-2xl bg-brand-primary text-white text-[11px] font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(0,173,232,0.4)] hover:shadow-[0_30px_60px_rgba(0,173,232,0.6)] hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50 italic"
                      onClick={() => handleForward(selected)} 
                      disabled={forwarding}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                      {forwarding ? "ORCHESTRATING..." : "EXECUTE FORWARD"}
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── Global Feedback Layer ── */}
      {notification && (
        <div className={`fixed bottom-12 right-12 px-8 py-5 rounded-[24px] shadow-[0_40px_80px_rgba(0,0,0,0.6)] border backdrop-blur-3xl animate-in slide-in-from-right duration-500 flex items-center gap-5 z-100 transition-all ${
          notification.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
            : "bg-red-500/10 border-red-500/30 text-red-400"
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-current opacity-10`} />
          <svg className="absolute left-10" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            {notification.type === "success" ? <path d="m5 12 5 5L20 7"/> : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}
          </svg>
          <span className="text-[12px] font-black uppercase tracking-[0.2em] italic">{notification.message}</span>
        </div>
      )}
    </div>
  );

}
