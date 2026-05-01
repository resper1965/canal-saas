import * as React from "react";
import { authClient, apiKey } from "../../lib/auth-client";
import { ApiDocsViewer } from "../ApiDocsViewer";
import { KeyIcon } from "./Icons";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  key?: string;
  createdAt: string;
  updatedAt: string;
}

export function ApiKeysTab({ org }: { org: any }) {
  const [name, setName] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [keyData, setKeyData] = React.useState<any>(null);
  const [error, setError] = React.useState("");
  const [keys, setKeys] = React.useState<ApiKey[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await authClient.$fetch(`/api/admin/api-keys/${org.id}`, { baseURL: window.location.origin });
      if (res.data) setKeys(res.data as unknown as ApiKey[]);
    } catch (e) {
      console.error("Failed to load keys", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchKeys();
  }, [org.id]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setGenerating(true);
    setError("");
    setKeyData(null);
    try {
      const res = await (apiKey as unknown as { create: (args: any) => Promise<any> }).create({
         name: name.trim(),
         metadata: { orgId: org.id }
      });
      if (res.data) {
         setKeyData(res.data);
         fetchKeys();
      }
      if (res.error) setError(res.error.message || "Erro ao criar API Key");
    } catch(e: any) {
      setError(e.message || "Erro inesperado.");
    } finally {
       setGenerating(false);
    }
  };

  const handleRevoke = async (id: string, keyName: string) => {
    if (!confirm(`Revogar a chave "${keyName}"? Integrações irão falhar imediatamente.`)) return;
    try {
      const res = await authClient.$fetch(`/api/admin/api-keys/${id}`, { 
        method: "DELETE", 
        baseURL: window.location.origin 
      });
      if ((res.data as { success?: boolean })?.success) {
         fetchKeys();
      } else {
         alert("Erro ao revogar.");
      }
    } catch(err: any) {
      alert("Erro: " + err.message);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) minmax(400px, 1fr)', gap: '24px', alignItems: 'start' }}>
      <div className="card">
        <div className="card-header">
           <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}><KeyIcon /> Tokens de Acesso (API Keys)</span>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 20 }}>
           Gere chaves para agentes MCP, crawlers e integrações M2M se conectarem ao Canal CMS em nome desta Organização.
        </p>

        {/* Form */}
        <div className="form">
          <div className="field">
             <label>Nome do Token</label>
             <input type="text" placeholder="Ex: Claude MCP Agent" value={name} onChange={e => setName(e.target.value)} disabled={!!keyData} />
          </div>
          {error && <div className="error-msg">{error}</div>}
          
          {keyData ? (
             <div style={{ background: "var(--bg-card)", border: "1px dashed var(--accent)", padding: 16, borderRadius: "var(--radius-md)", marginTop: 16 }}>
               <h4 style={{ margin: "0 0 8px 0", color: "var(--accent)" }}>Chave Gerada com Sucesso</h4>
               <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>Copie o token abaixo. Você não poderá vê-lo novamente.</p>
               <div style={{ position: "relative" }}>
                 <code style={{ display: "block", padding: "12px 14px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", wordBreak: "break-all", fontSize: 14 }}>
                   {keyData.key}
                 </code>
                 <button 
                    className="btn btn-sm btn-ghost" 
                    style={{ position: "absolute", right: 6, top: 6 }}
                    onClick={() => navigator.clipboard.writeText(keyData.key)}
                 >
                   Copiar
                 </button>
               </div>
               <button className="btn btn-secondary" style={{ marginTop: 16, width: "100%" }} onClick={() => { setKeyData(null); setName(""); }}>
                 Gerar outro
               </button>
             </div>
          ) : (
             <div className="action-row">
               <button className="btn btn-primary" onClick={handleCreate} disabled={generating || !name.trim()}>
                 {generating ? "Gerando..." : "Gerar Novo Token"}
               </button>
             </div>
          )}
        </div>

        {keys.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h4 style={{ fontSize: 14, marginBottom: 12 }}>Chaves Ativas</h4>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Chave</th>
                    <th>Criada em</th>
                    <th style={{ width: 80 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k) => (
                    <tr key={k.id}>
                      <td><strong>{k.name}</strong></td>
                      <td className="mono" style={{ fontSize: 13, color: "var(--text-muted)" }}>{k.prefix || "sk_"}••••••••</td>
                      <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{new Date(k.createdAt).toLocaleDateString("pt-BR")}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-ghost" 
                          style={{ color: "var(--danger)" }}
                          onClick={() => handleRevoke(k.id, k.name)}
                        >
                          Revogar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div style={{ position: 'sticky', top: '24px' }}>
        <ApiDocsViewer />
      </div>
    </div>
  );
}
