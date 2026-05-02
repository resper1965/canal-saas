import { useState, useEffect } from "react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../../components/ui/Table";


export default function ROPADashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setItems([
        { id: "1", process_name: "Recrutamento", purpose: "Contratação", data_categories: "Currículo, Email", legal_basis: "Consentimento", retention_period: "2 anos", created_at: "2026/04/28" },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 mt-2">
        <span className="text-[14px] font-medium text-muted-foreground bg-muted/40 px-3 py-1 rounded-full border border-border/50">
          {items.length} processos mapeados
        </span>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-[14px] font-semibold px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all outline-none">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Mapear Processo</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><div className="loader-inline" /></div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 text-center bg-card rounded-[24px] border border-border/50 shadow-sm mt-4">
          <h3 className="text-xl font-bold text-foreground font-mono">Inventário Vazio</h3>
          <p className="text-muted-foreground mt-2 mb-6 max-w-sm">Nenhum processo de dados mapeado na organização.</p>
        </div>
      ) : (
        <div className="bg-card rounded-[24px] border border-border/60 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="overflow-x-auto w-full">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 border-b border-border/60">
                  <TableHead className="py-4 font-bold text-[11px] uppercase tracking-widest text-muted-foreground/80 pl-8 pr-4">Processo</TableHead>
                  <TableHead className="py-4 font-bold text-[11px] uppercase tracking-widest text-muted-foreground/80 px-4">Propósito</TableHead>
                  <TableHead className="py-4 font-bold text-[11px] uppercase tracking-widest text-muted-foreground/80 px-4">Base Legal</TableHead>
                  <TableHead className="py-4 font-bold text-[11px] uppercase tracking-widest text-muted-foreground/80 px-4">Retenção</TableHead>
                  <TableHead className="pr-8 pl-4 py-4 font-bold text-[11px] uppercase tracking-widest text-muted-foreground/80 text-right">Ajustes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="group hover:bg-muted/30 dark:hover:bg-muted/50 transition-colors duration-150">
                    <TableCell className="py-5 pl-8 pr-4 text-[14px] font-bold text-foreground">
                      {item.process_name}
                    </TableCell>
                    <TableCell className="py-5 px-4 text-[14px] font-medium text-muted-foreground">
                      {item.purpose}
                    </TableCell>
                    <TableCell className="py-5 px-4 text-[14px] font-medium text-muted-foreground">
                      {item.legal_basis}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-muted-foreground font-mono text-[12px] opacity-70">
                      {item.retention_period}
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
