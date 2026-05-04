import { createAuthClient } from "better-auth/react";
import { adminClient, organizationClient } from "better-auth/client/plugins";
import { apiKeyClient } from "@better-auth/api-key/client";
import { ac, roles } from "@shared/permissions";

// Detecta automaticamente a URL base do host atual
// Em produção: https://canal.ness.com.br
// Em dev: http://localhost:5173 (proxy Vite encaminha /api/* para :8787)
const baseURL = `${window.location.origin}/api/auth`;

export const authClient = createAuthClient({ 
  baseURL,
  plugins: [
    adminClient(),
    organizationClient({ ac, roles }),
    apiKeyClient()
  ]
});

export const { signIn, signUp, signOut, useSession, organization, admin, apiKey } = authClient;

