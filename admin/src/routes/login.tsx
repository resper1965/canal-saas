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
    <div className="min-h-screen bg-background flex selection:bg-brand-primary/20 selection:text-brand-primary overflow-hidden">
      {/* Lado Esquerdo - Visionary Branding Panel */}
      <div className="hidden lg:flex w-[55%] relative flex-col justify-between p-16 overflow-hidden border-r border-border shadow-2xl">
        {/* Deep Spatial Ornaments */}
        <div className="absolute inset-0 bg-black z-0">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_30%,rgba(0,173,232,0.15),transparent_50%)]" />
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_80%_70%,rgba(0,173,232,0.1),transparent_60%)]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-primary/5 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 animate-pulse transition-all duration-[10s]" />
        </div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 border border-border flex items-center justify-center shadow-inner  group hover:border-brand-primary/50 transition-all duration-500">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brand-primary group-hover:scale-110 transition-transform"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xl tracking-tighter text-white" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}>canal<span className="text-brand-primary">.</span></span>
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
              <span className="text-transparent bg-clip-text bg-linear-to-r from-brand-primary to-emerald-400">Governança</span> Ativa
            </h1>
          </div>
          <p className="text-xl text-zinc-400 font-medium leading-relaxed max-w-lg">
            Plataforma central unificada para gestão de dados e curadoria B2B, auditável em tempo real via arquitetura Zero-Trust.
          </p>
          
          <div className="pt-8 flex gap-8">
             <div className="relative group">
                <div className="absolute inset-0 bg-brand-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="relative bg-muted/50  rounded-3xl p-6 border border-border shadow-2xl transition-all hover:border-border">
                   <span className="block text-4xl font-black text-white tracking-tighter">14ms</span>
                   <span className="block text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mt-2">Latência Global</span>
                </div>
             </div>
             <div className="bg-muted/50  rounded-3xl p-6 border border-border shadow-2xl transition-all hover:border-border">
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,173,232,0.03),transparent_70%)] pointer-events-none" />
        
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
                   className="flex h-14 w-full rounded-2xl border border-border bg-muted/20 px-6 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all shadow-inner  hover:bg-muted/50"
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
                   className="flex h-14 w-full rounded-2xl border border-border bg-muted/20 px-6 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-brand-primary/50 transition-all shadow-inner  hover:bg-muted/50"
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
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </div>
              ) : "Entrar no Sistema"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-muted/50" />
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.3em]">ou</span>
              <div className="flex-1 h-px bg-muted/50" />
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setLoading(true);
                setError("");
                // Direct navigation ensures browser processes Set-Cookie headers
                window.location.href = "/api/oauth/google?callbackURL=/";
              }}
              className="relative group inline-flex w-full h-14 items-center justify-center gap-4 rounded-2xl bg-muted/30 border border-border text-white px-8 font-bold text-xs uppercase tracking-[0.15em] hover:bg-muted/50 hover:border-border hover:scale-[1.01] active:scale-[0.99] transition-all duration-500 disabled:opacity-50 disabled:pointer-events-none overflow-hidden "
            >
              <svg viewBox="0 0 24 24" width="18" height="18" className="shrink-0">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continuar com Google</span>
            </button>
          </form>

          <footer className="pt-12 text-center border-t border-border">
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
