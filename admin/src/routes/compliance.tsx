import { useEffect, useState } from 'react'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/Table";
import { authClient } from '../lib/auth-client'
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "../components/ui/Card"
import { TabGroup, TabPanel } from "../components/ui/Tabs"
import { EmptyState } from "../components/ui/EmptyState"


interface DSARRequest {
  id: string; requester_name: string; requester_email: string; request_type: string;
  status: string; sla_deadline: string; created_at: string; description?: string;
}
interface WhistleblowerCase {
  id: string; case_code: string; category: string; status: string;
  sla_deadline: string; created_at: string;
}
interface Policy {
  id: string; type: string; locale: string; title: string; body_md: string;
  version: number; status: string; effective_date?: string; created_at: string;
}

const API = import.meta.env.VITE_CANAL_URL || ''

const DSAR_TYPES: Record<string, string> = {
  'access': 'Acesso aos Dados',
  'deletion': 'Exclusão/Esquecimento',
  'portability': 'Portabilidade',
  'correction': 'Correção de Dados',
  'revocation': 'Revogação de Consentimento',
}

const CASE_CATEGORIES: Record<string, string> = {
  'harassment': 'Assédio/Conduta',
  'corruption': 'Corrupção/Fraude',
  'security': 'Segurança/Vulnerabilidade',
  'discrimination': 'Discriminação',
  'other': 'Outros Incidentes',
}

