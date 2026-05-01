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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex items-center justify-between bg-black/40 backdrop-blur-3xl border border-white/5 p-6 rounded-[32px] shadow-2xl radial-gradient-glass">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">GitHub Projects Kanban</h2>
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none italic">Software Engineering Operational Board</p>
        </div>
        <button 
          onClick={fetchIssues} 
          disabled={loading} 
          className="h-12 px-8 flex items-center bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,173,232,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 italic"
        >
          {loading ? 'Sincronizando Core...' : 'Sync Repository'}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Todo Column */}
        <div className="rounded-[40px] flex flex-col h-full min-h-[600px] bg-black/40 backdrop-blur-3xl border border-white/5 shadow-2xl radial-gradient-glass overflow-hidden group">
          <div className="px-8 py-6 border-b border-white/5 font-black text-[10px] tracking-[0.2em] flex justify-between items-center bg-white/2">
            <span className="flex items-center gap-3 uppercase text-zinc-400 italic">
               <div className="w-2 h-2 rounded-full bg-zinc-600 animate-pulse" /> Backlog Protocol
            </span>
            <span className="h-6 px-3 rounded-full bg-black/40 border border-white/5 text-zinc-600 font-mono flex items-center justify-center">{loading ? '...' : todo.length}</span>
          </div>
          <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-32 rounded-3xl bg-white/2 border border-white/5 animate-pulse" />)
            ) : todo.map((issue: any) => (
              <a href={issue.url} target="_blank" rel="noreferrer" key={issue.id} className="block p-6 rounded-3xl bg-white/2 border border-white/5 hover:border-brand-primary/20 hover:bg-white/5 transition-all duration-500 shadow-xl group/card">
                <div className="flex justify-between items-start mb-3">
                   <span className="text-[10px] font-black text-brand-primary uppercase italic tracking-widest">Ness.Engine</span>
                   <span className="text-[9px] font-black font-mono text-zinc-800">#{issue.id}</span>
                </div>
                <h4 className="text-[14px] font-black leading-tight text-white italic group-hover/card:text-brand-primary transition-colors">{issue.title}</h4>
                {issue.labels && issue.labels.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-4">
                    {issue.labels.map((l: string) => <span key={l} className="text-[8px] font-black bg-white/5 text-zinc-500 px-2 py-1 rounded-lg uppercase tracking-widest">{l}</span>)}
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="rounded-[40px] flex flex-col h-full min-h-[600px] bg-black/40 backdrop-blur-3xl border border-brand-primary/20 shadow-[0_40px_80px_-20px_rgba(0,173,232,0.2)] radial-gradient-glass overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
             <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div className="px-8 py-6 border-b border-white/5 font-black text-[10px] tracking-[0.2em] flex justify-between items-center bg-brand-primary/5">
            <span className="flex items-center gap-3 uppercase text-brand-primary italic">
               <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse shadow-[0_0_12px_rgba(0,173,232,0.8)]" /> Active Sprint
            </span>
            <span className="h-6 px-3 rounded-full bg-brand-primary/20 border border-brand-primary/20 text-brand-primary font-mono flex items-center justify-center">{loading ? '...' : inProgress.length}</span>
          </div>
          <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-32 rounded-3xl bg-white/2 border border-white/5 animate-pulse" />)
            ) : inProgress.map((issue: any) => (
              <a href={issue.url} target="_blank" rel="noreferrer" key={issue.id} className="block p-6 rounded-3xl bg-brand-primary/5 border border-brand-primary/20 hover:bg-brand-primary/10 transition-all duration-500 shadow-2xl relative group/active">
                <div className="absolute top-4 right-4 animate-pulse">
                   <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                </div>
                <div className="flex justify-between items-start mb-3">
                   <span className="text-[10px] font-black text-brand-primary uppercase italic tracking-widest">Priority Node</span>
                   <span className="text-[9px] font-black font-mono text-brand-primary/60">#{issue.id}</span>
                </div>
                <h4 className="text-[14px] font-black leading-tight text-white italic">{issue.title}</h4>
                {issue.labels && issue.labels.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-4">
                    {issue.labels.map((l: string) => <span key={l} className="text-[8px] font-black bg-brand-primary/20 text-brand-primary px-2 py-1 rounded-lg uppercase tracking-widest">{l}</span>)}
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Done Column */}
        <div className="rounded-[40px] flex flex-col h-full min-h-[600px] bg-black/40 backdrop-blur-3xl border border-white/5 shadow-2xl radial-gradient-glass overflow-hidden opacity-60 hover:opacity-100 transition-opacity duration-700">
          <div className="px-8 py-6 border-b border-white/5 font-black text-[10px] tracking-[0.2em] flex justify-between items-center bg-white/2">
            <span className="flex items-center gap-3 uppercase text-emerald-500 italic">
               <div className="w-2 h-2 rounded-full bg-emerald-500" /> Shipped Logic
            </span>
            <span className="h-6 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 font-mono flex items-center justify-center">{loading ? '...' : done.length}</span>
          </div>
          <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              [1,2,3].map(i => <div key={i} className="h-20 rounded-3xl bg-white/2 border border-white/5 animate-pulse" />)
            ) : done.slice(0, 15).map((issue: any) => (
               <a href={issue.url} target="_blank" rel="noreferrer" key={issue.id} className="block p-4 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 transition-all group/done">
                <h4 className="text-[12px] font-black line-through text-zinc-600 group-hover/done:text-emerald-500 italic transition-colors line-clamp-1">{issue.title}</h4>
                <div className="flex justify-between items-baseline mt-2">
                   <span className="text-[9px] font-black font-mono text-zinc-800">#{issue.id}</span>
                   <span className="text-[8px] font-black text-emerald-500/40 uppercase">Verified</span>
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
    <div className="max-w-[1700px] w-full px-10 md:px-12 py-10 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      
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
          className="h-12 bg-black/40 backdrop-blur-3xl border border-white/5 p-1 rounded-2xl shadow-2xl"
        />
      </div>

      <div className="min-h-[600px] relative">
        <TabPanel id="social" active={activeTab}>
            <div className="bg-black/40 backdrop-blur-3xl rounded-[48px] border border-white/5 shadow-2xl radial-gradient-glass overflow-hidden flex flex-col">
              <div className="px-10 py-10 border-b border-white/5 bg-white/2">
                 <div className="flex items-center justify-between">
                    <div className="space-y-1">
                       <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Generative Social Engine</h2>
                       <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none italic">LLM-Dynamic Cross-Platform Ingestion</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary animate-pulse">
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                    </div>
                 </div>
              </div>
              <div className="p-10 space-y-10">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic block">Target Platform</label>
                    <div className="relative group">
                      <select 
                        value={socialPlatform}
                        onChange={e => setSocialPlatform(e.target.value)}
                        className="h-14 w-full rounded-2xl border border-white/10 bg-black/40 px-6 text-[11px] font-black uppercase tracking-widest text-white shadow-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:bg-white/5 transition-all appearance-none cursor-pointer">
                        <option value="linkedin" className="bg-zinc-900 italic">LinkedIn Executive Protocol</option>
                        <option value="instagram" className="bg-zinc-900 italic">Instagram Visual Meta</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                         <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic block">Orchestration Brief</label>
                    <input 
                      value={socialBrief}
                      onChange={e => setSocialBrief(e.target.value)}
                      className="h-14 w-full rounded-2xl border border-white/10 bg-black/40 px-6 text-sm font-bold text-white shadow-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:bg-white/5 transition-all placeholder:text-zinc-800" placeholder="Conceito, notícias ou insights do setor..." />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic block">Cognitive Post Output</label>
                    <button 
                      onClick={handleGenerateSocial}
                      disabled={isDrafting || !socialBrief}
                      className="h-12 px-8 flex items-center bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,173,232,0.4)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 italic">
                      {isDrafting ? 'Propagando Tokens...' : 'Start Brainstorming'}
                    </button>
                  </div>
                  <div className="relative group/textarea">
                    <textarea 
                      value={socialDraft}
                      onChange={(e) => setSocialDraft(e.target.value)}
                      className="min-h-[300px] w-full rounded-[32px] border border-white/5 bg-black/40 px-8 py-8 text-[13px] font-mono font-bold text-zinc-400 shadow-2xl transition-all placeholder:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 hover:bg-white/5 resize-none leading-relaxed italic" placeholder="O output generativo final será transposto aqui após a orquestração." />
                  </div>
                </div>
                
                <div className="flex gap-4 justify-end pt-8 border-t border-white/5">
                  <button 
                    onClick={() => handlePublish(true)}
                    disabled={!socialDraft || isDrafting}
                    className="h-14 px-8 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-all disabled:opacity-50 italic">
                    Queue Protocol (24h)
                  </button>
                  <button 
                    onClick={() => handlePublish(false)}
                    disabled={!socialDraft || isDrafting}
                    className="h-14 px-12 rounded-2xl bg-brand-primary text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_25px_50px_-12px_rgba(0,173,232,0.5)] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 italic">
                    Execute Live Push
                  </button>
                </div>
              </div>
            </div>
        </TabPanel>

        <TabPanel id="newsletter" active={activeTab}>
            <div className="bg-black/40 backdrop-blur-3xl rounded-[48px] border border-white/5 shadow-2xl radial-gradient-glass min-h-[500px] flex flex-col items-center justify-center p-24 text-center group">
              <div className="h-24 w-24 mb-10 rounded-3xl bg-brand-primary/5 flex items-center justify-center border border-brand-primary/20 shadow-2xl group-hover:scale-110 transition-transform duration-700">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brand-primary animate-pulse">
                  <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>
              <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">Draft Engine: Offline</h3>
              <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.4em] max-w-sm italic leading-relaxed">Nenhuma campanha orquestrada. Inicie um draft para habilitar seu SMTP relay pipeline.</p>
              <button className="h-14 px-12 mt-12 rounded-2xl bg-brand-primary text-white text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-105 transition-all italic">
                Initialize Blueprint
              </button>
            </div>
        </TabPanel>

        <TabPanel id="github" active={activeTab}>
          <GithubKanbanTab />
        </TabPanel>
        
        <TabPanel id="brandbook" active={activeTab}>
            <div className="bg-black/40 backdrop-blur-3xl rounded-[48px] border border-white/5 shadow-2xl radial-gradient-glass p-12">
               <div className="flex flex-col xl:flex-row items-center gap-12">
                  <div className="flex-1 w-full bg-black/60 border border-white/10 p-8 rounded-[32px] shadow-inner overflow-hidden relative group">
                    <div className="absolute top-4 right-4">
                       <span className="text-[8px] font-black text-brand-primary uppercase tracking-widest font-mono">HTML v5.3</span>
                    </div>
                    <code className="text-[13px] font-mono leading-loose text-zinc-500 group-hover:text-zinc-300 transition-colors block italic">
                      &lt;div style=&quot;font-family: 'Ness', sans-serif; font-weight: 900;&quot;&gt;<br/>
                        &nbsp;&nbsp;&lt;h1&gt;Digital Handoff Protocol&lt;/h1&gt;<br/>
                        &nbsp;&nbsp;&lt;span style=&quot;color: #00ADE8;&quot;&gt;Verified Asset v4&lt;/span&gt;<br/>
                      &lt;/div&gt;
                    </code>
                  </div>
                  <button className="h-16 px-12 rounded-2xl bg-brand-primary text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-[0_30px_60px_-15px_rgba(0,173,232,0.6)] hover:scale-105 active:scale-95 transition-all italic whitespace-nowrap">
                    Extrair Build.Protocol
                  </button>
               </div>
            </div>
        </TabPanel>
      </div>
    </div>
  );
}
