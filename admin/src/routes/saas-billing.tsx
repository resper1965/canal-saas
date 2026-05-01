import { useNavigate } from "react-router";

export default function SaasBilling() {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1600px] w-full px-10 md:px-12 py-10 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col items-center justify-center min-h-[80vh]">
      
      <div className="relative group overflow-visible">
         {/* ── Spatial Ornament ── */}
         <div className="absolute -inset-20 bg-brand-primary/5 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
         
         <div className="relative w-full max-w-2xl bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[48px] radial-gradient-glass shadow-2xl p-16 flex flex-col items-center text-center space-y-8">
            <div className="w-24 h-24 rounded-[32px] bg-white/2 border border-white/10 flex items-center justify-center text-brand-primary shadow-xl group-hover:scale-110 transition-transform duration-700">
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
               </svg>
            </div>

            <div className="space-y-4">
               <div className="space-y-1">
                  <h2 className="text-3xl font-black text-white tracking-tighter italic">FINANCIAL CORE</h2>
                  <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">Módulo em Expansão Digital</span>
               </div>
               
               <p className="text-sm font-medium text-zinc-500 max-w-sm leading-relaxed">
                  Nossa nova arquitetura de faturamento dinâmico e gestão de quotas SaaS está sob rigorosa auditoria de segurança. Disponível em breve para o ecossistema Ness.
               </p>
            </div>

            <div className="flex items-center gap-2 pt-4">
               <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
               <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest whitespace-nowrap">Status: Deployment in progress</span>
            </div>

            <button
               onClick={() => navigate("/")}
               className="relative group h-12 px-10 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-500 flex items-center gap-3 overflow-hidden"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="m15 18-6-6 6-6"/>
               </svg>
               Retornar ao Command Center
            </button>
         </div>
      </div>

   </div>

  );
}
