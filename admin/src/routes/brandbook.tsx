import { useState, useEffect } from "react";
import { Link } from "react-router";
import { fetchEntries } from "../lib/api";
import { authClient } from "../lib/auth-client";
import { LogoCard } from "../components/brandbook/LogoCard";

export default function BrandbookHub() {
  const { data: activeOrg } = authClient.useActiveOrganization();
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchEntries("brandbook", { status: "all" }).then((res) => {
      setItems(res.data ?? []);
      setLoading(false);
    }).catch(() => {
      setItems([]);
      setLoading(false);
    });
  }, [activeOrg?.id]);

  const logos = items.filter(i => i.category === "logo");
  const colors = items.filter(i => i.category === "cor");
  const typography = items.filter(i => i.category === "tipografia");

  if (loading) {
    return <div className="flex justify-center p-20"><div className="w-8 h-8 rounded-full border-2 border-border border-t-brand-primary animate-spin" /></div>;
  }

  return (
    <div className="max-w-7xl w-full px-6 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowManual(v => !v)}
            className={`h-9 px-4 rounded-md text-xs font-semibold transition-colors ${
              showManual
                ? 'bg-brand-primary text-white'
                : 'border border-border text-zinc-400 hover:text-white hover:border-border'
            }`}
          >
            {showManual ? 'Fechar Manual' : 'Manual de Identidade'}
          </button>
          <Link to="/crud/brandbook" className="h-9 px-4 flex items-center rounded-md bg-card text-foreground text-xs font-semibold hover:bg-zinc-200 transition-colors">
            Gerenciar Catálogo
          </Link>
        </div>
      </div>

      {/* Manual */}
      {showManual && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300 bg-card border border-border rounded-xl p-6">
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-3">
                 <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    </div>
                    <h3 className="text-sm font-semibold text-white">Cores</h3>
                 </div>
                 <p className="text-sm text-zinc-400 leading-relaxed">A gestão de cores opera via categorização <code className="text-brand-primary font-mono text-xs bg-brand-primary/5 px-1.5 py-0.5 rounded">#cor</code>. Cada item deve conter metadados HEX precisos.</p>
              </div>
              <div className="space-y-3">
                 <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    <h3 className="text-sm font-semibold text-white">Logos</h3>
                 </div>
                 <p className="text-sm text-zinc-400 leading-relaxed">Logotipos são processados sob a tag <code className="text-amber-500 font-mono text-xs bg-amber-500/5 px-1.5 py-0.5 rounded">#logo</code>. O sistema gera automaticamente variações para contextos diferentes.</p>
              </div>
           </div>
        </div>
      )}

      {/* Colors */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
           <h2 className="text-base font-semibold text-white">Paleta de Cores</h2>
           <div className="flex-1 h-px bg-muted" />
           <span className="text-xs text-zinc-500">{colors.length} cores</span>
        </div>
        
        {colors.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600 mb-2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
            <span className="text-xs text-zinc-600">Nenhuma cor cadastrada</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-3">
            {colors.map((color: Record<string, unknown>) => (
              <div
                key={color.id}
                className="group bg-card border border-border rounded-xl p-3 hover:border-border transition-colors cursor-pointer"
                onClick={() => navigator.clipboard.writeText(color.hex_value)}
              >
                <div className="w-full aspect-square rounded-lg mb-3 shadow-sm" style={{ backgroundColor: color.hex_value || '#ccc' }} />
                <div className="space-y-0.5">
                  <span className="block text-xs font-semibold text-white truncate">{color.title}</span>
                  <span className="block text-xs font-mono text-zinc-500">{color.hex_value}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Logos & Typography */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
         {/* Logos */}
         <div className="space-y-4">
            <div className="flex items-center gap-4">
               <h2 className="text-base font-semibold text-white">Logos</h2>
               <div className="flex-1 h-px bg-muted" />
            </div>
            {logos.length === 0 ? (
               <div className="h-48 rounded-xl bg-card border border-dashed border-border flex items-center justify-center text-xs text-zinc-600">
                 Nenhum logo cadastrado
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {logos.map((logo: Record<string, unknown>) => <LogoCard key={logo.id} logo={logo} />)}
               </div>
            )}
         </div>

         {/* Typography */}
         <div className="space-y-4">
            <div className="flex items-center gap-4">
               <h2 className="text-base font-semibold text-white">Tipografia</h2>
               <div className="flex-1 h-px bg-muted" />
            </div>
            <div className="space-y-3">
               {typography.length === 0 ? (
                  <div className="py-12 text-center rounded-xl border border-dashed border-border bg-card">
                     <span className="text-xs text-zinc-600">Fontes do sistema em uso</span>
                  </div>
               ) : (
                  typography.map((font: Record<string, unknown>) => (
                    <div key={font.id} className="bg-card border border-border rounded-xl p-6 hover:border-border transition-colors">
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xl text-zinc-500" style={{ fontFamily: font.title }}>
                               Aa
                            </div>
                            <span className="text-sm font-semibold text-white">{font.title}</span>
                         </div>
                      </div>
                      <p className="text-lg text-zinc-400 leading-relaxed mb-4" style={{ fontFamily: font.title }}>
                        {font.desc || "The quick brown fox jumps over the lazy dog."}
                      </p>
                      <div className="flex gap-2">
                         {['Regular', 'Medium', 'Bold'].map(weight => (
                            <span key={weight} className="text-xs text-zinc-600 px-2 py-0.5 rounded bg-muted border border-border">{weight}</span>
                         ))}
                      </div>
                    </div>
                  ))
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
