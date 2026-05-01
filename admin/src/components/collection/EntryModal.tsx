import type { CollectionDef, FieldDef } from "../../lib/api";
import { FieldInput } from "./FieldInput";
import AIWriterModal from "../AIWriterModal";
import { useState } from "react";

const LOCALES = ["pt", "en", "es"];

interface EntryModalProps {
  mode: "create" | "edit";
  collection: CollectionDef;
  slug: string;
  locale: string;
  form: Record<string, unknown>;
  saving: boolean;
  onFormChange: (form: Record<string, unknown>) => void;
  onSave: () => void;
  onClose: () => void;
}

export function EntryModal({
  mode,
  collection,
  slug,
  locale,
  form,
  saving,
  onFormChange,
  onSave,
  onClose,
}: EntryModalProps) {
  const [aiWriterField, setAiWriterField] = useState<FieldDef | null>(null);

  return (
    <>
      <div className="fixed inset-0 z-100 flex items-center justify-center p-6 md:p-12 bg-black/60 backdrop-blur-xl animate-in fade-in duration-700" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="w-full max-w-2xl bg-black/40 backdrop-blur-3xl rounded-[48px] border border-white/5 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8)] radial-gradient-glass overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
          
          <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="space-y-1">
               <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">
                 {mode === "create" ? `Novo Protocolo: ${collection.label}` : `Refinar Protocolo: ${collection.label}`}
               </h2>
               <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.4em] italic leading-none">Ness Entry Ingestion Engine v2</span>
            </div>
            <button 
               onClick={onClose} 
               className="w-11 h-11 flex items-center justify-center rounded-full bg-white/2 border border-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all duration-300 active:scale-90"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="px-10 py-10 overflow-y-auto flex-1 custom-scrollbar space-y-10">
            {/* Locale + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {collection.has_locale ? (
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic block">Idioma de Indexação</label>
                  <div className="relative group">
                    <select
                      id="entry-locale"
                      value={(form.locale as string) ?? locale}
                      onChange={(e) => onFormChange({ ...form, locale: e.target.value })}
                      className="flex h-12 w-full items-center justify-between rounded-2xl border border-white/5 bg-black/40 px-5 text-xs font-black uppercase tracking-widest text-white shadow-2xl transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none hover:bg-white/5"
                    >
                      {LOCALES.map((l) => (
                        <option key={l} value={l} className="bg-zinc-900">{l.toUpperCase()}</option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 group-hover:text-brand-primary transition-colors">
                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
              ) : null}
              
              {collection.has_status ? (
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic block">Status do Registro</label>
                  <div className="relative group">
                    <select
                      id="entry-status"
                      value={(form.status as string) ?? "draft"}
                      onChange={(e) => onFormChange({ ...form, status: e.target.value })}
                      className="flex h-12 w-full items-center justify-between rounded-2xl border border-white/5 bg-black/40 px-5 text-xs font-black uppercase tracking-widest text-white shadow-2xl transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/20 appearance-none hover:bg-white/5"
                    >
                      <option value="draft" className="bg-zinc-900">Rascunho (Secure)</option>
                      <option value="published" className="bg-zinc-900">Publicado (Live)</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 group-hover:text-brand-primary transition-colors">
                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Slug */}
            {collection.has_slug ? (
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic block">Routing Slug (URL Primary)</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 font-mono text-xs group-focus-within:text-brand-primary transition-colors">/</div>
                  <input
                    id="entry-slug"
                    value={(form.slug as string) ?? ""}
                    onChange={(e) => onFormChange({ ...form, slug: e.target.value })}
                    placeholder="protocolo-id-alpha"
                    className="flex h-12 w-full rounded-2xl border border-white/5 bg-black/40 pl-10 pr-6 text-xs font-mono font-bold text-zinc-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:bg-white/5 transition-all shadow-xl"
                  />
                </div>
              </div>
            ) : null}

            {/* Collection fields */}
            <div className="space-y-8">
              {collection.fields.map((field) => (
                <FieldInput
                  key={field.name}
                  field={field}
                  value={form[field.name]}
                  onChange={(v) => onFormChange({ ...form, [field.name]: v })}
                  collection={slug}
                  locale={(form.locale as string) ?? locale}
                  onAIWrite={(f) => setAiWriterField(f)}
                />
              ))}
            </div>
          </div>

          <div className="px-10 py-8 border-t border-white/5 bg-white/2 flex items-center justify-between shrink-0">
            <div>
              {!!((slug === 'insights' || slug === 'cases') && mode === "edit" && form.id) && (
                <button 
                   className="flex items-center gap-3 h-12 px-6 rounded-2xl border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/10 transition-all shadow-xl active:scale-95 italic" 
                   onClick={async (e) => {
                    e.preventDefault();
                    try {
                      const res = await fetch(`/api/admin/entries/${form.id}/social`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ platform: 'linkedin' })
                      });
                      if (res.ok) alert('Post Social pro LinkedIn enviado p/ Geração na IA!');
                    } catch(err) { alert('Erro.'); }
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  Sync Social Draft
                </button>
              )}
            </div>
            <div className="flex gap-6">
              <button 
                className="h-12 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white hover:bg-white/5 transition-all italic" 
                onClick={onClose}
              >
                Cancelar
              </button>
              <button 
                className="h-12 px-10 rounded-2xl bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest shadow-[0_20px_40px_-10px_rgba(0,173,232,0.4)] hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50 italic" 
                onClick={onSave} 
                disabled={saving}
              >
                {saving ? "Deploying..." : mode === "create" ? "Confirmar Protocolo" : "Salvar Protocolo"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Writer Modal */}
      {aiWriterField && (
        <AIWriterModal
          field={aiWriterField.name}
          fieldLabel={aiWriterField.label ?? aiWriterField.name}
          collection={slug}
          locale={(form.locale as string) ?? locale}
          onApply={(text) => onFormChange({ ...form, [aiWriterField.name]: text })}
          onClose={() => setAiWriterField(null)}
        />
      )}
    </>
  );
}
