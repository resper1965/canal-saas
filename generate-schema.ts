import { betterAuth } from "better-auth";
import { admin, organization } from "better-auth/plugins";
import { agentAuth } from "@better-auth/agent-auth";
import { apiKey } from "@better-auth/api-key";

export const auth = betterAuth({
  database: {
    provider: "sqlite",
    url: "dummy.db"
  },
  plugins: [
    admin({ defaultRole: "user" }),
    organization({
      teams: { enabled: true },
      dynamicAccessControl: { enabled: true },
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
    agentAuth({
      providerName: "Canal CMS",
      providerDescription: "Multi-tenant Agent Provider",
      modes: ["delegated", "autonomous"]
    }),
    apiKey()
  ]
});
