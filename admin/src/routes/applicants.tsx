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
        if (res.ok) setData(await res.json());
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
    <div className="max-w-7xl w-full px-6 py-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto">
      
      {/* Search */}
      <div className="flex items-center gap-4 bg-card border border-border rounded-xl px-5 py-3">
        <Search size={16} className="text-zinc-500 shrink-0" />
        <input
          type="text"
          placeholder="Buscar candidato por nome ou email..."
          className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 outline-none"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-72 bg-card border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border rounded-xl">
          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-zinc-500 mb-6">
            <Inbox size={28} strokeWidth={1.5} />
          </div>
          <h3 className="text-lg font-semibold text-white">Nenhum candidato</h3>
          <p className="text-sm text-zinc-500 mt-2">Nenhum candidato encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(app => (
            <div key={app.id} className="group bg-card border border-border rounded-xl p-6 flex flex-col hover:border-border transition-colors">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-semibold text-sm">
                    {app.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white line-clamp-1">{app.name}</h3>
                    <span className="text-xs text-zinc-500">{app.email}</span>
                  </div>
                </div>
                
                <div className={`
                  w-10 h-10 rounded-lg flex flex-col items-center justify-center border text-xs font-bold
                  ${app.ai_score >= 80 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                    app.ai_score >= 50 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                    'bg-red-500/10 text-red-500 border-red-500/20'}
                `}>
                  {app.ai_score || '—'}
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 mb-4 text-xs text-zinc-500">
                 <span>Registrado: {new Date(app.created_at).toLocaleDateString('pt-BR')}</span>
                 <span className="text-zinc-700">•</span>
                 <span className="text-brand-primary font-mono">{app.job_id}</span>
              </div>

              {/* AI Summary */}
              <div className="bg-background border border-border p-4 rounded-lg flex-1 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <BrainCircuit size={12} className="text-zinc-500" />
                  <span className="text-xs font-semibold text-zinc-500">Análise IA</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {app.ai_summary || 'Análise ainda não processada.'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleStatusChange(app.id, 'shortlisted')}
                    className={`w-10 h-10 flex items-center justify-center rounded-md border transition-colors ${app.status === 'shortlisted' ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-border text-zinc-600 hover:text-emerald-500 hover:border-emerald-500/30'}`}
                    title="Aprovar"
                  >
                    <CheckCircle2 size={16} strokeWidth={2} />
                  </button>
                  <button 
                    onClick={() => handleStatusChange(app.id, 'rejected')}
                    className={`w-10 h-10 flex items-center justify-center rounded-md border transition-colors ${app.status === 'rejected' ? 'bg-red-500 border-red-400 text-white' : 'border-border text-zinc-600 hover:text-red-500 hover:border-red-500/30'}`}
                    title="Rejeitar"
                  >
                    <XCircle size={16} strokeWidth={2} />
                  </button>
                </div>
                {app.resume_r2_key && (
                  <a 
                    href={`/media/${encodeURIComponent(app.resume_r2_key)}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="h-9 px-4 flex items-center rounded-md bg-brand-primary text-white text-xs font-semibold hover:brightness-110 transition-all"
                  >
                    Ver Currículo
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
