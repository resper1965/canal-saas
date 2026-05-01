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
      className="group relative flex items-center gap-2 px-5 h-9 bg-brand-primary text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all overflow-hidden"
    >
      <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="relative z-10 animate-pulse"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>
      <span className="relative z-10 italic">Magic Gen</span>
    </button>
  ) : null;

  const labelStyle = "text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 block italic";
  const inputBase = "w-full rounded-2xl border border-white/5 bg-black/40 px-5 text-sm font-bold text-zinc-300 shadow-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:bg-white/5 transition-all duration-300";

  switch (field.type) {
    case "textarea":
    case "richtext":
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className={labelStyle}>
              {field.label ?? field.name}
              {field.type === "richtext" && <span className="ml-3 text-brand-primary/50 text-[8px] font-black">[RENDER ENGINE: MD/HTML]</span>}
            </label>
            {AIButton}
          </div>
          <textarea
            id={id}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            required={field.required}
            rows={field.type === "richtext" ? 14 : 4}
            className={`${inputBase} py-5 ${field.type === "richtext" ? 'font-mono text-zinc-400' : ''}`}
            placeholder={`Protocolo de entrada para ${field.label ?? field.name}...`}
          />
        </div>
      );

    case "image":
      return (
        <div className="space-y-4">
          <label className={labelStyle}>
            {field.label ?? field.name} (Asset Index URL)
          </label>
          <div className="flex gap-6 items-center">
            <div className="flex-none h-24 w-24 rounded-[32px] border border-white/5 bg-black/40 overflow-hidden shadow-2xl flex items-center justify-center radial-gradient-glass group/asset">
              {value ? (
                 <img src={value as string} alt="Preview" className="h-full w-full object-cover transition-transform duration-700 group-hover/asset:scale-110" />
              ) : (
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-800"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input
                id={id}
                type="text"
                value={(value as string) ?? ""}
                onChange={(e) => onChange(e.target.value)}
                required={field.required}
                placeholder="https://cloud.ness.dev/assets/..."
                className={`${inputBase} h-14`}
              />
              <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest pl-4">Path Externo ou Local Node</span>
            </div>
          </div>
        </div>
      );

    case "select":
      return (
        <div className="space-y-4">
          <label className={labelStyle}>{field.label ?? field.name}</label>
          <div className="relative group">
            <select 
              id={id} 
              value={(value as string) ?? ""} 
              onChange={(e) => onChange(e.target.value)}
              className={`${inputBase} h-14 appearance-none`}
            >
              <option value="" className="bg-zinc-900">— SELECTION REQUIRED —</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt} className="bg-zinc-900 font-bold uppercase tracking-widest">
                  {opt}
                </option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600 group-hover:text-brand-primary transition-colors">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
      );

    case "boolean":
      return (
        <div 
          className="flex items-center justify-between p-6 bg-white/2 rounded-[32px] border border-white/5 shadow-2xl group/check cursor-pointer hover:bg-white/4 transition-all duration-500"
          onClick={() => onChange(!value)}
        >
          <div className="space-y-1">
            <label htmlFor={id} className="text-[11px] font-black uppercase tracking-widest text-zinc-400 group-hover/check:text-white transition-colors cursor-pointer">
              {field.label ?? field.name}
            </label>
            <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest block">Operational Toggle State</span>
          </div>
          <div className={`w-12 h-6 rounded-full p-1 transition-all duration-500 ${value ? 'bg-brand-primary shadow-[0_0_15px_rgba(0,173,232,0.4)]' : 'bg-zinc-800'}`}>
             <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-500 ${value ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
        </div>
      );

    case "date":
    case "number":
      return (
        <div className="space-y-4">
          <label className={labelStyle}>{field.label ?? field.name}</label>
          <input
            id={id}
            type={field.type}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)}
            required={field.required}
            className={`${inputBase} h-14`}
          />
        </div>
      );

    case "json":
      return (
        <div className="space-y-4">
          <label className={labelStyle}>{field.label ?? field.name} (Object Configuration JSON)</label>
          <textarea
            id={id}
            value={typeof value === "string" ? value : JSON.stringify(value ?? [], null, 2)}
            onChange={(e) => onChange(e.target.value)}
            rows={5}
            className={`${inputBase} py-6 font-mono text-zinc-500`}
            placeholder={`{ "id": "alpha", "params": [] }`}
          />
        </div>
      );

    default:
      return (
        <div className="space-y-4">
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
            className={`${inputBase} h-14`}
            placeholder={`Protocolo de entrada...`}
          />
        </div>
      );
  }
}
