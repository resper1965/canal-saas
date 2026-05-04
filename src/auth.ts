/**
 * Canal CMS — Better Auth Configuration
 *
 * Plugins:
 *   - emailAndPassword: login/signup padrão
 *   - admin: gestão de usuários, roles, ban/unban
 *   - organization: multi-tenancy avançado (teams, roles dinâmicas, SaaS tracking)
 *   - agentAuth: autenticação de MCPs e registro de agentes de inteligência artificial
 *   - apiKey: acesso legado para integrações limitadas
 *
 * Referência: Better Auth docs + Agent Auth Protocol + SaaS Best Practices
 */

import { betterAuth } from "better-auth";
import { admin, organization } from "better-auth/plugins";
import { agentAuth } from "@better-auth/agent-auth";
import { apiKey } from "@better-auth/api-key";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { drizzle } from "drizzle-orm/d1";
import { sendEmail, welcomeEmail } from "./email";
import type { Bindings } from "./index";
import { ac, roles } from "./auth/permissions";

// Factory: cria instância por request para injetar o binding D1 do Cloudflare
export function createAuth(
  db: D1Database,
  secret: string,
  baseURL: string,
  opts?: { googleClientId?: string; googleClientSecret?: string; sendEmailBinding?: Bindings['SEND_EMAIL']; EMAIL?: Bindings['EMAIL']; SEND_EMAIL?: Bindings['SEND_EMAIL']; kv?: KVNamespace }
) {
  const drizzleDb = drizzle(db);

  return betterAuth({
    database: drizzleAdapter(drizzleDb, { provider: "sqlite" }),
    secret,
    baseURL,
    
    // KV-based secondary storage for OAuth PKCE state (Workers are stateless)
    ...(opts?.kv ? {
      secondaryStorage: {
        get: async (key: string) => await opts.kv!.get(key),
        set: async (key: string, value: string, ttl?: number) => {
          await opts.kv!.put(key, value, { expirationTtl: Math.max(ttl || 300, 60) });
        },
        delete: async (key: string) => { await opts.kv!.delete(key); },
      },
    } : {}),

    // Using Better Auth default cookie settings

    // ── Auto-admin for @bekaa.eu ─────────────────────────────────
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const email = user.email || "";
            if (email.endsWith("@bekaa.eu")) {
              return { data: { ...user, role: "admin" } };
            }
            return { data: user };
          },
          after: async (user) => {
            // Send welcome email (fire-and-forget)
            if (user.email) {
              const name = user.name || user.email.split("@")[0];
              const template = welcomeEmail(name);
              sendEmail({ EMAIL: opts?.EMAIL, SEND_EMAIL: opts?.SEND_EMAIL || opts?.sendEmailBinding }, {
                to: user.email,
                ...template,
              }).catch(() => {});
            }
          },
        },
      },
    },

    // ── Email & Password ────────────────────────────────────────
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },

    // ── Social Providers (Google OAuth) ──────────────────────────
    ...(opts?.googleClientId && opts?.googleClientSecret ? {
      socialProviders: {
        google: {
          clientId: opts.googleClientId,
          clientSecret: opts.googleClientSecret,
        },
      },
    } : {}),

    // ── Account & User Management ───────────────────────────────
    user: {
      changeEmail: {
        enabled: true,
      },
      deleteUser: {
        enabled: true,
      }
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google", "microsoft"],
      }
    },

    // ── Trusted origins ─────────────────────────────────────────
    trustedOrigins: [
      "https://canal.bekaa.eu",
      "http://localhost:8787",
      "http://localhost:5173",
      "http://localhost:5174"
    ],

    // ── Plugins ─────────────────────────────────────────────────
    plugins: [
      // Admin Plugin
      admin({
        defaultRole: "user",
      }),

      // Organization Plugin (Multi-tenancy + RBAC)
      organization({
         ac,
         roles,
         allowUserToCreateOrganization: true,
         creatorRole: "owner",
         
         teams: {
           enabled: true,
           maximumTeams: 20,
         },

         schema: {
           organization: {
             additionalFields: {
               plan: { type: "string", defaultValue: "free", required: false },
               usageLimit: { type: "number", defaultValue: 100, required: false },
               stripeCustomerId: { type: "string", required: false }
             }
           }
         }
      }),

      // Agent Auth Plugin (Inteligência Artificial & Bots MCP) 
      agentAuth({
         providerName: "Canal CMS MCP Agent Provider",
         providerDescription: "Acesso administrativo via MCP para a Plataforma Canal",
         // "delegated" (age como usuário), "autonomous" (age independente sob conta de sistema)
         modes: ["delegated", "autonomous"],
         
         // Permitindo que o host dite as capabilities default de forma autônoma
         defaultHostCapabilities: ["read_entries", "create_entries"],
         
         // Declarar abertamente quais capabilities (Resources e Tools do MCP)
         // este servidor auth está disposto em aceitar requests formais de grant:
         capabilities: [
            { name: "read_insights", description: "Listar artigos de Insight em todas verticais." },
            { name: "create_entries", description: "Criar novos registros multi-tenant (entries)." }
         ]
      }),

      // API Key Plugin
      apiKey(),
    ],
  });
}

export type Auth = ReturnType<typeof createAuth>;
