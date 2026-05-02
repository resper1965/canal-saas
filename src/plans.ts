/**
 * Canal CMS — Plan Configuration & Enforcement
 *
 * Define limites por plano e fornece utilities para enforcement.
 * Planos são constantes (não DB) para performance máxima no edge.
 */

export interface PlanLimits {
  name: string;
  entries: number;        // Max entries per collection
  totalEntries: number;   // Max entries total
  apiCalls: number;       // Per minute (rate limit)
  storage: number;        // MB of R2 storage
  collections: number;    // Max collections
  domains: number;        // Max custom domains
  chatbot: boolean;       // Chatbot widget access
  vectorSearch: boolean;  // AI vector search
  aiWriter: boolean;      // AI content generation
  agents: boolean;        // MCP agent access
}

export const PLANS: Record<string, PlanLimits> = {
  free: {
    name: "Free",
    entries: 50,
    totalEntries: 200,
    apiCalls: 20,
    storage: 100,        // 100MB
    collections: 5,
    domains: 1,
    chatbot: true,
    vectorSearch: false,
    aiWriter: false,
    agents: false,
  },
  starter: {
    name: "Starter",
    entries: 500,
    totalEntries: 2000,
    apiCalls: 100,
    storage: 1000,       // 1GB
    collections: 10,
    domains: 3,
    chatbot: true,
    vectorSearch: true,
    aiWriter: false,
    agents: false,
  },
  pro: {
    name: "Pro",
    entries: 5000,
    totalEntries: 20000,
    apiCalls: 500,
    storage: 10000,      // 10GB
    collections: 50,
    domains: 10,
    chatbot: true,
    vectorSearch: true,
    aiWriter: true,
    agents: true,
  },
  enterprise: {
    name: "Enterprise",
    entries: 999999,
    totalEntries: 999999,
    apiCalls: 10000,
    storage: 100000,     // 100GB
    collections: 999,
    domains: 999,
    chatbot: true,
    vectorSearch: true,
    aiWriter: true,
    agents: true,
  },
};

export function getPlan(planId: string): PlanLimits {
  return PLANS[planId] || PLANS.free;
}

// ── Usage Counter ───────────────────────────────────────────────

export interface UsageSnapshot {
  entries: number;
  collections: number;
  domains: number;
  plan: string;
  limits: PlanLimits;
}

export async function getUsage(db: D1Database, orgId: string): Promise<UsageSnapshot> {
  const [entriesResult, collectionsResult, domainsResult, orgResult] = await Promise.all([
    db.prepare("SELECT COUNT(*) as c FROM entries WHERE tenant_id = ?").bind(orgId).first<{ c: number }>(),
    db.prepare("SELECT COUNT(DISTINCT collection_id) as c FROM entries WHERE tenant_id = ?").bind(orgId).first<{ c: number }>(),
    db.prepare("SELECT COUNT(*) as c FROM tenant_domains WHERE tenant_id = ?").bind(orgId).first<{ c: number }>(),
    db.prepare("SELECT metadata FROM organization WHERE id = ?").bind(orgId).first<{ metadata: string }>(),
  ]);

  const meta = orgResult?.metadata ? JSON.parse(orgResult.metadata) : {};
  const plan = meta.plan || "free";

  return {
    entries: entriesResult?.c || 0,
    collections: collectionsResult?.c || 0,
    domains: domainsResult?.c || 0,
    plan,
    limits: getPlan(plan),
  };
}

// ── Enforcement Checks ──────────────────────────────────────────

export function canCreateEntry(usage: UsageSnapshot): { allowed: boolean; reason?: string } {
  if (usage.entries >= usage.limits.totalEntries) {
    return { allowed: false, reason: `Limite de ${usage.limits.totalEntries} entries atingido (plano ${usage.limits.name}). Faça upgrade.` };
  }
  return { allowed: true };
}

export function canCreateDomain(usage: UsageSnapshot): { allowed: boolean; reason?: string } {
  if (usage.domains >= usage.limits.domains) {
    return { allowed: false, reason: `Limite de ${usage.limits.domains} domínios atingido (plano ${usage.limits.name}). Faça upgrade.` };
  }
  return { allowed: true };
}

export function canUseFeature(usage: UsageSnapshot, feature: keyof Pick<PlanLimits, 'chatbot' | 'vectorSearch' | 'aiWriter' | 'agents'>): { allowed: boolean; reason?: string } {
  if (!usage.limits[feature]) {
    return { allowed: false, reason: `${feature} não disponível no plano ${usage.limits.name}. Faça upgrade.` };
  }
  return { allowed: true };
}
