import { useToast } from "../components/ui/Toast";
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
    return <div className="flex justify-center p-32"><div className="w-16 h-16 rounded-full border-4 border-border border-t-brand-primary animate-spin" /></div>;
  }

  return (
    <div className="max-w-[1600px] w-full px-10 md:px-12 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
      {/* Header Integration */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Inteligência Privada</h1>
          <p className="text-sm text-zinc-400 mt-1">Cognitive Governance & LLM Orchestration</p>
        </div>
        <div className="flex items-center gap-3 bg-background border border-border p-1.5 rounded-md">
           <div className="px-4 h-8 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-white">Ness.Brain v4 Online</span>
           </div>
        </div>
      </div>

      {/* Stats Engine */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background rounded-xl border border-border p-6 hover:bg-muted/50 transition-colors">
           <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-zinc-400">Interações Totais</span>
              <div className="w-8 h-8 rounded-md bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
           </div>
           <div className="text-2xl font-bold text-white mb-1">{stats.totalChats}</div>
           <div className="text-xs font-medium text-emerald-500">+12.4% <span className="text-zinc-500">vs yesterday</span></div>
        </div>

        <div className="bg-background rounded-xl border border-border p-6 hover:bg-muted/50 transition-colors">
           <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-zinc-400">Conversão de Lead</span>
              <div className="w-8 h-8 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-500">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
              </div>
           </div>
           <div className="text-2xl font-bold text-white mb-1">{stats.totalLeads}</div>
           <div className="text-xs font-medium text-amber-500">High Probability <span className="text-zinc-500">node detection</span></div>
        </div>

        <div className="bg-background rounded-xl border border-border p-6 hover:bg-muted/50 transition-colors">
           <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-zinc-400">Atividade (72h)</span>
              <div className="w-8 h-8 rounded-md bg-purple-500/10 flex items-center justify-center text-purple-500">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
           </div>
           <div className="text-2xl font-bold text-white mb-1">{stats.recentChats}</div>
           <div className="text-xs font-medium text-purple-500">Active Threads <span className="text-zinc-500">monitored</span></div>
        </div>
      </div>

      {/* Config Nodes */}
      <div className="bg-background rounded-xl border border-border overflow-hidden flex flex-col">
        <div className="px-8 py-6 border-b border-border">
           <div className="flex items-center justify-between">
              <div className="space-y-1">
                 <h2 className="text-xl font-bold tracking-tight text-white">LLM Engine Configuration</h2>
                 <p className="text-sm text-zinc-400">Private Agent Persona & Behavioral Logic</p>
              </div>
              <div 
                className={`flex items-center gap-3 p-2 rounded-md border transition-colors cursor-pointer ${config.enabled ? 'bg-brand-primary/10 border-brand-primary/30' : 'bg-card border-border'}`}
                onClick={() => setConfig({ ...config, enabled: !config.enabled })}
              >
                 <div className={`w-10 h-5 rounded-full p-1 transition-colors relative ${config.enabled ? 'bg-brand-primary' : 'bg-zinc-700'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${config.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                 </div>
                 <span className="text-sm font-semibold text-white select-none">
                    Brain State: {config.enabled ? "Ativo" : "Desligado"}
                 </span>
              </div>
           </div>
        </div>

        <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 block">Identidade do Agente</label>
              <input
                type="text"
                value={config.bot_name}
                onChange={(e) => setConfig({ ...config, bot_name: e.target.value })}
                className="h-10 w-full rounded-md border border-border bg-card px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
                placeholder="Ex: Gabi.OS"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 block">Avatar URL</label>
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 rounded-md bg-card border border-border flex items-center justify-center overflow-hidden shrink-0">
                   {config.avatar_url ? <img src={config.avatar_url} className="w-full h-full object-cover" /> : <div className="w-5 h-5 rounded-full bg-muted" />}
                </div>
                <input
                  type="text"
                  value={config.avatar_url || ""}
                  onChange={(e) => setConfig({ ...config, avatar_url: e.target.value })}
                  placeholder="https://assets.../gabi.png"
                  className="h-10 w-full rounded-md border border-border bg-card px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-sm font-medium text-zinc-400 block">Cor Tema</label>
                 <div className="flex h-10 gap-3 items-center bg-card border border-border rounded-md px-3">
                   <input
                     type="color"
                     value={config.theme_color}
                     onChange={(e) => setConfig({ ...config, theme_color: e.target.value })}
                     className="h-6 w-6 cursor-pointer rounded bg-transparent border-0 shrink-0"
                   />
                   <span className="text-xs font-mono text-zinc-300">{config.theme_color}</span>
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-sm font-medium text-zinc-400 block">Limites (Max Turns)</label>
                 <input
                   type="number"
                   value={config.max_turns}
                   min={1} max={50}
                   onChange={(e) => setConfig({ ...config, max_turns: parseInt(e.target.value) || 20 })}
                   className="h-10 w-full rounded-md border border-border bg-card px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors"
                 />
               </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400 block">Mensagem de Boas Vindas</label>
              <textarea
                value={config.welcome_message}
                onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
                rows={2}
                className="w-full rounded-md border border-border bg-card px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors resize-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium text-zinc-400 block">System Directive</label>
                <div className="flex gap-2">
                  <span className="bg-card border border-border px-2 py-0.5 rounded text-xs font-mono text-zinc-500">{"${lang}"}</span>
                  <span className="bg-card border border-border px-2 py-0.5 rounded text-xs font-mono text-zinc-500">{"${rag}"}</span>
                </div>
              </div>
              <textarea
                value={config.system_prompt}
                onChange={(e) => setConfig({ ...config, system_prompt: e.target.value })}
                rows={8}
                placeholder={DEFAULT_PROMPT}
                className="w-full rounded-md border border-border bg-card px-4 py-4 text-sm font-mono text-zinc-300 focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        <div className="px-8 py-4 bg-card border-t border-border flex items-center justify-between">
           <div className="flex items-center gap-4">
              {saved && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold">Sincronizado</span>
                </div>
              )}
           </div>
           <button
              onClick={handleSave}
              disabled={saving}
              className="h-10 px-6 rounded-md bg-brand-primary text-white text-sm font-semibold shadow-sm hover:brightness-110 transition-colors disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Sincronizar Cognitive Brain"}
            </button>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-4 mb-6">
           <h3 className="text-xl font-bold text-white tracking-tight">Intercept History</h3>
           <div className="flex-1 h-px bg-muted" />
        </div>
        <ChatsHistory />
      </div>
    </div>
  );
}
