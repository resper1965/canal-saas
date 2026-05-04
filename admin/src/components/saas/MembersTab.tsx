import * as React from "react";
import { organization } from "../../lib/auth-client";
import { UsersIcon, MailIcon, TrashIcon } from "./Icons";

function RoleBadge({ role }: { role: string }) {
  const r = role?.toLowerCase() || "member";
  return <span className={`badge-role badge-role-${r}`}>{r}</span>;
}

export function MembersTab({ org, isAdmin }: { org: any; isAdmin: boolean }) {
  const [inviteEmail, setInviteEmail] = React.useState("");
  const [inviteRole, setInviteRole] = React.useState("editor");
  const [inviting, setInviting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");

  const members = org?.members || [];

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setError("");
    setSuccess("");
    try {
      await organization.inviteMember({
        email: inviteEmail.trim(),
        role: inviteRole as any,
        organizationId: org.id,
      });
      setSuccess(`Convite enviado para ${inviteEmail}`);
      setInviteEmail("");
    } catch (e: any) {
      setError(e?.message || "Erro ao convidar membro");
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Remover este membro da organização?")) return;
    try {
      await organization.removeMember({
        memberIdOrEmail: memberId,
        organizationId: org.id,
      });
    } catch (e: any) {
      setError(e?.message || "Erro ao remover membro");
    }
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      await organization.updateMemberRole({
        memberId,
        role: newRole as "admin" | "member" | "owner",
        organizationId: org.id,
      });
    } catch (e: any) {
      setError(e?.message || "Erro ao alterar role");
    }
  };

  return (
    <>
      {/* Invite card */}
      {isAdmin && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MailIcon /> Convidar Membro
            </span>
          </div>
          <div className="form">
            <div className="form-row-2">
              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="colaborador@empresa.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                />
              </div>
              <div className="field">
                <label>Role</label>
                <select
                  className="role-select"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  style={{ padding: "10px 14px", fontSize: 14 }}
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                  <option value="compliance-officer">Compliance Officer</option>
                </select>
              </div>
            </div>
            {error && <div className="error-msg">{error}</div>}
            {success && <div style={{ color: "var(--success)", fontSize: 13 }}>{success}</div>}
            <div className="action-row">
              <button className="btn btn-primary" onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
                {inviting ? "Enviando..." : "Enviar Convite"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <UsersIcon /> Membros ({members.length})
          </span>
        </div>
        {members.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Role</th>
                  {isAdmin && <th style={{ width: 100 }}>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {members.map((m: any) => (
                  <tr key={m.id}>
                    <td>{m.user?.name || "—"}</td>
                    <td className="mono" style={{ fontSize: 12 }}>{m.user?.email || m.email}</td>
                    <td>
                      {isAdmin && m.role !== "owner" ? (
                        <select
                          className="role-select"
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.id, e.target.value)}
                        >
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                          <option value="compliance-officer">Compliance Officer</option>
                        </select>
                      ) : (
                        <RoleBadge role={m.role} />
                      )}
                    </td>
                    {isAdmin && (
                      <td>
                        {m.role !== "owner" && (
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemove(m.id)}
                            title="Remover membro"
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <UsersIcon />
            <p>Nenhum membro na organização.</p>
          </div>
        )}
      </div>
    </>
  );
}
