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
import { kyselyAdapter } from "@better-auth/kysely-adapter";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";

// Factory: cria instância por request para injetar o binding D1 do Cloudflare
export function createAuth(db: D1Database, secret: string, baseURL: string) {
  const kyselyDb = new Kysely({ dialect: new D1Dialect({ database: db }) });

  return betterAuth({
    database: kyselyAdapter(kyselyDb, { type: "sqlite" }),
    secret,
    baseURL,

    // ── Email & Password ────────────────────────────────────────
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
    },

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
      "https://canal.ness.com.br",
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

      // Organization Plugin (Multi-tenancy p/ SaaS Platforms)
      organization({
         allowUserToCreateOrganization: true,
         creatorRole: "owner",
         
         // Isolamento organizacional em níveis de times ("Squads") e acesso rigoroso
         teams: {
           enabled: true,
           maximumTeams: 20,
         },
         dynamicAccessControl: {
           enabled: true, // Libera customização de cargos/roles via Roles API
         },

         // Extendemos o esquema SaaS nativo sugerido no implementation plan
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
