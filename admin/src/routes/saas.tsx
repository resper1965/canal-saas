import * as React from "react";
import { authClient } from "../lib/auth-client";
import { ShieldIcon } from "../components/saas/Icons";
import { OverviewTab } from "../components/saas/OverviewTab";
import { MembersTab } from "../components/saas/MembersTab";
import { PlanTab } from "../components/saas/PlanTab";
import { SettingsTab } from "../components/saas/SettingsTab";
import { ApiKeysTab } from "../components/saas/ApiKeysTab";
import { UsageTab } from "../components/saas/UsageTab";

type Tab = "overview" | "members" | "plan" | "usage" | "settings" | "api-keys";

import { isSuperAdminEmail } from "../components/dashboard/nav-config";

/* ── Main Page ────────────────────────────────────── */
export default function SaasSettingsPage() {
  const { data: session } = authClient.useSession();
  const { data: activeOrg } = authClient.useActiveOrganization();
  const [agents, setAgents] = React.useState<any[]>([]);
  const [activeTab, setActiveTab] = React.useState<Tab>("overview");

  React.useEffect(() => {
    // Agents fetched via different API layer if needed
    setAgents([]);
  }, []);

  // Determine user role in this org
  const userEmail = session?.user?.email || "";
  const isSuperAdmin = isSuperAdminEmail(userEmail);
  const myMembership = activeOrg?.members?.find((m: Record<string, unknown>) => m.user?.email === userEmail || m.userId === session?.user?.id);
  const myRole = myMembership?.role || "member";
  const isAdmin = isSuperAdmin || myRole === "owner" || myRole === "admin";
  const isEditor = isAdmin || myRole === "member";

  // Define visible tabs based on role
  const tabs: { key: Tab; label: string; visible: boolean; icon: React.ReactNode }[] = [
    { key: "overview", label: "Visão Geral", visible: true, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg> },
    { key: "members", label: "Membros", visible: isEditor, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { key: "plan", label: "Plano & Billing", visible: true, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
    { key: "usage", label: "Uso", visible: true, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg> },
    { key: "api-keys", label: "Developer API", visible: isAdmin, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
    { key: "settings", label: "Configurações", visible: isAdmin, icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg> },
  ];

  if (!activeOrg) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
         <div className="flex-1 flex flex-col items-center justify-center p-20 rounded-xl border border-border bg-background text-center">
            <div className="h-16 w-16 rounded-full bg-card border border-border text-zinc-400 flex items-center justify-center mb-6 shadow-sm">
               <ShieldIcon />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">Nenhuma Organização Focada</h2>
            <p className="text-sm font-medium text-zinc-500 mt-2 max-w-md">
               Acesso restrito ao painel SaaS. Você precisa selecionar ativamente um grupo inquilino na barra de contexto lateral para visualizar este painel.
            </p>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 border-b border-border pb-6 shrink-0">
         <div>
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
               SaaS Config
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
               Gerenciador do Espaço de Trabalho Virtual
            </p>
         </div>

         {/* Apple Segmented Control */}
         <div className="inline-flex h-10 items-center justify-center rounded-lg bg-card border border-border p-1 text-zinc-400 w-full xl:w-auto flex-nowrap overflow-x-auto overflow-y-hidden custom-scrollbar">
            {tabs.filter(t => t.visible).map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer outline-none ${
                  activeTab === t.key
                    ? "bg-muted text-white shadow-sm"
                    : "hover:text-zinc-300 hover:bg-muted/50"
                }`}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
         </div>
      </div>

      <div>
        {activeTab === "overview" && <OverviewTab org={activeOrg} agents={agents} />}
        {activeTab === "members" && isEditor && <MembersTab org={activeOrg} isAdmin={isAdmin} />}
        {activeTab === "plan" && <PlanTab org={activeOrg} />}
        {activeTab === "usage" && <UsageTab org={activeOrg} />}
        {activeTab === "api-keys" && isAdmin && <ApiKeysTab org={activeOrg} />}
        {activeTab === "settings" && isAdmin && <SettingsTab org={activeOrg} />}
      </div>
    </div>
  );
}
