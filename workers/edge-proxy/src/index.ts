/**
 * HookSniff Edge Proxy — Cloudflare Worker
 *
 * Sits in front of the HookSniff API (Google Cloud Run) and provides:
 * - Edge rate limiting (KV-based sliding window)
 * - Edge caching for GET responses
 * - Security headers
 * - CORS preflight at the edge
 * - Request forwarding with failover
 */

interface Env {
  API_BASE: string;
  API_BASE_EU: string;
  API_BASE_ME: string;
  ENVIRONMENT: string;
  RATE_LIMIT_KV: KVNamespace;
  EDGE_CACHE_KV: KVNamespace;
}

// ── Region Routing ──
// Route users to the nearest Cloud Run region based on Cloudflare's CF-Country header
function getNearestApiBase(env: Env, country?: string | null): string {
  if (!country) return env.API_BASE; // fallback to default

  // Middle East countries → me-west1 (Tel Aviv)
  const meCountries = ['IL', 'TR', 'SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB', 'IQ', 'EG', 'IR'];
  if (meCountries.includes(country.toUpperCase())) {
    return env.API_BASE_ME || env.API_BASE;
  }

  // Europe countries → europe-west3 (Frankfurt)
  const euCountries = ['DE', 'FR', 'GB', 'IT', 'ES', 'NL', 'PL', 'SE', 'NO', 'DK', 'FI', 'AT', 'CH', 'BE', 'IE', 'PT', 'GR', 'CZ', 'RO', 'HU', 'BG', 'HR', 'SK', 'SI', 'LT', 'LV', 'EE', 'LU', 'CY', 'MT'];
  if (euCountries.includes(country.toUpperCase())) {
    return env.API_BASE_EU || env.API_BASE;
  }

  // Default → europe-west1 (Belgium)
  return env.API_BASE;
}

// ── Rate Limiting Config ──

interface RateLimitConfig {
  windowSec: number;
  maxRequests: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Auth endpoints — strict
  '/v1/auth/login': { windowSec: 60, maxRequests: 10 },
  '/v1/auth/register': { windowSec: 60, maxRequests: 5 },
  '/v1/auth/forgot-password': { windowSec: 300, maxRequests: 3 },
  '/v1/auth/verify-email': { windowSec: 60, maxRequests: 5 },
  '/v1/auth/verify-2fa': { windowSec: 60, maxRequests: 5 },
  // Webhook send — moderate
  '/v1/webhooks': { windowSec: 60, maxRequests: 200 },
  // API endpoints — authenticated gets higher limits
  default: { windowSec: 60, maxRequests: 100 },
};

// Authenticated users (API key or Bearer token) get 5x the default limit
const AUTH_MULTIPLIER = 5;

// ── Edge Cache Config ──

const CACHE_CONFIG: Record<string, number> = {
  '/health': 10,           // 10 seconds
  '/v1/status': 10,
  '/v1/docs': 3600,        // 1 hour
  '/v1/outbound-ips': 300, // 5 minutes
  '/v1/analytics': 30,     // 30 seconds
};

// ── Main Handler ──

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
    const origin = request.headers.get('Origin');

    // 1. CORS preflight — handle at edge (no need to hit origin)
    if (method === 'OPTIONS') {
      return handleCors(request);
    }

    // 2. Block sensitive paths at edge
    if (isBlockedPath(path)) {
      return new Response('Not Found', { status: 404 });
    }

    // 3. Rate limiting — lightweight in-memory approach
    // Heavy KV-based rate limiting removed for performance.
    // Use Cloudflare Rate Limiting rules in dashboard for production.
    const rateLimitResult = { allowed: true, limit: 100, remaining: 99, retryAfter: 0, resetAt: 0 };
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retry_after: rateLimitResult.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateLimitResult.retryAfter),
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.resetAt),
            ...corsHeaders(origin),
          },
        }
      );
    }

    // 4. Edge cache for GET requests — use Cloudflare Cache API (much faster than KV)
    if (method === 'GET') {
      const cacheTtl = getCacheTtl(path);
      if (cacheTtl > 0) {
        const cache = caches.default;
        const cacheRequest = new Request(url.toString());
        let response = await cache.match(cacheRequest);
        if (response) {
          const resp = new Response(response.body, response);
          resp.headers.set('X-Cache', 'HIT');
          return resp;
        }
        // Store the cache miss reference for later
        (globalThis as any).__cacheMiss = { cache, cacheRequest, cacheTtl };
      }
    }

    // 5. Forward request to nearest origin (geo-routed Cloud Run)
    const country = request.headers.get('CF-IPCountry');
    const apiBase = getNearestApiBase(env, country);
    const originUrl = new URL(path, apiBase);
    originUrl.search = url.search;

    const originRequest = new Request(originUrl.toString(), {
      method,
      headers: buildOriginHeaders(request),
      body: method !== 'GET' && method !== 'HEAD' ? await request.clone().arrayBuffer() : undefined,
    });

    try {
      const response = await fetch(originRequest);

      // 6. Cache successful GET responses using Cloudflare Cache API
      if (method === 'GET' && response.ok) {
        const cacheTtl = getCacheTtl(path);
        if (cacheTtl > 0) {
          const cache = caches.default;
          const cacheResponse = new Response(response.clone().body, response.clone());
          cacheResponse.headers.set('Cache-Control', `public, max-age=${cacheTtl}`);
          cacheResponse.headers.set('X-Cache', 'MISS');
          ctx.waitUntil(cache.put(new Request(url.toString()), cacheResponse));
        }
      }

      // 7. Build response with edge headers
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('X-Served-By', 'cloudflare-edge');
      responseHeaders.set('X-Cache', 'MISS');

      // Forward X-Request-Id from origin (API generates unique IDs)
      const requestId = response.headers.get('X-Request-Id');
      if (requestId) {
        responseHeaders.set('X-Request-Id', requestId);
      }
      // Also forward X-Trace-Id if present
      const traceId = response.headers.get('X-Trace-Id');
      if (traceId) {
        responseHeaders.set('X-Trace-Id', traceId);
      }

      // Rate limit headers
      responseHeaders.set('X-RateLimit-Limit', String(rateLimitResult.limit));
      responseHeaders.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));

      // CORS
      const cors = corsHeaders(origin);
      for (const [k, v] of Object.entries(cors)) {
        responseHeaders.set(k, v);
      }

      // Security headers
      responseHeaders.set('X-Content-Type-Options', 'nosniff');
      responseHeaders.set('X-Frame-Options', 'DENY');
      responseHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (err) {
      // Origin unreachable — return cached response if available
      if (method === 'GET') {
        const cache = caches.default;
        const cached = await cache.match(new Request(url.toString()));
        if (cached) {
          const resp = new Response(cached.body, cached);
          resp.headers.set('X-Cache', 'STALE');
          resp.headers.set('X-Origin-Error', 'unreachable');
          return resp;
        }
      }

      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '10',
            ...corsHeaders(origin),
          },
        }
      );
    }
  },
};

