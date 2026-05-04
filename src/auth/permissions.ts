/**
 * Canal SaaS — RBAC Permission Definitions
 *
 * Shared between server (auth.ts) and client (auth-client.ts).
 * Uses Better Auth's createAccessControl to define resources, actions, and roles.
 *
 * Roles:
 *   owner              — Full control, billing, org deletion
 *   admin              — Full control except org deletion/owner transfer
 *   editor             — Create/edit entries & media, read everything
 *   viewer             — Read-only access to all modules
 *   compliance-officer — Full compliance module + read-only elsewhere
 */
import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
  ownerAc,
  memberAc,
} from "better-auth/plugins/organization/access";

export const statement = {
  ...defaultStatements,
  // CMS Resources
  entry:      ["create", "read", "update", "delete", "publish"],
  media:      ["create", "read", "delete"],
  brand:      ["create", "read", "update", "delete"],
  // Compliance
  compliance: ["read", "manage", "export"],
  // Communications
  newsletter: ["create", "read", "send"],
  lead:       ["read", "update", "export"],
  // AI & Automation
  automation: ["read", "configure"],
  // Settings & Admin
  settings:   ["read", "update"],
} as const;

export const ac = createAccessControl(statement);

// ── Roles ──────────────────────────────────────────────────────────

export const owner = ac.newRole({
  ...ownerAc.statements,
  entry:      ["create", "read", "update", "delete", "publish"],
  media:      ["create", "read", "delete"],
  brand:      ["create", "read", "update", "delete"],
  compliance: ["read", "manage", "export"],
  newsletter: ["create", "read", "send"],
  lead:       ["read", "update", "export"],
  automation: ["read", "configure"],
  settings:   ["read", "update"],
});

export const admin = ac.newRole({
  ...adminAc.statements,
  entry:      ["create", "read", "update", "delete", "publish"],
  media:      ["create", "read", "delete"],
  brand:      ["create", "read", "update", "delete"],
  compliance: ["read", "manage", "export"],
  newsletter: ["create", "read", "send"],
  lead:       ["read", "update", "export"],
  automation: ["read", "configure"],
  settings:   ["read", "update"],
});

export const editor = ac.newRole({
  entry:      ["create", "read", "update"],
  media:      ["create", "read"],
  brand:      ["read"],
  compliance: ["read"],
  newsletter: ["create", "read"],
  lead:       ["read"],
  automation: ["read"],
  settings:   ["read"],
});

export const viewer = ac.newRole({
  entry:      ["read"],
  media:      ["read"],
  brand:      ["read"],
  compliance: ["read"],
  newsletter: ["read"],
  lead:       ["read"],
  automation: ["read"],
  settings:   ["read"],
});

export const complianceOfficer = ac.newRole({
  entry:      ["read"],
  media:      ["read"],
  brand:      ["read"],
  compliance: ["read", "manage", "export"],
  newsletter: ["read"],
  lead:       ["read", "export"],
  automation: ["read"],
  settings:   ["read"],
});

/** All roles for passing to organization({ roles }) */
export const roles = {
  owner,
  admin,
  editor,
  viewer,
  "compliance-officer": complianceOfficer,
};
