import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";

export function UserDropdown({ user, isSuperAdmin, onSignOut }: { user: any, isSuperAdmin?: boolean, onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = user?.name ? user.name[0].toUpperCase() : 'A';

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-7 h-7 rounded-full bg-primary/80 text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0">
            {initial}
          </div>
          <div className="overflow-hidden text-left">
            <div className="text-[13px] font-semibold text-foreground truncate leading-tight">{user?.name || "Admin"}</div>
            <div className="text-[11px] text-muted-foreground truncate">{user?.email}</div>
          </div>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`}>
          <polyline points="18 15 12 9 6 15"/>
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute bottom-[calc(100%+12px)] left-0 right-0 z-100 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden radial-gradient-glass animate-in fade-in slide-in-from-bottom-2 duration-200">

          {/* Profile header */}
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="w-10 h-10 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-sm shrink-0 border border-brand-primary/20">
              {initial}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white truncate tracking-tight">{user?.name || "Admin"}</div>
              <div className="text-[10px] font-bold text-zinc-500 truncate uppercase tracking-widest">{user?.email}</div>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-2 space-y-1">
            <button
              onClick={() => { setOpen(false); navigate('/account'); }}
              className="w-full flex h-11 items-center gap-3 px-4 rounded-xl text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 shrink-0">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              Minha Conta
            </button>
            <button
              onClick={() => { setOpen(false); navigate('/saas-billing'); }}
              className="w-full flex h-11 items-center gap-3 px-4 rounded-xl text-[11px] font-bold uppercase tracking-widest text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 shrink-0">
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              Faturamento
            </button>
          </div>

          {isSuperAdmin && (
            <>
              <div className="h-px bg-white/10 mx-2" />
              <div className="p-2">
                <button
                  onClick={() => { setOpen(false); navigate('/organizations'); }}
                  className="w-full flex h-11 items-center gap-3 px-4 rounded-xl text-[11px] font-bold uppercase tracking-widest text-brand-primary hover:bg-brand-primary/10 transition-all"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d="M18 10h-1.26a8 8 0 1 0-9.48 0H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2zM12 10v4M10 14h4"/>
                  </svg>
                  Admin Console
                </button>
              </div>
            </>
          )}

          <div className="h-px bg-white/10 mx-2" />

          <div className="p-2">
            <button
              onClick={() => { setOpen(false); onSignOut(); }}
              className="w-full flex h-11 items-center gap-3 px-4 rounded-xl text-[11px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sair
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
