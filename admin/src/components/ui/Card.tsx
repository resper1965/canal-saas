import type { ReactNode, HTMLAttributes } from "react";

/* ── Card ── */
export function Card({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl bg-card border border-border text-foreground flex flex-col transition-colors duration-200 hover:border-border/80 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── CardHeader ── */
export function CardHeader({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-background/50 px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-t-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── CardTitle ── */
export function CardTitle({ children, icon, className = "" }: { children: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <h3 className={`font-semibold text-base tracking-tight text-white flex items-center gap-2 ${className}`}>
      {icon && <span className="text-zinc-500" aria-hidden="true">{icon}</span>}
      {children}
    </h3>
  );
}

/* ── CardAction ── */
export function CardAction({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center gap-2 ${className}`} {...props}>
      {children}
    </div>
  );
}

/* ── CardContent ── */
export function CardContent({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-5 ${className}`} {...props}>
      {children}
    </div>
  );
}

/* ── CardFooter ── */
export function CardFooter({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 border-t border-border bg-background/30 flex flex-col sm:flex-row sm:items-center rounded-b-xl gap-4 ${className}`} {...props}>
      {children}
    </div>
  );
}
