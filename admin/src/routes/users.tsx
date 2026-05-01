import { useEffect, useState } from "react";
import { authClient, admin } from "../lib/auth-client";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";

export default function UsersPage() {
  const { data: session } = authClient.useSession();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const SUPER_ADMIN_EMAILS = ["resper@bekaa.eu", "admin@ness.com.br", "resper@ness.com.br"];
  const isSuperAdmin = session?.user?.role === 'admin' || SUPER_ADMIN_EMAILS.includes(session?.user?.email || "");

  useEffect(() => {
    if (isSuperAdmin) {
      fetchUsers();
    } else {
      setLoading(false);
      setErrorMsg("Acesso restrito a Super Admins.");
    }
  }, [isSuperAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await admin.listUsers({ query: { limit: 100 } });
      if (res.data?.users) {
        setUsers(res.data.users);
      } else if (res.error) {
        setErrorMsg(res.error.message || "Erro ao buscar usuários");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro de conexão ao buscar usuários");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: "user" | "admin") => {
    const res = await admin.setRole({ userId, role: newRole });
    if (!res.error) fetchUsers();
    else alert(res.error.message);
  };

  const handleBan = async (userId: string, isBanned: boolean) => {
    if (!confirm(`Deseja realmente ${isBanned ? 'desbanir' : 'banir'} este usuário da infraestrutura?`)) return;
    const res = isBanned ? await admin.unbanUser({ userId }) : await admin.banUser({ userId });
    if (!res.error) fetchUsers();
    else alert(res.error.message);
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex flex-col items-center justify-center p-20 rounded-xl border border-red-500/20 bg-background/50">
          <div className="h-20 w-20 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-6 border border-red-500/20 shadow-sm animate-pulse">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h2 className="text-lg font-semibold text-foreground">Acesso Negado</h2>
          <p className="text-muted-foreground font-medium mt-2 max-w-md text-center">{errorMsg}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

      {errorMsg && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 flex items-start gap-3">
          <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          }>
            IAM Usuários
          </CardTitle>
          <CardAction>
            <Badge variant="neutral">
              <span className="font-mono">T: {users.length}</span>
            </Badge>
          </CardAction>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-20 animate-pulse"><div className="loader-inline" /></div>
          ) : (
            <div className="w-full overflow-x-auto min-w-0 max-w-full custom-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/20 text-xs text-muted-foreground text-left">
                    <th className="font-semibold py-3 px-5">Identidade</th>
                    <th className="font-semibold py-3 px-4">Email</th>
                    <th className="font-semibold py-3 px-4">Privilégio</th>
                    <th className="font-semibold py-3 px-4">Estado</th>
                    <th className="font-semibold py-3 px-5 text-right w-[150px]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u: any) => {
                    const isBanned = u.banned;
                    return (
                      <tr key={u.id} className={`border-b border-border/20 transition-colors ${isBanned ? 'bg-red-500/5' : 'hover:bg-muted/30'}`}>
                        <td className="py-3 px-5">
                          <div className="font-medium text-sm text-foreground flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs border border-primary/20 shrink-0">
                              {u.name?.charAt(0) || '?'}
                            </div>
                            {u.name || "N/A"}
                          </div>
                          <div className="text-[10px] font-mono text-muted-foreground mt-1 ml-11 opacity-70">ID: {u.id}</div>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-muted-foreground">{u.email}</td>
                        <td className="py-3 px-4">
                          <select
                            className="h-8 w-[130px] rounded-lg border border-border bg-background px-2 text-xs transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer"
                            value={u.role || "user"}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as "user" | "admin")}
                            disabled={u.email === session?.user?.email}
                          >
                            <option value="user">Member</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={isBanned ? "error" : "ok"}>
                            {isBanned ? "Banido" : "Ativo"}
                          </Badge>
                        </td>
                        <td className="py-3 px-5 flex justify-end">
                          <button
                            className={`inline-flex h-8 items-center justify-center rounded-lg border text-xs font-medium px-3 transition-all ${
                              isBanned
                                ? 'border-border bg-background hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                                : 'border-border bg-background hover:bg-red-500 hover:text-white hover:border-red-500'
                            }`}
                            onClick={() => handleBan(u.id, isBanned)}
                            disabled={u.email === session?.user?.email}
                          >
                            {isBanned ? "Desbanir" : "Banir"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
