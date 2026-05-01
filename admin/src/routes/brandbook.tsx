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
    return <div className="flex justify-center p-32"><div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-brand-primary animate-spin" /></div>;
  }

  return (
    <div className="max-w-[1750px] w-full px-10 md:px-16 py-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 overflow-hidden flex flex-col">
      
      {/* ── Identity Command Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 bg-black/40 backdrop-blur-3xl border border-white/5 p-12 rounded-[56px] shadow-[0_60px_120px_rgba(0,0,0,0.5)] radial-gradient-glass relative overflow-hidden group">
        <div className="absolute -inset-32 bg-brand-primary/5 rounded-full blur-[120px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
        <div className="space-y-3 relative z-10">
          <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">Brandbook</h1>
          <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em] italic leading-none">Visual Identity Protocol & Digital Governance Node</p>
        </div>
        <div className="flex items-center gap-6 relative z-10">
          <button
            onClick={() => setShowManual(v => !v)}
            className={`h-16 px-12 rounded-[22px] text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-700 italic active:scale-95 ${
              showManual
                ? 'bg-brand-primary text-white shadow-[0_20px_40px_rgba(0,173,232,0.4)] scale-105'
                : 'bg-white/2 border border-white/5 text-zinc-600 hover:text-white hover:bg-white/5 shadow-2xl'
            }`}
          >
            {showManual ? 'Fechar Protocolo' : 'Identity Manual'}
          </button>
          <Link to="/crud/brandbook" className="h-16 px-14 flex items-center bg-white text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-[22px] shadow-[0_40px_80px_rgba(255,255,255,0.1)] hover:scale-[1.05] active:scale-95 transition-all italic relative overflow-hidden group/btn">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
            <span className="relative z-10">Catalog Core</span>
          </Link>
        </div>
      </div>

      {showManual && (
        <div className="animate-in fade-in slide-in-from-top-10 duration-1000 bg-black/40 backdrop-blur-3xl rounded-[56px] border border-white/5 p-16 shadow-[0_60px_120px_rgba(0,0,0,0.6)] radial-gradient-glass relative overflow-hidden group">
           <div className="absolute left-0 top-0 bottom-0 w-3 bg-brand-primary/40 group-hover:bg-brand-primary transition-all duration-1000 shadow-[0_0_20px_rgba(0,173,232,0.3)]" />
           <div className="grid grid-cols-1 xl:grid-cols-2 gap-20">
              <div className="space-y-10">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary shadow-2xl group-hover:scale-110 transition-transform duration-700">
                       <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                    </div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Protocolo Cromático</h3>
                 </div>
                 <div className="space-y-6">
                    <p className="text-[13px] font-bold text-zinc-500 uppercase tracking-widest leading-loose italic">A gestão de cores opera via categorização <code className="text-brand-primary font-mono text-[11px] bg-brand-primary/5 px-2 py-1 rounded-lg">#cor</code>. Cada nó deve conter metadados HEX precisos para renderização em pipelines de renderização social e web de alta fidelidade.</p>
                 </div>
              </div>
              <div className="space-y-10">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[24px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                       <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    </div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Assets de Logo</h3>
                 </div>
                 <div className="space-y-6">
                    <p className="text-[13px] font-bold text-zinc-500 uppercase tracking-widest leading-loose italic">Logotipos são processados sob a tag <code className="text-amber-500 font-mono text-[11px] bg-amber-500/5 px-2 py-1 rounded-lg">#logo</code>. O sistema Ness.Brain gera automaticamente variações cromáticas adaptativas para contextos Dark/High-Contrast e Mobile Ready.</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ── Colors Architecture Matrix ── */}
      <div className="space-y-10 overflow-y-auto custom-scrollbar pr-2 pb-6">
        <div className="flex items-center gap-8">
           <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none px-1">Color Palettes</h2>
           <div className="flex-1 h-px bg-white/5 opacity-50" />
           <span className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.4em] italic leading-none">{colors.length} Active Nodes DETECTED</span>
        </div>
        
        {colors.length === 0 ? (
          <div className="h-[240px] flex flex-col items-center justify-center rounded-[56px] border-2 border-dashed border-white/5 bg-black/20 text-[11px] font-black text-zinc-800 uppercase tracking-[0.4em] italic shadow-inner">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-6 opacity-20"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
            Nenhum nó de cor detectado no ledger visual.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-8">
            {colors.map((color: any) => (
              <div
                key={color.id}
                className="group p-6 rounded-[40px] border border-white/5 bg-black/40 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] transition-all duration-1000 hover:border-brand-primary/30 hover:scale-[1.08] active:scale-95 cursor-pointer radial-gradient-glass relative overflow-hidden"
                onClick={() => {
                  navigator.clipboard.writeText(color.hex_value);
                }}
              >
                <div className="absolute -inset-16 bg-brand-primary/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                <div className="w-full aspect-square rounded-[24px] mb-6 shadow-[inset_0_4px_12px_rgba(0,0,0,0.5)] relative overflow-hidden group-hover:rotate-6 transition-transform duration-700" style={{ backgroundColor: color.hex_value || '#ccc' }}>
                   <div className="absolute inset-0 bg-white/5 group-hover:opacity-0 transition-opacity" />
                   <div className="absolute inset-0 ring-4 ring-inset ring-black/20 rounded-[24px]" />
                </div>
                <div className="space-y-2 relative z-10 px-1">
                  <span className="block font-black text-[12px] text-white uppercase italic tracking-tighter truncate group-hover:text-brand-primary transition-colors">{color.title}</span>
                  <span className="block font-mono text-[10px] text-zinc-600 font-black uppercase tracking-widest group-hover:text-zinc-300 transition-colors leading-none">{color.hex_value}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Logos & Typography Engine ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 overflow-y-auto custom-scrollbar pr-2 pb-10">
         {/* Logos Logic Canvas */}
         <div className="space-y-10">
            <div className="flex items-center gap-8">
               <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none px-1">Signatures</h2>
               <div className="flex-1 h-px bg-white/5 opacity-50" />
            </div>
            {logos.length === 0 ? (
               <div className="h-[400px] rounded-[56px] bg-black/40 border-2 border-dashed border-white/5 animate-pulse shadow-inner" />
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {logos.map((logo: any) => <LogoCard key={logo.id} logo={logo} />)}
               </div>
            )}
         </div>

         {/* Typography Spatial Engine */}
         <div className="space-y-10">
            <div className="flex items-center gap-8">
               <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none px-1">Typography</h2>
               <div className="flex-1 h-px bg-white/5 opacity-50" />
            </div>
            <div className="grid grid-cols-1 gap-8">
               {typography.length === 0 ? (
                  <div className="p-20 text-center rounded-[56px] border-2 border-dashed border-white/5 bg-black/40 shadow-inner group">
                     <span className="text-[11px] font-black text-zinc-800 uppercase tracking-[0.5em] italic group-hover:text-zinc-600 transition-colors">Default System Fonts Enforced</span>
                  </div>
               ) : (
                  typography.map((font: any) => (
                    <div key={font.id} className="group p-12 rounded-[56px] border border-white/5 bg-black/40 backdrop-blur-3xl shadow-[0_40px_80px_rgba(0,0,0,0.5)] radial-gradient-glass relative overflow-hidden transition-all duration-1000 hover:border-brand-primary/30 hover:scale-[1.02]">
                      <div className="absolute -inset-40 bg-brand-primary/2 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                      
                      <div className="flex items-center justify-between mb-10 relative z-10">
                         <div className="w-20 h-20 rounded-[28px] bg-white/5 border border-white/10 flex items-center justify-center text-6xl font-black italic text-white/5 group-hover:text-brand-primary/30 transition-all duration-1000 shadow-inner" style={{ fontFamily: font.title }}>
                            Aa
                         </div>
                         <div className="text-right space-y-2">
                            <span className="block font-black text-3xl text-white uppercase italic tracking-tighter leading-none group-hover:text-brand-primary transition-colors">{font.title}</span>
                            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] italic leading-none block">Global Type Scale Architecture</span>
                         </div>
                      </div>
                      <p className="text-2xl font-black text-zinc-500 group-hover:text-zinc-100 transition-colors duration-700 leading-relaxed italic tracking-tighter" style={{ fontFamily: font.title }}>
                        {font.desc || "The quick brown fox jumps over the lazy dog."}
                      </p>
                      
                      <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between relative z-10 opacity-30 group-hover:opacity-100 transition-opacity duration-1000">
                         <div className="flex gap-4">
                            {['Regular', 'Medium', 'Bold', 'Black'].map(weight => (
                               <span key={weight} className="text-[9px] font-black uppercase tracking-widest text-zinc-600 italic px-3 py-1 rounded-lg bg-white/2 border border-white/5">{weight}</span>
                            ))}
                         </div>
                         <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-800">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m5 12h14M12 5l7 7-7 7"/></svg>
                         </div>
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
