import React, { useState, useEffect } from "react";

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
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    label: "Formulário", colorClass: "text-blue-500 bg-blue-500/10 border-blue-500/20" 
  },
  lead: { 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    label: "Lead", colorClass: "text-amber-500 bg-amber-500/10 border-amber-500/20" 
  },
  chat: { 
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
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
    const endpoint = `/api/admin/${msg.type}s/${msg.id}`; 
    try {
      await fetch(endpoint, { method: "DELETE", credentials: "include" });
      setMessages((prev) => prev.filter((m) => m.id !== msg.id || m.type !== msg.type));
      setSelected(null);
      showNotification("Item excluído.");
    } catch {
      showNotification("Erro ao deletar.", "error");
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
      showNotification("Erro ao atualizar.", "error");
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
    return <div className="flex justify-center p-16"><div className="w-8 h-8 border-2 border-border border-t-brand-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="max-w-7xl w-full px-6 py-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col mx-auto">
      <div className="flex flex-col lg:flex-row gap-4 items-stretch flex-1 min-h-0">
        
        {/* List Column */}
        <div className="flex flex-col w-full lg:w-[380px] shrink-0 gap-4 min-h-0">
          <div className="space-y-3">
            {/* Tabs */}
            <div className="flex gap-1 bg-card border border-border rounded-lg p-1 h-10">
              {[
                { id: "all", label: "Inbox" },
                { id: "form", label: "Forms" },
                { id: "lead", label: "Leads" },
                { id: "chat", label: "Chat" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`flex-1 flex items-center justify-center rounded-md text-xs font-semibold transition-colors ${
                    filter === tab.id ? 'bg-brand-primary text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full h-10 rounded-lg border border-border bg-card pl-9 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-border transition-colors"
              />
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto bg-card border border-border rounded-xl custom-scrollbar">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-700 mb-3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                 <span className="text-xs text-zinc-600">Nenhuma mensagem</span>
              </div>
            ) : (
               <div className="flex flex-col divide-y divide-[#222222]">
                {filtered.map((msg, i) => {
                  const cfg = TYPE_CONFIG[msg.type] || { icon: null, label: msg.type, colorClass: "text-zinc-500 bg-muted/50 border-border" };
                  const isSelected = selected?.id === msg.id && selected?.type === msg.type;
                  return (
                    <button
                      key={`${msg.type}-${msg.id}-${i}`}
                      onClick={() => setSelected(msg)}
                      className={`text-left px-4 py-3 flex gap-3 items-start transition-colors relative ${isSelected ? 'bg-muted' : 'hover:bg-muted/50'}`}
                    >
                      {isSelected && <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-brand-primary rounded-r-full" />}
                      <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${cfg.colorClass}`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className={`text-sm font-medium truncate ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                           {msg.title || `#${msg.id}`}
                         </div>
                         <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs text-zinc-600">{cfg.label}</span>
                            <span className="text-zinc-700">·</span>
                            <span className="text-xs text-zinc-600 truncate">{msg.source || "Sistema"}</span>
                         </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                         <span className="text-xs text-zinc-600">{msg.created_at ? timeAgo(msg.created_at) : "—"}</span>
                         {msg.status === "new" && (
                           <span className="w-2 h-2 rounded-full bg-brand-primary" />
                         )}
                      </div>
                    </button>
                  );
                })}
               </div>
            )}
          </div>
        </div>

        {/* Detail Pane */}
        <div className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden min-h-[400px]">
          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-700 mb-4"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
               <p className="text-sm text-zinc-600">Selecione uma mensagem</p>
            </div>
          ) : (() => {
            const cfg = TYPE_CONFIG[selected.type] || { icon: null, label: selected.type, colorClass: "text-zinc-500 bg-muted/50 border-border" };
            const parsed = parseData(selected.data);
            return (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex items-center gap-4 shrink-0 bg-background">
                  <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${cfg.colorClass}`}>
                    {cfg.icon && React.cloneElement(cfg.icon as React.ReactElement<any>, { width: 20, height: 20 })}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-white">{selected.title || cfg.label}</h3>
                        <span className={`inline-flex h-5 items-center rounded-md px-2 text-xs font-medium border ${
                          selected.status === "new" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted text-zinc-500 border-border"
                        }`}>
                          {selected.status === "new" ? "Novo" : "Lido"}
                        </span>
                     </div>
                     <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-2">
                        <span>{new Date(selected.created_at).toLocaleString('pt-BR')}</span>
                        <span className="text-zinc-700">·</span>
                        <span>Origem: <span className="text-brand-primary">{selected.source}</span></span>
                     </div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                   {/* Data Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background border border-border p-5 rounded-lg">
                      {Object.entries(parsed).filter(([key]) => key !== 'message' && key !== 'raw').map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <span className="text-xs font-semibold text-zinc-500 uppercase">{key.replace(/_/g, ' ')}</span>
                          <span className={`block text-sm ${key === 'email' || key === 'phone' ? 'font-mono text-zinc-300' : 'text-white'}`}>
                            {String(value)}
                          </span>
                        </div>
                      ))}
                   </div>
                   
                   {parsed.message && (
                     <div className="space-y-2">
                       <span className="text-xs font-semibold text-zinc-500 uppercase">Mensagem</span>
                       <div className="bg-background p-5 rounded-lg border border-border text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed border-l-2 border-l-brand-primary/40">
                         {parsed.message}
                       </div>
                     </div>
                   )}

                   {parsed.raw && (
                     <div className="space-y-2">
                       <span className="text-xs font-semibold text-zinc-500 uppercase">Dados brutos</span>
                       <div className="bg-background p-4 rounded-lg border border-border text-xs font-mono text-zinc-500 whitespace-pre-wrap overflow-x-auto">
                         {parsed.raw}
                       </div>
                     </div>
                   )}
                </div>

                {/* Action Bar */}
                <div className="px-6 py-3 border-t border-border bg-background flex gap-3 justify-end items-center shrink-0">
                  
                  {selected.type === "lead" && (
                    <div className="mr-auto">
                       <select
                         value={selected.status}
                         onChange={e => handleUpdateStatus(selected, e.target.value)}
                         className="h-9 bg-card border border-border rounded-md px-3 text-xs font-medium text-white outline-none focus:border-border cursor-pointer appearance-none"
                       >
                         <option value="new">Novo</option>
                         <option value="contacted">Contatado</option>
                         <option value="qualified">Qualificado</option>
                         <option value="lost">Perdido</option>
                       </select>
                    </div>
                  )}

                  {selected.type === "form" && selected.status === "new" && (
                    <button 
                      className="mr-auto h-9 px-4 rounded-md border border-border text-xs font-semibold text-white hover:bg-muted transition-colors"
                      onClick={() => handleUpdateStatus(selected, "read")} 
                    >
                      Marcar como lido
                    </button>
                  )}

                  <button 
                    className="h-9 px-4 rounded-md border border-red-500/20 text-red-500 text-xs font-semibold hover:bg-red-500/10 transition-colors"
                    onClick={() => handleDelete(selected)} 
                  >
                    Excluir
                  </button>

                  {selected.type !== "chat" && (
                    <button 
                      className="h-9 px-5 rounded-md bg-brand-primary text-white text-xs font-semibold hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-50"
                      onClick={() => handleForward(selected)} 
                      disabled={forwarding}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                      {forwarding ? "Enviando..." : "Encaminhar"}
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-6 right-6 px-5 py-3 rounded-lg border shadow-lg animate-in slide-in-from-right duration-300 flex items-center gap-3 z-100 ${
          notification.type === "success" 
            ? "bg-card border-emerald-500/30 text-emerald-400" 
            : "bg-card border-red-500/30 text-red-400"
        }`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {notification.type === "success" ? <path d="m5 12 5 5L20 7"/> : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}
          </svg>
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}
    </div>
  );
}
