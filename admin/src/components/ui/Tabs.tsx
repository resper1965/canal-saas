import type { ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabGroupProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

export function TabGroup({ tabs, active, onChange, className = "" }: TabGroupProps) {
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={`inline-flex h-11 items-center justify-center gap-1 rounded-xl bg-black/40 backdrop-blur-xl border border-white/10 p-1.5 text-zinc-500 shadow-2xl ${className}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={active === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          tabIndex={active === tab.id ? 0 : -1}
          onClick={() => onChange(tab.id)}
          className={`inline-flex items-center gap-2 justify-center whitespace-nowrap rounded-lg px-6 h-full text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            active === tab.id
              ? "bg-white/10 text-white shadow-lg border border-white/10 scale-105"
              : "hover:text-zinc-300 hover:bg-white/5"
          }`}
        >
          {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface TabPanelProps {
  id: string;
  active: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ id, active, children, className = "" }: TabPanelProps) {
  if (active !== id) return null;
  return (
    <div
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      tabIndex={0}
      className={`animate-in fade-in slide-in-from-bottom-2 duration-300 ${className}`}
    >
      {children}
    </div>
  );
}
