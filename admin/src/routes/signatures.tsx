import { useState, useEffect } from "react";
import { SignaturePreview } from "../components/signatures/SignaturePreview";
import { useToast } from "../components/ui/Toast";
import { PageSpinner } from "../components/ui/Spinner";



const DEPARTMENTS = [
  "Diretoria", "Engenharia", "Comercial", "Operações",
  "RH", "Financeiro", "Marketing", "Cybersecurity", "Legal", "Infraestrutura",
];

async function fetchBrandAssets() {
  try {
    const res = await fetch("/api/admin/brand/assets");
    if (!res.ok) throw new Error("Erro");
    return await res.json();
  } catch { return null; }
}

async function fetchMySignature() {
  try {
    const res = await fetch("/api/admin/brand/signature/me?type=json");
    if (!res.ok) throw new Error("Erro");
    return await res.json();
  } catch { return null; }
}

export default function SignaturesPage() {
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
  const { toast } = useToast();

  useEffect(() => {
    async function init() {
      const [assets, sig] = await Promise.all([fetchBrandAssets(), fetchMySignature()]);
      if (assets?.complete_book) setBrandData(assets);
      if (sig?.base_form) setForm({ ...form, ...sig.base_form });
      setLoading(false);
    }
    init();
  }, []);



  const copyHTML = () => {
    const el = document.getElementById("sig-preview");
    if (!el) return;
    navigator.clipboard.writeText(el.innerHTML).then(() => {
      setCopied(true);
      toast("HTML copiado!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    setDownloading(true);
    const qs = new URLSearchParams({
      type: 'file', name: form.name, role: form.role, email: form.email,
      phone: form.phone, brand: form.brand, linkedin: form.linkedin,
      disclaimer: String(form.disclaimer)
    }).toString();
    window.location.href = `/api/admin/brand/signature/me?${qs}`;
    setTimeout(() => {
      setDownloading(false);
      toast("Download gerado.");
    }, 1500);
  };

  if (loading) {
    return <PageSpinner />;
  }

  const BRANDS = brandData?.complete_book ? Object.keys(brandData.complete_book) : ["ness"];

  return (
    <div className="max-w-7xl w-full px-6 py-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col mx-auto">


      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-lg p-1 h-10 w-fit shrink-0">
        {[
          { id: 'generator', label: 'Gerador' },
          { id: 'assets', label: 'Assets' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-5 rounded-md text-xs font-semibold transition-colors ${
              activeTab === item.id ? 'bg-brand-primary text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0">
        {activeTab === 'generator' ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start overflow-y-auto custom-scrollbar h-full">
            {/* Form */}
            <div className="xl:col-span-4 bg-card border border-border rounded-xl p-6 space-y-5">
               <h2 className="text-base font-semibold text-white">Dados da Assinatura</h2>

               <div className="space-y-4">
                  {([
                    ["Nome", "name", "Ex: João Silva", "text"],
                    ["Cargo", "role", "Ex: Diretor de TI", "text"],
                    ["E-mail", "email", "email@empresa.com", "email"],
                    ["Telefone", "phone", "+55 11 00000-0000", "text"],
                    ["LinkedIn", "linkedin", "https://linkedin.com/...", "text"],
                  ] as [string, string, string, string][]).map(([label, key, placeholder, type]) => (
                    <div key={key} className="space-y-1.5">
                       <label className="text-xs font-semibold text-zinc-400 uppercase">{label}</label>
                       <input 
                        type={type} 
                        value={form[key as keyof typeof form] as string}
                        placeholder={placeholder}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        className="h-10 w-full bg-background border border-border rounded-md px-4 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-border transition-colors"
                      />
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-xs font-semibold text-zinc-400 uppercase">Marca</label>
                       <select 
                         value={form.brand}
                         onChange={e => setForm({ ...form, brand: e.target.value })}
                         className="h-10 w-full bg-background border border-border rounded-md px-3 text-sm text-white focus:outline-none focus:border-border appearance-none transition-colors"
                       >
                         {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                       </select>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-semibold text-zinc-400 uppercase">Departamento</label>
                       <select 
                         value={form.department}
                         onChange={e => setForm({ ...form, department: e.target.value })}
                         className="h-10 w-full bg-background border border-border rounded-md px-3 text-sm text-white focus:outline-none focus:border-border appearance-none transition-colors"
                       >
                         {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                       </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-5 h-5 rounded border text-white flex items-center justify-center transition-colors ${form.disclaimer ? 'bg-brand-primary border-brand-primary' : 'bg-background border-border group-hover:border-border'}`}>
                           {form.disclaimer && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <input type="checkbox" checked={form.disclaimer} onChange={e => setForm({ ...form, disclaimer: e.target.checked })} className="hidden" />
                        <span className="text-xs text-zinc-400">Incluir disclaimer LGPD</span>
                    </label>
                  </div>
               </div>
            </div>

            {/* Preview */}
            <div className="xl:col-span-8 space-y-6">
               <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                     <h2 className="text-base font-semibold text-white">Preview</h2>
                     <div className="flex gap-3">
                        <button 
                          onClick={copyHTML} 
                          className={`h-9 px-4 rounded-md text-xs font-semibold border transition-colors ${copied ? "bg-emerald-500 border-emerald-400 text-white" : "border-border text-zinc-400 hover:text-white hover:border-border"}`}
                        >
                          {copied ? "Copiado!" : "Copiar HTML"}
                        </button>
                        <button 
                          onClick={handleDownload}
                          disabled={downloading}
                          className="h-9 px-4 rounded-md bg-brand-primary text-white text-xs font-semibold hover:brightness-110 transition-all disabled:opacity-50"
                        >
                          {downloading ? "Gerando..." : "Download HTML"}
                        </button>
                     </div>
                  </div>

                   <div className="p-8 bg-background rounded-lg border border-border flex items-center justify-center">
                      <div className="bg-card p-6 rounded-lg shadow-lg" id="sig-preview">
                         <SignaturePreview form={form} />
                      </div>
                   </div>
               </div>

               <div className="p-5 bg-brand-primary/5 border border-brand-primary/10 rounded-xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  </div>
                  <div>
                     <h3 className="text-sm font-semibold text-white mb-1">Instruções</h3>
                     <p className="text-xs text-zinc-500 leading-relaxed">
                        Faça o download do HTML e abra no navegador, depois copie para o Outlook/Gmail. O disclaimer LGPD é inserido automaticamente.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar h-full">
            {brandData?.complete_book && Object.entries(brandData.complete_book).map(([key, brand]: [string, any]) => (
              <div key={key} className="bg-card border border-border rounded-xl p-6 space-y-5 hover:border-border transition-colors">
                 
                 <div className="flex items-center justify-between">
                    <div>
                       <h3 className="text-sm font-semibold text-white">{key}</h3>
                       <span className="text-xs font-mono text-zinc-500">{brand.websiteDisplay}</span>
                    </div>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold border border-border" style={{ backgroundColor: brand.colors.primary }}>
                       {brand.logoWordmark.charAt(0)}
                    </div>
                 </div>

                 {/* Colors */}
                 <div className="space-y-2">
                    <span className="text-xs font-semibold text-zinc-500 uppercase">Cores</span>
                    <div className="grid grid-cols-2 gap-3">
                       <button onClick={() => { navigator.clipboard.writeText(brand.colors.primary); toast("Cor copiada"); }} className="bg-background border border-border rounded-lg p-3 flex flex-col gap-2 hover:border-border transition-colors text-left">
                          <div className="h-8 w-full rounded" style={{ backgroundColor: brand.colors.primary }} />
                          <div className="flex justify-between items-center">
                             <span className="text-xs text-zinc-500">Primary</span>
                             <span className="text-xs font-mono text-zinc-400">{brand.colors.primary}</span>
                          </div>
                       </button>
                       <button onClick={() => { navigator.clipboard.writeText(brand.colors.bg); toast("Cor copiada"); }} className="bg-background border border-border rounded-lg p-3 flex flex-col gap-2 hover:border-border transition-colors text-left">
                          <div className="h-8 w-full rounded border border-border" style={{ backgroundColor: brand.colors.bg }} />
                          <div className="flex justify-between items-center">
                             <span className="text-xs text-zinc-500">Surface</span>
                             <span className="text-xs font-mono text-zinc-400">{brand.colors.bg}</span>
                          </div>
                       </button>
                    </div>
                 </div>

                 {/* Assets */}
                 <div className="space-y-2">
                    <span className="text-xs font-semibold text-zinc-500 uppercase">Arquivos</span>
                    <div className="space-y-2">
                       {['SVG Logotipo', 'EPS Símbolo'].map((asset, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-2 rounded-md bg-background border border-border hover:border-border transition-colors">
                             <span className="text-xs text-zinc-400">{asset}</span>
                             <span className="text-xs font-mono text-zinc-600">.{i===0?'svg':'eps'}</span>
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
