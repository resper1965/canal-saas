/**
 * Canal CMS — Shared D1 Row Types
 * 
 * Typed interfaces for D1 query results to eliminate `as any` casts.
 */

export interface EntryRow {
  id: string;
  collection_id: string;
  slug: string | null;
  locale: string;
  status: string;
  data: string;
  tenant_id: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  featured?: number;
}

export interface MediaRow {
  id: string;
  r2_key: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  alt_text: string | null;
  width: number | null;
  height: number | null;
  tenant_id: string | null;
  created_at: string;
}

export interface LeadRow {
  id: number;
  name: string;
  contact: string;
  intent: string;
  urgency: string;
  source: string;
  status: string;
  tenant_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface FormRow {
  id: number;
  source: string;
  payload: string;
  status: string;
  created_at: string;
}

export interface CanalApiKey {
  id: string;
  name: string;
  key?: string;
  prefix: string;
  userId: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface OrgMember {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
  };
}
