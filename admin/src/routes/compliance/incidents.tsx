import { PageSpinner } from "../../components/ui/Spinner";
import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../components/ui/Table";


export default function IncidentsDashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setItems([
        { id: "1", title: "Acesso não autorizado API", severity: "high", status: "open", deadline: "2026/04/30", created_at: "2026/04/28" },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 mt-2">
        <span className="text-[14px] font-medium text-muted-foreground bg-muted/40 px-3 py-1 rounded-full border border-border/50">
          {items.length} incidentes registrados
        </span>
        <button className="flex items-center gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-[14px] font-semibold px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all outline-none">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Reportar Incidente</span>
        </button>
      </div>

      {loading ? (
        <PageSpinner />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 text-center bg-card rounded-[24px] border border-border/50 shadow-sm mt-4">
          <span className="text-4xl mb-4">🎉</span>
          <h3 className="text-xl font-bold text-foreground font-mono">100% Seguro</h3>
          <p className="text-muted-foreground mt-2 mb-6 max-w-sm">Nenhum incidente de segurança ativo na plataforma.</p>
        </div>
      ) : (
        <div className="bg-card rounded-[24px] border border-border/60 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 border-b border-border/60">
                  <TableHead className="py-4 font-bold text-[11px] uppercase tracking-widest text-muted-foreground/80 pl-8 pr-4">Incidente</TableHead>
                  <TableHead className="py-4 font-bold text-[11px] uppercase tracking-widest text-muted-foreground/80 px-4">Severidade</TableHead>
                  <TableHead className="py-4 font-bold text-[11px] uppercase tracking-widest text-muted-foreground/80 px-4">Status</TableHead>
                  <TableHead className="py-4 font-bold text-[11px] uppercase tracking-widest text-muted-foreground/80 px-4">SLA (T-Limit)</TableHead>
                  <TableHead className="pr-8 pl-4 py-4 font-bold text-[11px] uppercase tracking-widest text-muted-foreground/80 text-right">Ajustes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-muted/30 dark:hover:bg-muted/50 transition-colors duration-150">
                    <TableCell className="py-5 pl-8 pr-4 text-[14px] font-bold text-foreground">
                      {item.title}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className={`
                        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest outline-none shadow-sm
                        ${item.severity === 'high' 
                          ? 'bg-destructive/15 text-destructive border border-destructive/20' 
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'}
                      `}>
                        {item.severity === 'high' ? 'Crítico' : 'Baixo'}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className={`
                        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest outline-none shadow-sm
                        ${item.status === 'open' 
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                          : 'bg-muted/50 text-muted-foreground border border-border/50'}
                      `}>
                        {item.status === 'open' ? (
                          <><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />Aberto</>
                        ) : (
                          <><span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />Fechado</>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground font-mono text-[12px] opacity-70">
                      {item.deadline}
                    </TableCell>
                    <TableCell className="pr-8 pl-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="p-2 rounded-lg bg-muted/30 dark:bg-muted/50 text-foreground hover:bg-primary/10 hover:text-primary transition-colors outline-none">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
