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
    <div className={`rounded-xl bg-card border border-border shadow-sm py-5 px-6 flex flex-col gap-3 transition-colors duration-200 hover:border-border/80 cursor-default group ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-400">{label}</span>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:bg-accent transition-colors" aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold tracking-tight text-white">
        {formatted}
      </div>
      {change && (
        <p className="text-xs font-medium mt-1">
          <span className={changeColor}>{change}</span>
        </p>
      )}
    </div>
  );
}
