import { useState, useEffect, useCallback } from "react";
import {
  fetchCollection,
  fetchEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  toggleEntryStatus,
  toggleEntryFeatured,
  type CollectionDef,
  type EntryMeta,
} from "../lib/api";
import { EntryTable } from "../components/collection/EntryTable";
import { EntryModal } from "../components/collection/EntryModal";

const LOCALES = ["pt", "en", "es"];

export default function CollectionPage({ slug }: { slug: string }) {
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
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(null);

  useEffect(() => {
    fetchCollection(slug).then((col) => setCollection(col ?? null));
  }, [slug]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchEntries(slug, { locale, page });
      setItems(res.data ?? []);
      setMeta(res.meta);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, [slug, locale, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [slug, locale]);

  function openCreate() {
    const defaults: Record<string, unknown> = {};
    collection?.fields.forEach((f) => {
      if (f.defaultValue !== undefined) defaults[f.name] = f.defaultValue;
    });
    if (collection?.has_locale) defaults.locale = locale;
    if (collection?.has_status) defaults.status = "draft";
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
        await createEntry(slug, form);
      } else if (editing) {
        await updateEntry(slug, editing.id as string, form);
      }
      closeModal();
      await load();
    } catch (err) {
      console.error("Save failed:", err);
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover este item permanentemente?")) return;
    await deleteEntry(slug, id);
    await load();
  }

  async function handleToggleStatus(item: Record<string, unknown>) {
    const id = item.id as string;
    const next = item.status === "published" ? "draft" : "published";
    setTogglingId(id);
    try { await toggleEntryStatus(slug, id, next); await load(); }
    finally { setTogglingId(null); }
  }

  async function handleToggleFeatured(item: Record<string, unknown>) {
    const id = item.id as string;
    setTogglingFeaturedId(id);
    try { await toggleEntryFeatured(slug, id, !item.featured); await load(); }
    finally { setTogglingFeaturedId(null); }
  }

  if (!collection) {
    return <div className="flex items-center justify-center h-full"><div className="loader-inline" /></div>;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000 w-full">
      
      {/* ── Operational Intelligence Controller ── */}
      <div className="flex-none px-10 md:px-16 py-12 flex border-b border-white/5 w-full bg-white/1">
        <div className="flex flex-col gap-10 w-full max-w-[1750px] mx-auto">
          
          <div className="flex items-center justify-between w-full h-16">
            <div className="flex items-center gap-10">
              <div className="flex flex-col">
                <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">{collection.label}</h1>
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic mt-3 leading-none">Content Ledger Node: {slug}</span>
              </div>

              <div className="h-10 w-px bg-white/5 mx-4" />

              {collection.has_locale && (
                <div className="flex p-1.5 bg-black/40 backdrop-blur-3xl rounded-[20px] border border-white/5 h-14 shadow-2xl relative group/locale group">
                  <div className="absolute -inset-4 bg-brand-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                  {LOCALES.map((l) => (
                    <button 
                      key={l} 
                      className={`relative z-10 px-8 h-full rounded-[14px] text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-700 italic outline-none ${l === locale ? 'bg-brand-primary shadow-2xl text-white scale-[1.05]' : 'text-zinc-600 hover:text-zinc-300'}`}
                      onClick={() => setLocale(l)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
              
              {meta && (
                <div className="flex items-center gap-5 bg-white/2 px-8 h-14 rounded-[20px] border border-white/5 shadow-2xl">
                   <div className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse shadow-[0_0_15px_rgba(0,173,232,0.6)]" />
                   <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] italic">
                     {meta.total} CORE {meta.total === 1 ? "ENTRY" : "ENTRIES"} ACTIVE
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
              <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.3em]">{`Injear ${collection.label} Pro-Max`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Analytical Content Canvas ── */}
      <div className="flex-1 overflow-y-auto overflow-x-auto px-10 md:px-16 py-14 custom-scrollbar w-full">
        <div className="max-w-[1750px] mx-auto">
          <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[56px] radial-gradient-glass shadow-[0_60px_120px_rgba(0,0,0,0.5)] p-10 group overflow-hidden relative">
            <div className="absolute -inset-40 bg-brand-primary/2 rounded-full blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            <EntryTable
              collection={collection}
              items={items}
              meta={meta}
              loading={loading}
              page={page}
              togglingId={togglingId}
              togglingFeaturedId={togglingFeaturedId}
              onPageChange={setPage}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onToggleFeatured={handleToggleFeatured}
              onCreateFirst={openCreate}
            />
          </div>
        </div>
      </div>

      {/* ── Protocol Modal ── */}
      {modal && (
        <div className="animate-in fade-in zoom-in-95 duration-700 fixed inset-0 z-100 flex items-center justify-center p-6 md:p-12 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeModal} />
          <div className="relative z-110 w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <EntryModal
              mode={modal}
              collection={collection}
              slug={slug}
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
