import * as React from "react";
import { BotIcon } from "./Icons";

export function OverviewTab({ org, agents }: { org: any; agents: any[] }) {
  const memberCount = org?.members?.length || 0;

  return (
    <>
      {/* Hero card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "var(--radius-sm)",
            background: "var(--accent-soft)", display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 24, fontWeight: 700, color: "var(--accent)",
            fontFamily: "var(--display)"
          }}>
            {(org?.name || "?")[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{org?.name}</h2>
            <span className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>{org?.slug}</span>
            <span className="badge badge-new" style={{ marginLeft: 10 }}>
              {(org?.metadata?.plan || "free").toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Membros</div>
          <div className="stat-value">{memberCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Plano</div>
          <div className="stat-value" style={{ fontSize: 22 }}>
            {(org?.metadata?.plan || "free").toUpperCase()}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">AI Agents</div>
          <div className="stat-value">{agents.length}</div>
        </div>
      </div>

      {/* Agents section */}
      <div className="card">
        <div className="card-header">
          <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BotIcon /> Agentes MCP
          </span>
        </div>
        {agents.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Modo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((a: any) => (
                  <tr key={a.id}>
                    <td className="mono">{a.name}</td>
                    <td><span className="badge badge-read">{a.mode}</span></td>
                    <td><span className="badge badge-new">{a.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <BotIcon />
            <p>Nenhum agente registrado.</p>
            <p className="hint">Agentes se registram via <code>/.well-known/agent-configuration</code></p>
          </div>
        )}
      </div>
    </>
  );
}
