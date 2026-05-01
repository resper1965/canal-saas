import * as React from "react";
import { organization } from "../../lib/auth-client";
import { CheckIcon, ShieldIcon } from "./Icons";

export function PlanTab({ org }: { org: any }) {
  const currentPlan = (org?.metadata?.plan || "free").toLowerCase();
  const [switching, setSwitching] = React.useState(false);

  const handleSwitch = async (plan: string) => {
    if (plan === currentPlan) return;
    setSwitching(true);
    try {
      await organization.update({
        data: { metadata: { ...org.metadata, plan } },
        organizationId: org.id,
      });
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="plan-grid">
      {/* Free Plan */}
      <div className={`plan-card${currentPlan === "free" ? " current" : ""}`}>
        {currentPlan === "free" && (
          <div className="plan-card-badge">
            <span className="badge badge-new">Atual</span>
          </div>
        )}
        <h3>Free</h3>
        <p className="plan-desc">Para equipes pequenas começando.</p>
        <ul className="plan-features">
          <li><CheckIcon /> 1 organização</li>
          <li><CheckIcon /> Até 3 membros</li>
          <li><CheckIcon /> Conteúdo ilimitado</li>
          <li><CheckIcon /> 1 agente MCP</li>
          <li><CheckIcon /> Brandbook básico</li>
        </ul>
        {currentPlan !== "free" ? (
          <button
            className="btn btn-ghost"
            onClick={() => handleSwitch("free")}
            disabled={switching}
          >
            {switching ? "..." : "Mudar para Free"}
          </button>
        ) : (
          <button className="btn btn-secondary" disabled>
            <ShieldIcon /> Plano Ativo
          </button>
        )}
      </div>

      {/* Pro Plan */}
      <div className={`plan-card${currentPlan === "pro" ? " current" : ""}`}>
        {currentPlan === "pro" && (
          <div className="plan-card-badge">
            <span className="badge badge-new">Atual</span>
          </div>
        )}
        <h3>Pro</h3>
        <p className="plan-desc">Para empresas e agências em crescimento.</p>
        <ul className="plan-features">
          <li><CheckIcon /> Organizações ilimitadas</li>
          <li><CheckIcon /> Membros ilimitados</li>
          <li><CheckIcon /> Conteúdo ilimitado</li>
          <li><CheckIcon /> Agentes MCP ilimitados</li>
          <li><CheckIcon /> Brandbook avançado</li>
          <li><CheckIcon /> Suporte prioritário</li>
          <li><CheckIcon /> API & Webhooks</li>
        </ul>
        {currentPlan !== "pro" ? (
          <button
            className="btn btn-primary"
            onClick={() => handleSwitch("pro")}
            disabled={switching}
          >
            {switching ? "..." : "Ativar Pro"}
          </button>
        ) : (
          <button className="btn btn-secondary" disabled>
            <ShieldIcon /> Plano Ativo
          </button>
        )}
      </div>
    </div>
  );
}
