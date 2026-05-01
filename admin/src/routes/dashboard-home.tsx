import { useState, useEffect } from "react";

/* ══════════════════════════════════════════════════════════════
   TYPES
   ══════════════════════════════════════════════════════════════ */

type Stats = {
  totalLeads: number;
  newLeads: number;
  totalForms: number;
  newForms: number;
  totalChats: number;
  publishedEntries: number;
  totalPosts: number;
  totalCases: number;
  totalJobs: number;
  totalUsers: number;
  weeklyLeads: { day: string; count: number }[];
};

type ServiceHealth = {
  status: "ok" | "degraded" | "error";
  latency_ms?: number;
};

type HealthStatus = {
  db?: ServiceHealth;
  kv?: ServiceHealth;
  ai?: ServiceHealth;
  storage?: ServiceHealth;
  queue?: ServiceHealth;
  checked_at?: string;
};

/* ══════════════════════════════════════════════════════════════
   ICONS (Lucide, strict 16px, text-muted-foreground)
   ══════════════════════════════════════════════════════════════ */

const I = {
  target: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
  file: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  briefcase: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  clipboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  ),
  chat: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  key: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  ),
  cloud: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  ),
  db: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3" />
    </svg>
  ),
  layers: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
  ),
  cpu: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" /><line x1="9" y1="1" x2="9" y2="4" /><line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="1" x2="15" y2="4" /><line x1="15" y1="20" x2="15" y2="23" />
    </svg>
  ),
  bucket: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  ),
  list: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
};

