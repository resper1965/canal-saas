/**
 * Canal Admin — API Client v2
 * Genérico: fala com /api/v1/collections/:slug/entries
 */

const BASE = '/api/v1';

export interface EntryMeta {
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface EntryListResponse {
  data: Record<string, unknown>[];
  meta: EntryMeta;
}

export interface CollectionDef {
  id: string;
  slug: string;
  label: string;
  label_plural: string;
  icon: string;
  has_locale: number;
  has_slug: number;
  has_status: number;
  fields: FieldDef[];
}

export interface FieldDef {
  name: string;
  type: string;
  label?: string;
  required?: boolean;
  defaultValue?: unknown;
  options?: string[];
}

/** Busca todas as collections registradas. (Apenas resumo) */
export async function fetchCollections(): Promise<CollectionDef[]> {
  const res = await fetch(`${BASE}/collections`, { credentials: 'include' });
  const data = await res.json() as Record<string, unknown> | unknown[];
  const list = Array.isArray(data) ? data : (data as { data?: unknown[] })?.data ?? [];
  return (list as Record<string, unknown>[]).map((c) => ({
    ...c,
    fields: typeof c.fields === 'string' ? JSON.parse(c.fields as string) : c.fields ?? [],
  })) as CollectionDef[];
}

/** Busca schema detalhado de uma collection (Com campos) */
export async function fetchCollection(slug: string): Promise<CollectionDef | null> {
  const res = await fetch(`${BASE}/collections/${slug}`, { credentials: 'include' });
  if (!res.ok) return null;
  const c = await res.json() as Record<string, unknown>;
  return {
    ...c,
    fields: typeof c.fields === 'string' ? JSON.parse(c.fields as string) : c.fields ?? [],
  } as CollectionDef;
}

/** Busca entries de uma collection */
export async function fetchEntries(
  slug: string,
  params: { locale?: string; page?: number; status?: string } = {}
): Promise<EntryListResponse> {
  const qs = new URLSearchParams();
  if (params.locale) qs.set('locale', params.locale);
  if (params.page) qs.set('page', String(params.page));
  if (params.status) qs.set('status', params.status);
  const res = await fetch(`${BASE}/collections/${slug}/entries?${qs}`, { credentials: 'include' });
  return res.json() as Promise<EntryListResponse>;
}

/** Busca uma entry pelo ID */
export async function fetchEntry(slug: string, id: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE}/collections/${slug}/entries/${id}`, { credentials: 'include' });
  const data = await res.json() as { data: Record<string, unknown> };
  return data.data;
}

/** Cria uma nova entry */
export async function createEntry(slug: string, body: Record<string, unknown>) {
  const res = await fetch(`${BASE}/collections/${slug}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return res.json();
}

/** Atualiza uma entry existente */
export async function updateEntry(slug: string, id: string, body: Record<string, unknown>) {
  const res = await fetch(`${BASE}/collections/${slug}/entries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  return res.json();
}

/** Remove uma entry */
export async function deleteEntry(slug: string, id: string) {
  const res = await fetch(`${BASE}/collections/${slug}/entries/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return res.json();
}

/** Busca a lista de media */
export async function fetchMedia(params: { page?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  const res = await fetch(`${BASE}/media?${qs}`, { credentials: 'include' });
  return res.json() as Promise<{ data: Record<string, unknown>[]; meta: EntryMeta }>;
}

/** Upload de media */
export async function uploadMedia(file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/media`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  });
  return res.json();
}

/** Remove media */
export async function deleteMedia(id: string) {
  const res = await fetch(`${BASE}/media/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return res.json();
}

/** Altera status de publicação de uma entry */
export async function toggleEntryStatus(slug: string, id: string, status: 'published' | 'draft') {
  const res = await fetch(`${BASE}/collections/${slug}/entries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  return res.json();
}

/** Altera status de destaque (featured) de uma entry */
export async function toggleEntryFeatured(slug: string, id: string, featured: boolean) {
  const res = await fetch(`${BASE}/collections/${slug}/entries/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ featured }),
  });
  return res.json();
}

/** Encaminha um formulário via email (Resend) */
export async function forwardForm(id: string, emails: string[]) {
  const res = await fetch(`${BASE}/collections/forms/entries/${id}/forward`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ emails }),
  });
  return res.json();
}

export interface AIWriteParams {
  brief: string;
  field: string;
  collection: string;
  tone: 'tecnico' | 'consultivo' | 'executivo';
  locale?: string;
}

/** Gera conteúdo assistido por IA (streaming) */
export async function generateWithAI(params: AIWriteParams): Promise<ReadableStream<string>> {
  const res = await fetch('/api/content-agent/write', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`AI writer error: ${res.status}`);
  if (!res.body) throw new Error('No response body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream<string>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      const text = decoder.decode(value, { stream: true });
      if (text) {
        controller.enqueue(text);
      }
    },
  });
}

