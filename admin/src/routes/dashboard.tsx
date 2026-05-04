import { useEffect, useState, lazy, Suspense } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import { useSession, signOut, authClient } from "../lib/auth-client";
import { OrgSwitcher } from "../components/dashboard/OrgSwitcher";
import { UserDropdown } from "../components/dashboard/UserDropdown";
import { NAV, ADMIN_NAV, PAGE_META, isSuperAdminEmail } from "../components/dashboard/nav-config";
import NotificationBell from "../components/dashboard/NotificationBell";

const CommandPalette = lazy(() => import("../components/dashboard/CommandPalette"));

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

  const isSuperAdmin = session?.user?.role === 'admin' || isSuperAdminEmail(session?.user?.email);
  const members = (activeOrg as any)?.members || [];
  const myMembership = members.find((m: Record<string, unknown>) => m.userId === session?.user?.id || m.user?.email === session?.user?.email);
  const myRole = myMembership?.role || "member";

  const sysAdminRoutes = ['/organizations', '/users'];
  const isSysAdminMode = sysAdminRoutes.some(r => location.pathname.startsWith(r));

  const meta = PAGE_META[location.pathname] ?? { title: "Infraestrutura Canal", sub: "Painel de Controle" };

  async function handleSignOut() {
    await signOut({ fetchOptions: { onSuccess: () => navigate("/login") } });
  }

  return (
    <div className="flex h-screen w-full bg-background p-3 md:p-4 font-sans text-foreground overflow-hidden gap-4 selection:bg-brand-primary/30 selection:text-white">

      {/* ── Sidebar ── */}
      <aside role="complementary" aria-label="Menu de navegação" className={`shrink-0 flex flex-col bg-card border border-border rounded-2xl transition-[width] duration-300 ease-in-out overflow-hidden relative group/sidebar ${isMinimized ? 'w-[80px]' : 'w-[260px]'}`}>
        
        {/* Logo */}
        <div className="flex items-center h-16 px-6 shrink-0 justify-between">
          <h2 className={`text-xl tracking-tight select-none transition-opacity duration-300 ${isMinimized ? 'opacity-0 scale-50 absolute' : 'opacity-100 scale-100 relative'}`} style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}>
            canal<span className="text-brand-primary">.</span>
          </h2>
          <button
            onClick={toggleSidebar}
            className={`w-8 h-8 rounded-lg flex items-center justify-center bg-transparent border border-transparent text-zinc-400 hover:text-white hover:bg-muted/50 transition-all shrink-0 active:scale-95 ${isMinimized ? 'mx-auto w-10 h-10' : ''}`}
            aria-label="Toggle Sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-300 ${isMinimized ? 'rotate-180' : ''}`}>
               <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
        </div>

        {/* Org Switcher */}
        <div className={`py-4 shrink-0 border-b border-border ${isMinimized ? 'px-3' : 'px-6'}`}>
          {!isMinimized ? (
            <OrgSwitcher userEmail={session?.user?.email ?? ''} isSuperAdmin={isSuperAdmin} />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-muted/50 border border-border flex items-center justify-center mx-auto cursor-pointer hover:bg-muted transition-colors" title={activeOrg?.name}>
               <span className="font-bold text-xs text-zinc-300 uppercase">{activeOrg?.name?.substring(0, 2) || "NS"}</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav aria-label="Navegação principal" className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 py-6 scrollbar-hide">
          {(isSysAdminMode ? ADMIN_NAV : NAV).map((group) => {
            if (group.adminOnly && !isSuperAdmin) return null;
            if (group.ownerOnly && !isSuperAdmin && myRole !== "owner") return null;
            // RBAC: check group-level permission
            if (group.requiredPermission && !isSuperAdmin) {
              const groupAllowed = authClient.organization.checkRolePermission({
                permissions: group.requiredPermission,
                role: myRole,
              });
              if (!groupAllowed) return null;
            }

            const visibleItems = group.items.filter((item) => {
              if (item.adminOnly && !isSuperAdmin) return false;
              if (item.ownerOnly && !isSuperAdmin && myRole !== "owner") return false;
              // RBAC: check item-level permission
              if (item.requiredPermission && !isSuperAdmin) {
                return authClient.organization.checkRolePermission({
                  permissions: item.requiredPermission,
                  role: myRole,
                });
              }
              return true;
            });
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.section} className="space-y-1">
                {!isMinimized && (
                  <div className="px-6 mb-2">
                    <span className="text-xs font-semibold text-zinc-500">{group.section}</span>
                  </div>
                )}
                {isMinimized && <div className="h-px bg-muted/50 mx-6 my-2 opacity-50" />}
                <div className={`flex flex-col px-3 ${isMinimized ? 'gap-2 items-center' : 'gap-1'}`}>
                  {visibleItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      title={isMinimized ? item.label : undefined}
                      className={({ isActive }) => `
                        flex items-center outline-none group/nav transition-colors
                        ${isMinimized ? 'w-10 h-10 justify-center rounded-lg' : 'gap-3 px-3 h-10 rounded-lg w-full'}
                        ${isActive
                          ? 'bg-brand-primary/10 text-brand-primary font-medium'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-muted/50'}
                      `}
                    >
                      <span className={`shrink-0 ${isMinimized ? '[&>svg]:w-5 [&>svg]:h-5' : '[&>svg]:w-4 [&>svg]:h-4'}`}>{item.icon}</span>
                      {!isMinimized && <span className="text-sm font-medium truncate">{item.label}</span>}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Profile Area */}
        <div className={`shrink-0 py-4 border-t border-border ${isMinimized ? 'px-3 items-center flex flex-col' : 'px-6'}`}>
          {isMinimized ? (
            <button
              onClick={handleSignOut}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
              title="Encerrar Sessão"
              aria-label="Encerrar Sessão"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </button>
          ) : (
            <UserDropdown user={session?.user} isSuperAdmin={isSuperAdmin} onSignOut={handleSignOut} />
          )}
        </div>
      </aside>

      {/* ── Main Canvas ── */}
      <main role="main" aria-label="Conteúdo principal" className="flex-1 flex flex-col bg-background border border-border rounded-2xl overflow-hidden relative transition-all duration-300">
        
        {/* Header toolbar */}
        <header className="shrink-0 h-16 flex items-center justify-between px-6 md:px-8 border-b border-border bg-card/50  sticky top-0 z-10">
          <div className="flex flex-col">
             <h1 className="text-lg font-semibold text-white tracking-tight">{meta.title}</h1>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
              className="h-8 flex items-center gap-2 px-3 rounded-lg border border-border text-zinc-500 hover:text-zinc-300 hover:bg-muted/50 transition-colors text-xs"
              title="Busca Global (⌘K)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span className="hidden md:inline">Buscar...</span>
              <kbd className="hidden md:inline text-[10px] bg-muted/50 px-1.5 py-0.5 rounded border border-border">⌘K</kbd>
            </button>
            <NotificationBell />
            <button
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-zinc-400 hover:text-white hover:bg-muted/50 transition-colors"
              title={theme === 'light' ? 'Tema Escuro' : 'Tema Claro'}
              aria-label={theme === 'light' ? 'Alternar para tema escuro' : 'Alternar para tema claro'}
            >
               {theme === 'light' ? (
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
               ) : (
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
               )}
            </button>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-0 flex flex-col items-center bg-background">
          <Outlet />
        </div>
        <Suspense fallback={null}><CommandPalette /></Suspense>
      </main>
    </div>
  );
}
