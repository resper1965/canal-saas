import React, { useState, useEffect } from 'react';
import { TabGroup, TabPanel } from "../components/ui/Tabs";

function GithubKanbanTab() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/automation/github/issues');
      if (!res.ok) throw new Error('Falha ao conectar.');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setIssues(data);
      setError(null);
    } catch (e: any) {
      setError(e.message || 'Erro de API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const todo = issues.filter(i => i.status === 'todo');
  const inProgress = issues.filter(i => i.status === 'in-progress');
  const done = issues.filter(i => i.status === 'done');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between bg-background border border-border p-6 rounded-xl">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-white">GitHub Projects Kanban</h2>
          <p className="text-sm font-medium text-zinc-500">Software Engineering Operational Board</p>
        </div>
        <button 
          onClick={fetchIssues} 
          disabled={loading} 
          className="h-10 px-6 flex items-center bg-card border border-border text-white text-sm font-medium rounded-md hover:bg-muted transition-colors disabled:opacity-50"
        >
          {loading ? 'Sincronizando Core...' : 'Sync Repository'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Todo Column */}
        <div className="rounded-xl flex flex-col h-full min-h-[600px] bg-background border border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-card">
            <span className="flex items-center gap-2 text-sm font-semibold text-zinc-400">
               <div className="w-2 h-2 rounded-full bg-zinc-600" /> Backlog
            </span>
            <span className="h-6 px-3 rounded-full bg-muted text-xs font-medium text-zinc-400 flex items-center justify-center">{loading ? '...' : todo.length}</span>
          </div>
          <div className="p-4 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-28 rounded-lg bg-card animate-pulse" />)
            ) : todo.map((issue: any) => (
              <a href={issue.url} target="_blank" rel="noreferrer" key={issue.id} className="block p-4 rounded-lg bg-card border border-border hover:bg-muted transition-colors group/card">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-xs font-semibold text-zinc-400">Ness.Engine</span>
                   <span className="text-xs font-mono text-zinc-500">#{issue.id}</span>
                </div>
                <h4 className="text-sm font-medium text-white group-hover/card:text-brand-primary">{issue.title}</h4>
                {issue.labels && issue.labels.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {issue.labels.map((l: string) => <span key={l} className="text-[10px] font-medium bg-muted text-zinc-400 px-2 py-0.5 rounded">{l}</span>)}
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="rounded-xl flex flex-col h-full min-h-[600px] bg-background border border-brand-primary/30 overflow-hidden relative">
          <div className="px-6 py-4 border-b border-brand-primary/20 flex justify-between items-center bg-brand-primary/5">
            <span className="flex items-center gap-2 text-sm font-semibold text-brand-primary">
               <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse shadow-[0_0_8px_rgba(0,173,232,0.8)]" /> Active Sprint
            </span>
            <span className="h-6 px-3 rounded-full bg-brand-primary/20 text-xs font-medium text-brand-primary flex items-center justify-center">{loading ? '...' : inProgress.length}</span>
          </div>
          <div className="p-4 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-28 rounded-lg bg-card animate-pulse" />)
            ) : inProgress.map((issue: any) => (
              <a href={issue.url} target="_blank" rel="noreferrer" key={issue.id} className="block p-4 rounded-lg bg-brand-primary/10 border border-brand-primary/30 hover:bg-brand-primary/20 transition-colors relative group/active">
                <div className="absolute top-4 right-4 animate-pulse">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                </div>
                <div className="flex justify-between items-start mb-2">
                   <span className="text-xs font-semibold text-brand-primary">Priority Node</span>
                   <span className="text-xs font-mono text-brand-primary/60">#{issue.id}</span>
                </div>
                <h4 className="text-sm font-medium text-white">{issue.title}</h4>
                {issue.labels && issue.labels.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {issue.labels.map((l: string) => <span key={l} className="text-[10px] font-medium bg-brand-primary/20 text-brand-primary px-2 py-0.5 rounded">{l}</span>)}
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Done Column */}
        <div className="rounded-xl flex flex-col h-full min-h-[600px] bg-background border border-border overflow-hidden opacity-60 hover:opacity-100 transition-opacity duration-300">
          <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-card">
            <span className="flex items-center gap-2 text-sm font-semibold text-emerald-500">
               <div className="w-2 h-2 rounded-full bg-emerald-500" /> Done
            </span>
            <span className="h-6 px-3 rounded-full bg-emerald-500/10 text-xs font-medium text-emerald-500 flex items-center justify-center">{loading ? '...' : done.length}</span>
          </div>
          <div className="p-4 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-16 rounded-lg bg-card animate-pulse" />)
            ) : done.slice(0, 15).map((issue: any) => (
               <a href={issue.url} target="_blank" rel="noreferrer" key={issue.id} className="block p-3 rounded-lg bg-card border border-border hover:bg-muted transition-colors group/done">
                <h4 className="text-sm font-medium line-through text-zinc-500 group-hover/done:text-emerald-500 transition-colors line-clamp-1">{issue.title}</h4>
                <div className="flex justify-between items-baseline mt-2">
                   <span className="text-xs font-mono text-zinc-600">#{issue.id}</span>
                   <span className="text-xs text-emerald-500">Verified</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AutomationDashboard() {
  const [activeTab, setActiveTab] = useState('social');
  const [socialBrief, setSocialBrief] = useState('');
  const [socialPlatform, setSocialPlatform] = useState('linkedin');
  const [socialDraft, setSocialDraft] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  const handleGenerateSocial = async () => {
    if (!socialBrief) return;
    setIsDrafting(true);
    setSocialDraft('Iniciando Orquestração Generativa v4...');
    try {
      const res = await fetch('/api/automation/social-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: socialPlatform, brief: socialBrief })
      });
      const data = await res.json();
      if (data.success) {
        setSocialDraft(data.text);
      } else {
        setSocialDraft('Erro no Pipeline: ' + (data.error || 'Cognitive Timeout.'));
      }
    } catch (e) {
      setSocialDraft('Critical: Falha de conexão com Ness.Brain.');
    } finally {
      setIsDrafting(false);
    }
  };

  const handlePublish = async (isScheduled: boolean) => {
    if (!socialDraft) return;
    try {
      await fetch('/api/automation/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: socialPlatform,
          content: socialDraft,
          scheduled_at: isScheduled ? new Date(Date.now() + 86400000).toISOString() : undefined 
        })
      });
      alert(isScheduled ? 'Inserido na Task Queue de 24h.' : 'Ativo Social Publicado com Sucesso.');
      setSocialDraft('');
      setSocialBrief('');
    } catch (e) {
      alert('Erro Crítico na Publicação.');
    }
  };

  return (
    <div className="max-w-[1700px] w-full px-10 md:px-12 py-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Tab Controller Engine */}
      <div className="flex items-center justify-center">
        <TabGroup
          tabs={[
            { id: 'social', label: 'POSTS IA', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> },
            { id: 'newsletter', label: 'CAMPAIGNS', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> },
            { id: 'github', label: 'GITHUB CORE', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg> },
            { id: 'brandbook', label: 'HANDOFF', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg> },
          ]}
          active={activeTab}
          onChange={setActiveTab}
          className="h-10 bg-background border border-border p-1 rounded-lg"
        />
      </div>

      <div className="min-h-[600px] relative">
        <TabPanel id="social" active={activeTab}>
            <div className="bg-background rounded-xl border border-border overflow-hidden flex flex-col">
              <div className="px-8 py-6 border-b border-border bg-card">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <h2 className="text-xl font-bold tracking-tight text-white">Generative Social Engine</h2>
                       <p className="text-sm font-medium text-zinc-500">LLM-Dynamic Cross-Platform Ingestion</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                    </div>
                 </div>
              </div>
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-zinc-400">Target Platform</label>
                    <div className="relative group">
                      <select 
                        value={socialPlatform}
                        onChange={e => setSocialPlatform(e.target.value)}
                        className="h-10 w-full rounded-md border border-border bg-card px-4 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors appearance-none cursor-pointer">
                        <option value="linkedin">LinkedIn Executive Protocol</option>
                        <option value="instagram">Instagram Visual Meta</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-semibold text-zinc-400">Orchestration Brief</label>
                    <input 
                      value={socialBrief}
                      onChange={e => setSocialBrief(e.target.value)}
                      className="h-10 w-full rounded-md border border-border bg-card px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors placeholder:text-zinc-600" placeholder="Conceito, notícias ou insights do setor..." />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-semibold text-zinc-400">Cognitive Post Output</label>
                    <button 
                      onClick={handleGenerateSocial}
                      disabled={isDrafting || !socialBrief}
                      className="h-10 px-6 flex items-center bg-card border border-border text-white text-sm font-medium rounded-md hover:bg-muted transition-colors disabled:opacity-50">
                      {isDrafting ? 'Propagando Tokens...' : 'Start Brainstorming'}
                    </button>
                  </div>
                  <div className="relative group/textarea">
                    <textarea 
                      value={socialDraft}
                      onChange={(e) => setSocialDraft(e.target.value)}
                      className="min-h-[250px] w-full rounded-md border border-border bg-card p-4 text-sm font-mono text-zinc-300 transition-colors placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-brand-primary resize-none leading-relaxed" placeholder="O output generativo final será transposto aqui após a orquestração." />
                  </div>
                </div>
                
                <div className="flex gap-3 justify-end pt-6 border-t border-border">
                  <button 
                    onClick={() => handlePublish(true)}
                    disabled={!socialDraft || isDrafting}
                    className="h-10 px-6 rounded-md bg-card border border-border hover:bg-muted text-sm font-medium text-white transition-colors disabled:opacity-50">
                    Queue Protocol (24h)
                  </button>
                  <button 
                    onClick={() => handlePublish(false)}
                    disabled={!socialDraft || isDrafting}
                    className="h-10 px-6 rounded-md bg-brand-primary text-white text-sm font-medium hover:brightness-110 transition-colors disabled:opacity-50">
                    Execute Live Push
                  </button>
                </div>
              </div>
            </div>
        </TabPanel>

        <TabPanel id="newsletter" active={activeTab}>
            <div className="bg-background rounded-xl border border-border min-h-[500px] flex flex-col items-center justify-center p-20 text-center">
              <div className="h-16 w-16 mb-6 rounded-2xl bg-card border border-border flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-500">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white mb-2">Draft Engine: Offline</h3>
              <p className="text-sm text-zinc-500 max-w-sm">Nenhuma campanha orquestrada. Inicie um draft para habilitar seu SMTP relay pipeline.</p>
              <button className="h-10 px-6 mt-8 rounded-md bg-brand-primary text-white text-sm font-medium hover:brightness-110 transition-colors">
                Initialize Blueprint
              </button>
            </div>
        </TabPanel>

        <TabPanel id="github" active={activeTab}>
          <GithubKanbanTab />
        </TabPanel>
        
        <TabPanel id="brandbook" active={activeTab}>
            <div className="bg-background rounded-xl border border-border p-8">
               <div className="flex flex-col xl:flex-row items-center gap-8">
                  <div className="flex-1 w-full bg-card border border-border p-6 rounded-lg relative">
                    <div className="absolute top-4 right-4">
                       <span className="text-xs font-mono text-zinc-500">HTML v5.3</span>
                    </div>
                    <code className="text-sm font-mono leading-relaxed text-zinc-400 block">
                      &lt;div style=&quot;font-family: 'Ness', sans-serif; font-weight: 600;&quot;&gt;<br/>
                        &nbsp;&nbsp;&lt;h1&gt;Digital Handoff Protocol&lt;/h1&gt;<br/>
                        &nbsp;&nbsp;&lt;span style=&quot;color: #00ADE8;&quot;&gt;Verified Asset v4&lt;/span&gt;<br/>
                      &lt;/div&gt;
                    </code>
                  </div>
                  <button className="h-10 px-6 rounded-md bg-brand-primary text-white text-sm font-medium hover:brightness-110 transition-colors whitespace-nowrap">
                    Extrair Build.Protocol
                  </button>
               </div>
            </div>
        </TabPanel>
      </div>
    </div>
  );
}
