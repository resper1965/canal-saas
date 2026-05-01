import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/Table";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";


type Subscriber = { id: number; email: string; created_at: string };

type Draft = {
  subject: string;
  preheader: string;
  audience: string;
  body: string;
};

const EMPTY_DRAFT: Draft = { subject: "", preheader: "", audience: "todos", body: "" };

const AUDIENCES = ["todos", "clientes", "prospects", "parceiros", "interno"];

export default function NewslettersPage() {
  const [draft, setDraft] = useState<Draft>({ ...EMPTY_DRAFT });
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<{ subject: string; count: number; date: string }[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [tab, setTab] = useState<"compose" | "subscribers">("compose");

  useEffect(() => {
    fetch("/api/admin/newsletter-subscribers", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setSubscribers(Array.isArray(data) ? data : []))
      .catch(() => setSubscribers([]));
  }, []);

  const handleSend = async () => {
    if (!draft.subject || !draft.body) {
      alert("Preencha o assunto e o corpo do e-mail.");
      return;
    }
    if (subscribers.length === 0) {
      alert("Nenhum assinante cadastrado. Adicione pelo menos um.");
      return;
    }
    if (!confirm(`Enviar "${draft.subject}" para ${subscribers.length} assinante(s)?`)) return;
    
    setSending(true);
    try {
      const res = await fetch("/api/admin/newsletters/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(draft),
      });
      const result = await res.json() as { success?: boolean; sent?: number; error?: string };
      if (result.success) {
        setSent((prev) => [
          { subject: draft.subject, count: result.sent || subscribers.length, date: new Date().toLocaleString("pt-BR") },
          ...prev,
        ]);
        setDraft({ ...EMPTY_DRAFT });
        alert(`Newsletter enviada com sucesso para ${result.sent || subscribers.length} destinatário(s)!`);
      } else {
        alert(`Erro: ${result.error || "Falha no envio"}`);
      }
    } catch {
      alert("Erro de rede ao enviar.");
    } finally {
      setSending(false);
    }
  };

  const handleAddSubscriber = async () => {
    if (!newEmail || !newEmail.includes("@")) return;
    try {
      const res = await fetch("/api/admin/newsletter-subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: newEmail }),
      });
      const result = await res.json() as { success?: boolean; id?: number };
      if (result.success) {
        setSubscribers((prev) => [{ id: result.id || Date.now(), email: newEmail, created_at: new Date().toISOString() }, ...prev]);
        setNewEmail("");
      }
    } catch { /* */ }
  };

  const handleRemoveSubscriber = async (id: number) => {
    if (!confirm("Remover este assinante permanente?")) return;
    await fetch(`/api/admin/newsletter-subscribers/${id}`, { method: "DELETE", credentials: "include" });
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
  };

  const renderEmailPreview = () => {
    return `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:16px;overflow:hidden;box-shadow:0 10px 40px -10px rgba(0,0,0,0.1);">
        <div style="background:#0A0A0A;padding:32px 40px;display:flex;align-items:center;">
          <span style="font-family:Montserrat,sans-serif;font-size:24px;font-weight:900;color:#fff;letter-spacing:-0.5px;">ness<span style="color:#00ADE8;">.</span></span>
        </div>
        <div style="padding:48px 40px;">
          <h1 style="font-size:24px;color:#0f172a;margin:0 0 8px;font-weight:800;letter-spacing:-0.03em;">${draft.subject || "Assunto do e-mail"}</h1>
          <p style="font-size:14px;color:#64748b;margin:0 0 32px;font-weight:500;">${draft.preheader || ""}</p>
          <div style="font-size:15px;line-height:1.8;color:#334155;white-space:pre-wrap;">${draft.body || "Escreva algo impactante..."}</div>
        </div>
        <div style="background:#f8fafc;padding:32px 40px;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="font-size:11px;color:#94a3b8;margin:0;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;">ness. · canal.ness.com.br · Você optou por receber esta newsletter.</p>
        </div>
      </div>
    `;
  };

  return (
    <div className="max-w-[1750px] w-full px-10 md:px-16 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 overflow-hidden flex flex-col h-full">
      
      {/* ── Transmission Segmented Hub ── */}
        <div className="flex p-1.5 bg-black/40 backdrop-blur-3xl rounded-2xl border border-white/5 radial-gradient-glass w-fit h-14 shrink-0 shadow-2xl relative overflow-hidden group">
          <div className="absolute -inset-10 bg-brand-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        {[
          { id: 'compose', label: 'Composição Engine', icon: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M21 15V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v10"/></> },
          { id: 'subscribers', label: `CRM Assinantes (${subscribers.length})`, icon: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></> }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as any)}
            className={`flex items-center gap-5 px-10 rounded-[18px] text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-700 italic z-10 ${
              tab === item.id 
                ? 'bg-brand-primary text-white shadow-[0_10px_30px_rgba(0,173,232,0.3)] scale-[1.05]' 
                : 'text-zinc-600 hover:text-zinc-300'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">{item.icon}</svg>
            <span className="hidden md:block">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 pb-10">
        {tab === "compose" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
            <div className="xl:col-span-12 2xl:col-span-8 space-y-12">
              <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[56px] radial-gradient-glass shadow-[0_60px_120px_rgba(0,0,0,0.5)] p-12 space-y-12 relative group/form overflow-hidden">
                <div className="absolute -inset-32 bg-brand-primary/5 rounded-full blur-[100px] opacity-0 group-hover/form:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                  <div className="space-y-2">
                    <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Nova Campanha</h2>
                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] italic leading-none">Ness.Brain Transmission Protocol v5.1</span>
                  </div>
                  <div className="flex gap-6 h-16">
                    <button 
                      onClick={() => setShowPreview((v) => !v)}
                      className="h-full px-8 rounded-[20px] bg-white/2 border border-white/5 hover:bg-white/5 hover:border-white/20 text-white text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl italic active:scale-95 group/btn-render"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="inline mr-4 group-hover/btn-render:rotate-12 transition-transform"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      {showPreview ? "Recolher Editor" : "Renderizar HTML"}
                    </button>
                    <button 
                      className="h-full px-12 rounded-[20px] bg-brand-primary text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(0,173,232,0.4)] hover:scale-[1.05] active:scale-95 transition-all overflow-hidden disabled:opacity-50 italic group/btn-fire" 
                      onClick={handleSend} 
                      disabled={sending}
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn-fire:translate-x-full transition-transform duration-1000" />
                      {sending ? "Transmitindo Payload..." : `Atirar p/ ${subscribers.length} Nodes`}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] px-2 italic">Assunto do E-mail</label>
                    <input
                      type="text"
                      className="h-16 w-full rounded-[24px] bg-black/60 border border-white/5 px-8 text-sm font-black text-white italic placeholder:text-zinc-800 focus:ring-4 focus:ring-brand-primary/20 outline-none transition-all tracking-tight uppercase"
                      value={draft.subject}
                      onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                      placeholder="Ex: Insight Letter nº 42"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] px-2 italic">Cluster de Audiência</label>
                    <div className="relative group/sel">
                      <select
                        value={draft.audience}
                        onChange={(e) => setDraft({ ...draft, audience: e.target.value })}
                        className="h-16 w-full rounded-[24px] bg-black/60 border border-white/5 px-8 text-[11px] font-black text-zinc-400 uppercase tracking-[0.3em] italic outline-none focus:ring-4 focus:ring-brand-primary/20 appearance-none transition-all"
                      >
                        {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-800 pointer-events-none group-hover/sel:text-brand-primary transition-colors"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 relative z-10">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] px-2 italic">Pré-header (Inbound Visibility)</label>
                  <input
                    type="text"
                    className="h-16 w-full rounded-[24px] bg-black/60 border border-white/5 px-8 text-sm font-black text-white italic placeholder:text-zinc-800 focus:ring-4 focus:ring-brand-primary/20 outline-none transition-all tracking-tight uppercase"
                    value={draft.preheader}
                    onChange={(e) => setDraft({ ...draft, preheader: e.target.value })}
                    placeholder="Resumo técnico p/ aumentar CTR..."
                  />
                </div>

                <div className="space-y-4 pt-12 border-t border-white/5 relative z-10">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic">Intelligence Ledger Output (Markdown)</label>
                    <div className="flex items-center gap-3 bg-brand-primary/10 px-4 py-1.5 rounded-xl border border-brand-primary/20">
                       <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                       <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest italic">Adaptive RTF Converter Active</span>
                    </div>
                  </div>
                  <textarea
                    className="w-full rounded-[40px] bg-black/60 border border-white/5 p-10 text-sm font-black text-white/80 leading-relaxed italic placeholder:text-zinc-800 focus:ring-4 focus:ring-brand-primary/20 outline-none transition-all resize-none shadow-inner"
                    value={draft.body}
                    onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                    rows={12}
                    placeholder="Injete o conteúdo estruturado aqui..."
                  />
                </div>
              </div>

              {sent.length > 0 && (
                <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[56px] radial-gradient-glass shadow-[0_40px_80px_rgba(0,0,0,0.4)] p-12 space-y-10">
                  <div className="flex items-center gap-6">
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">Registro de Transmissão</h2>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5 text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] italic text-left">
                          <th className="pb-6 px-4">Assunto Compilado</th>
                          <th className="pb-6 px-4">Destinatários Hits</th>
                          <th className="pb-6 px-4">Data/Hora Log</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {sent.map((s, i) => (
                          <tr key={i} className="group hover:bg-white/2 transition-colors">
                            <td className="py-8 px-4 font-black text-white italic uppercase tracking-tight group-hover:text-brand-primary transition-colors">{s.subject}</td>
                            <td className="py-8 px-4">
                              <span className="inline-flex items-center rounded-[12px] bg-emerald-500/10 px-4 py-2 text-[10px] font-black font-mono text-emerald-500 border border-emerald-500/20 shadow-2xl">
                                {s.count} disparos
                              </span>
                            </td>
                            <td className="py-8 px-4 font-mono text-[11px] font-black text-zinc-600 uppercase tracking-widest">{s.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="xl:col-span-12 2xl:col-span-4 space-y-12 h-fit 2xl:sticky 2xl:top-0">
               <div className={`rounded-[56px] border border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden radial-gradient-glass transition-all duration-1000 p-12 ${showPreview ? 'bg-black/60 backdrop-blur-3xl' : 'bg-black/20 opacity-40'}`}>
                  <div className="space-y-2 mb-12">
                     <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none px-1">Mock Simulator</h3>
                     <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] italic leading-none block px-1">Cross-Client Render Engine</span>
                  </div>
                  
                  {showPreview ? (
                    <div className="rounded-[32px] overflow-hidden bg-white shadow-2xl animate-in zoom-in-95 duration-700 scale-[0.9] origin-top">
                       <div dangerouslySetInnerHTML={{ __html: renderEmailPreview() }} />
                    </div>
                  ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-1000">
                       <div className="w-24 h-24 rounded-[32px] bg-white/2 border border-white/5 flex items-center justify-center text-zinc-800 shadow-inner">
                         <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/><line x1="4" y1="4" x2="20" y2="20"/></svg>
                       </div>
                       <p className="text-[11px] font-black text-zinc-800 uppercase tracking-[0.3em] px-10 italic">Ative o Renderizador HTML para simular a saída no ecossistema Outlook/Gmail.</p>
                    </div>
                  )}
               </div>

               <div className="p-10 bg-brand-primary/5 border border-brand-primary/10 rounded-[48px] flex items-start gap-8 shadow-2xl radial-gradient-glass">
                  <div className="w-16 h-16 rounded-[24px] bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 border border-brand-primary/20">
                     <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  </div>
                  <div className="space-y-3">
                     <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Aviso de Governança</h3>
                     <p className="text-xs font-bold text-zinc-600 leading-relaxed italic tracking-wide">
                        Todas as newsletters são processadas pelo protocolo Ness. Brain. Ativos de imagem são servidos via CDN Canal High-Availability. O disclaimer LGPD v4 é afixado automaticamente no footer.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {tab === "subscribers" && (
          <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[64px] radial-gradient-glass shadow-[0_60px_120px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col">
            <div className="p-16 border-b border-white/5 bg-white/2 flex flex-col lg:flex-row lg:items-center justify-between gap-12 shrink-0 relative overflow-hidden group/crm">
              <div className="absolute -inset-20 bg-brand-primary/5 rounded-full blur-[100px] opacity-0 group-hover/crm:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              <div className="space-y-3 relative z-10">
                <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">CRM de Assinantes</h2>
                <span className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em] italic leading-none block">Captura Nativa e Gestão de Portadores Core</span>
              </div>
              <div className="flex items-center gap-8 w-full lg:w-auto h-20 relative z-10">
                <div className="relative group/inp flex-1 lg:w-[480px]">
                   <div className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within/inp:text-brand-primary transition-colors">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-5.07 4a3 3 0 0 1-5.86 0"/></svg>
                   </div>
                   <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="Incluir Node Email..."
                    onKeyDown={(e) => e.key === "Enter" && handleAddSubscriber()}
                    className="h-full w-full rounded-[28px] bg-black/60 border border-white/5 pl-24 pr-10 text-[13px] font-black text-white uppercase italic tracking-tighter placeholder:text-zinc-900 focus:ring-4 focus:ring-brand-primary/20 outline-none transition-all"
                  />
                </div>
                <button 
                  className="h-full px-12 rounded-[28px] bg-white text-black text-[12px] font-black uppercase tracking-[0.4em] shadow-[0_40px_80px_rgba(255,255,255,0.1)] hover:scale-[1.05] active:scale-95 transition-all italic shrink-0" 
                  onClick={handleAddSubscriber}
                >
                  Adicionar Node
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-12">
              {subscribers.length === 0 ? (
                 <div className="py-40 flex flex-col items-center justify-center text-center opacity-30">
                    <div className="w-32 h-32 rounded-[48px] bg-white/2 border border-white/5 flex items-center justify-center mb-12 shadow-inner">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    </div>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic">Lista de Captura Vazia</h4>
                    <p className="text-[11px] font-black text-zinc-800 uppercase tracking-[0.5em] mt-4 max-w-[320px] italic">Sem leads inbound sincronizados com a newsletter nativa canal.</p>
                  </div>
              ) : (
                <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                     {subscribers.map((s) => (
                       <div key={s.id} className="group p-8 rounded-[44px] border border-white/5 bg-black/40 backdrop-blur-3xl radial-gradient-glass shadow-[0_40px_80px_rgba(0,0,0,0.4)] transition-all duration-1000 hover:scale-[1.05] hover:border-brand-primary/30 flex items-center justify-between relative overflow-hidden">
                          <div className="absolute -inset-10 bg-brand-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                          <div className="flex items-center gap-6 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-xl italic border border-brand-primary/20 shadow-2xl group-hover:bg-brand-primary group-hover:text-white transition-all duration-700">
                               {s.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="space-y-2">
                               <span className="block font-black text-[13px] text-white tracking-widest uppercase italic group-hover:text-brand-primary transition-colors">{s.email}</span>
                               <span className="block font-mono text-[10px] font-black text-zinc-700 uppercase tracking-widest">{s.created_at?.slice(0, 10).replace(/-/g, '.')} // CAPTURED</span>
                            </div>
                          </div>
                          <button 
                            className="w-14 h-14 rounded-2xl border border-white/5 bg-white/2 hover:bg-red-500 hover:text-white hover:border-red-400 text-zinc-800 transition-all duration-500 shadow-2xl active:scale-90 flex items-center justify-center group/btn-rem relative z-10" 
                            onClick={() => handleRemoveSubscriber(s.id)}
                            title="Desativar Node"
                          >
                            <svg className="group-hover/btn-rem:rotate-90 transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                          </button>
                       </div>
                     ))}
                   </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
