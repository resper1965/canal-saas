import React, { useEffect, useState } from "react";
import { authClient } from "../lib/auth-client";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

interface Organization {
  id: string;
  name: string;
  slug: string;
  metadata: string | Record<string, unknown>;
  createdAt: string;
  memberCount: number;
}

export default function OrganizationsPage() {
  const { data: session } = authClient.useSession();
  const [organizations, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const SUPER_ADMIN_EMAILS = ["resper@bekaa.eu", "admin@ness.com.br", "resper@ness.com.br"];
  const isSuperAdmin = session?.user?.role === 'admin' || SUPER_ADMIN_EMAILS.includes(session?.user?.email || "");

  useEffect(() => {
    if (isSuperAdmin) {
      fetchOrganizations();
    } else {
      setLoading(false);
      setErrorMsg("Acesso restrito a Super Admins.");
    }
  }, [isSuperAdmin]);

  const fetchOrganizations = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const req = await authClient.$fetch("/api/admin/organizations", {
        baseURL: window.location.origin
      });
      if (req.error) {
        setErrorMsg((req.error as { message?: string }).message ?? "Erro ao carregar organizações.");
      } else {
        setOrgs((req.data as Organization[]) || []);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro de conexão ao buscar organizações");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePlan = async (org: Organization, plan: string) => {
    if (!confirm(`Mudar o plano da organização ${org.name} para ${plan.toUpperCase()}?`)) return;
    const metadata = { ...(typeof org.metadata === 'string' ? JSON.parse(org.metadata || "{}") : org.metadata), plan };
    try {
      const req = await authClient.$fetch(`/api/admin/organizations/${org.id}`, {
        method: "PATCH",
        baseURL: window.location.origin,
        body: { metadata }
      });
      if ((req.data as { success?: boolean })?.success) {
        fetchOrganizations();
      } else {
        alert("Erro ao atualizar plano.");
      }
    } catch (err: any) {
      alert("Erro: " + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmName = prompt(`CUIDADO: Escreva "${name}" para excluir esta organização DEFINITIVAMENTE.`);
    if (confirmName !== name) return;
    
    try {
      const req = await authClient.$fetch(`/api/admin/organizations/${id}`, {
        method: "DELETE",
        baseURL: window.location.origin
      });
      if ((req.data as { success?: boolean })?.success) {
        fetchOrganizations();
      } else {
        alert("Erro ao excluir.");
      }
    } catch (err: any) {
      alert("Erro: " + err.message);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
         <div className="flex-1 flex flex-col items-center justify-center p-20 rounded-2xl border border-red-500/20 bg-background/50">
            <div className="h-20 w-20 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-6 border border-red-500/20 shadow-sm animate-pulse">
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <h2 className="text-lg font-semibold tracking-tighter text-foreground uppercase">Acesso Negado</h2>
            <p className="text-muted-foreground font-medium mt-2 max-w-md text-center">{errorMsg}</p>
         </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-6 relative shrink-0">
        <div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-border/60 to-transparent"></div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-3">
             <svg className="text-muted-foreground/60" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 10h16M4 14h16M4 6h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><path d="M8 10v4M16 10v4"/></svg>
            Cloud Platform <span className="text-muted-foreground/30 font-light mx-1">/</span> Tenant Ops
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Instâncias Multi-Tenant e Provisionamento
          </p>
        </div>
      </div>

      {errorMsg && (
         <div className="p-4 rounded-xl border bg-red-500/10 border-red-500/30 text-red-500 flex items-start gap-4 shadow-sm">
            <div className="mt-0.5 inline-flex items-center justify-center p-1 rounded-md bg-red-500/20 border border-red-500/30">
              <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <span className="text-sm font-bold tracking-wide">{errorMsg}</span>
         </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Instâncias Aprovadas</CardTitle>
          <CardAction>
            <Badge variant="neutral">
              <span className="font-mono">Nodes: {organizations.length}</span>
            </Badge>
          </CardAction>
        </CardHeader>
        
        {loading ? (
          <div className="flex justify-center p-20 animate-pulse"><div className="loader-inline" /></div>
        ) : (
           <div className="w-full overflow-x-auto min-w-0 max-w-full custom-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-background/40 text-xs tracking-tight text-muted-foreground text-left">
                  <th className="font-bold py-3 px-6">Estrutura Org. (Tenant)</th>
                  <th className="font-bold py-3 px-4">Identifier / Slug</th>
                  <th className="font-bold py-3 px-4">Policy / Billing</th>
                  <th className="font-bold py-3 px-4 text-center">Seats Utilizados</th>
                  <th className="font-bold py-3 px-6 text-right w-[150px]">Diretiva</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((o: any) => {
                  let meta = o.metadata || {};
                  if (typeof meta === "string") {
                    try { meta = JSON.parse(meta); } catch(e){}
                  }
                  
                  return (
                    <tr key={o.id} className="border-b border-border/20 transition-colors hover:bg-muted/30">
                      <td className="py-3 px-6">
                        <div className="font-bold text-sm text-foreground">{o.name}</div>
                        <div className="text-xs uppercase font-mono text-muted-foreground mt-1.5 tracking-wider opacity-70">ID: {o.id}</div>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono font-medium text-muted-foreground">
                        <span className="bg-muted/50 border border-border/60 font-medium tracking-wide px-2 py-0.5 rounded-md text-xs uppercase text-foreground">{o.slug}</span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          className="flex h-9 w-[140px] items-center justify-between rounded-xl border border-border/50 bg-background/50 px-3 py-1 text-xs tracking-tight transition-all hover:bg-background focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary font-bold appearance-none cursor-pointer"
                          value={meta.plan || "free"}
                          onChange={(e) => handleUpdatePlan(o, e.target.value)}
                        >
                          <option value="free">Tier: FREE</option>
                          <option value="pro">Tier: PRO</option>
                          <option value="enterprise">Tier: ENTERPRISE</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-center">
                         <span className="inline-flex shadow-sm items-center justify-center bg-accent/10 border-accent/20 text-accent font-mono w-8 h-8 rounded-full text-xs font-semibold border">
                            {o.memberCount || 0}
                         </span>
                      </td>
                      <td className="py-3 px-6 text-right">
                        <button
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent hover:border-red-500/40 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all focus:outline-none shadow-sm shadow-transparent hover:shadow-red-500/20"
                          onClick={() => handleDelete(o.id, o.name)}
                          title="Purge Tenant"
                        >
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
