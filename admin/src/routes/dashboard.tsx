import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import { useSession, signOut, authClient } from "../lib/auth-client";
import { OrgSwitcher } from "../components/dashboard/OrgSwitcher";
import { UserDropdown } from "../components/dashboard/UserDropdown";
import { NAV, ADMIN_NAV, PAGE_META, SUPER_ADMIN_EMAILS } from "../components/dashboard/nav-config";

function useSidebarCollapse() {
  const key = 'canal_sidebar_minimized';
  const [isMinimized, setIsMinimized] = useState(() => {
    try { return localStorage.getItem(key) === 'true'; } catch { return false; }
  });
  const toggleSidebar = () => {
    setIsMinimized(prev => {
      const next = !prev;
      localStorage.setItem(key, String(next));
      return next;
    });
  };
  return { isMinimized, toggleSidebar };
}

function useTheme() {
  const key = 'canal_theme';
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored === 'light' || stored === 'dark') return stored;
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    } catch {}
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem(key, theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  return { theme, toggleTheme };
}

export default function DashboardLayout() {
  const { data: session, isPending } = useSession();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isMinimized, toggleSidebar } = useSidebarCollapse();

  useEffect(() => {
    if (!isPending && !session) navigate("/login");
  }, [session, isPending, navigate]);

  if (isPending) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="loader-inline" /></div>;
  if (!session) return null;

  const isSuperAdmin = session?.user?.role === 'admin' || SUPER_ADMIN_EMAILS.includes(session?.user?.email ?? '');
  const myMembership = activeOrg?.members?.find((m: any) => m.userId === session?.user?.id || m.user?.email === session?.user?.email);
  const myRole = myMembership?.role || "member";

  const sysAdminRoutes = ['/organizations', '/users'];
  const isSysAdminMode = sysAdminRoutes.some(r => location.pathname.startsWith(r));

  const meta = PAGE_META[location.pathname] ?? { title: "Infraestrutura Canal", sub: "Painel de Controle" };

  async function handleSignOut() {
    await signOut({ fetchOptions: { onSuccess: () => navigate("/login") } });
  }

  return (
    <div className="flex h-screen w-full bg-[#030303] p-5 md:p-8 font-sans text-foreground overflow-hidden gap-8 selection:bg-brand-primary selection:text-white">

      {/* ── Sidebar: The Glass Pillar Architecture ── */}
      <aside className={`shrink-0 flex flex-col bg-black/40 backdrop-blur-3xl border border-white/5 shadow-[0_60px_120px_-20px_rgba(0,0,0,0.9)] rounded-[56px] transition-[width] duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden relative group/sidebar ${isMinimized ? 'w-[120px]' : 'w-[340px]'}`}>
        
        {/* Logo Node: Identity Signature */}
        <div className="flex items-center h-28 px-10 shrink-0 justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-primary/5 blur-[80px] opacity-40 group-hover/sidebar:opacity-100 transition-opacity duration-1000 pointer-events-none" />
          <h2 className={`font-black text-3xl tracking-tighter select-none transition-all duration-700 relative z-10 italic uppercase leading-none group-hover:scale-105 origin-left ${isMinimized ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
            CANAL<span className="text-brand-primary font-black not-italic ml-1">.</span>
          </h2>
          <button
            onClick={toggleSidebar}
            className="w-14 h-14 rounded-2xl flex items-center justify-center bg-white/2 border border-white/5 text-zinc-600 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all shrink-0 active:scale-90 shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className={`transition-transform duration-1000 ${isMinimized ? 'rotate-180' : ''}`}>
               <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
        </div>

        {/* Global Identity Switcher: Multi-Tenancy Node */}
        <div className={`pb-10 shrink-0 relative z-10 ${isMinimized ? 'px-6' : 'px-10'}`}>
          {!isMinimized ? (
            <div className="animate-in fade-in zoom-in-95 duration-700">
              <OrgSwitcher userEmail={session?.user?.email ?? ''} isSuperAdmin={isSuperAdmin} />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-[22px] bg-white/2 border border-white/10 flex items-center justify-center mx-auto shadow-2xl group/org cursor-pointer hover:bg-brand-primary/10 hover:border-brand-primary/30 transition-all duration-500" title={activeOrg?.name}>
               <span className="font-black text-xs uppercase text-brand-primary italic">{activeOrg?.name?.substring(0, 2) || "NS"}</span>
            </div>
          )}
        </div>

        {/* Tactical Navigation Area: Command Protocol */}
        <nav className={`flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-10 pb-10 relative z-10 ${isMinimized ? 'px-6' : 'px-8'}`}>
          {(isSysAdminMode ? ADMIN_NAV : NAV).map((group) => {
            if (group.adminOnly && !isSuperAdmin) return null;
            if (group.ownerOnly && !isSuperAdmin && myRole !== "owner") return null;

            const visibleItems = group.items.filter((item) => {
              if (item.adminOnly && !isSuperAdmin) return false;
              if (item.ownerOnly && !isSuperAdmin && myRole !== "owner") return false;
              return true;
            });
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.section} className="space-y-4">
                {!isMinimized && (
                  <div className="px-6">
                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] italic leading-none">{group.section}</span>
                  </div>
                )}
                {isMinimized && <div className="h-px bg-white/5 mx-4 opacity-50" />}
                <div className={`flex flex-col ${isMinimized ? 'gap-3 items-center' : 'gap-1.5'}`}>
                  {visibleItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      title={isMinimized ? item.label : undefined}
                      className={({ isActive }) => `
                        relative flex items-center transition-all duration-500 outline-none group/nav overflow-hidden
                        ${isMinimized ? 'w-16 h-16 justify-center rounded-[22px] mx-auto' : 'gap-5 px-6 h-14 rounded-[22px] border border-transparent'}
                        ${isActive
                          ? 'bg-brand-primary/10 text-white font-black shadow-[0_20px_40px_rgba(0,0,0,0.3)] border-white/5 scale-[1.03] before:absolute before:left-0 before:h-8 before:w-1.5 before:bg-brand-primary before:rounded-r-full group-hover/nav:bg-brand-primary/15'
                          : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/2'}
                      `}
                    >
                      <span className={`shrink-0 transition-all duration-700 group-hover/nav:scale-110 group-hover/nav:text-brand-primary ${isMinimized ? '[&>svg]:w-[28px] [&>svg]:h-[28px]' : '[&>svg]:w-[22px] [&>svg]:h-[22px]'}`}>{item.icon}</span>
                      {!isMinimized && <span className="text-[14px] font-bold uppercase tracking-tighter truncate italic">{item.label}</span>}
                      {isMinimized ? null : (
                         <div className="ml-auto opacity-0 group-hover/nav:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-500 text-brand-primary">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="m9 18 6-6-6-6"/></svg>
                         </div>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Tactical Base: Node Telemetry & Identity */}
        <div className={`shrink-0 flex flex-col gap-6 py-10 border-t border-white/5 relative z-10 ${isMinimized ? 'px-6 items-center' : 'px-10'}`}>
          {!isMinimized && (
            <div className="flex items-center gap-5 bg-black/40 rounded-[24px] p-5 border border-white/5 shadow-inner group/telemetry cursor-default overflow-hidden relative">
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/telemetry:opacity-100 transition-opacity duration-1000" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.7)] shrink-0"></span>
              <div className="flex flex-col overflow-hidden relative z-10">
                 <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] truncate group-hover:text-emerald-400 transition-colors italic">Ecosystem Protected</span>
                 <span className="text-[9px] font-mono font-black text-zinc-700 uppercase tracking-tighter truncate mt-1">Signal strength 99.8% / sync 8ms</span>
              </div>
            </div>
          )}

          {isMinimized ? (
            <button
              onClick={handleSignOut}
              className="w-16 h-16 flex items-center justify-center rounded-[22px] bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-500 shadow-2xl active:scale-90"
              title="Encerrar Sessão"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          ) : (
            <UserDropdown user={session?.user} isSuperAdmin={isSuperAdmin} onSignOut={handleSignOut} />
          )}
        </div>
      </aside>

      {/* ── Main Canvas: The Spatial Depth Dynamic ── */}
      <main className="flex-1 flex flex-col bg-black/40 backdrop-blur-3xl border border-white/5 shadow-[0_80px_160px_-20px_rgba(0,0,0,1)] rounded-[56px] overflow-hidden relative transition-all duration-1000">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(0,173,232,0.05),transparent_70%)] pointer-events-none" />

        {/* Global Control Toolbar */}
        <header className="shrink-0 h-28 flex items-center justify-between px-12 md:px-20 border-b border-white/5 relative z-10">
          <div className="flex flex-col gap-2">
             <h1 className="text-3xl font-black text-white tracking-tighter italic uppercase leading-none">{meta.title}</h1>
             <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em] italic leading-none">{meta.sub || "Operational Interface"}</p>
          </div>
          <button
            onClick={toggleTheme}
            className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/2 border border-white/10 text-zinc-700 hover:text-white hover:bg-white/5 transition-all duration-700 shadow-2xl active:scale-90 group/theme overflow-hidden relative"
            title={theme === 'light' ? 'Override: Dark Architecture' : 'Override: Light Architecture'}
          >
            <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover/theme:opacity-100 transition-opacity" />
            <div className="group-hover/theme:rotate-[360deg] transition-transform duration-1000 relative z-10">
               {theme === 'light' ? (
                 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
               ) : (
                 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
               )}
            </div>
          </button>
        </header>

        {/* Global Viewport Architecture */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-0 flex flex-col items-center">
          <Outlet />
        </div>
      </main>
    </div>


  );
}
