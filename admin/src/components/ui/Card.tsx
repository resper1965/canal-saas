import type { ReactNode, HTMLAttributes } from "react";

/* ── Card ── */
export function Card({ children, className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl glass-panel text-card-foreground flex flex-col transition-all duration-300 hover:border-brand-primary/20 ${className}`}
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
      className={`bg-white/3 px-6 py-4 border-b border-white/5 flex items-center justify-between rounded-t-2xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── CardTitle ── */
export function CardTitle({ children, icon, className = "" }: { children: ReactNode; icon?: ReactNode; className?: string }) {
  return (
    <h3 className={`font-semibold text-sm leading-none text-foreground flex items-center gap-2 ${className}`}>
      {icon && <span className="text-muted-foreground" aria-hidden="true">{icon}</span>}
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
    <div className={`px-6 py-4 border-t border-white/5 flex items-center ${className}`} {...props}>
      {children}
    </div>
  );
}
