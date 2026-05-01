import React, { useEffect, useState } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/Table";
import {
  BarChart, 

  Download, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown,
  Clock
} from "lucide-react";

interface Session {
  id: string;
  turn_count: number;
  csat_score: number | null;
  locale: string;
  status: string;
  created_at: string;
  ended_at: string | null;
}

interface Stats {
  total_sessions: number;
  avg_turns: number;
  avg_csat: number | null;
}

export default function ChatsHistory() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<Stats>({ total_sessions: 0, avg_turns: 0, avg_csat: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/chat-sessions")
      .then((r) => r.json())
      .then((data: any) => {
        if (data.sessions) {
          setSessions(data.sessions);
          setStats(data.stats);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load generic chat sessions", err);
        setLoading(false);
      });
  }, []);

  const handleExport = () => {
    window.location.href = "/api/admin/chat-sessions/export";
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] w-full px-10 md:px-12 py-10 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-end">
        <button
          onClick={handleExport}
          className="inline-flex h-11 items-center gap-2 px-6 bg-brand-primary text-white rounded-xl shadow-[0_10px_20px_rgba(0,173,232,0.3)] hover:brightness-110 transition-all text-xs font-bold uppercase tracking-widest"
        >
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden radial-gradient-glass">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2.5 bg-brand-primary/10 rounded-xl border border-brand-primary/20">
              <MessageSquare className="w-5 h-5 text-brand-primary" />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">TOTAL DE SESSÕES</h3>
          </div>
          <p className="text-5xl font-bold text-white mt-4 tracking-tighter">{stats.total_sessions}</p>
        </div>

        <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden radial-gradient-glass">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <BarChart className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">MÉDIA DE INTERAÇÕES</h3>
          </div>
          <p className="text-5xl font-bold text-white mt-4 tracking-tighter">{Number(stats.avg_turns).toFixed(1)} <span className="text-lg font-medium text-zinc-500">msgs</span></p>
        </div>

        <div className="bg-black/40 backdrop-blur-3xl border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden radial-gradient-glass">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <ThumbsUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">ACEITAÇÃO (CSAT)</h3>
          </div>
          <p className="text-5xl font-bold text-white mt-4 tracking-tighter">
            {stats.avg_csat !== null ? ((stats.avg_csat > 0 ? '+' : '') + Number(stats.avg_csat).toFixed(1)) : "—"} 
          </p>
        </div>
      </div>

      <div className="glass-panel border border-white/5 rounded-2xl shadow-xl overflow-hidden radial-gradient-glass">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/5 bg-white/2 hover:bg-white/2">
                <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Sessão ID</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Data de Início</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Interações</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status / Local</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-right">CSAT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s) => (
                <TableRow key={s.id} className="hover:bg-neutral-800/30 transition-colors">
                  <TableCell className="px-6 py-4 font-medium text-neutral-200">
                    {s.id.split('-').pop() || s.id}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 opacity-70" />
                      {s.created_at ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(s.created_at)) : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-neutral-300">{s.turn_count}</TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-800 text-neutral-300 border border-neutral-700/50">
                      {s.status} / {s.locale.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    {s.csat_score === 1 && <ThumbsUp className="w-4 h-4 text-emerald-500 inline-block" />}
                    {s.csat_score === -1 && <ThumbsDown className="w-4 h-4 text-red-500 inline-block" />}
                    {s.csat_score === null && <span className="text-neutral-600">-</span>}
                  </TableCell>
                </TableRow>
              ))}
              {sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    Nenhuma conversa registrada ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
