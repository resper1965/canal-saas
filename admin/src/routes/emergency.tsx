import { useState } from 'react';

export default function EmergencyDashboard() {
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="max-w-[1700px] w-full px-10 md:px-12 py-10 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 overflow-hidden flex flex-col">
      
      {/* ── Governance Telemetry KPIs ── */}
      <div className="grid gap-8 md:grid-cols-3">
        {[
          { label: "Incidentes Ativos", value: 0, icon: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>, color: "text-red-500", glow: "shadow-[0_0_20px_rgba(239,68,68,0.2)]" },
          { label: "SLA Resposta MTTA", value: "--", icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>, color: "text-brand-primary", glow: "shadow-[0_0_20px_rgba(0,173,232,0.2)]" },
          { label: "Erros Críticos (24h)", value: "0.00%", icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>, color: "text-emerald-500", glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]" }
        ].map((kpi, i) => (
          <div key={i} className="group relative">
             <div className="absolute -inset-1 bg-white/5 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none" />
             <div className={`relative p-10 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[40px] radial-gradient-glass shadow-2xl overflow-hidden h-full flex flex-col justify-between ${kpi.glow}`}>
                <div className="flex justify-between items-start">
                   <div className={`w-12 h-12 rounded-2xl bg-white/2 border border-white/10 flex items-center justify-center ${kpi.color} group-hover:scale-110 transition-transform duration-700`}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">{kpi.icon}</svg>
                   </div>
                   <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] font-mono">Live Node</span>
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

      {/* ── Command Segmented Control ── */}
      <div className="space-y-10 flex-1 flex flex-col min-h-0">
        <div className="flex p-1 bg-black/40 backdrop-blur-3xl rounded-xl border border-white/5 radial-gradient-glass h-11 shadow-2xl relative overflow-hidden group">
          <div className="absolute -inset-10 bg-brand-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          {[
            { id: 'active', label: 'Incidência Ativa', icon: <><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></> },
            { id: 'history', label: 'Histórico & RCA', icon: <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></> },
            { id: 'analytics', label: 'Edge Analytics', icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic z-10 ${
                activeTab === tab.id
                  ? 'bg-brand-primary text-white shadow-2xl scale-[1.05]'
                  : 'text-zinc-600 hover:text-zinc-300'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">{tab.icon}</svg>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          {activeTab === 'active' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 h-full">
               <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[56px] relative overflow-hidden group shadow-2xl radial-gradient-glass">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,173,232,0.05),transparent_70%)] animate-pulse pointer-events-none" />
                  <div className="h-32 w-32 rounded-[40px] bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center mb-10 relative z-10 transition-transform group-hover:scale-110 duration-1000 shadow-2xl">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-500 animate-pulse"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                  </div>
                  <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase relative z-10">Integridade de Sistemas: 100%</h3>
                  <p className="mt-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] relative z-10 italic">Monitoramento Heurístico Multicloud — Ativo</p>
                  <div className="mt-12 px-10 py-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-[9px] font-black uppercase tracking-[0.5em] text-emerald-500 shadow-2xl relative z-10 italic">
                     Status: No incidents detected
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 h-full">
               <div className="p-16 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[56px] radial-gradient-glass shadow-2xl min-h-[500px] flex flex-col">
                  <div className="flex items-center gap-6 mb-12">
                     <div className="w-14 h-14 rounded-2xl bg-white/2 border border-white/10 flex items-center justify-center text-zinc-500 shadow-2xl">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                     </div>
                     <div className="flex flex-col">
                        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Arquivo RCA</h2>
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic">Deep Trace Event Audit Logs</span>
                     </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[40px] bg-white/1 px-12 text-center group">
                    <div className="w-20 h-20 rounded-full border border-white/5 bg-white/1 flex items-center justify-center mb-8 opacity-20 group-hover:scale-110 transition-transform duration-1000">
                       <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M12 15V3m0 0l-4 4m4-4l4 4"/></svg>
                    </div>
                    <p className="text-[12px] font-black text-zinc-700 uppercase tracking-[0.4em] italic leading-loose max-w-sm">
                      Logs arquivados em storage imutável. Nenhum desvio detectado no protocolo operacional atual.
                    </p>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 h-full">
               <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[56px] radial-gradient-glass overflow-hidden flex flex-col shadow-2xl shadow-brand-primary/5">
                  <div className="p-10 border-b border-white/5 bg-white/2 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-[24px] bg-white/2 border border-white/10 flex items-center justify-center text-brand-primary shadow-2xl">
                           <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
                        </div>
                        <div className="flex flex-col">
                           <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Edge Telemetry</h2>
                           <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic leading-none">Querying: <code>canal_metrics_v4</code></span>
                        </div>
                     </div>
                     <button className="h-14 px-12 rounded-2xl bg-brand-primary text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(0,173,232,0.4)] hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4 italic group">
                        <svg className="group-hover:translate-x-1 transition-transform" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        Execute Protocol
                     </button>
                  </div>
                  <div className="p-12 space-y-6 bg-black/60 font-mono text-[13px] leading-relaxed relative min-h-[300px] shadow-inner font-bold italic tracking-wide">
                     <div className="absolute left-10 top-12 bottom-12 w-px bg-white/5" />
                     <div className="pl-10 space-y-6">
                        <div className="flex items-start gap-6 group/line">
                           <span className="text-zinc-800 shrink-0 select-none group-hover/line:text-zinc-600 transition-colors">01</span>
                           <span className="text-zinc-500 uppercase tracking-widest leading-loose">SELECT <span className="text-brand-primary">blob1</span> AS tenant_id, <span className="text-brand-primary">blob2</span> AS path, SUM(double1) AS latency</span>
                        </div>
                        <div className="flex items-start gap-6 group/line">
                           <span className="text-zinc-800 shrink-0 select-none group-hover/line:text-zinc-600 transition-colors">02</span>
                           <span className="text-zinc-500 uppercase tracking-widest leading-loose">FROM <span className="text-emerald-500">ness_orchestrator_dataset</span></span>
                        </div>
                         <div className="flex items-start gap-6 group/line">
                            <span className="text-zinc-800 shrink-0 select-none group-hover/line:text-zinc-600 transition-colors">03</span>
                            <span className="text-amber-500 uppercase tracking-widest leading-loose">WHERE timestamp &gt; NOW() - INTERVAL '24 HOURS'</span>
                         </div>
                        <div className="flex items-start gap-6 group/line">
                           <span className="text-zinc-800 shrink-0 select-none group-hover/line:text-zinc-600 transition-colors">04</span>
                           <span className="text-zinc-500 uppercase tracking-widest leading-loose">GROUP BY <span className="text-brand-primary">blob1, blob2</span></span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
