import * as React from "react";
import { BrainCircuit, CheckCircle2, XCircle, Search, Inbox } from "lucide-react";

interface Applicant {
  id: string;
  tenant_id: string;
  job_id: string;
  name: string;
  email: string;
  linkedin_url: string;
  resume_r2_key: string;
  ai_score: number;
  ai_summary: string;
  status: string;
  created_at: string;
}

export default function ApplicantsPage() {
  const [data, setData] = React.useState<Applicant[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/applicants");
        if (res.ok) {
          setData(await res.json());
        } else {
          console.error("Failed to load applicants", res.status);
        }
      } catch (err) {
        console.error("Failed to load applicants", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/applicants/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setData(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch (err) {}
  };

  const filtered = data.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-[1750px] w-full px-10 md:px-16 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 overflow-hidden flex flex-col">
      
      {/* ── Autonomous Search Controller ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 bg-black/40 backdrop-blur-3xl border border-white/5 p-10 rounded-[48px] shadow-[0_40px_80px_rgba(0,0,0,0.4)] radial-gradient-glass relative overflow-hidden group/search">
        <div className="absolute -inset-20 bg-brand-primary/5 rounded-full blur-[100px] opacity-0 group-hover/search:opacity-100 transition-opacity duration-1000 pointer-events-none" />
        <div className="space-y-2 relative z-10">
           <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Gestão de Talentos</h1>
           <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic leading-none">High-Fidelity Applicant Intelligence Node</span>
        </div>
        <div className="flex-1 max-w-xl relative group z-10">
          <div className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-brand-primary transition-colors duration-500">
            <Search size={22} strokeWidth={4} />
          </div>
          <input
            type="text"
            placeholder="Rastrear Candidato (Nome, Email...)"
            className="h-16 w-full rounded-[24px] bg-black/40 border border-white/5 pl-20 pr-8 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-2xl focus:outline-none focus:ring-4 focus:ring-brand-primary/20 hover:bg-white/5 transition-all italic placeholder:text-zinc-800"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-[520px] rounded-[56px] bg-black/40 border border-white/5 animate-pulse shadow-inner" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-black/40 backdrop-blur-3xl rounded-[64px] py-40 text-center border border-white/5 flex flex-col items-center justify-center radial-gradient-glass group shadow-[0_60px_120px_rgba(0,0,0,0.6)]">
          <div className="w-32 h-32 rounded-[40px] bg-white/2 flex items-center justify-center mb-10 border border-white/5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000 shadow-2xl">
            <Inbox size={56} className="text-zinc-800" strokeWidth={1} />
          </div>
          <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Vácuo de Talentos Detectado</h3>
          <p className="text-[11px] font-black text-zinc-700 uppercase tracking-[0.4em] mt-6 italic">Nenhum ativo humano processado pelo sistema nas últimas 24h.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 overflow-y-auto custom-scrollbar pr-2 pb-10">
          {filtered.map(app => (
            <div key={app.id} className="group p-10 rounded-[56px] border border-white/5 hover:border-brand-primary/20 bg-black/40 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.5)] transition-all duration-1000 flex flex-col h-[540px] relative overflow-hidden radial-gradient-glass group-hover:scale-[1.02] group-hover:-translate-y-2">
              
              {/* Deep Spatial Ornamentation */}
              <div className="absolute -inset-32 bg-brand-primary/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              <div className="absolute -right-20 -top-20 w-48 h-48 bg-white/2 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

              {/* Status Header: Identity Node */}
              <div className="flex items-center justify-between mb-10 relative z-10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[22px] bg-brand-primary/5 border border-brand-primary/20 flex items-center justify-center text-brand-primary text-2xl font-black italic shadow-2xl group-hover:bg-brand-primary group-hover:text-white transition-all duration-700">
                    {app.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none line-clamp-1">{app.name}</h3>
                    <div className="flex items-center gap-3">
                       <span className={`w-2 h-2 rounded-full shadow-[0_0_10px] animate-pulse ${app.status === 'shortlisted' ? 'bg-emerald-500 shadow-emerald-500/50' : app.status === 'rejected' ? 'bg-red-500 shadow-red-500/50' : 'bg-brand-primary shadow-brand-primary/50'}`} />
                       <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] italic leading-none">Security Identity Active</span>
                    </div>
                  </div>
                </div>
                
                <div className={`
                  w-16 h-16 rounded-[24px] flex flex-col items-center justify-center border transition-all duration-700 shadow-2xl group-hover:scale-110
                  ${app.ai_score >= 80 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                    app.ai_score >= 50 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                    'bg-red-500/10 text-red-500 border-red-500/20'}
                `}>
                  <span className="text-[9px] font-black uppercase opacity-60 leading-none mb-1 italic tracking-widest">Score</span>
                  <span className="text-xl font-black font-mono leading-none">{app.ai_score || '??'}</span>
                </div>
              </div>

              {/* Technical Governance Meta */}
              <div className="flex items-center gap-8 mb-10 relative z-10">
                 <div className="space-y-1.5 px-1">
                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] block italic leading-none">Registrado</span>
                    <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest font-mono italic leading-none">{new Date(app.created_at).toLocaleDateString()}</span>
                 </div>
                 <div className="flex-1 h-px bg-white/5 opacity-50" />
                 <div className="space-y-1.5 text-right px-1">
                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] block italic leading-none">Job Hash</span>
                    <span className="text-[11px] font-black text-brand-primary uppercase tracking-widest italic leading-none">{app.job_id}</span>
                 </div>
              </div>

              {/* AI Insight Node: Cognitive Engine */}
              <div className="bg-black/60 backdrop-blur-3xl p-8 rounded-[32px] border border-white/5 flex-1 mb-10 radial-gradient-glass relative z-10 group/insight overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover/insight:opacity-20 group-hover/insight:scale-110 transition-all duration-1000 rotate-12">
                   <BrainCircuit size={64} />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 italic mb-5 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
                  Cognitive Analysis v4.2
                </h4>
                <p className="text-xs font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors duration-500 leading-loose italic">
                  {app.ai_summary || 'Analysis Engine em Standby... Processando metadados do currículo em curso.'}
                </p>
              </div>

              {/* Action Node: Governance Controls */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleStatusChange(app.id, 'shortlisted')}
                    className={`w-14 h-14 flex items-center justify-center rounded-[18px] transition-all duration-500 border shadow-2xl active:scale-90 ${app.status === 'shortlisted' ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20' : 'bg-white/2 text-zinc-700 border-white/5 hover:text-emerald-500 hover:bg-emerald-500/10'}`}
                    title="Aprovar Protocolo"
                  >
                    <CheckCircle2 size={24} strokeWidth={4} />
                  </button>
                  <button 
                    onClick={() => handleStatusChange(app.id, 'rejected')}
                    className={`w-14 h-14 flex items-center justify-center rounded-[18px] transition-all duration-500 border shadow-2xl active:scale-90 ${app.status === 'rejected' ? 'bg-red-500 border-red-400 text-white shadow-red-500/20' : 'bg-white/2 text-zinc-700 border-white/5 hover:text-red-500 hover:bg-red-500/10'}`}
                    title="Rejeitar Protocolo"
                  >
                    <XCircle size={24} strokeWidth={4} />
                  </button>
                </div>
                {app.resume_r2_key && (
                  <a 
                    href={`/media/${encodeURIComponent(app.resume_r2_key)}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="h-16 px-10 flex items-center bg-brand-primary text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-[18px] shadow-[0_20px_40px_rgba(0,173,232,0.4)] hover:scale-[1.05] active:scale-95 transition-all italic relative overflow-hidden group/btn"
                  >
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                    <span className="relative z-10">Ver CV Asset</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
