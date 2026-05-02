interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const SIZES = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-4",
};

export function Spinner({ size = "md", className = "", label }: SpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`${SIZES[size]} rounded-full border-border border-t-brand-primary animate-spin`} />
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}

/** Full-page centered spinner */
export function PageSpinner({ label }: { label?: string }) {
  return (
    <div className="flex justify-center p-20">
      <Spinner size="lg" label={label} />
    </div>
  );
}
