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
      <div className="fixed inset-0 z-100 flex items-center justify-center p-6 md:p-12 bg-background" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="w-full max-w-2xl bg-background rounded-xl border border-border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
          
          <div className="px-6 py-5 border-b border-border bg-card flex items-center justify-between shrink-0">
            <div className="space-y-1">
               <h2 className="text-base font-semibold text-white">
                 {mode === "create" ? `Novo: ${collection.label}` : `Editar: ${collection.label}`}
               </h2>
            </div>
            <button 
               onClick={onClose} 
               className="w-10 h-10 flex items-center justify-center rounded-md border border-border text-zinc-400 hover:text-white hover:bg-muted transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="px-6 py-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
            {/* Locale + Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {collection.has_locale ? (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase">Idioma</label>
                  <div className="relative">
                    <select
                      id="entry-locale"
                      value={(form.locale as string) ?? locale}
                      onChange={(e) => onFormChange({ ...form, locale: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-border bg-card px-4 text-sm font-medium text-white transition-colors focus:outline-none focus:border-border appearance-none"
                    >
                      {LOCALES.map((l) => (
                        <option key={l} value={l} className="bg-card">{l.toUpperCase()}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
              ) : null}
              
              {collection.has_status ? (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase">Status</label>
                  <div className="relative">
                    <select
                      id="entry-status"
                      value={(form.status as string) ?? "draft"}
                      onChange={(e) => onFormChange({ ...form, status: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-border bg-card px-4 text-sm font-medium text-white transition-colors focus:outline-none focus:border-border appearance-none"
                    >
                      <option value="draft" className="bg-card">Rascunho</option>
                      <option value="published" className="bg-card">Publicado</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Slug */}
            {collection.has_slug ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Slug (URL)</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm">/</div>
                  <input
                    id="entry-slug"
                    value={(form.slug as string) ?? ""}
                    onChange={(e) => onFormChange({ ...form, slug: e.target.value })}
                    placeholder="meu-conteudo"
                    className="flex h-10 w-full rounded-md border border-border bg-card pl-8 pr-4 text-sm font-mono text-zinc-300 focus:outline-none focus:border-border transition-colors"
                  />
                </div>
              </div>
            ) : null}

            {/* Collection fields */}
            <div className="space-y-5">
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

          <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between shrink-0">
            <div>
              {!!((slug === 'insights' || slug === 'cases') && mode === "edit" && form.id) && (
                <button 
                   className="flex items-center gap-2 h-10 px-4 rounded-md border border-brand-primary/20 text-brand-primary text-xs font-semibold uppercase hover:bg-brand-primary/10 transition-colors" 
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  Sync Social
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button 
                className="h-10 px-5 rounded-md text-xs font-semibold text-zinc-400 hover:text-white hover:bg-muted transition-colors" 
                onClick={onClose}
              >
                Cancelar
              </button>
              <button 
                className="h-10 px-6 rounded-md bg-brand-primary text-white text-xs font-semibold uppercase hover:brightness-110 transition-all disabled:opacity-50" 
                onClick={onSave} 
                disabled={saving}
              >
                {saving ? "Salvando..." : mode === "create" ? "Criar" : "Salvar"}
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
