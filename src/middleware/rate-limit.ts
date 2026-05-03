/**
 * Canal CMS — Rate Limiter Middleware
 *
 * Sliding window via KV. Limita requests por API key ou IP.
 * Limites configuráveis por plano do tenant.
 */

import type { Context } from "hono";

interface RateLimitConfig {
  windowMs: number;    // Window size in ms (default: 60000 = 1 min)
  limits: Record<string, number>; // plan → max requests per window
  defaultLimit: number; // fallback
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60_000, // 1 minute
  limits: {
    free: 20,
    starter: 100,
    pro: 500,
    enterprise: 10_000,
  },
  defaultLimit: 30,
};

export function rateLimiter(config: Partial<RateLimitConfig> = {}) {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  return async (c: Context, next: () => Promise<void>) => {
    const kv = (c.env as any).CANAL_KV as KVNamespace | undefined;
    if (!kv) {
      // KV not available: skip rate limiting (dev mode)
      await next();
      return;
    }

    // Identify caller: API key prefix or IP
    const authHeader = c.req.header("Authorization") || "";
    const apiKeyMatch = authHeader.match(/^Bearer (pk_\w{7})/);
    const identifier = apiKeyMatch
      ? apiKeyMatch[1]
      : c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "unknown";

    // Determine plan from tenant metadata (set by resolveApiKeyOrSession)
    const plan = (c.get("tenantPlan") as string) || "free";
    const limit = cfg.limits[plan] ?? cfg.defaultLimit;

    // Sliding window key: rate:{identifier}:{minute_bucket}
    const bucket = Math.floor(Date.now() / cfg.windowMs);
    const key = `rate:${identifier}:${bucket}`;

    try {
      const current = parseInt((await kv.get(key)) || "0", 10);

      if (current >= limit) {
        const retryAfter = Math.ceil(cfg.windowMs / 1000);
        c.header("Retry-After", String(retryAfter));
        c.header("X-RateLimit-Limit", String(limit));
        c.header("X-RateLimit-Remaining", "0");
        c.header("X-RateLimit-Reset", String(bucket + 1));
        return c.json(
          { error: "Too many requests", retryAfter },
          429
        );
      }

      // Increment counter (fire-and-forget for perf)
      c.executionCtx.waitUntil(
        kv.put(key, String(current + 1), {
          expirationTtl: Math.ceil(cfg.windowMs / 1000) + 10,
        })
      );

      // Set rate limit headers
      c.header("X-RateLimit-Limit", String(limit));
      c.header("X-RateLimit-Remaining", String(limit - current - 1));
    } catch (e) {
      // KV error: allow through (fail-open for availability)
    }

    await next();
  };
}
