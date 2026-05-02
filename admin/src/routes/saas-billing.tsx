import { useNavigate } from "react-router";

export default function SaasBilling() {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1600px] w-full px-10 md:px-12 py-10 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 flex flex-col items-center justify-center min-h-[80vh]">
      
      <div className="relative">
         <div className="relative w-full max-w-xl bg-background border border-border rounded-xl p-12 flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center text-zinc-400 mb-2">
               <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
               </svg>
            </div>

            <div className="space-y-2">
               <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Financial Core</h2>
                  <div className="text-sm font-medium text-brand-primary">Módulo em Expansão Digital</div>
               </div>
               
               <p className="text-sm font-medium text-zinc-500 max-w-sm leading-relaxed">
                  Nossa nova arquitetura de faturamento dinâmico e gestão de quotas SaaS está sob rigorosa auditoria de segurança. Disponível em breve para o ecossistema Ness.
               </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
               <span className="w-2 h-2 rounded-full bg-brand-primary" />
               <span className="text-xs font-medium text-zinc-500">Status: Deployment in progress</span>
            </div>

            <button
               onClick={() => navigate("/")}
               className="mt-4 h-9 px-4 rounded-md bg-card border border-border text-zinc-300 text-sm font-medium hover:bg-muted/50 transition-colors flex items-center gap-2"
            >
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6"/>
               </svg>
               Retornar ao Command Center
            </button>
         </div>
      </div>

   </div>

  );
}
