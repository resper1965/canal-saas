import { useState, useEffect, useCallback, useMemo } from "react";
import {
  fetchCollection,
  fetchEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  toggleEntryStatus,
  toggleEntryFeatured,
  uploadMedia,
  type CollectionDef,
  type EntryMeta,
} from "../lib/api";
import { EntryModal } from "../components/collection/EntryModal";

const SLUG = "publications";
const LOCALES = ["pt", "en", "es"];

const CATEGORY_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  "resultado-financeiro": { label: "Resultado Financeiro", icon: "📊", color: "text-emerald-400" },
  "relatorio-anual": { label: "Relatório Anual", icon: "📘", color: "text-blue-400" },
  "relatorio-sustentabilidade": { label: "Sustentabilidade", icon: "🌿", color: "text-green-400" },
  "governanca": { label: "Governança", icon: "⚖️", color: "text-amber-400" },
  "ata-assembleia": { label: "Ata & Assembleia", icon: "📝", color: "text-zinc-400" },
  "fato-relevante": { label: "Fato Relevante", icon: "⚡", color: "text-red-400" },
  "apresentacao-investidores": { label: "Apresentação RI", icon: "🎤", color: "text-cyan-400" },
  "documento-institucional": { label: "Doc. Institucional", icon: "🏛️", color: "text-indigo-400" },
  "outro": { label: "Outro", icon: "📄", color: "text-zinc-500" },
};

function isPDF(url: string) {
  return url?.toLowerCase().endsWith(".pdf");
}

