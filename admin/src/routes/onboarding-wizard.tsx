import { useToast } from "../components/ui/Toast";
import * as React from "react";
import { authClient } from "../lib/auth-client";

type Step = 1 | 2 | 3 | 4;

interface SignupResult {
  success: boolean;
  user: { id: string; email: string };
  organization: { id: string; name: string; slug: string; plan: string };
  apiKey: { id: string; key: string; prefix: string };
  quickStart: { step1: string; step2: string; step3: string };
  collections: number;
  error?: string;
}

export default function OnboardingWizard() {
  const [step, setStep] = React.useState<Step>(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<SignupResult | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Form state
  const [form, setForm] = React.useState({
    name: '', email: '', password: '',
    companyName: '', domain: '',
    plan: 'free',
    botName: '', themeColor: '#00E5A0',
  });

  const up = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/onboarding/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao criar conta');
        return;
      }
      setResult(data);
      setStep(4);
    } catch (e: any) {
      setError(e.message || 'Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const copyKey = () => {
    if (result?.apiKey.key) {
      navigator.clipboard.writeText(result.apiKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Check if already logged in
  const { data: session } = authClient.useSession();
  if (session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl border border-border/50 bg-background/50 text-center space-y-4">
          <h2 className="text-lg font-semibold">Você já tem uma conta</h2>
          <p className="text-sm text-muted-foreground">Logado como {session.user.email}</p>
          <a href="/" className="btn btn-primary inline-block">Ir para o Dashboard →</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-background, #0a0a12)' }}>
      <div className="max-w-lg w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-2xl tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}>canal<span className="text-brand-primary">.</span></h1>
          <p className="text-sm text-muted-foreground mt-1">Crie sua conta em segundos</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mx-auto max-w-xs">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className="h-2 flex-1 rounded-full transition-all duration-300"
                style={{
                  background: s <= step
                    ? 'linear-gradient(90deg, #00E5A0, #10b981)'
                    : 'var(--color-muted, #1a1a2e)',
                }}
              />
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="p-8 rounded-2xl border border-border/50 bg-background/80  space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Account */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">Criar conta</h2>
                <p className="text-xs text-muted-foreground mt-1">Seus dados de acesso ao painel administrativo.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Nome</label>
                  <input
                    type="text" value={form.name} onChange={e => up('name', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border/50 bg-muted/20 text-foreground text-sm outline-none focus:border-accent transition-colors"
                    placeholder="Seu nome completo"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Email</label>
                  <input
                    type="email" value={form.email} onChange={e => up('email', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border/50 bg-muted/20 text-foreground text-sm outline-none focus:border-accent transition-colors"
                    placeholder="voce@empresa.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Senha</label>
                  <input
                    type="password" value={form.password} onChange={e => up('password', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border/50 bg-muted/20 text-foreground text-sm outline-none focus:border-accent transition-colors"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!form.name || !form.email || form.password.length < 8}
                className="w-full py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-40"
                style={{ background: '#00E5A0', color: '#000' }}
              >
                Continuar →
              </button>
            </div>
          )}

          {/* Step 2: Organization */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">Sua empresa</h2>
                <p className="text-xs text-muted-foreground mt-1">Informações da organização (tenant).</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Nome da empresa</label>
                  <input
                    type="text" value={form.companyName} onChange={e => up('companyName', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border/50 bg-muted/20 text-foreground text-sm outline-none focus:border-accent transition-colors"
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Domínio do site (opcional)</label>
                  <input
                    type="text" value={form.domain} onChange={e => up('domain', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border/50 bg-muted/20 text-foreground text-sm outline-none focus:border-accent transition-colors"
                    placeholder="acme.com.br"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Usado para CORS e verificação DNS</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Plano</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['free', 'pro', 'enterprise'].map(p => (
                      <button
                        key={p}
                        onClick={() => up('plan', p)}
                        className={`py-2 rounded-lg text-xs font-semibold border transition-all capitalize ${
                          form.plan === p
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border/50 bg-muted/10 text-muted-foreground hover:bg-muted/20'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-lg font-semibold text-sm border border-border/50 text-muted-foreground hover:text-foreground transition-colors">
                  ← Voltar
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!form.companyName}
                  className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-40"
                  style={{ background: '#00E5A0', color: '#000' }}
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Chatbot Config */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold">Chatbot (opcional)</h2>
                <p className="text-xs text-muted-foreground mt-1">Configure seu assistente virtual. Pode alterar depois.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Nome do bot</label>
                  <input
                    type="text" value={form.botName} onChange={e => up('botName', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-border/50 bg-muted/20 text-foreground text-sm outline-none focus:border-accent transition-colors"
                    placeholder="Assistente"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Cor do tema</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color" value={form.themeColor} onChange={e => up('themeColor', e.target.value)}
                      className="h-10 w-14 rounded-lg border border-border/50 bg-transparent cursor-pointer"
                    />
                    <span className="text-sm text-muted-foreground font-mono">{form.themeColor}</span>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-xl border border-border/30 bg-muted/10">
                <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">Preview</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: form.themeColor, color: '#000' }}
                  >
                    {(form.botName || 'A')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 p-2.5 rounded-lg bg-muted/20 border border-border/30 text-xs text-muted-foreground">
                    Olá! 👋 Como posso ajudar?
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-2.5 rounded-lg font-semibold text-sm border border-border/50 text-muted-foreground hover:text-foreground transition-colors">
                  ← Voltar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: '#00E5A0', color: '#000' }}
                >
                  {loading ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                      Criando...
                    </>
                  ) : 'Criar conta →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && result && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 border border-accent/30 mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00E5A0" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2 className="text-lg font-semibold">Conta criada!</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Organização <strong>{result.organization.name}</strong> com {result.collections} collections.
                </p>
              </div>

              {/* API Key */}
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-2">
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">⚠️ Sua API Key (copie agora!)</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono p-2.5 rounded-lg bg-muted text-foreground overflow-x-auto break-all">
                    {result.apiKey.key}
                  </code>
                  <button
                    onClick={copyKey}
                    className="px-3 py-2 rounded-lg text-xs font-semibold border border-border/50 hover:bg-muted/20 transition-colors shrink-0"
                  >
                    {copied ? '✓' : 'Copiar'}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">Esta chave não será exibida novamente.</p>
              </div>

              {/* Quick start snippets */}
              <div className="p-4 rounded-xl border border-border/30 bg-muted/10 space-y-3">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Integração rápida</p>
                <pre className="text-xs text-muted-foreground font-mono p-3 rounded-lg bg-muted overflow-x-auto whitespace-pre-wrap">
{`<!-- Widget do Chatbot -->
<script src="https://canal.bekaa.eu/widget.js"
  data-key="${result.apiKey.key}"></script>

<!-- Fetch de conteúdo -->
fetch("https://canal.bekaa.eu/api/v1/collections/insights/entries", {
  headers: { "Authorization": "Bearer ${result.apiKey.key}" }
})`}
                </pre>
              </div>

              <a
                href="/login"
                className="block w-full py-2.5 rounded-lg font-semibold text-sm text-center transition-all"
                style={{ background: '#00E5A0', color: '#000' }}
              >
                Fazer login →
              </a>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Já tem conta? <a href="/login" className="text-accent hover:underline">Fazer login</a>
        </p>
      </div>
    </div>
  );
}