/* ── Health services config ── */
const SERVICES: { key: keyof Omit<HealthStatus, "checked_at">; label: string; icon: React.ReactNode }[] = [
  { key: "db", label: "D1", icon: I.db },
  { key: "kv", label: "KV", icon: I.layers },
  { key: "ai", label: "AI", icon: I.cpu },
  { key: "storage", label: "R2", icon: I.bucket },
  { key: "queue", label: "Queue", icon: I.list },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

/* ══════════════════════════════════════════════════════════════
   COMPONENT (SHADCN BLOCKS ADMIN KIT REPLICA)
   ══════════════════════════════════════════════════════════════ */



export default function DashboardHome() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/stats", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/admin/health", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([s, h]) => {
        setStats(s as Stats);
        setHealth(h as HealthStatus);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-48 animate-pulse text-center">
        <div className="space-y-4">
           <div className="w-16 h-16 border-4 border-brand-primary/20 border-t-brand-primary rounded-[24px] animate-spin mx-auto shadow-[0_0_40px_rgba(0,173,232,0.3)]" />
           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic">Carregando métricas de infraestrutura...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-48 text-center space-y-6">
        <div className="w-20 h-20 rounded-[32px] bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shadow-2xl">
           <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div className="space-y-2">
           <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Protocol Failure</h2>
           <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest leading-relaxed">Falha crítica na sincronização de telemetria.</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Total Leads Ledger", value: stats.totalLeads, delta: stats.newLeads, deltaLabel: "novos", icon: () => I.target },
    { label: "Form Ingestion Logic", value: stats.totalForms, delta: stats.newForms, deltaLabel: "pendentes", icon: () => I.clipboard, urgent: true },
    { label: "Identity Nodes", value: stats.totalUsers, icon: () => I.key },
    { label: "Deployment Cases", value: stats.totalCases, icon: () => I.briefcase },
    { label: "Market Protocols", value: stats.totalJobs, icon: () => I.users },
    { label: "Synapse Chat Sessions", value: stats.totalChats, icon: () => I.chat },
    { label: "Insight Matrix", value: stats.totalPosts, icon: () => I.file },
    { label: "Cloud Core Assets", value: stats.publishedEntries, icon: () => I.cloud },
  ];

  const allOk = health && SERVICES.every((s) => health[s.key]?.status === "ok");

  return (
    <div className="max-w-[1750px] w-full px-10 md:px-16 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 overflow-hidden flex flex-col">
      
      {/* ── Infrastructure Command Hub ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 shrink-0 relative">
        <div className="inline-flex items-center gap-8 bg-black/40 backdrop-blur-3xl border border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.4)] rounded-[40px] px-10 py-6 radial-gradient-glass relative overflow-hidden group/health border-white/10">
          <div className="absolute inset-0 bg-brand-primary/2 opacity-0 group-hover/health:opacity-100 transition-opacity duration-1000 pointer-events-none" />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className={`w-4 h-4 rounded-full shadow-[0_0_20px] ${allOk ? 'bg-emerald-500 shadow-emerald-500/60 animate-pulse' : 'bg-amber-500 shadow-amber-500/60 animate-pulse'}`} />
            <div className="flex flex-col gap-1">
               <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white italic">Core Infrastructure</span>
               <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em] italic leading-none">{health?.checked_at ? `Ledger Sync: ${timeAgo(health.checked_at)}` : 'Scanning Cloud Nodes…'}</span>
            </div>
          </div>

          <div className="h-10 w-px bg-white/5 mx-4" />

          <div className="flex items-center gap-8 relative z-10">
            {SERVICES.map(({ key, label }) => {
              const svc = health?.[key];
              const isOk = svc?.status === "ok";
              return (
                <div key={key} className="flex items-center gap-4 group/svc cursor-default">
                  <div className="flex flex-col items-end gap-1">
                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 group-hover:text-brand-primary transition-colors italic leading-none">{label}</span>
                     {svc?.latency_ms !== undefined && (
                       <span className="text-[9px] font-mono font-black text-emerald-500/40 transition-all leading-none">{svc.latency_ms}ms</span>
                     )}
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 group-hover:scale-125 ${isOk ? 'bg-emerald-500/30 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-amber-500/30 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'}`} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 pr-6">
           <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Executive Command</h2>
           <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em] italic leading-none">Ness Operational Core Pro-Max</span>
        </div>
      </div>

      {/* ── Analytical Intelligence Matrix ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 overflow-y-auto custom-scrollbar pr-2 h-full pb-10">
        {kpis.map((kpi, idx) => {
          const isProminent = idx === 0 || idx === 1;
          const Icon = kpi.icon;

          return (
            <div 
              key={kpi.label} 
              className={`relative overflow-hidden flex flex-col justify-between bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[56px] p-12 shadow-[0_50px_100px_rgba(0,0,0,0.5)] transition-all duration-1000 hover:border-brand-primary/30 hover:scale-[1.02] active:scale-[0.99] radial-gradient-glass group ${isProminent ? 'md:col-span-2 lg:col-span-2' : ''}`}
            >
              {/* Spatial Depth Infrastructure */}
              <div className="absolute -right-32 -top-32 w-80 h-80 bg-brand-primary/5 rounded-full blur-[120px] pointer-events-none transition-all duration-1000 group-hover:bg-brand-primary/15 group-hover:scale-150" />
              <div className="absolute -left-32 -bottom-32 w-64 h-64 bg-white/2 rounded-full blur-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

              <div className="relative z-10 flex justify-between items-start mb-16">
                <div className="space-y-4">
                  <span className="block text-[11px] font-black text-zinc-600 tracking-[0.5em] uppercase group-hover:text-zinc-400 transition-colors italic leading-none">{kpi.label}</span>
                  <div className="h-1.5 w-16 bg-white/5 overflow-hidden rounded-full">
                     <div className="h-full w-1/4 bg-brand-primary group-hover:w-full transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]" />
                  </div>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:text-white group-hover:rotate-[360deg] group-hover:scale-110 transition-all duration-1000 shadow-2xl border border-brand-primary/20">
                  <Icon />
                </div>
              </div>

              <div className="relative z-10 space-y-8">
                <div className="text-7xl font-black tracking-tighter text-white leading-none italic group-hover:scale-[1.05] origin-left transition-transform duration-1000 group-hover:text-transparent bg-clip-text bg-linear-to-r from-white to-white group-hover:from-white group-hover:to-brand-primary/60">
                  {kpi.value.toLocaleString("pt-BR")}
                </div>
                <div className="flex items-center gap-5">
                  {kpi.delta !== undefined ? (
                    <div className={`h-12 px-6 rounded-2xl border flex items-center gap-4 transition-all duration-500 ${kpi.delta > 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-white/5 border-white/10 text-zinc-700'} font-black text-[11px] tracking-[0.3em] uppercase shadow-2xl italic`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${kpi.delta > 0 ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'}`} />
                      {kpi.delta} {kpi.deltaLabel} Protocol
                    </div>
                  ) : (
                    <div className="h-12 px-6 rounded-2xl bg-white/2 border border-white/5 text-zinc-700 font-black text-[11px] tracking-[0.3em] uppercase flex items-center gap-4 shadow-2xl italic">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-white/5" />
                      Status: Active Node
                    </div>
                  )}
                  
                  <div className="ml-auto opacity-0 group-hover:opacity-100 -translate-x-6 group-hover:translate-x-0 transition-all duration-1000 text-zinc-700 group-hover:text-brand-primary">
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
