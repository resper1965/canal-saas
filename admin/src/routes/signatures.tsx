import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "../components/ui/Card";
import { TabGroup, TabPanel } from "../components/ui/Tabs";
import { SignaturePreview } from "../components/signatures/SignaturePreview";

function Toast({ message, type, onClose }: { message: string; type: "success" | "error", onClose?: () => void }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300 font-medium text-sm text-white ${
      type === "success" ? "bg-emerald-500 border border-emerald-400" : "bg-red-500 border border-red-400"
    }`}>
      {type === "success" ? (
         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      ) : (
         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
      )}
      {message}
      {onClose && (
        <button onClick={onClose} className="ml-2 hover:opacity-70 focus:outline-none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      )}
    </div>
  );
}

const DEPARTMENTS = [
  "Diretoria", "Engenharia", "Comercial", "Operações",
  "RH", "Financeiro", "Marketing", "Cybersecurity", "Legal", "Infraestrutura",
];

// Reutilizamos o hook fetch das chamadas para API
async function fetchBrandAssets() {
  try {
    const res = await fetch("/api/admin/brand/assets");
    if (!res.ok) throw new Error("Erro de rede");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function fetchMySignature() {
  try {
    const res = await fetch("/api/admin/brand/signature/me?type=json");
    if (!res.ok) throw new Error("Erro ao buscar dados do usuário");
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default function BrandbookHub() {
  const [activeTab, setActiveTab] = useState("generator");
  const [loading, setLoading] = useState(true);
  const [brandData, setBrandData] = useState<any>(null);
  
  const [form, setForm] = useState({
    name: "", role: "", email: "", phone: "+55 11 00000-0000",
    brand: "ness", department: "Engenharia",
    linkedin: "https://www.linkedin.com/company/ness", disclaimer: true,
  });

  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function init() {
      const [assets, sig] = await Promise.all([fetchBrandAssets(), fetchMySignature()]);
      if (assets?.complete_book) {
        setBrandData(assets);
      }
      if (sig?.base_form) {
        setForm({ ...form, ...sig.base_form });
      }
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const copyHTML = () => {
    const el = document.getElementById("sig-preview");
    if (!el) return;
    navigator.clipboard.writeText(el.innerHTML).then(() => {
      setCopied(true);
      setToast({ message: "HTML Snippet copiado com sucesso.", type: "success" });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    setDownloading(true);
    // Compilar querystring
    const qs = new URLSearchParams({
      type: 'file',
      name: form.name,
      role: form.role,
      email: form.email,
      phone: form.phone,
      brand: form.brand,
      linkedin: form.linkedin,
      disclaimer: String(form.disclaimer)
    }).toString();
    
    // Redirect / window.open to force download
    window.location.href = `/api/admin/brand/signature/me?${qs}`;
    
    setTimeout(() => {
      setDownloading(false);
      setToast({ message: "Download HTML gerado.", type: "success" });
    }, 1500);
  };

  if (loading) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse text-sm font-semibold uppercase tracking-widest">Carregando Brandbook...</div>;
  }

  const BRANDS = brandData?.complete_book ? Object.keys(brandData.complete_book) : ["ness"];

  return (
    <div className="max-w-[1750px] w-full px-10 md:px-12 py-10 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 overflow-hidden flex flex-col">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* ── System Segmented Controls ── */}
      <div className="flex p-1.5 bg-black/40 backdrop-blur-3xl rounded-[24px] border border-white/5 radial-gradient-glass w-fit h-14 shrink-0 shadow-2xl relative overflow-hidden group">
        <div className="absolute -inset-10 bg-brand-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        {[
          { id: 'generator', label: 'Identity Render Engine', icon: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></> },
          { id: 'assets', label: 'Ecosystem Assets Hub', icon: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></> }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-4 px-8 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all italic z-10 ${
              activeTab === item.id 
                ? 'bg-brand-primary text-white shadow-2xl scale-[1.05]' 
                : 'text-zinc-600 hover:text-zinc-300'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">{item.icon}</svg>
            <span className="hidden md:block">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        {activeTab === 'generator' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start overflow-y-auto custom-scrollbar pr-2 h-full">
            {/* ── Configuration Node ── */}
            <div className="xl:col-span-4 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[48px] radial-gradient-glass shadow-2xl p-10 space-y-10">
               <div className="space-y-2">
                 <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Identity Proxy</h2>
                 <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic leading-none">Ness Security Identity Protocol</span>
               </div>

               <div className="space-y-8">
                  {([
                    ["Portador Core", "name", "Ex: Thomas Anderson", "text"],
                    ["Rank / Designação", "role", "Ex: Security Specialist", "text"],
                    ["Communication Pipeline", "email", "ident@ness.com.br", "email"],
                    ["Terminal Mobile", "phone", "+55 11 00000-0000", "text"],
                    ["Ness LinkedIn Hub", "linkedin", "https://linkedin.com/…", "text"],
                  ] as [string, string, string, string][]).map(([label, key, placeholder, type]) => (
                    <div key={key} className="space-y-3">
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] px-1 italic">{label}</label>
                       <input 
                        type={type} 
                        value={form[key as keyof typeof form] as string}
                        placeholder={placeholder}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        className="h-12 w-full bg-black/40 border border-white/5 rounded-2xl px-5 text-sm font-black text-white italic placeholder:text-zinc-800 focus:ring-2 focus:ring-brand-primary/40 outline-none transition-all tracking-tighter uppercase"
                      />
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] px-1 italic">Entidade Node</label>
                       <div className="relative group/sel">
                          <select 
                            value={form.brand}
                            onChange={e => setForm({ ...form, brand: e.target.value })}
                            className="h-12 w-full bg-black/40 border border-white/5 rounded-2xl px-5 text-[10px] font-black uppercase tracking-[0.2em] italic text-zinc-600 focus:text-white focus:ring-2 focus:ring-brand-primary/40 outline-none transition-all cursor-pointer appearance-none shadow-2xl"
                          >
                            {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-800 pointer-events-none group-hover/sel:text-brand-primary transition-colors"><path d="m6 9 6 6 6-6"/></svg>
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] px-1 italic">Unidade O.G.</label>
                       <div className="relative group/sel">
                          <select 
                            value={form.department}
                            onChange={e => setForm({ ...form, department: e.target.value })}
                            className="h-12 w-full bg-black/40 border border-white/5 rounded-2xl px-5 text-[10px] font-black uppercase tracking-[0.2em] italic text-zinc-600 focus:text-white focus:ring-2 focus:ring-brand-primary/40 outline-none transition-all cursor-pointer appearance-none shadow-2xl"
                          >
                            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-800 pointer-events-none group-hover/sel:text-brand-primary transition-colors"><path d="m6 9 6 6 6-6"/></svg>
                       </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5">
                    <label className="flex items-center gap-5 cursor-pointer group/chk w-fit">
                        <div className={`w-6 h-6 rounded-lg border text-white flex items-center justify-center transition-all ${form.disclaimer ? 'bg-brand-primary border-brand-primary shadow-[0_0_20px_rgba(0,173,232,0.4)] scale-110' : 'bg-black/40 border-white/10 group-hover/chk:border-white/30'}`}>
                           {form.disclaimer && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <input 
                          type="checkbox" 
                          checked={form.disclaimer}
                          onChange={e => setForm({ ...form, disclaimer: e.target.checked })}
                          className="hidden"
                        />
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] group-hover/chk:text-white transition-colors italic">Afixar Protocolo Legal LGPD v4</span>
                    </label>
                  </div>
               </div>
            </div>

            {/* ── Render Engine ── */}
            <div className="xl:col-span-8 space-y-10">
               <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[56px] radial-gradient-glass shadow-2xl overflow-hidden p-12 flex flex-col items-center justify-center min-h-[600px]">
                  <div className="w-full flex items-center justify-between mb-12 shrink-0">
                     <div className="flex flex-col">
                        <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Render Preview</h2>
                        <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] italic leading-none mt-2">Live Signature Engine v4.2 Pro-Max</span>
                     </div>
                     <div className="flex gap-6">
                        <button 
                          onClick={copyHTML} 
                          className={`h-14 px-8 rounded-2xl border text-[11px] font-black uppercase tracking-[0.3em] transition-all duration-500 italic ${copied ? "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-105" : "bg-white/2 border-white/10 text-white hover:bg-white/5 hover:border-white/20 active:scale-95 shadow-2xl"}`}
                        >
                          {copied ? "SNAPSHOT CLONADO" : "Clonar Snapshot HTML"}
                        </button>
                        <button 
                          onClick={handleDownload}
                          disabled={downloading}
                          className="relative group h-14 px-10 rounded-2xl bg-brand-primary text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(0,173,232,0.4)] hover:scale-[1.05] active:scale-95 transition-all overflow-hidden disabled:opacity-50 italic"
                        >
                          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          {downloading ? "Gerando Payload..." : "Download Binário HTML"}
                        </button>
                     </div>
                  </div>

                   <div className="p-16 bg-white/2 rounded-[64px] border border-white/5 shadow-inner scale-[1.02] relative group/sig overflow-hidden">
                      <div className="absolute -inset-10 bg-brand-primary/5 blur-2xl opacity-0 group-hover/sig:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                      <div className="relative bg-white p-14 rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-1000" id="sig-preview" style={{ boxShadow: '0 60px 120px rgba(0,0,0,0.5)' }}>
                         <SignaturePreview form={form} />
                      </div>
                   </div>
               </div>

               <div className="p-10 bg-brand-primary/5 border border-brand-primary/10 rounded-[48px] flex items-start gap-8 shadow-2xl">
                  <div className="w-16 h-16 rounded-[24px] bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 border border-brand-primary/20">
                     <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  </div>
                  <div className="space-y-3">
                     <h3 className="text-xl font-black text-white italic tracking-tighter uppercase leading-none">Manual de Distribuição Node</h3>
                     <p className="text-xs font-bold text-zinc-600 leading-relaxed max-w-2xl italic tracking-wide">
                        Opere o download para obter o artefato estruturado Ness. Para sincronização no Outlook/Gmail, abra o cliente e arraste o arquivo ou utilize o snapshot HTML para injeção via editor avançado. O disclaimer LGPD v4 está embutido no payload final.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 overflow-y-auto custom-scrollbar h-full pr-2">
            {brandData?.complete_book && Object.entries(brandData.complete_book).map(([key, brand]: [string, any]) => (
              <div key={key} className="group relative bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[48px] radial-gradient-glass shadow-[0_40px_80px_rgba(0,0,0,0.3)] p-10 space-y-10 hover:scale-[1.02] transition-all duration-700 overflow-hidden">
                 <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/2 rounded-full blur-3xl transition-transform group-hover:scale-150 duration-1000 pointer-events-none" />
                 
                 <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-2">
                       <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none group-hover:text-brand-primary transition-colors">{key}</h3>
                       <span className="text-[10px] font-mono text-zinc-700 tracking-[0.2em] uppercase italic">{brand.websiteDisplay}</span>
                    </div>
                    <div className="w-16 h-16 rounded-[22px] flex items-center justify-center text-white text-2xl font-black shadow-2xl border border-white/10 group-hover:scale-110 transition-transform duration-700" style={{ backgroundColor: brand.colors.primary }}>
                       <span className="italic">{brand.logoWordmark.charAt(0)}</span>
                    </div>
                 </div>

                 <div className="space-y-4 relative z-10">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] px-1 italic">Paleta Cromática (HEX)</span>
                    <div className="grid grid-cols-2 gap-6">
                       <button onClick={() => { navigator.clipboard.writeText(brand.colors.primary); setToast({ message: "HEX Master Copiado", type: "success" }); }} className="group/hex bg-white/2 border border-white/5 rounded-[24px] p-5 flex flex-col gap-4 hover:bg-white/5 transition-all text-left active:scale-95 shadow-2xl">
                          <div className="h-12 w-full rounded-xl shadow-inner group-hover:scale-105 transition-transform" style={{ backgroundColor: brand.colors.primary }} />
                          <div className="flex justify-between items-center px-1">
                             <span className="text-[9px] font-black text-zinc-700 uppercase italic tracking-widest leading-none">Primary</span>
                             <span className="text-[11px] font-mono font-black text-white tracking-widest">{brand.colors.primary}</span>
                          </div>
                       </button>
                       <button onClick={() => { navigator.clipboard.writeText(brand.colors.bg); setToast({ message: "HEX Surface Copiado", type: "success" }); }} className="group/hex bg-white/2 border border-white/5 rounded-[24px] p-5 flex flex-col gap-4 hover:bg-white/5 transition-all text-left active:scale-95 shadow-2xl">
                          <div className="h-12 w-full rounded-xl shadow-inner border border-white/10 group-hover:scale-105 transition-transform" style={{ backgroundColor: brand.colors.bg }} />
                          <div className="flex justify-between items-center px-1">
                             <span className="text-[9px] font-black text-zinc-700 uppercase italic tracking-widest leading-none">Surface</span>
                             <span className="text-[11px] font-mono font-black text-white tracking-widest">{brand.colors.bg}</span>
                          </div>
                       </button>
                    </div>
                 </div>

                 <div className="space-y-4 relative z-10">
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] px-1 italic">Depósito de Artefatos Vetoriais</span>
                    <div className="space-y-4">
                       {['SVG Logotipo Core', 'EPS Símbolo Master'].map((asset, i) => (
                          <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 transition-all group/asset cursor-pointer shadow-2xl hover:border-brand-primary/20">
                             <div className="flex items-center gap-5">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-800 group-hover/asset:text-brand-primary transition-colors group-hover/asset:scale-110 duration-500">
                                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                </div>
                                <span className="text-[11px] font-black text-white uppercase tracking-widest italic opacity-40 group-hover/asset:opacity-100 transition-opacity leading-none">{asset}</span>
                             </div>
                             <span className="text-[10px] font-mono font-black text-zinc-800 uppercase px-3 py-1.5 bg-black/60 border border-white/5 rounded-lg italic tracking-widest group-hover:text-brand-primary transition-colors">.{i===0?'SVG':'EPS'}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>


  );
}
