import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`p-12 flex flex-col items-center justify-center text-center border border-dashed border-border rounded-xl ${className}`}>
      {icon && (
        <div className="h-12 w-12 rounded-full bg-card border border-border text-muted-foreground flex items-center justify-center mb-4" aria-hidden="true">
          {icon}
        </div>
      )}
      <h4 className="font-medium text-white">{title}</h4>
      {description && (
        <p className="text-sm text-zinc-500 mt-1 max-w-[300px]">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
