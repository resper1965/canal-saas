import type { ReactNode } from "react";

interface SectionTitleProps {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function SectionTitle({ children, icon, className = "" }: SectionTitleProps) {
  return (
    <h3 className={`font-semibold text-sm leading-none text-white flex items-center gap-2 ${className}`}>
      {icon && <span className="text-zinc-500">{icon}</span>}
      {children}
    </h3>
  );
}
