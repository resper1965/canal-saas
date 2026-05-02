import * as React from "react";

interface UsageData {
  plan: string;
  usage: {
    entries: { current: number; limit: number };
    apiKeys: number;
    domains: number;
    storage: string;
  };
  subscription: {
    active: boolean;
    customerId: string | null;
  };
}

function UsageBar({ current, limit, label }: { current: number; limit: number; label: string }) {
  const pct = limit > 0 ? Math.min(100, (current / limit) * 100) : 0;
  const isNearLimit = pct > 80;
  const isOverLimit = pct >= 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className={`text-xs font-semibold tabular-nums ${isOverLimit ? 'text-red-400' : isNearLimit ? 'text-amber-400' : 'text-foreground'}`}>
          {current.toLocaleString()} / {limit >= 999999 ? '∞' : limit.toLocaleString()}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted/40 border border-border/30 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(100, pct)}%`,
            background: isOverLimit
              ? 'linear-gradient(90deg, #ef4444, #dc2626)'
              : isNearLimit
              ? 'linear-gradient(90deg, #f59e0b, #d97706)'
              : 'linear-gradient(90deg, var(--color-accent, #00E5A0), #10b981)',
          }}
        />
      </div>
    </div>
  );
}

export function UsageTab({ org }: { org: any }) {
  const [data, setData] = React.useState<UsageData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!org?.id) return;
    setLoading(true);
    fetch(`/api/saas/billing/usage?tenantId=${org.id}`, { credentials: 'include' })
      .then(r => r.json())
      .then((d: UsageData) => { setData(d); setError(null); })
      .catch(() => setError('Falha ao carregar dados de uso'))
      .finally(() => setLoading(false));
  }, [org?.id]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-accent" />
        <p className="text-xs text-muted-foreground mt-3">Carregando métricas...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center rounded-xl border border-border/50 bg-muted/20">
        <p className="text-sm text-muted-foreground">{error || 'Sem dados disponíveis'}</p>
      </div>
    );
  }

  const planColors: Record<string, string> = {
    free: '#6b7280',
    pro: '#00E5A0',
    enterprise: '#818cf8',
  };

  const rateLimits: Record<string, number> = { free: 20, pro: 100, enterprise: 999999 };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Plan Badge */}
      <div className="flex items-center justify-between p-5 rounded-xl border border-border/50 bg-background/50">
        <div className="flex items-center gap-4">
          <div
            className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: `${planColors[data.plan] || '#6b7280'}20`, color: planColors[data.plan] || '#6b7280' }}
          >
            {data.plan[0].toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground capitalize">Plano {data.plan}</h3>
            <p className="text-xs text-muted-foreground">
              {data.subscription.active ? '● Assinatura ativa' : '○ Sem assinatura ativa'}
            </p>
          </div>
        </div>
        {data.plan === 'free' && (
          <a href="/saas" className="text-xs font-semibold px-4 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors">
            Upgrade →
          </a>
        )}
      </div>

      {/* Usage Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Entries */}
        <div className="p-5 rounded-xl border border-border/50 bg-background/50 space-y-4">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/60">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
            </svg>
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Entries</span>
          </div>
          <UsageBar current={data.usage.entries.current} limit={data.usage.entries.limit} label="Conteúdo criado" />
        </div>

        {/* Rate Limit */}
        <div className="p-5 rounded-xl border border-border/50 bg-background/50 space-y-4">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/60">
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
            </svg>
            <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Rate Limit</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Requisições por minuto</span>
            <span className="text-lg font-bold tabular-nums text-foreground">
              {rateLimits[data.plan] >= 999999 ? '∞' : rateLimits[data.plan]}<span className="text-xs text-muted-foreground font-normal">/min</span>
            </span>
          </div>
        </div>

        {/* API Keys */}
        <div className="p-5 rounded-xl border border-border/50 bg-background/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/60">
                <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">API Keys</span>
            </div>
            <span className="text-lg font-bold tabular-nums text-foreground">{data.usage.apiKeys}</span>
          </div>
        </div>

        {/* Domains */}
        <div className="p-5 rounded-xl border border-border/50 bg-background/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground/60">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Domínios</span>
            </div>
            <span className="text-lg font-bold tabular-nums text-foreground">{data.usage.domains}</span>
          </div>
        </div>
      </div>

      {/* Storage */}
      <div className="p-4 rounded-xl border border-border/30 bg-muted/10 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Armazenamento disponível (R2)</span>
        <span className="text-sm font-semibold text-foreground">{data.usage.storage}</span>
      </div>

      {/* Stripe Portal Link */}
      {data.subscription.customerId && (
        <div className="text-center pt-2">
          <button
            onClick={async () => {
              const res = await fetch(`/api/saas/billing/portal?tenantId=${org.id}`);
              const d = await res.json();
              if (d.url) window.open(d.url, '_blank');
            }}
            className="text-xs text-accent hover:underline"
          >
            Gerenciar assinatura no Stripe →
          </button>
        </div>
      )}
    </div>
  );
}
