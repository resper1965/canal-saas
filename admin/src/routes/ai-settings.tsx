import { useState, useEffect } from "react";
import { authClient } from "../lib/auth-client";
import ChatsHistory from "./chats";

type AIConfig = {
  enabled: boolean;
  bot_name: string;
  avatar_url: string;
  welcome_message: string;
  system_prompt: string;
  theme_color: string;
  max_turns: number;
};

type AIStats = {
  totalChats: number;
  totalLeads: number;
  recentChats: number;
};

const DEFAULT_PROMPT = `Você é a Gabi, Secretária Executiva e concierge de alto nível da ness.
Elegante, discreta, de extrema confiança e DIRETA.
Responda sempre em no máximo 2-3 frases curtas.
Demonstre domínio do assunto com 1 frase precisa, depois redirecione para o time especialista.
Peça o contato do usuário de forma natural.`;

export default function AISettingsPage() {
  const { data: activeOrg } = authClient.useActiveOrganization();
  const [config, setConfig] = useState<AIConfig>({ 
    enabled: true, 
    bot_name: "Gabi.OS", 
    avatar_url: "", 
    welcome_message: "Olá! Como posso ajudar?", 
    system_prompt: "", 
    theme_color: "#00E5A0", 
    max_turns: 20 
  });
  const [stats, setStats] = useState<AIStats>({ totalChats: 0, totalLeads: 0, recentChats: 0 });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/ai-settings", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/admin/ai-stats", { credentials: "include" }).then((r) => r.json()),
    ]).then(([c, s]) => {
      if (c && !c.error) setConfig(c as AIConfig);
      if (s && !s.error) setStats(s as AIStats);
    }).finally(() => setLoading(false));
  }, [activeOrg?.id]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/ai-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-32"><div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-brand-primary animate-spin" /></div>;
  }

  return (
    <div className="max-w-[1600px] w-full px-10 md:px-12 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* Header Integration */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase">Inteligência Privada</h1>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] italic">Cognitive Governance & LLM Orchestration</p>
        </div>
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-3xl border border-white/5 p-2 rounded-2xl">
           <div className="px-4 h-9 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Ness.Brain v4 Online</span>
           </div>
        </div>
      </div>

      {/* Stats Engine */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/40 backdrop-blur-3xl rounded-[32px] border border-white/5 p-8 shadow-2xl radial-gradient-glass group hover:bg-white/5 transition-all duration-700">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic leading-none">Interações Totais</span>
              <div className="w-10 h-10 rounded-xl bg-brand-primary/5 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform duration-500">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
           </div>
           <div className="text-4xl font-black text-white italic tracking-tighter mb-1 uppercase shrink-0">{stats.totalChats}</div>
           <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">+12.4% <span className="text-zinc-700">vs yesterday</span></div>
        </div>

        <div className="bg-black/40 backdrop-blur-3xl rounded-[32px] border border-white/5 p-8 shadow-2xl radial-gradient-glass group hover:bg-white/5 transition-all duration-700">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic leading-none">Conversão de Lead</span>
              <div className="w-10 h-10 rounded-xl bg-amber-500/5 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform duration-500">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
              </div>
           </div>
           <div className="text-4xl font-black text-white italic tracking-tighter mb-1 uppercase shrink-0">{stats.totalLeads}</div>
           <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest">High Probability <span className="text-zinc-700">node detection</span></div>
        </div>

        <div className="bg-black/40 backdrop-blur-3xl rounded-[32px] border border-white/5 p-8 shadow-2xl radial-gradient-glass group hover:bg-white/5 transition-all duration-700">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest italic leading-none">Atividade (72h)</span>
              <div className="w-10 h-10 rounded-xl bg-purple-500/5 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform duration-500">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
           </div>
           <div className="text-4xl font-black text-white italic tracking-tighter mb-1 uppercase shrink-0">{stats.recentChats}</div>
           <div className="text-[9px] font-black text-purple-500 uppercase tracking-widest">Active Threads <span className="text-zinc-700">monitored</span></div>
        </div>
      </div>

      {/* Config Nodes */}
      <div className="bg-black/40 backdrop-blur-3xl rounded-[48px] border border-white/5 shadow-2xl radial-gradient-glass overflow-hidden flex flex-col">
        <div className="px-10 py-10 border-b border-white/5">
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">LLM Engine Configuration</h2>
                 <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic leading-none">Private Agent Persona & Behavioral Logic</p>
              </div>
              <div 
                className={`flex items-center gap-4 p-3 rounded-[24px] border transition-all duration-500 cursor-pointer ${config.enabled ? 'bg-brand-primary/5 border-brand-primary/20' : 'bg-white/2 border-white/5'}`}
                onClick={() => setConfig({ ...config, enabled: !config.enabled })}
              >
                 <div className={`w-12 h-6 rounded-full p-1 transition-all ${config.enabled ? 'bg-brand-primary' : 'bg-zinc-800'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${config.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                 </div>
                 <span className="text-[10px] font-black uppercase text-white tracking-widest select-none">
                    Brain State: {config.enabled ? "Ativo" : "Silenciado"}
                 </span>
              </div>
           </div>
        </div>

        <div className="p-10 grid grid-cols-1 xl:grid-cols-2 gap-12">
          <div className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic block">Identidade do Agente</label>
              <input
                type="text"
                value={config.bot_name}
                onChange={(e) => setConfig({ ...config, bot_name: e.target.value })}
                className="h-14 w-full rounded-2xl border border-white/5 bg-black/40 px-6 text-sm font-bold text-white shadow-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:bg-white/5 transition-all"
                placeholder="Ex: Gabi.OS"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic block">Avatar Assets Rendering</label>
              <div className="flex gap-4 items-center">
                <div className="w-14 h-14 rounded-2xl bg-black/60 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                   {config.avatar_url ? <img src={config.avatar_url} className="w-full h-full object-cover" /> : <div className="w-6 h-6 rounded-full bg-white/5 animate-pulse" />}
                </div>
                <input
                  type="text"
                  value={config.avatar_url || ""}
                  onChange={(e) => setConfig({ ...config, avatar_url: e.target.value })}
                  placeholder="https://assets.ness.dev/agents/gabi.png"
                  className="h-14 w-full rounded-2xl border border-white/5 bg-black/40 px-6 text-xs font-mono font-bold text-zinc-400 shadow-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:bg-white/5 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
               <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic block">Chromacity (Theme)</label>
                 <div className="flex h-14 gap-4 items-center bg-black/40 border border-white/5 rounded-2xl px-6">
                   <div className="relative">
                      <input
                        type="color"
                        value={config.theme_color}
                        onChange={(e) => setConfig({ ...config, theme_color: e.target.value })}
                        className="h-8 w-8 cursor-pointer rounded-lg border-0 p-0 bg-transparent shrink-0"
                      />
                   </div>
                   <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-widest">{config.theme_color}</span>
                 </div>
               </div>

               <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic block">Interaction Cap</label>
                 <input
                   type="number"
                   value={config.max_turns}
                   min={1} max={50}
                   onChange={(e) => setConfig({ ...config, max_turns: parseInt(e.target.value) || 20 })}
                   className="h-14 w-full rounded-2xl border border-white/5 bg-black/40 px-6 text-sm font-bold text-white shadow-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:bg-white/5 transition-all"
                 />
               </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic block">Preflight Hook (Welcome Message)</label>
              <textarea
                value={config.welcome_message}
                onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
                rows={3}
                className="w-full rounded-2xl border border-white/5 bg-black/40 px-6 py-5 text-sm font-bold text-white transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:bg-white/5 resize-none shadow-2xl"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic block">System Directive (Cognitive Template)</label>
                <div className="flex gap-2 mb-1">
                  <code className="bg-white/5 border border-white/5 px-2 py-0.5 rounded-md text-[8px] font-mono font-black uppercase tracking-widest text-zinc-600">{"${lang}"}</code>
                  <code className="bg-white/5 border border-white/5 px-2 py-0.5 rounded-md text-[8px] font-mono font-black uppercase tracking-widest text-zinc-600">{"${rag}"}</code>
                </div>
              </div>
              <textarea
                value={config.system_prompt}
                onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
                rows={8}
                placeholder={DEFAULT_PROMPT}
                className="w-full rounded-[24px] border border-white/5 bg-black/40 px-6 py-6 text-[13px] font-mono font-bold text-zinc-300 transition-all placeholder:text-zinc-800 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:bg-white/5 resize-none leading-relaxed shadow-2xl"
              />
            </div>
          </div>
        </div>

        <div className="px-10 py-8 bg-white/2 border-t border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-4">
              {saved && (
                <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 animate-in fade-in zoom-in-95">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 italic">Sincronização Completa</span>
                </div>
              )}
           </div>
           <button
              onClick={handleSave}
              disabled={saving}
              className="h-14 px-10 rounded-2xl bg-brand-primary text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(0,173,232,0.4)] hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50 italic"
            >
              {saving ? "Deploying Knowledge..." : "Sincronizar Cognitive Brain"}
            </button>
        </div>
      </div>

      <div className="mt-12">
        <div className="flex items-center gap-6 mb-8">
           <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Intercept History</h3>
           <div className="flex-1 h-px bg-white/5" />
        </div>
        <ChatsHistory />
      </div>
    </div>
  );
}
