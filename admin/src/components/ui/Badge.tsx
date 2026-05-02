import type { ReactNode } from "react";

type BadgeVariant = "ok" | "warning" | "error" | "neutral" | "info";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  icon?: ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  ok: "text-emerald-500",
  warning: "text-amber-500",
  error: "text-red-500",
  info: "text-blue-500",
  neutral: "text-muted-foreground",
};

export function Badge({ children, variant = "neutral", icon, className = "" }: BadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-card text-xs font-medium transition-colors ${VARIANT_STYLES[variant]} ${className}`}
    >
      {icon && <span className="opacity-70" aria-hidden="true">{icon}</span>}
      {children}
    </div>
  );
}
