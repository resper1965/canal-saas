import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: ReactNode;
  change?: string | null;
  changeColor?: string;
  className?: string;
}

export function StatCard({ label, value, icon, change, changeColor = "text-emerald-500", className = "" }: StatCardProps) {
  const formatted = typeof value === "number" ? value.toLocaleString("pt-BR") : value;

  return (
    <div className={`rounded-2xl glass-panel py-4 px-5 flex flex-col gap-2 transition-all duration-300 hover:scale-[1.02] cursor-default group ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
        {icon && (
          <div className="w-7 h-7 rounded-lg bg-muted/40 flex items-center justify-center text-muted-foreground/60 group-hover:text-foreground group-hover:bg-muted/60 transition-all" aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
      <div className="text-3xl font-extrabold leading-none text-white tracking-tight drop-shadow-sm">
        {formatted}
      </div>
      {change && (
        <p className="text-[11px] text-muted-foreground">
          <span className={changeColor}>{change}</span>
        </p>
      )}
    </div>
  );
}
