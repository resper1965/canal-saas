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
      .then((data: Record<string, unknown>) => {
        if (data.sessions) {
          setSessions(data.sessions);
          setStats(data.stats);
        }
        setLoading(false);
      })
      .catch((err) => {
        // error handled by empty state
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
    <div className="max-w-[1600px] w-full px-6 md:px-10 py-8 space-y-8 bg-background">
      <div className="flex items-center justify-end">
        <button
          onClick={handleExport}
          className="inline-flex h-10 items-center gap-2 px-4 bg-muted hover:bg-brand-primary text-white rounded-md transition-colors text-xs font-bold uppercase"
        >
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-primary/10 rounded-lg">
              <MessageSquare className="w-4 h-4 text-brand-primary" />
            </div>
            <h3 className="text-xs font-bold uppercase text-zinc-500">TOTAL DE SESSÕES</h3>
          </div>
          <p className="text-4xl font-bold text-white mt-4">{stats.total_sessions}</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <BarChart className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-xs font-bold uppercase text-zinc-500">MÉDIA DE INTERAÇÕES</h3>
          </div>
          <p className="text-4xl font-bold text-white mt-4">{Number(stats.avg_turns).toFixed(1)} <span className="text-sm font-medium text-zinc-500">msgs</span></p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <ThumbsUp className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-xs font-bold uppercase text-zinc-500">ACEITAÇÃO (CSAT)</h3>
          </div>
          <p className="text-4xl font-bold text-white mt-4">
            {stats.avg_csat !== null ? ((stats.avg_csat > 0 ? '+' : '') + Number(stats.avg_csat).toFixed(1)) : "—"} 
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-background">
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="px-6 py-4 text-xs font-bold uppercase text-zinc-500">Sessão ID</TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold uppercase text-zinc-500">Data de Início</TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold uppercase text-zinc-500">Interações</TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold uppercase text-zinc-500">Status / Local</TableHead>
                <TableHead className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 text-right">CSAT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-[#222222]">
              {sessions.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted transition-colors border-0">
                  <TableCell className="px-6 py-4 font-medium text-zinc-300">
                    {s.id.split('-').pop() || s.id}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-zinc-400">
                    <span className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-zinc-500" />
                      {s.created_at ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(s.created_at)) : '-'}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-zinc-300 text-sm font-medium">{s.turn_count}</TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold uppercase bg-muted text-zinc-400">
                      {s.status} / {s.locale}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    {s.csat_score === 1 && <ThumbsUp className="w-4 h-4 text-emerald-500 inline-block" />}
                    {s.csat_score === -1 && <ThumbsDown className="w-4 h-4 text-red-500 inline-block" />}
                    {s.csat_score === null && <span className="text-zinc-600">-</span>}
                  </TableCell>
                </TableRow>
              ))}
              {sessions.length === 0 && (
                <TableRow className="border-0 hover:bg-transparent">
                  <TableCell colSpan={5} className="px-6 py-12 text-center text-zinc-500 text-sm font-medium">
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