export default function CompliancePage() {
  const [tab, setTab] = useState<'dsar' | 'whistleblower' | 'policies'>('dsar')
  const [dsars, setDsars] = useState<DSARRequest[]>([])
  const [cases, setCases] = useState<WhistleblowerCase[]>([])
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    Promise.all([
      fetch(`${API}/api/admin/dsar?tenant_id=ness`, { headers, credentials: 'include' }).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/admin/whistleblower?tenant_id=ness`, { headers, credentials: 'include' }).then(r => r.json()).catch(() => []),
      fetch(`${API}/api/admin/policies?tenant_id=ness`, { headers, credentials: 'include' }).then(r => r.json()).catch(() => []),
    ]).then(([d, w, p]) => {
      setDsars(Array.isArray(d) ? d : [])
      setCases(Array.isArray(w) ? w : [])
      setPolicies(Array.isArray(p) ? p : [])
      setLoading(false)
    })
  }, [])

  const updateDsar = async (id: string, status: string) => {
    await fetch(`${API}/api/admin/dsar/${id}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, tenant_id: 'ness' }),
    })
    setDsars(prev => prev.map(d => d.id === id ? { ...d, status } : d))
  }

  const updateCase = async (id: string, status: string) => {
    await fetch(`${API}/api/admin/whistleblower/${id}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setCases(prev => prev.map(c => c.id === id ? { ...c, status } : c))
  }

  const [newPolicy, setNewPolicy] = useState({ type: 'privacy', locale: 'pt', title: '', body_md: '' })
  const createPolicy = async () => {
    if (!newPolicy.title || !newPolicy.body_md) return
    const res = await fetch(`${API}/api/admin/policies`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newPolicy, tenant_id: 'ness' }),
    })
    const data = await res.json()
    if (data.success) {
      setPolicies(prev => [{ ...newPolicy, id: data.id, version: 1, status: 'draft', created_at: new Date().toISOString() }, ...prev])
      setNewPolicy({ type: 'privacy', locale: 'pt', title: '', body_md: '' })
    }
  }

  function slaStatus(deadline: string) {
    const d = new Date(deadline)
    const now = new Date()
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return { label: `${Math.abs(diff)}d atrasado`, colorClass: 'text-red-500 bg-red-500/10 border border-red-500/20' }
    if (diff <= 3) return { label: `${diff}d restantes`, colorClass: 'text-amber-500 bg-amber-500/10 border border-amber-500/20' }
    return { label: `${diff}d restantes`, colorClass: 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20' }
  }

  return (
    <div className="max-w-[1750px] w-full px-10 md:px-12 py-10 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 overflow-hidden flex flex-col">
      
      {/* ── System Segmented Controls ── */}
      <div className="flex p-1 bg-card border border-border rounded-md w-fit h-10 shrink-0">
        {[
          { id: 'dsar', label: 'Gestão DSAR', icon: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></> },
          { id: 'whistleblower', label: 'Inteligência de Caso', icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></> },
          { id: 'policies', label: 'Governança Tech', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></> }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as any)}
            className={`flex items-center gap-2 px-4 rounded text-sm font-medium transition-colors ${
              tab === item.id ? 'bg-muted text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-300 hover:bg-muted/50'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{item.icon}</svg>
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-20 opacity-20"><div className="loader-inline scale-150 animate-pulse text-brand-primary" /></div>
      ) : (<>
      <TabPanel id="dsar" active={tab}>
        <div className="bg-background border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-md bg-card border border-border flex items-center justify-center text-brand-primary">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
               </div>
               <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-white tracking-tight">Protocolo DSAR</h2>
                  <span className="text-sm font-medium text-zinc-500 mt-1">Global Privacy Orchestrator Node</span>
               </div>
            </div>
            <button className="h-9 px-4 rounded-md bg-card border border-border text-white text-sm font-medium hover:bg-muted/50 transition-colors flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              Integrar OneTrust Protocol
            </button>
          </div>

          {dsars.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
               <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
               </div>
               <h4 className="text-sm font-bold text-white">Compliance Ativa</h4>
               <p className="mt-1 text-sm text-zinc-500 max-w-sm">Nenhuma solicitação de acesso ou esquecimento detectada na fila de processamento.</p>
            </div>
          ) : (
            <div className="w-full overflow-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-background text-xs font-medium text-zinc-400">
                    <TableHead className="px-6 py-4">Protocolo</TableHead>
                    <TableHead className="px-6 py-4">Titular dos Dados</TableHead>
                    <TableHead className="px-6 py-4">Eixo de Requisição</TableHead>
                    <TableHead className="px-6 py-4">Status Operacional</TableHead>
                    <TableHead className="px-6 py-4">SLA Velocity</TableHead>
                    <TableHead className="px-6 py-4 text-right">Governança</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dsars.map(d => {
                    const sla = slaStatus(d.sla_deadline)
                    return (
                      <TableRow key={d.id} className="border-b border-border hover:bg-muted/50">
                        <TableCell className="px-6 py-4">
                           <code className="font-mono text-xs text-brand-primary">#{d.id.substring(0, 8).toUpperCase()}</code>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                           <div className="flex flex-col">
                              <span className="text-sm font-medium text-white">{d.requester_name}</span>
                              <span className="text-xs text-zinc-500 mt-1">{d.requester_email}</span>
                           </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                           <span className="inline-flex items-center px-2 py-1 rounded bg-card border border-border text-xs font-medium text-zinc-300">
                              {DSAR_TYPES[d.request_type] || d.request_type}
                           </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                           <span className={`inline-flex items-center gap-2 text-xs font-medium ${
                              d.status === 'resolved' ? 'text-emerald-500' :
                              d.status === 'rejected' ? 'text-red-500' :
                              d.status === 'in-progress' ? 'text-brand-primary' :
                              'text-amber-500'
                           }`}>
                              <span className={`w-1.5 h-1.5 rounded-full bg-current ${d.status !== 'resolved' ? 'animate-pulse' : ''}`} />
                              {d.status === 'resolved' ? 'Finalizado' : d.status === 'rejected' ? 'Bloqueado' : d.status === 'in-progress' ? 'Análise Ativa' : 'Backlog'}
                           </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                           <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${sla.colorClass.replace(/bg-.*-500\/10/, 'bg-card')}`}>
                             {sla.label}
                           </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <select 
                            value={d.status} 
                            onChange={e => updateDsar(d.id, e.target.value)} 
                            className="h-8 w-[140px] bg-card border border-border rounded px-2 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            <option value="received">PROTOCOLAR</option>
                            <option value="in-progress">ANALISAR</option>
                            <option value="resolved">DEFERIR</option>
                            <option value="rejected">INDEFERIR</option>
                          </select>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </TabPanel>

      <TabPanel id="whistleblower" active={tab}>
        <div className="bg-background border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-md bg-card border border-border flex items-center justify-center text-red-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
               </div>
               <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-white tracking-tight">Canal de Ética</h2>
                  <span className="text-sm font-medium text-zinc-500 mt-1">Intelligence Whistleblower Pipeline</span>
               </div>
            </div>
            <button className="h-9 px-4 rounded-md bg-card border border-border text-white text-sm font-medium hover:bg-muted/50 transition-colors flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Gestão Externa de Integridade
            </button>
          </div>
          
          {cases.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 text-center">
               <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mb-4 text-zinc-500">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
               </div>
               <h4 className="text-sm font-bold text-white">Ambiente Ético Consolidado</h4>
               <p className="mt-1 text-sm text-zinc-500 max-w-sm">Nenhum reporte de conduta ou desvio de protocolo identificado na estrutura.</p>
            </div>
          ) : (
            <div className="w-full overflow-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border bg-background text-xs font-medium text-zinc-400">
                    <TableHead className="px-6 py-4">Case ID</TableHead>
                    <TableHead className="px-6 py-4">Classificação de Risco</TableHead>
                    <TableHead className="px-6 py-4">Estado de Auditoria</TableHead>
                    <TableHead className="px-6 py-4">SLA Response</TableHead>
                    <TableHead className="px-6 py-4 text-right">Gerenciamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.map(c => {
                    const sla = slaStatus(c.sla_deadline)
                    return (
                       <TableRow key={c.id} className="border-b border-border hover:bg-muted/50">
                        <TableCell className="px-6 py-4 font-mono text-xs text-red-500">
                           {c.case_code}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                           <div className="text-sm font-medium text-white">{CASE_CATEGORIES[c.category] || "Geral/Outros"}</div>
                           <span className="text-xs text-zinc-500 mt-1">Protocolo Interno: {c.id.substring(0, 4)}</span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-xs font-medium">
                           <span className={`inline-flex items-center gap-2 ${
                              c.status === 'closed' ? 'text-emerald-500' :
                              c.status === 'investigating' ? 'text-brand-primary' :
                              'text-red-500'
                           }`}>
                              <span className={`w-1.5 h-1.5 rounded-full bg-current ${c.status === 'new' ? 'animate-pulse' : ''}`} />
                              {c.status === 'closed' ? 'Encerrado' : c.status === 'investigating' ? 'Investigação Ativa' : 'Prioridade: Crítica'}
                           </span>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                           <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${sla.colorClass.replace(/bg-.*-500\/10/, 'bg-card')}`}>
                             {sla.label}
                           </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <select 
                            value={c.status} 
                            onChange={e => updateCase(c.id, e.target.value)} 
                            className="h-8 w-[140px] bg-card border border-border rounded px-2 text-xs text-zinc-300 outline-none focus:ring-1 focus:ring-red-500 cursor-pointer hover:bg-muted/50 transition-colors"
                          >
                            <option value="new">PROTOCOLO</option>
                            <option value="investigating">APURAR</option>
                            <option value="closed">ARQUIVAR</option>
                          </select>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </TabPanel>

      <TabPanel id="policies" active={tab}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Policy Creation Panel */}
          <div className="lg:col-span-4 bg-background border border-border rounded-xl overflow-hidden p-6 space-y-6 h-fit">
               <div className="space-y-1">
                 <h2 className="text-xl font-bold tracking-tight text-white">Mint Policy</h2>
                 <span className="text-sm font-medium text-zinc-500">Cunhagem de Instrumentos Pro-Max</span>
               </div>
               
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-xs font-medium text-zinc-400">Domínio Legal</label>
                       <select value={newPolicy.type} onChange={e => setNewPolicy(p => ({ ...p, type: e.target.value }))} className="h-10 w-full bg-card border border-border rounded text-sm text-zinc-300 px-3 focus:ring-1 focus:ring-brand-primary outline-none transition-all">
                          <option value="privacy">PRIVACIDADE</option>
                          <option value="terms">TERMOS E USO/EULA</option>
                          <option value="cookie">COOKIES GOV</option>
                          <option value="lgpd">DPA / SCCs</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-xs font-medium text-zinc-400">Locale Protocol</label>
                       <select value={newPolicy.locale} onChange={e => setNewPolicy(p => ({ ...p, locale: e.target.value }))} className="h-10 w-full bg-card border border-border rounded text-sm text-zinc-300 px-3 focus:ring-1 focus:ring-brand-primary outline-none transition-all">
                          <option value="pt">PT-BR (Brazil)</option>
                          <option value="en">EN-US (Global)</option>
                          <option value="es">ES-ES (Iberia)</option>
                       </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-xs font-medium text-zinc-400">Título do Documento</label>
                     <input type="text" placeholder="Instance Policy Name" value={newPolicy.title} onChange={e => setNewPolicy(p => ({ ...p, title: e.target.value }))} className="h-10 w-full bg-card border border-border rounded px-3 text-sm font-medium text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-brand-primary outline-none transition-all" />
                  </div>
                  
                  <div className="space-y-2">
                     <label className="text-xs font-medium text-zinc-400">Structure (MD Protocol)</label>
                     <textarea placeholder="## 1. Governance Provisions..." value={newPolicy.body_md} onChange={e => setNewPolicy(p => ({ ...p, body_md: e.target.value }))} rows={12} className="w-full bg-card border border-border rounded p-4 text-sm font-mono text-zinc-300 placeholder:text-zinc-600 focus:ring-1 focus:ring-brand-primary outline-none resize-none leading-relaxed transition-all" />
                  </div>
                  
                  <button className="w-full h-10 rounded bg-brand-primary text-white text-sm font-medium hover:brightness-110 transition-colors disabled:opacity-50" onClick={createPolicy} disabled={!newPolicy.title || !newPolicy.body_md}>
                    Publicar Protocolo v1.0
                  </button>
               </div>
          </div>
          
          {/* Policies Directory */}
          <div className="lg:col-span-8 bg-background border border-border rounded-xl overflow-hidden flex flex-col min-h-[700px]">
               <div className="p-6 border-b border-border space-y-1">
                  <h2 className="text-xl font-bold tracking-tight text-white">Governance Directory</h2>
                  <span className="text-sm font-medium text-zinc-500">Active Policy Ledger Set</span>
               </div>
               
               {policies.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center mb-4 text-zinc-500">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <h4 className="text-sm font-bold text-white">Repositório Vazio</h4>
                    <p className="mt-1 text-sm text-zinc-500 max-w-sm">Nenhum instrumento jurídico foi autenticado neste nó de governança.</p>
                 </div>
               ) : (
                 <div className="w-full overflow-auto custom-scrollbar flex-1">
                   <Table>
                     <TableHeader>
                       <TableRow className="border-b border-border bg-background text-xs font-medium text-zinc-400">
                         <TableHead className="px-6 py-4">Instance Document</TableHead>
                         <TableHead className="px-6 py-4">Locale</TableHead>
                         <TableHead className="px-6 py-4">Ledger v.</TableHead>
                         <TableHead className="px-6 py-4">Protocol Status</TableHead>
                         <TableHead className="px-6 py-4 text-right">Audit Timestamp</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {policies.map(p => (
                         <TableRow key={p.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                           <TableCell className="px-6 py-4">
                              <div className="font-medium text-white text-sm hover:text-brand-primary transition-colors">{p.title}</div>
                              <span className="inline-flex mt-1 items-center rounded bg-card border border-border px-2 py-0.5 text-xs font-medium text-zinc-500">
                                 LEGAL://{p.type.toUpperCase()}
                              </span>
                           </TableCell>
                           <TableCell className="px-6 py-4">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded border border-border font-medium text-xs text-zinc-300 bg-card">
                                 {p.locale}
                              </span>
                           </TableCell>
                           <TableCell className="px-6 py-4 font-mono font-medium text-brand-primary text-xs">v{p.version}.0</TableCell>
                           <TableCell className="px-6 py-4">
                              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                 p.status === 'published' ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-500 bg-card border border-border'
                              }`}>
                                 {p.status === 'published' ? 'Publicado' : 'Draft Node'}
                              </span>
                           </TableCell>
                           <TableCell className="px-6 py-4 text-right font-mono text-xs text-zinc-500">
                             {new Date(p.created_at).toLocaleString('pt-BR')}
                           </TableCell>
                         </TableRow>
                       ))}
                     </TableBody>
                   </Table>
                 </div>
               )}
          </div>
        </div>
      </TabPanel>
      </>)}
    </div>


  )
}
