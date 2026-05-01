import { useState } from "react";
import { useNavigate } from "react-router";
import { signIn } from "../lib/auth-client";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await signIn.email({ email, password, callbackURL: "/" });

    if (error) {
      setError(error.message ?? "Credenciais inválidas.");
      setLoading(false);
    } else {
      navigate("/");
    }
  }

  return (
    <div className="min-h-screen bg-[#050505] flex selection:bg-brand-primary/20 selection:text-brand-primary overflow-hidden">
      {/* Lado Esquerdo - Visionary Branding Panel */}
      <div className="hidden lg:flex w-[55%] relative flex-col justify-between p-16 overflow-hidden border-r border-white/5 shadow-2xl">
        {/* Deep Spatial Ornaments */}
        <div className="absolute inset-0 bg-black z-0">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_30%,_rgba(0,173,232,0.15),_transparent_50%)]" />
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_80%_70%,_rgba(0,173,232,0.1),_transparent_60%)]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 animate-pulse transition-all duration-[10s]" />
        </div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner backdrop-blur-xl group hover:border-brand-primary/50 transition-all duration-500">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brand-primary group-hover:scale-110 transition-transform"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tighter text-white">Canal CMS</span>
            <span className="text-[9px] font-bold text-brand-primary uppercase tracking-[0.3em]">Governance Suite</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8 max-w-2xl">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-bold uppercase tracking-widest">
              v2.4.0 Codename: Aegis
            </span>
            <h1 className="text-6xl font-black tracking-tight text-white leading-[1.05]">
              Inteligência e <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-emerald-400">Governança</span> Ativa
            </h1>
          </div>
          <p className="text-xl text-zinc-400 font-medium leading-relaxed max-w-lg">
            Plataforma central unificada para gestão de dados e curadoria B2B, auditável em tempo real via arquitetura Zero-Trust.
          </p>
          
          <div className="pt-8 flex gap-8">
             <div className="relative group">
                <div className="absolute inset-0 bg-brand-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="relative bg-white/5 backdrop-blur-3xl rounded-3xl p-6 border border-white/10 shadow-2xl transition-all hover:border-white/20">
                   <span className="block text-4xl font-black text-white tracking-tighter">14ms</span>
                   <span className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mt-2">Latência Global</span>
                </div>
             </div>
             <div className="bg-white/5 backdrop-blur-3xl rounded-3xl p-6 border border-white/10 shadow-2xl transition-all hover:border-white/20">
                <span className="block text-4xl font-black text-emerald-400 tracking-tighter">SOC2</span>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mt-2">Audit Verified</span>
             </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-zinc-600 font-bold text-[10px] uppercase tracking-[0.2em]">
          <div className="flex -space-x-2">
            {[1,2,3].map(i => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-black bg-zinc-800" />
            ))}
          </div>
          <span>Aegis Shield Guard Ativo na Região SA-East</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
        </div>
      </div>

      {/* Lado Direito - High-Fidelity Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 sm:p-20 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(0,173,232,0.03),_transparent_70%)] pointer-events-none" />
        
        <div className="w-full max-w-[440px] space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          
          <div className="space-y-3">
            <h2 className="text-4xl font-bold tracking-tight text-white leading-tight">
              Acesso Autorizado
            </h2>
            <p className="text-zinc-500 text-sm font-medium tracking-wide">
              Autentique-se com sua credencial corporativa.
            </p>
            <div className="h-1 w-12 bg-brand-primary rounded-full" />
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
               <div className="space-y-3 group">
                 <div className="flex justify-between items-center px-1">
                   <label htmlFor="email" className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 group-focus-within:text-brand-primary transition-colors">
                      Identificador (Email)
                   </label>
                 </div>
                 <input
                   id="email"
                   type="email"
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="ex: nome@ness.com.br"
                   required
                   autoFocus
                   className="flex h-14 w-full rounded-2xl border border-white/5 bg-white/2 px-6 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all shadow-inner backdrop-blur-xl hover:bg-white/5"
                 />
               </div>

               <div className="space-y-3 group">
                 <div className="flex justify-between items-center px-1">
                   <label htmlFor="password" className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 group-focus-within:text-brand-primary transition-colors">
                      Chave de Acesso
                   </label>
                   <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-zinc-400">Esqueci a senha</span>
                 </div>
                 <input
                   id="password"
                   type="password"
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••"
                   required
                   className="flex h-14 w-full rounded-2xl border border-white/5 bg-white/2 px-6 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all shadow-inner backdrop-blur-xl hover:bg-white/5"
                 />
               </div>
            </div>

            {error && (
               <div className="p-4 rounded-2xl border border-red-500/10 bg-red-500/5 text-red-500 flex items-center gap-4 animate-in fade-in zoom-in duration-500 shadow-xl">
                  <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  </div>
                  <span className="text-[11px] font-bold tracking-widest uppercase">{error}</span>
               </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="relative group inline-flex w-full h-14 items-center justify-center rounded-2xl bg-brand-primary text-white px-8 font-bold text-xs uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(0,173,232,0.3)] hover:shadow-[0_25px_50px_rgba(0,173,232,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 disabled:opacity-50 disabled:pointer-events-none overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </div>
              ) : "Entrar no Sistema"}
            </button>
          </form>

          <footer className="pt-12 text-center border-t border-white/5">
             <div className="flex flex-col gap-2">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em]">
                   Infraestrutura Zero-Trust &copy; 2026
                </p>
                <div className="flex justify-center gap-4 text-[9px] font-bold text-zinc-700 uppercase tracking-widest">
                  <span className="hover:text-zinc-500 cursor-pointer transition-colors">Termos de Uso</span>
                  <span className="text-white/5">|</span>
                  <span className="hover:text-zinc-500 cursor-pointer transition-colors">Política de Privacidade</span>
                </div>
             </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
