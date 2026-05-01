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
      <div className="flex p-1.5 bg-black/40 backdrop-blur-3xl rounded-2xl border border-white/5 radial-gradient-glass w-fit h-14 shrink-0 shadow-2xl relative overflow-hidden group">
        <div className="absolute -inset-10 bg-brand-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        {[
          { id: 'dsar', label: 'Gestão DSAR', icon: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></> },
          { id: 'whistleblower', label: 'Inteligência de Caso', icon: <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></> },
          { id: 'policies', label: 'Governança Tech', icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></> }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id as any)}
            className={`flex items-center gap-4 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic z-10 ${
              tab === item.id ? 'bg-brand-primary text-white shadow-2xl scale-[1.05]' : 'text-zinc-600 hover:text-zinc-300'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">{item.icon}</svg>
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-20 opacity-20"><div className="loader-inline scale-150 animate-pulse text-brand-primary" /></div>
      ) : (<>
      <TabPanel id="dsar" active={tab}>
        <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[56px] radial-gradient-glass overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between bg-white/2 gap-8">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-[24px] bg-white/2 border border-white/10 flex items-center justify-center text-brand-primary shadow-2xl">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
               </div>
               <div className="flex flex-col">
                  <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Protocolo DSAR</h2>
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic leading-none">Global Privacy Orchestrator Node</span>
               </div>
            </div>
            <button className="h-14 px-10 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/10 transition-all flex items-center gap-4 italic shadow-2xl group">
              <svg className="group-hover:rotate-12 transition-transform" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              Integrar OneTrust Protocol
            </button>
          </div>

          {dsars.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-32 text-center group">
               <div className="w-24 h-24 rounded-[40px] bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center mb-10 opacity-40 group-hover:scale-110 duration-1000 transition-transform shadow-2xl">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
               </div>
               <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-zinc-500 italic">Compliance Ativa</h4>
               <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-zinc-700 italic max-w-[400px] leading-loose">Nenhuma solicitação de acesso ou esquecimento detectada na fila de processamento.</p>
            </div>
          ) : (
            <div className="w-full overflow-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/5 bg-white/2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 italic">
                    <TableHead className="px-10 py-8">Protocolo</TableHead>
                    <TableHead className="px-10 py-8">Titular dos Dados</TableHead>
                    <TableHead className="px-10 py-8">Eixo de Requisição</TableHead>
                    <TableHead className="px-10 py-8">Status Operacional</TableHead>
                    <TableHead className="px-10 py-8">SLA Velocity</TableHead>
                    <TableHead className="px-10 py-8 text-right">Governança</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dsars.map(d => {
                    const sla = slaStatus(d.sla_deadline)
                    return (
                      <TableRow key={d.id} className="border-b border-white/5 transition-colors hover:bg-white/5 group">
                        <TableCell className="px-10 py-8">
                           <code className="font-mono text-[11px] font-black text-brand-primary tracking-[0.2em] select-all italic opacity-60 group-hover:opacity-100 transition-opacity">#{d.id.substring(0, 8).toUpperCase()}</code>
                        </TableCell>
                        <TableCell className="px-10 py-8">
                           <div className="flex flex-col">
                              <span className="text-sm font-black text-white uppercase italic tracking-tighter">{d.requester_name}</span>
                              <span className="text-[9px] font-bold text-zinc-600 lowercase tracking-widest leading-none mt-1">{d.requester_email}</span>
                           </div>
                        </TableCell>
                        <TableCell className="px-10 py-8">
                           <span className="inline-flex h-8 items-center px-4 rounded-xl bg-white/2 border border-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">
                              {DSAR_TYPES[d.request_type] || d.request_type}
                           </span>
                        </TableCell>
                        <TableCell className="px-10 py-8">
                           <span className={`inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] italic ${
                              d.status === 'resolved' ? 'text-emerald-500' :
                              d.status === 'rejected' ? 'text-red-500' :
                              d.status === 'in-progress' ? 'text-brand-primary' :
                              'text-amber-500'
                           }`}>
                              <span className={`w-2 h-2 rounded-full bg-current ${d.status !== 'resolved' ? 'animate-pulse' : ''} shadow-2xl shadow-current`} />
                              {d.status === 'resolved' ? 'Finalizado' : d.status === 'rejected' ? 'Bloqueado' : d.status === 'in-progress' ? 'Análise Ativa' : 'Backlog'}
                           </span>
                        </TableCell>
                        <TableCell className="px-10 py-8">
                           <span className={`inline-flex h-8 items-center px-5 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl italic ${sla.colorClass.replace(/bg-.*-500\/10/, 'bg-black/60')}`}>
                             {sla.label}
                           </span>
                        </TableCell>
                        <TableCell className="px-10 py-8 text-right">
                          <select 
                            value={d.status} 
                            onChange={e => updateDsar(d.id, e.target.value)} 
                            className="h-12 w-[180px] bg-black/60 border border-white/5 rounded-2xl px-5 text-[10px] font-black uppercase tracking-[0.2em] text-white outline-none focus:ring-2 focus:ring-brand-primary/40 cursor-pointer hover:bg-black transition-all shadow-2xl italic"
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
        <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[56px] radial-gradient-glass overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between bg-white/2 gap-8">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-[24px] bg-white/2 border border-white/10 flex items-center justify-center text-red-500 shadow-2xl">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
               </div>
               <div className="flex flex-col">
                  <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase text-red-500/80">Canal de Ética</h2>
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic leading-none">Intelligence Whistleblower Pipeline</span>
               </div>
            </div>
            <button className="h-14 px-10 rounded-2xl bg-white/2 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-500/10 transition-all italic flex items-center gap-4">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Gestão Externa de Integridade
            </button>
          </div>
          
          {cases.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-32 text-center group">
               <div className="w-24 h-24 rounded-[40px] bg-white/2 border border-white/5 flex items-center justify-center mb-10 opacity-20 shadow-2xl">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
               </div>
               <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-zinc-700 italic">Ambiente Ético Consolidado</h4>
               <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-zinc-800 italic max-w-[400px] leading-loose">Nenhum reporte de conduta ou desvio de protocolo identificado na estrutura.</p>
            </div>
          ) : (
            <div className="w-full overflow-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/5 bg-white/2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 italic">
                    <TableHead className="px-10 py-8">Case ID</TableHead>
                    <TableHead className="px-10 py-8">Classificação de Risco</TableHead>
                    <TableHead className="px-10 py-8">Estado de Auditoria</TableHead>
                    <TableHead className="px-10 py-8">SLA Response</TableHead>
                    <TableHead className="px-10 py-8 text-right">Gerenciamento</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cases.map(c => {
                    const sla = slaStatus(c.sla_deadline)
                    return (
                       <TableRow key={c.id} className="border-b border-white/5 transition-all hover:bg-red-500/30 group">
                        <TableCell className="px-10 py-8 font-mono text-[11px] font-black text-red-500/80 tracking-[0.3em] italic uppercase">
                           {c.case_code}
                        </TableCell>
                        <TableCell className="px-10 py-8">
                           <div className="text-sm font-black text-white italic tracking-tighter uppercase">{CASE_CATEGORIES[c.category] || "Geral/Outros"}</div>
                           <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Protocolo Interno: {c.id.substring(0, 4)}</span>
                        </TableCell>
                        <TableCell className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] italic">
                           <span className={`inline-flex items-center gap-3 ${
                              c.status === 'closed' ? 'text-emerald-500' :
                              c.status === 'investigating' ? 'text-brand-primary' :
                              'text-red-500 animate-pulse'
                           }`}>
                              <span className="w-2.5 h-2.5 rounded-full bg-current shadow-2xl" />
                              {c.status === 'closed' ? 'Encerrado' : c.status === 'investigating' ? 'Investigação Ativa' : 'Prioridade: Crítica'}
                           </span>
                        </TableCell>
                        <TableCell className="px-10 py-8">
                           <span className={`inline-flex h-8 items-center px-5 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl italic ${sla.colorClass.replace(/bg-.*-500\/10/, 'bg-black/60')}`}>
                             {sla.label}
                           </span>
                        </TableCell>
                        <TableCell className="px-10 py-8 text-right">
                          <select 
                            value={c.status} 
                            onChange={e => updateCase(c.id, e.target.value)} 
                            className="h-12 w-[180px] bg-black/60 border border-white/5 rounded-2xl px-5 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:ring-2 focus:ring-red-500/40 cursor-pointer shadow-2xl italic"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Policy Creation Panel */}
          <div className="lg:col-span-4 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[48px] radial-gradient-glass shadow-2xl overflow-hidden p-10 space-y-10 h-fit">
               <div className="space-y-2">
                 <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Mint Policy</h2>
                 <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic leading-none">Cunhagem de Instrumentos Pro-Max</span>
               </div>
               
               <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] px-1 italic">Domínio Legal</label>
                       <select value={newPolicy.type} onChange={e => setNewPolicy(p => ({ ...p, type: e.target.value }))} className="h-12 w-full bg-black/40 border border-white/5 rounded-2xl px-5 text-[10px] font-black text-white uppercase tracking-[0.2em] italic focus:ring-2 focus:ring-brand-primary/40 outline-none transition-all">
                          <option value="privacy">PRIVACIDADE</option>
                          <option value="terms">TERMOS E USO/EULA</option>
                          <option value="cookie">COOKIES GOV</option>
                          <option value="lgpd">DPA / SCCs</option>
                       </select>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] px-1 italic">Locale Protocol</label>
                       <select value={newPolicy.locale} onChange={e => setNewPolicy(p => ({ ...p, locale: e.target.value }))} className="h-12 w-full bg-black/40 border border-white/5 rounded-2xl px-5 text-[10px] font-black text-white uppercase italic focus:ring-2 focus:ring-brand-primary/40 outline-none transition-all">
                          <option value="pt">PT-BR (Brazil)</option>
                          <option value="en">EN-US (Global)</option>
                          <option value="es">ES-ES (Iberia)</option>
                       </select>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                     <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] px-1 italic">Título do Documento</label>
                     <input type="text" placeholder="Instance Policy Name" value={newPolicy.title} onChange={e => setNewPolicy(p => ({ ...p, title: e.target.value }))} className="h-12 w-full bg-black/40 border border-white/5 rounded-2xl px-5 text-sm font-black text-white italic placeholder:text-zinc-800 focus:ring-2 focus:ring-brand-primary/40 outline-none transition-all uppercase tracking-tighter" />
                  </div>
                  
                  <div className="space-y-3">
                     <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] px-1 italic">Structure (MD Protocol)</label>
                     <textarea placeholder="## 1. Governance Provisions..." value={newPolicy.body_md} onChange={e => setNewPolicy(p => ({ ...p, body_md: e.target.value }))} rows={12} className="w-full bg-black/40 border border-white/5 rounded-3xl p-6 text-[13px] font-bold italic font-mono text-zinc-400 placeholder:text-zinc-800 focus:ring-2 focus:ring-brand-primary/40 outline-none resize-none leading-relaxed transition-all" />
                  </div>
                  
                  <button className="relative group w-full h-14 rounded-2xl bg-brand-primary text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(0,173,232,0.4)] hover:scale-[1.05] active:scale-95 transition-all overflow-hidden italic" onClick={createPolicy} disabled={!newPolicy.title || !newPolicy.body_md}>
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    Publicar Protocolo v1.0
                  </button>
               </div>
          </div>
          
          {/* Policies Directory */}
          <div className="lg:col-span-8 bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[48px] radial-gradient-glass overflow-hidden shadow-2xl flex flex-col min-h-[700px]">
               <div className="p-10 border-b border-white/5 bg-white/2 space-y-2">
                  <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">Governance Directory</h2>
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic leading-none">Active Policy Ledger Set</span>
               </div>
               
               {policies.length === 0 ? (
                 <div className="flex-1 flex flex-col items-center justify-center p-32 text-center opacity-20 group">
                    <div className="w-24 h-24 rounded-[40px] bg-white/2 border border-white/5 mb-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-1000">
                       <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-zinc-600 italic">Repositório Criptográfico Vazio</h4>
                    <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-zinc-800 italic max-w-[400px] leading-loose">Nenhum instrumento jurídico foi autenticado neste nó de governança.</p>
                 </div>
               ) : (
                 <div className="w-full overflow-auto custom-scrollbar flex-1">
                   <Table>
                     <TableHeader>
                       <TableRow className="border-b border-white/5 bg-white/2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 italic">
                         <TableHead className="px-10 py-8">Instance Document</TableHead>
                         <TableHead className="px-10 py-8">Locale</TableHead>
                         <TableHead className="px-10 py-8">Ledger v.</TableHead>
                         <TableHead className="px-10 py-8">Protocol Status</TableHead>
                         <TableHead className="px-10 py-8 text-right">Audit Timestamp</TableHead>
                       </TableRow>
                     </TableHeader>
                     <TableBody>
                       {policies.map(p => (
                         <TableRow key={p.id} className="border-b border-white/5 transition-all hover:bg-white/5 group">
                           <TableCell className="px-10 py-8">
                              <div className="font-black text-white tracking-tighter text-sm uppercase italic group-hover:text-brand-primary transition-colors">{p.title}</div>
                              <span className="inline-flex mt-2 items-center rounded-lg bg-white/2 border border-white/5 px-3 py-1 text-[8px] font-black uppercase text-zinc-600 tracking-[0.3em] italic">
                                 LEGAL://{p.type.toUpperCase()}
                              </span>
                           </TableCell>
                           <TableCell className="px-10 py-8">
                              <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl border border-white/10 font-black text-[10px] uppercase text-white bg-black/40 shadow-2xl italic tracking-widest">
                                 {p.locale}
                              </span>
                           </TableCell>
                           <TableCell className="px-10 py-8 font-mono font-black tracking-[0.3em] text-brand-primary text-xs italic">v{p.version}.0</TableCell>
                           <TableCell className="px-10 py-8">
                              <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] border italic ${
                                 p.status === 'published' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5 shadow-2xl shadow-emerald-500/10' : 'text-zinc-600 border-white/5 bg-white/2'
                              }`}>
                                 {p.status === 'published' ? 'Publicado' : 'Draft Node'}
                              </span>
                           </TableCell>
                           <TableCell className="px-10 py-8 text-right font-mono text-[10px] font-black text-zinc-700 uppercase tracking-tighter italic">
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
