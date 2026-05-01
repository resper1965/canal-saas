import { useState, useEffect, useRef } from "react";
import { authClient, organization } from "../../lib/auth-client";

export function OrgSwitcher({ userEmail, isSuperAdmin }: { userEmail: string; isSuperAdmin: boolean }) {
  const { data: activeOrg } = authClient.useActiveOrganization();
  const { data: orgs } = authClient.useListOrganizations();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Auto-activate ness for super admins who don't have an active org
  useEffect(() => {
    if (isSuperAdmin && !activeOrg && orgs?.length) {
      const globalOrg = orgs.find((o: any) => o.slug === 'ness-global') || orgs.find((o: any) => o.slug === 'ness') || orgs[0];
      if (globalOrg) {
        organization.setActive({ organizationId: globalOrg.id });
      }
    }
  }, [isSuperAdmin, activeOrg, orgs]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setCreating(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSwitch = async (orgId: string) => {
    await organization.setActive({ organizationId: orgId });
    setOpen(false);
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const { data } = await organization.create({ name: newName, slug });
      if (data) await organization.setActive({ organizationId: data.id });
      setNewName("");
      setCreating(false);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const orgName = activeOrg?.name || "Workspace";
  const orgSlug = activeOrg?.slug || userEmail.split("@")[1]?.split(".")[0];

  return (
    <div className="org-switcher" ref={ref}>
      <button
        className={`w-full flex h-11 items-center justify-between gap-3 px-4 rounded-xl border transition-all duration-300 group ${open ? 'bg-white/10 border-white/20 shadow-xl' : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'}`}
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-col items-start overflow-hidden">
          <div className="text-[13px] font-bold text-white tracking-tight truncate leading-tight">{orgName}</div>
          {orgSlug && <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate">{orgSlug}</div>}
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 text-zinc-500 transition-transform duration-300 ${open ? 'rotate-180 text-white' : 'group-hover:text-zinc-300'}`}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="absolute top-[calc(100%+12px)] left-0 right-0 z-100 rounded-2xl border border-white/10 bg-black/80 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden radial-gradient-glass animate-in fade-in slide-in-from-top-2 duration-200 p-1.5 space-y-1">
          {orgs?.map((o: any) => (
            <button
              key={o.id}
              className={`w-full flex h-11 items-center justify-between px-4 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${activeOrg?.id === o.id ? "bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-lg" : "text-zinc-400 hover:bg-white/5 hover:text-white"}`}
              onClick={() => handleSwitch(o.id)}
            >
              <span className="truncate">{o.name}</span>
              {activeOrg?.id === o.id && (
                <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
          <div className="h-px bg-white/10 mx-2" />

          {isSuperAdmin && (
            creating ? (
              <div className="p-3 space-y-3 bg-white/2 rounded-xl border border-white/5 mx-1">
                <input
                  autoFocus
                  placeholder="Nome da organização"
                  value={newName}
                  className="w-full h-11 px-4 bg-black/40 border border-white/10 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white outline-none focus:border-brand-primary/50 transition-all"
                  aria-label="Nome da organização"
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                <div className="flex gap-2">
                  <button className="flex-1 h-11 rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:bg-white/5 transition-all" onClick={() => { setCreating(false); setNewName(""); }}>
                    Cancelar
                  </button>
                  <button className="flex-1 h-11 rounded-xl bg-brand-primary text-white text-[10px] font-bold uppercase tracking-widest shadow-lg hover:brightness-110 transition-all disabled:opacity-50" onClick={handleCreate} disabled={loading || !newName.trim()}>
                    {loading ? "..." : "Criar"}
                  </button>
                </div>
              </div>
            ) : (
              <button className="w-full flex h-11 items-center gap-3 px-4 rounded-xl text-[11px] font-bold uppercase tracking-widest text-brand-primary hover:bg-brand-primary/10 transition-all" onClick={() => setCreating(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Nova Organização
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
