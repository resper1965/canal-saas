/**
 * Canal CMS — Security Utilities
 *
 * Helpers de segurança: hashing de API keys, input sanitization, CSRF.
 */

// ── API Key Hashing (SHA-256) ───────────────────────────────────

export async function hashApiKey(rawKey: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(rawKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ── Input Sanitization (XSS Prevention) ─────────────────────────

const DANGEROUS_TAGS = /<\s*(script|iframe|object|embed|form|meta|link|base|applet)[^>]*>[\s\S]*?<\/\s*\1\s*>/gi;
const DANGEROUS_SELF_CLOSING = /<\s*(script|iframe|object|embed|form|meta|link|base|applet)[^>]*\/?>/gi;
const EVENT_HANDLERS = /\s+on\w+\s*=\s*["'][^"']*["']/gi;
const JAVASCRIPT_URLS = /\b(href|src|action)\s*=\s*["']\s*javascript:/gi;
const DATA_URLS_SCRIPT = /\b(href|src)\s*=\s*["']\s*data:\s*text\/html/gi;

export function sanitizeHtml(input: string): string {
  if (typeof input !== "string") return "";
  return input
    .replace(DANGEROUS_TAGS, "")
    .replace(DANGEROUS_SELF_CLOSING, "")
    .replace(EVENT_HANDLERS, "")
    .replace(JAVASCRIPT_URLS, "")
    .replace(DATA_URLS_SCRIPT, "");
}

export function sanitizeEntryData(
  data: Record<string, unknown>
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeHtml(value);
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeEntryData(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

// ── CSRF Origin Validation ──────────────────────────────────────

const TRUSTED_ORIGINS = new Set([
  "https://canal.bekaa.eu",
  "http://localhost:5173",
  "http://localhost:8787",
]);

export function isValidOrigin(
  origin: string | undefined,
  allowedDomains?: string[]
): boolean {
  if (!origin) return true; // Same-origin requests don't send Origin
  if (TRUSTED_ORIGINS.has(origin)) return true;
  if (allowedDomains) {
    return allowedDomains.some((d) => origin === `https://${d}` || origin === `http://${d}`);
  }
  return false;
}
