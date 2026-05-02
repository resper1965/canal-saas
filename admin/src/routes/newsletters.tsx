import { useToast } from "../components/ui/Toast";
import { useState, useEffect } from "react";

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
      alert("Nenhum assinante cadastrado.");
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
        alert(`Newsletter enviada para ${result.sent || subscribers.length} destinatário(s)!`);
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
    if (!confirm("Remover este assinante?")) return;
    await fetch(`/api/admin/newsletter-subscribers/${id}`, { method: "DELETE", credentials: "include" });
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
  };

  const renderEmailPreview = () => {
    return `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;">
        <div style="background:#0A0A0A;padding:24px 32px;">
          <span style="font-family:Montserrat,sans-serif;font-size:20px;font-weight:500;color:#fff;">canal<span style="color:#00ADE8;">.</span></span>
        </div>
        <div style="padding:32px;">
          <h1 style="font-size:20px;color:#0f172a;margin:0 0 8px;font-weight:600;">${draft.subject || "Assunto"}</h1>
          <p style="font-size:13px;color:#64748b;margin:0 0 24px;">${draft.preheader || ""}</p>
          <div style="font-size:14px;line-height:1.8;color:#334155;white-space:pre-wrap;">${draft.body || "Conteúdo..."}</div>
        </div>
        <div style="background:#f8fafc;padding:24px 32px;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="font-size:11px;color:#94a3b8;margin:0;">canal. · Você optou por receber esta newsletter.</p>
        </div>
      </div>
    `;
  };

  return (
    <div className="max-w-7xl w-full px-6 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col h-full mx-auto">
      
      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-lg p-1 h-10 w-fit shrink-0">
        {[
          { id: 'compose', label: 'Composição' },
          { id: 'subscribers', label: `Assinantes (${subscribers.length})` },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as any)}
            className={`px-5 rounded-md text-xs font-semibold transition-colors ${
              tab === item.id ? 'bg-brand-primary text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-6">
        {tab === "compose" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            {/* Compose Panel */}
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                
                {/* Actions */}
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-white">Nova Campanha</h2>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowPreview((v) => !v)}
                      className="h-9 px-4 rounded-md border border-border text-xs font-semibold text-zinc-400 hover:text-white hover:border-border transition-colors"
                    >
                      {showPreview ? "Fechar Preview" : "Preview"}
                    </button>
                    <button 
                      className="h-9 px-5 rounded-md bg-brand-primary text-white text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-50" 
                      onClick={handleSend} 
                      disabled={sending}
                    >
                      {sending ? "Enviando..." : `Enviar (${subscribers.length})`}
                    </button>
                  </div>
                </div>

                {/* Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase">Assunto</label>
                    <input
                      type="text"
                      className="h-10 w-full rounded-md bg-background border border-border px-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-border transition-colors"
                      value={draft.subject}
                      onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
                      placeholder="Ex: Newsletter nº 42"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-400 uppercase">Audiência</label>
                    <select
                      value={draft.audience}
                      onChange={(e) => setDraft({ ...draft, audience: e.target.value })}
                      className="h-10 w-full rounded-md bg-background border border-border px-4 text-sm text-white focus:outline-none focus:border-border appearance-none transition-colors"
                    >
                      {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase">Pré-header</label>
                  <input
                    type="text"
                    className="h-10 w-full rounded-md bg-background border border-border px-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-border transition-colors"
                    value={draft.preheader}
                    onChange={(e) => setDraft({ ...draft, preheader: e.target.value })}
                    placeholder="Resumo para aumentar abertura..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase">Conteúdo (Markdown)</label>
                  <textarea
                    className="w-full rounded-md bg-background border border-border p-4 text-sm text-white leading-relaxed placeholder:text-zinc-700 focus:outline-none focus:border-border resize-none transition-colors"
                    value={draft.body}
                    onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                    rows={10}
                    placeholder="Escreva o conteúdo aqui..."
                  />
                </div>
              </div>

              {/* Sent History */}
              {sent.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                  <h2 className="text-sm font-semibold text-white">Histórico de Envios</h2>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-xs font-semibold text-zinc-500 uppercase text-left">
                        <th className="pb-3 pr-4">Assunto</th>
                        <th className="pb-3 pr-4">Destinatários</th>
                        <th className="pb-3">Data</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222222]">
                      {sent.map((s, i) => (
                        <tr key={i} className="hover:bg-muted transition-colors">
                          <td className="py-3 pr-4 text-sm font-medium text-white">{s.subject}</td>
                          <td className="py-3 pr-4">
                            <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
                              {s.count} enviados
                            </span>
                          </td>
                          <td className="py-3 font-mono text-xs text-zinc-500">{s.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Preview Sidebar */}
            <div className="space-y-4">
               <div className={`bg-card border border-border rounded-xl p-5 transition-opacity ${showPreview ? 'opacity-100' : 'opacity-40'}`}>
                  <h3 className="text-sm font-semibold text-white mb-4">Preview</h3>
                  {showPreview ? (
                    <div className="rounded-lg overflow-hidden bg-card">
                       <div dangerouslySetInnerHTML={{ __html: renderEmailPreview() }} />
                    </div>
                  ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600 mb-2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                       <p className="text-xs text-zinc-600">Clique em "Preview" para visualizar</p>
                    </div>
                  )}
               </div>

               <div className="p-5 bg-brand-primary/5 border border-brand-primary/10 rounded-xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  </div>
                  <div>
                     <h3 className="text-sm font-semibold text-white mb-1">Aviso</h3>
                     <p className="text-xs text-zinc-500 leading-relaxed">
                        O disclaimer LGPD é inserido automaticamente no footer de cada e-mail.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {tab === "subscribers" && (
          <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
            {/* Add subscriber */}
            <div className="px-6 py-4 border-b border-border bg-background flex items-center gap-3 shrink-0">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Adicionar e-mail..."
                onKeyDown={(e) => e.key === "Enter" && handleAddSubscriber()}
                className="flex-1 h-10 bg-card border border-border rounded-md px-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-border transition-colors"
              />
              <button 
                className="h-10 px-5 rounded-md bg-card text-foreground text-xs font-semibold hover:bg-zinc-200 transition-colors shrink-0" 
                onClick={handleAddSubscriber}
              >
                Adicionar
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {subscribers.length === 0 ? (
                 <div className="py-16 flex flex-col items-center justify-center text-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600 mb-3"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                    <h4 className="text-sm font-semibold text-white">Lista vazia</h4>
                    <p className="text-xs text-zinc-600 mt-1">Nenhum assinante cadastrado.</p>
                 </div>
              ) : (
                <div className="divide-y divide-[#222222]">
                   {subscribers.map((s) => (
                     <div key={s.id} className="px-6 py-3 flex items-center justify-between hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-md bg-brand-primary/10 text-brand-primary flex items-center justify-center font-semibold text-xs">
                             {s.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                             <span className="text-sm text-white">{s.email}</span>
                             <span className="text-xs text-zinc-600 ml-3">{s.created_at?.slice(0, 10)}</span>
                          </div>
                        </div>
                        <button 
                          className="w-8 h-8 rounded-md border border-border text-zinc-600 hover:text-red-500 hover:border-red-500/30 transition-colors flex items-center justify-center" 
                          onClick={() => handleRemoveSubscriber(s.id)}
                          title="Remover"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                     </div>
                   ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
