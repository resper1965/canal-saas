/**
 * Canal SaaS — Cloudflare Binding Types
 *
 * Typed interfaces for Cloudflare Workers bindings
 * that were previously typed as `any`.
 */

/** Cloudflare Analytics Engine Dataset */
export interface AnalyticsEngineDataset {
  writeDataPoint(data: {
    blobs?: string[]
    doubles?: number[]
    indexes?: string[]
  }): void
}

/** Cloudflare Email Send Binding (Workers Email Routing) */
export interface SendEmailBinding {
  send(message: EmailMessage): Promise<void>
}

/** Email message for Workers Email Routing */
export interface EmailMessage {
  from: string
  to: string
  subject: string
  html?: string
  text?: string
}

/** Session shape from BetterAuth */
export interface AuthSession {
  user: {
    id: string
    email: string
    name?: string
    role?: string
    image?: string
  }
  session: {
    id: string
    activeOrganizationId?: string
    token?: string
  }
}

/** Agent/Copilot session */
export interface AgentSession {
  id: string
  tenantId: string
  [key: string]: unknown
}