export default function PublicationsPage() {
  const [collection, setCollection] = useState<CollectionDef | null>(null);
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [meta, setMeta] = useState<EntryMeta | null>(null);
  const [locale, setLocale] = useState("pt");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState("");
  const [filterYear, setFilterYear] = useState("");

  useEffect(() => {
    fetchCollection(SLUG).then((col) => setCollection(col ?? null));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchEntries(SLUG, { locale, page });
      const data = (res.data ?? []).map((item) => {
        if (typeof item.data === "string") {
          try { return { ...item, ...JSON.parse(item.data as string) }; } catch { /* skip */ }
        }
        return item;
      });
      setItems(data);
      setMeta(res.meta);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, [locale, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [locale, filterCategory, filterYear]);

  // Group items by fiscal year, then by period
  const grouped = useMemo(() => {
    let filtered = items;
    if (filterCategory) filtered = filtered.filter((i) => i.category === filterCategory);
    if (filterYear) filtered = filtered.filter((i) => i.fiscal_year === filterYear);

    const groups: Record<string, Record<string, Record<string, unknown>[]>> = {};
    for (const item of filtered) {
      const year = (item.fiscal_year as string) || "Sem Ano";
      const period = (item.fiscal_period as string) || "N/A";
      if (!groups[year]) groups[year] = {};
      if (!groups[year][period]) groups[year][period] = [];
      groups[year][period].push(item);
    }

    // Sort years descending
    const sortedYears = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedYears.map((year) => ({
      year,
      periods: Object.entries(groups[year]).sort(([a], [b]) => {
        const order = ["1T", "2T", "3T", "4T", "1S", "2S", "Anual", "N/A"];
        return order.indexOf(a) - order.indexOf(b);
      }),
    }));
  }, [items, filterCategory, filterYear]);

  // Available years for filter
  const availableYears = useMemo(() => {
    const years = new Set(items.map((i) => (i.fiscal_year as string) || "").filter(Boolean));
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [items]);

  // KPIs
  const totalPubs = items.length;
  const featuredCount = items.filter((i) => i.featured).length;
  const pdfCount = items.filter((i) => isPDF((i.file_url as string) || "")).length;
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      const cat = (item.category as string) || "outro";
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [items]);

  function openCreate() {
    const defaults: Record<string, unknown> = { locale, status: "draft", fiscal_year: String(new Date().getFullYear()) };
    setForm(defaults);
    setEditing(null);
    setModal("create");
  }

  function openEdit(item: Record<string, unknown>) {
    setEditing(item);
    setForm({ ...item });
    setModal("edit");
  }

  function closeModal() {
    setModal(null);
    setEditing(null);
    setForm({});
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (modal === "create") {
        await createEntry(SLUG, form);
      } else if (editing) {
        await updateEntry(SLUG, editing.id as string, form);
      }
      closeModal();
      await load();
    } catch (err) {
      console.error("Save failed:", err);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover esta publicação?")) return;
    await deleteEntry(SLUG, id);
    await load();
  }

  async function handleToggleStatus(item: Record<string, unknown>) {
    const id = item.id as string;
    const next = item.status === "published" ? "draft" : "published";
    setTogglingId(id);
    try { await toggleEntryStatus(SLUG, id, next); await load(); }
    finally { setTogglingId(null); }
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    try {
      const result = await uploadMedia(file);
      if (result?.url) {
        setForm((prev) => ({ ...prev, file_url: result.url }));
      }
    } catch (err) {
      console.error("PDF upload failed", err);
    }
    setUploadingPdf(false);
  }

  if (!collection && loading) {
    return <div className="flex items-center justify-center h-full"><div className="loader-inline" /></div>;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full">

      {/* ── KPI Telemetry Header ── */}
      <div className="flex-none px-10 md:px-16 py-10 border-b border-white/5 w-full bg-white/1">
        <div className="max-w-[1750px] mx-auto space-y-10">

          {/* Title Row */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-10">
              <div className="flex flex-col">
                <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Publicações & RI</h1>
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic mt-3 leading-none">Resultados, Relatórios & Documentos Institucionais</span>
              </div>

              <div className="h-10 w-px bg-white/5 mx-4" />

              {/* Locale Switcher */}
              <div className="flex p-1.5 bg-black/40 backdrop-blur-3xl rounded-[20px] border border-white/5 h-14 shadow-2xl relative group">
                <div className="absolute -inset-4 bg-brand-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                {LOCALES.map((l) => (
                  <button
                    key={l}
                    className={`relative z-10 px-8 h-full rounded-[14px] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-700 italic outline-none ${l === locale ? "bg-brand-primary shadow-2xl text-white scale-[1.05]" : "text-zinc-600 hover:text-zinc-300"}`}
                    onClick={() => setLocale(l)}
                  >
                    {l}
                  </button>
                ))}
              </div>

              {meta && (
                <div className="flex items-center gap-5 bg-white/2 px-8 h-14 rounded-[20px] border border-white/5 shadow-2xl">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse shadow-[0_0_15px_rgba(0,173,232,0.6)]" />
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] italic">
                    {meta.total} {meta.total === 1 ? "PUBLICAÇÃO" : "PUBLICAÇÕES"}
                  </span>
                </div>
              )}
            </div>

            <button
              className="group relative flex items-center gap-4 bg-brand-primary text-white h-16 px-10 rounded-[22px] shadow-[0_20px_40px_rgba(0,173,232,0.4)] hover:scale-[1.05] active:scale-95 transition-all duration-700 outline-none overflow-hidden italic"
              onClick={openCreate}
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="relative z-10"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.3em]">Nova Publicação</span>
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Total Publicações", value: totalPubs, color: "text-white", glow: "" },
              { label: "Documentos PDF", value: pdfCount, color: "text-brand-primary", glow: "shadow-[0_0_20px_rgba(0,173,232,0.15)]" },
              { label: "Em Destaque", value: featuredCount, color: "text-amber-400", glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]" },
              { label: "Categorias Ativas", value: Object.keys(categoryCounts).length, color: "text-emerald-400", glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]" },
            ].map((kpi, i) => (
              <div key={i} className={`group relative p-7 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[28px] radial-gradient-glass overflow-hidden ${kpi.glow} hover:border-white/10 transition-all duration-700`}>
                <div className="absolute -inset-10 bg-white/2 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                <span className="block text-[9px] font-black uppercase tracking-[0.4em] text-zinc-600 italic relative z-10">{kpi.label}</span>
                <span className={`block text-4xl font-black tracking-tighter italic mt-3 relative z-10 ${kpi.color}`}>{kpi.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content Canvas ── */}
      <div className="flex-1 overflow-y-auto overflow-x-auto px-10 md:px-16 py-10 custom-scrollbar w-full">
        <div className="max-w-[1750px] mx-auto space-y-10">

          {/* Filters Bar */}
          <div className="flex items-center gap-6 flex-wrap">
            <div className="relative group">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="h-12 pl-5 pr-10 bg-black/40 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:bg-white/5 transition-all italic"
              >
                <option value="">Todas Categorias</option>
                {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                  <option key={key} value={key} className="bg-zinc-900">{val.icon} {val.label}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>

            <div className="relative group">
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="h-12 pl-5 pr-10 bg-black/40 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 appearance-none focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:bg-white/5 transition-all italic"
              >
                <option value="">Todos os Anos</option>
                {availableYears.map((y) => (
                  <option key={y} value={y} className="bg-zinc-900">{y}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>

            {(filterCategory || filterYear) && (
              <button
                onClick={() => { setFilterCategory(""); setFilterYear(""); }}
                className="h-12 px-6 rounded-2xl border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white hover:bg-white/5 transition-all italic"
              >
                Limpar Filtros
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="loader-inline" />
            </div>
          )}

          {/* Empty State */}
          {!loading && items.length === 0 && (
            <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[56px] radial-gradient-glass shadow-2xl p-32 text-center group overflow-hidden relative">
              <div className="absolute -inset-40 bg-brand-primary/2 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              <div className="w-24 h-24 rounded-[40px] bg-white/2 border border-white/5 mx-auto mb-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-1000 shadow-2xl">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-700">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-zinc-600 italic">Nenhuma Publicação</h4>
              <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-zinc-800 italic max-w-[500px] mx-auto leading-loose">
                Cadastre resultados financeiros, relatórios anuais e documentos institucionais.
              </p>
              <button
                onClick={openCreate}
                className="mt-10 h-14 px-10 rounded-2xl bg-brand-primary text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(0,173,232,0.4)] hover:scale-105 active:scale-95 transition-all italic"
              >
                Primeira Publicação
              </button>
            </div>
          )}

          {/* Grouped Timeline */}
          {!loading && grouped.map(({ year, periods }) => (
            <div key={year} className="space-y-6">
              {/* Year Header */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 bg-white/2 px-8 h-12 rounded-2xl border border-white/5">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-brand-primary">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span className="text-[13px] font-black text-white uppercase tracking-[0.2em] italic">{year}</span>
                </div>
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] italic">
                  {periods.reduce((sum, [, docs]) => sum + docs.length, 0)} documentos
                </span>
              </div>

              {/* Period Groups */}
              {periods.map(([period, docs]) => (
                <div key={period} className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[40px] radial-gradient-glass shadow-2xl overflow-hidden group/period relative">
                  <div className="absolute -inset-20 bg-brand-primary/1 rounded-full blur-[80px] opacity-0 group-hover/period:opacity-100 transition-opacity duration-1000 pointer-events-none" />

                  {/* Period Header */}
                  <div className="px-10 py-6 border-b border-white/5 bg-white/1 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                      </div>
                      <span className="text-[11px] font-black text-white uppercase tracking-[0.3em] italic">{period} {year}</span>
                      <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] italic">{docs.length} {docs.length === 1 ? "doc" : "docs"}</span>
                    </div>
                  </div>

                  {/* Documents List */}
                  <div className="divide-y divide-white/5">
                    {docs.map((doc) => {
                      const cat = CATEGORY_LABELS[(doc.category as string) || "outro"] || CATEGORY_LABELS["outro"];
                      const fileUrl = doc.file_url as string;
                      const isPublished = doc.status === "published";
                      const isFeatured = !!doc.featured;

                      return (
                        <div key={doc.id as string} className="px-10 py-6 hover:bg-white/2 transition-all flex items-center justify-between group/doc relative overflow-hidden">
                          <div className="flex items-center gap-6 flex-1 min-w-0">
                            {/* Category Icon */}
                            <div className={`w-12 h-12 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-center text-xl shrink-0 group-hover/doc:scale-110 transition-transform duration-500`}>
                              {cat.icon}
                            </div>

                            {/* Title & Meta */}
                            <div className="flex flex-col gap-1.5 min-w-0">
                              <div className="flex items-center gap-4">
                                <h4 className="text-[13px] font-black text-white italic tracking-tighter uppercase truncate group-hover/doc:text-brand-primary transition-colors">{doc.title as string}</h4>
                                {isFeatured && (
                                  <span className="text-[8px] px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 font-black uppercase tracking-[0.3em] italic shrink-0">Destaque</span>
                                )}
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] italic ${cat.color}`}>{cat.label}</span>
                                <span className="w-1 h-1 bg-white/10 rounded-full" />
                                <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.2em] italic">
                                  {doc.date ? new Date(doc.date as string).toLocaleDateString("pt-BR") : "—"}
                                </span>
                                <span className="w-1 h-1 bg-white/10 rounded-full" />
                                <span className={`text-[9px] font-black uppercase tracking-[0.2em] italic ${isPublished ? "text-emerald-500" : "text-zinc-700"}`}>
                                  {isPublished ? "LIVE" : "DRAFT"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3 opacity-0 group-hover/doc:opacity-100 transition-all duration-500 shrink-0 ml-6">
                            {/* Preview PDF */}
                            {fileUrl && (
                              <button
                                onClick={() => setPreviewUrl(fileUrl)}
                                className="h-10 px-5 rounded-xl border border-white/5 bg-white/2 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-brand-primary hover:border-brand-primary/20 transition-all italic flex items-center gap-2"
                                title="Preview"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                Preview
                              </button>
                            )}

                            {/* Download */}
                            {fileUrl && (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="h-10 w-10 rounded-xl border border-white/5 bg-white/2 flex items-center justify-center text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/20 transition-all"
                                title="Download"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                              </a>
                            )}

                            {/* Toggle Status */}
                            <button
                              onClick={() => handleToggleStatus(doc)}
                              disabled={togglingId === (doc.id as string)}
                              className={`h-10 w-10 rounded-xl border flex items-center justify-center transition-all active:scale-90 ${
                                isPublished
                                  ? "border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10"
                                  : "border-white/5 text-zinc-600 hover:text-white hover:bg-white/5"
                              }`}
                              title={isPublished ? "Despublicar" : "Publicar"}
                            >
                              {togglingId === (doc.id as string) ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  {isPublished ? <><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></> : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>}
                                </svg>
                              )}
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => openEdit(doc)}
                              className="h-10 w-10 rounded-xl border border-white/5 bg-white/2 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-all active:scale-90"
                              title="Editar"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(doc.id as string)}
                              className="h-10 w-10 rounded-xl border border-transparent text-zinc-700 hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/5 flex items-center justify-center transition-all active:scale-90"
                              title="Remover"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 py-8">
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-12 h-12 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all italic ${
                    p === page
                      ? "bg-brand-primary text-white shadow-[0_10px_30px_rgba(0,173,232,0.4)] scale-110"
                      : "bg-white/2 border border-white/5 text-zinc-600 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── PDF Preview Modal ── */}
      {previewUrl && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setPreviewUrl(null)} />
          <div className="relative z-10 w-full max-w-6xl h-[85vh] bg-black/60 backdrop-blur-3xl border border-white/5 rounded-[48px] shadow-[0_60px_120px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
            {/* Preview Header */}
            <div className="flex items-center justify-between px-10 py-6 border-b border-white/5 bg-white/2 shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-black text-white uppercase tracking-[0.2em] italic">Document Preview</span>
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] italic mt-1 truncate max-w-[400px]">{previewUrl}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-11 px-6 rounded-2xl border border-white/5 bg-white/2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-brand-primary hover:border-brand-primary/20 transition-all italic flex items-center gap-3"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Abrir Externamente
                </a>
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="w-11 h-11 rounded-2xl border border-white/5 bg-white/2 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 bg-zinc-950 relative">
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title="Document Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Entry Modal (Create/Edit) ── */}
      {modal && collection && (
        <div className="animate-in fade-in zoom-in-95 duration-700 fixed inset-0 z-100 flex items-center justify-center p-6 md:p-12 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeModal} />
          <div className="relative z-110 w-full max-w-5xl max-h-[90vh] overflow-hidden">
            {/* PDF Upload Helper (shown above modal for publications) */}
            <div className="mb-4 flex items-center gap-4">
              <label className={`group relative flex items-center gap-4 h-14 px-8 rounded-[22px] border border-dashed transition-all cursor-pointer italic overflow-hidden ${
                uploadingPdf
                  ? "border-brand-primary/40 bg-brand-primary/10 text-brand-primary"
                  : "border-white/10 bg-black/40 backdrop-blur-xl text-zinc-400 hover:text-white hover:border-white/20"
              }`}>
                <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="relative z-10">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] relative z-10">
                  {uploadingPdf ? "Enviando PDF..." : "Upload PDF ao R2"}
                </span>
                <input
                  type="file"
                  accept=".pdf,.xlsx,.xls,.doc,.docx"
                  onChange={handlePdfUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploadingPdf}
                />
              </label>
              {!!form.file_url && (
                <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl px-6 h-14">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-emerald-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] italic truncate max-w-[300px]">Arquivo vinculado</span>
                </div>
              )}
            </div>

            <EntryModal
              mode={modal}
              collection={collection}
              slug={SLUG}
              locale={locale}
              form={form}
              saving={saving}
              onFormChange={setForm}
              onSave={handleSave}
              onClose={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}
