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
      <div className="flex-none px-6 md:px-10 py-8 flex border-b border-border w-full bg-background">
        <div className="flex flex-col gap-6 w-full max-w-[1750px] mx-auto">
          
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight text-white uppercase leading-none">{collection.label}</h1>
                <span className="text-xs font-medium text-zinc-500 mt-2 leading-none">Content Ledger Node: {slug}</span>
              </div>

              <div className="h-8 w-px bg-muted mx-2" />

              {collection.has_locale && (
                <div className="flex p-1 bg-card rounded-lg border border-border h-10">
                  {LOCALES.map((l) => (
                    <button 
                      key={l} 
                      className={`px-4 h-full rounded-md text-xs font-medium uppercase transition-colors outline-none ${l === locale ? 'bg-muted text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                      onClick={() => setLocale(l)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              )}
              
              {meta && (
                <div className="flex items-center gap-3 bg-card px-4 h-10 rounded-lg border border-border">
                   <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                   <span className="text-xs font-medium text-zinc-400">
                     {meta.total} {meta.total === 1 ? "ENTRY" : "ENTRIES"}
                   </span>
                </div>
              )}
            </div>

            <button 
              className="flex items-center gap-2 bg-brand-primary text-white h-10 px-6 rounded-md hover:brightness-110 transition-colors outline-none"
              onClick={openCreate}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              <span className="text-sm font-medium">{`Create ${collection.label}`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Analytical Content Canvas ── */}
      <div className="flex-1 overflow-y-auto overflow-x-auto px-6 md:px-10 py-8 custom-scrollbar w-full bg-background">
        <div className="max-w-[1750px] mx-auto">
          <div className="bg-background border border-border rounded-xl overflow-hidden relative">
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
          <div className="absolute inset-0 bg-background " onClick={closeModal} />
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
