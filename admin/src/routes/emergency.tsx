import { useState } from 'react';

export default function EmergencyDashboard() {
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="max-w-[1700px] w-full px-6 md:px-10 py-8 space-y-8 flex flex-col bg-background">
      
      {/* ── Governance Telemetry KPIs ── */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: "Incidentes Ativos", value: 0, icon: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>, color: "text-red-500", bg: "bg-red-500/10" },
          { label: "SLA Resposta MTTA", value: "--", icon: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>, color: "text-brand-primary", bg: "bg-brand-primary/10" },
          { label: "Erros Críticos (24h)", value: "0.00%", icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>, color: "text-emerald-500", bg: "bg-emerald-500/10" }
        ].map((kpi, i) => (
          <div key={i} className="relative p-6 bg-card border border-border rounded-xl overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${kpi.bg}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={kpi.color}>{kpi.icon}</svg>
               </div>
               <span className="text-xs font-semibold text-zinc-500 uppercase">Live Node</span>
            </div>
            <div className="mt-6 space-y-1">
               <span className="block text-sm font-semibold uppercase text-zinc-400">{kpi.label}</span>
               <span className="block text-3xl font-bold text-white">{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Command Segmented Control ── */}
      <div className="space-y-8 flex-1 flex flex-col min-h-0">
        <div className="flex p-1 bg-card rounded-lg border border-border h-12 w-fit">
          {[
            { id: 'active', label: 'Incidência Ativa', icon: <><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></> },
            { id: 'history', label: 'Histórico & RCA', icon: <><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></> },
            { id: 'analytics', label: 'Edge Analytics', icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 rounded-md text-xs font-bold uppercase transition-colors ${
                activeTab === tab.id
                  ? 'bg-muted text-white'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-muted'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{tab.icon}</svg>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
          {activeTab === 'active' && (
            <div className="h-full">
               <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-card border border-border rounded-xl relative overflow-hidden">
                  <div className="h-24 w-24 rounded-2xl bg-background border border-border flex items-center justify-center mb-8 relative z-10 transition-transform hover:scale-105 duration-300">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white uppercase relative z-10">Integridade de Sistemas: 100%</h3>
                  <p className="mt-2 text-sm font-medium text-zinc-500 relative z-10">Monitoramento Heurístico Multicloud — Ativo</p>
                  <div className="mt-8 px-6 py-2 rounded-md border border-border bg-background text-xs font-bold uppercase text-emerald-500 relative z-10">
                     Status: No incidents detected
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="h-full">
               <div className="p-12 bg-card border border-border rounded-xl min-h-[400px] flex flex-col">
                  <div className="flex items-center gap-4 mb-10">
                     <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-zinc-500">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                     </div>
                     <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-white uppercase">Arquivo RCA</h2>
                        <span className="text-xs font-semibold text-zinc-500 uppercase">Deep Trace Event Audit Logs</span>
                     </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-background px-10 text-center">
                    <div className="w-16 h-16 rounded-full border border-border bg-card flex items-center justify-center mb-6 opacity-50">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M12 15V3m0 0l-4 4m4-4l4 4"/></svg>
                    </div>
                    <p className="text-sm font-medium text-zinc-500 uppercase max-w-sm">
                      Logs arquivados em storage imutável. Nenhum desvio detectado no protocolo operacional atual.
                    </p>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="h-full">
               <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
                  <div className="p-8 border-b border-border bg-background flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-brand-primary">
                           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>
                        </div>
                        <div className="flex flex-col">
                           <h2 className="text-xl font-bold text-white uppercase">Edge Telemetry</h2>
                           <span className="text-xs font-semibold text-zinc-500 uppercase">Querying: <code className="text-zinc-400 bg-muted px-1 py-0.5 rounded">canal_metrics_v4</code></span>
                        </div>
                     </div>
                     <button className="h-10 px-6 rounded-md bg-muted hover:bg-brand-primary text-white text-xs font-bold uppercase transition-colors flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        Execute Protocol
                     </button>
                  </div>
                  <div className="p-8 space-y-4 bg-background font-mono text-xs leading-relaxed text-zinc-400 min-h-[300px]">
                     <div className="space-y-4">
                        <div className="flex items-start gap-4">
                           <span className="text-zinc-600 select-none">01</span>
                           <span>SELECT <span className="text-brand-primary">blob1</span> AS tenant_id, <span className="text-brand-primary">blob2</span> AS path, SUM(double1) AS latency</span>
                        </div>
                        <div className="flex items-start gap-4">
                           <span className="text-zinc-600 select-none">02</span>
                           <span>FROM <span className="text-emerald-500">ness_orchestrator_dataset</span></span>
                        </div>
                         <div className="flex items-start gap-4">
                            <span className="text-zinc-600 select-none">03</span>
                            <span className="text-amber-500">WHERE timestamp &gt; NOW() - INTERVAL '24 HOURS'</span>
                         </div>
                        <div className="flex items-start gap-4">
                           <span className="text-zinc-600 select-none">04</span>
                           <span>GROUP BY <span className="text-brand-primary">blob1, blob2</span></span>
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