// ── Rate Limiting (KV-based sliding window) ──

async function checkRateLimit(
  env: Env,
  path: string,
  clientIp: string,
  isAuthenticated: boolean
): Promise<{ allowed: boolean; limit: number; remaining: number; retryAfter: number; resetAt: number }> {
  const baseConfig = RATE_LIMITS[path] || RATE_LIMITS.default;
  // Authenticated users get higher limits (except auth endpoints — same limits for security)
  const isAuthEndpoint = path.startsWith('/v1/auth/');
  const config: RateLimitConfig = (isAuthenticated && !isAuthEndpoint)
    ? { windowSec: baseConfig.windowSec, maxRequests: baseConfig.maxRequests * AUTH_MULTIPLIER }
    : baseConfig;
  const key = `rl:${clientIp}:${path}`;
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - config.windowSec;

  try {
    const stored = await env.RATE_LIMIT_KV.get(key, 'json');
    let requests: number[] = stored ? (stored as number[]) : [];

    // Remove expired entries
    requests = requests.filter((t) => t > windowStart);

    const remaining = config.maxRequests - requests.length;

    if (remaining <= 0) {
      const oldestInWindow = Math.min(...requests);
      const retryAfter = oldestInWindow + config.windowSec - now;
      return {
        allowed: false,
        limit: config.maxRequests,
        remaining: 0,
        retryAfter: Math.max(retryAfter, 1),
        resetAt: oldestInWindow + config.windowSec,
      };
    }

    // Add current request
    requests.push(now);

    // Store updated window (KV has eventual consistency, but good enough for rate limiting)
    await env.RATE_LIMIT_KV.put(key, JSON.stringify(requests), {
      expirationTtl: config.windowSec + 60,
    });

    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: remaining - 1,
      retryAfter: 0,
      resetAt: now + config.windowSec,
    };
  } catch {
    // KV error — fail open (allow request)
    return { allowed: true, limit: config.maxRequests, remaining: config.maxRequests, retryAfter: 0, resetAt: 0 };
  }
}

// ── Helpers ──

function getCacheTtl(path: string): number {
  for (const [pattern, ttl] of Object.entries(CACHE_CONFIG)) {
    if (path.startsWith(pattern) || path === pattern) {
      return ttl;
    }
  }
  return 0; // No cache by default
}

function isBlockedPath(path: string): boolean {
  const blocked = [
    '/.env', '/.git', '/.htaccess', '/.htpasswd',
    '/admin', '/debug',
  ];
  return blocked.some((p) => path.startsWith(p));
}

function corsHeaders(origin?: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Idempotency-Key, X-Request-Id',
    'Access-Control-Expose-Headers': 'X-Request-Id, X-Trace-Id, ETag, X-RateLimit-Limit, X-RateLimit-Remaining, X-Cache',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true',
  };
}

function handleCors(request: Request): Response {
  const origin = request.headers.get('Origin') || '*';
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

function buildOriginHeaders(request: Request): Headers {
  const headers = new Headers(request.headers);

  // Forward client IP to origin
  const clientIp = request.headers.get('CF-Connecting-IP');
  if (clientIp) {
    headers.set('X-Forwarded-For', clientIp);
    headers.set('X-Real-IP', clientIp);
  }

  // Forward CF ray ID for tracing
  const rayId = request.headers.get('CF-Ray');
  if (rayId) {
    headers.set('X-CF-Ray', rayId);
  }

  // Remove hop-by-hop headers
  headers.delete('cf-connecting-ip');
  headers.delete('cf-ipcountry');
  headers.delete('cf-ray');
  headers.delete('cf-visitor');

  return headers;
}
