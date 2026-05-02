import * as React from "react";
import type { FieldDef } from "../../lib/api";

export function FieldInput({
  field,
  value,
  onChange,
  collection,
  locale,
  onAIWrite,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  collection?: string;
  locale?: string;
  onAIWrite?: (field: FieldDef) => void;
}) {
  const id = `field-${field.name}`;
  const isTextual = ["text", "textarea", "richtext"].includes(field.type);

  const AIButton = onAIWrite && isTextual ? (
    <button
      type="button"
      onClick={() => onAIWrite(field)}
      className="flex items-center gap-1.5 px-3 h-7 bg-brand-primary text-white rounded-md text-xs font-semibold hover:brightness-110 active:scale-95 transition-all"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
      IA
    </button>
  ) : null;

  const labelStyle = "text-xs font-semibold text-muted-foreground uppercase block";
  const inputBase = "w-full rounded-md border border-border bg-background px-4 text-sm text-foreground focus:outline-none focus:border-border/80 transition-colors";

  switch (field.type) {
    case "textarea":
    case "richtext":
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={labelStyle}>
              {field.label ?? field.name}
              {field.type === "richtext" && <span className="ml-2 text-brand-primary/50 text-xs font-normal normal-case">(Markdown/HTML)</span>}
            </label>
            {AIButton}
          </div>
          <textarea
            id={id}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            rows={field.type === "richtext" ? 14 : 4}
            className={`${inputBase} py-3 ${field.type === "richtext" ? 'font-mono text-muted-foreground' : ''}`}
            placeholder={`Conteúdo para ${field.label ?? field.name}...`}
          />
        </div>
      );

    case "image":
      return (
        <div className="space-y-2">
          <label className={labelStyle}>
            {field.label ?? field.name}
          </label>
          <div className="flex gap-4 items-center">
            <div className="flex-none h-20 w-20 rounded-lg border border-border bg-card overflow-hidden flex items-center justify-center">
              {value ? (
                 <img src={value as string} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              )}
            </div>
            <div className="flex-1 space-y-1">
              <input
                id={id}
                type="text"
                value={(value as string) ?? ""}
                onChange={(e) => onChange(e.target.value)}
                required={field.required}
                placeholder="https://cdn.exemplo.com/imagem.jpg"
                className={`${inputBase} h-10`}
              />
              <span className="text-xs text-muted-foreground pl-1">URL externa ou local</span>
            </div>
          </div>
        </div>
      );

    case "select":
      return (
        <div className="space-y-2">
          <label className={labelStyle}>{field.label ?? field.name}</label>
          <div className="relative">
            <select 
              id={id} 
              value={(value as string) ?? ""} 
              onChange={(e) => onChange(e.target.value)}
              className={`${inputBase} h-10 appearance-none`}
            >
              <option value="">— Selecione —</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
      );

    case "boolean":
      return (
        <div 
          className="flex items-center justify-between p-4 bg-card rounded-lg border border-border cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => onChange(!value)}
        >
          <label htmlFor={id} className="text-sm font-medium text-foreground cursor-pointer">
            {field.label ?? field.name}
          </label>
          <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${value ? 'bg-brand-primary' : 'bg-muted'}`}>
             <div className={`w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </div>
      );

    case "date":
    case "number":
      return (
        <div className="space-y-2">
          <label className={labelStyle}>{field.label ?? field.name}</label>
          <input
            id={id}
            type={field.type}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
            required={field.required}
            className={`${inputBase} h-10`}
          />
        </div>
      );

    case "json":
      return (
        <div className="space-y-2">
          <label className={labelStyle}>{field.label ?? field.name} <span className="font-normal normal-case text-muted-foreground">(JSON)</span></label>
          <textarea
            id={id}
            value={typeof value === "string" ? value : JSON.stringify(value ?? [], null, 2)}
            onChange={(e) => onChange(e.target.value)}
            rows={5}
            className={`${inputBase} py-3 font-mono text-muted-foreground`}
            placeholder={`{ "id": "alpha", "params": [] }`}
          />
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className={labelStyle}>{field.label ?? field.name}</label>
            {AIButton}
          </div>
          <input
            id={id}
            type="text"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            className={`${inputBase} h-10`}
            placeholder={`${field.label ?? field.name}...`}
          />
        </div>
      );
  }
}
