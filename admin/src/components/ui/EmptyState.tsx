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
    <div className={`p-16 flex flex-col items-center justify-center text-center ${className}`}>
      {icon && (
        <div className="h-16 w-16 rounded-full bg-muted/40 text-muted-foreground flex items-center justify-center mb-4" aria-hidden="true">
          {icon}
        </div>
      )}
      <h4 className="font-semibold text-foreground">{title}</h4>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-[300px]">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
