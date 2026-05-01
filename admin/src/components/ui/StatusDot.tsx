type DotStatus = "ok" | "warning" | "error" | "loading";

interface StatusDotProps {
  status?: DotStatus;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}

const STATUS_COLORS: Record<DotStatus, string> = {
  ok: "bg-emerald-500",
  warning: "bg-amber-500 animate-pulse",
  error: "bg-red-500",
  loading: "bg-muted-foreground/40 animate-pulse",
};

const STATUS_LABELS: Record<DotStatus, string> = {
  ok: "Operacional",
  warning: "Degradado",
  error: "Erro",
  loading: "Verificando",
};

const SIZES = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
};

export function StatusDot({ status = "loading", size = "sm", label, className = "" }: StatusDotProps) {
  const ariaLabel = label || STATUS_LABELS[status];
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={`inline-flex rounded-full shrink-0 ${SIZES[size]} ${STATUS_COLORS[status]} ${className}`}
    />
  );
}
