// HookSniff Edge Worker — Cloudflare Workers
// Handles: caching, rate limiting, security headers, custom domain routing
const ORIGIN = 'https://hooksniff-api-1046140057667.europe-west1.run.app';
const KNOWN_HOSTS = ['hooksniff.vercel.app', 'hookrelay.com', 'hooksniff.com', 'localhost'];
const CACHE_TTL = { '/health': 30, '/v1/status': 30, '/v1/outbound-ips': 3600, '/v1/stats': 120, '/v1/analytics/': 30 };
const NEVER_CACHE = ['/v1/auth/','/v1/webhooks/','/v1/deliveries/','/v1/billing/','/v1/endpoints/','/v1/teams/','/v1/api-keys/','/v1/notifications/','/v1/settings/','/v1/portal/'];
const RATE_LIMIT = 100;
const rateLimitMap = new Map();
const domainCache = new Map();
const DOMAIN_CACHE_TTL = 300000;

function checkRateLimit(ip) {
  const now = Date.now();
  if (!rateLimitMap.has(ip)) { rateLimitMap.set(ip, { count: 1, windowStart: now }); return true; }
  const entry = rateLimitMap.get(ip);
  if (now - entry.windowStart > 60000) { entry.count = 1; entry.windowStart = now; return true; }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

function cleanupRateLimits() {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) { if (now - entry.windowStart > 120000) rateLimitMap.delete(ip); }
}

function addSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set('x-content-type-options', 'nosniff');
  headers.set('x-frame-options', 'DENY');
  headers.set('x-xss-protection', '1; mode=block');
  headers.set('strict-transport-security', 'max-age=31536000; includeSubDomains');
  headers.set('referrer-policy', 'strict-origin-when-cross-origin');
  headers.set('x-edge-location', 'cf-worker');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function getCacheKey(request) {
  const url = new URL(request.url);
  const auth = request.headers.get('authorization') || '';
  const authHash = auth ? btoa(auth.slice(0, 20)).slice(0, 8) : 'anon';
  return url.pathname + url.search + ':' + authHash;
}

async function getFromEdgeCache(cacheKey) {
  return await caches.default.match(new Request('https://cache.hooksniff.dev' + cacheKey));
}

async function putToEdgeCache(cacheKey, response, ttlSeconds) {
  const cacheResponse = new Response(response.body, response);
  cacheResponse.headers.set('cache-control', 'public, max-age=' + ttlSeconds);
  await caches.default.put(new Request('https://cache.hooksniff.dev' + cacheKey), cacheResponse.clone());
  return cacheResponse;
}

async function lookupCustomDomain(host) {
  const domain = host.split(':')[0].toLowerCase();
  const cached = domainCache.get(domain);
  if (cached && Date.now() - cached.ts < DOMAIN_CACHE_TTL) return cached.customerId;
  try {
    const resp = await fetch(ORIGIN + '/v1/custom-domains/lookup/' + domain);
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data.found && data.customer_id) {
      domainCache.set(domain, { customerId: data.customer_id, ts: Date.now() });
      return data.customer_id;
    }
    domainCache.set(domain, { customerId: null, ts: Date.now() - DOMAIN_CACHE_TTL + 60000 });
    return null;
  } catch { return null; }
}

export default {
  async fetch(request, env, ctx) {
  cleanupRateLimits();
  const url = new URL(request.url);
  const clientIp = request.headers.get('cf-connecting-ip') || 'unknown';
  const method = request.method;
  const host = url.hostname;

  if (!checkRateLimit(clientIp)) {
    return new Response(JSON.stringify({ error: 'rate_limit_exceeded', message: 'Too many requests.' }), {
      status: 429, headers: { 'content-type': 'application/json', 'retry-after': '60' }
    });
  }

  if (url.pathname.startsWith('/v1/auth/')) {
    const authLimit = 20;
    const now = Date.now();
    const authKey = 'auth:' + clientIp;
    const authEntry = rateLimitMap.get(authKey);
    if (authEntry && now - authEntry.windowStart < 60000 && authEntry.count > authLimit) {
      return new Response(JSON.stringify({ error: 'rate_limit_exceeded' }), { status: 429, headers: { 'content-type': 'application/json', 'retry-after': '60' } });
    }
    if (!authEntry || now - authEntry.windowStart > 60000) rateLimitMap.set(authKey, { count: 1, windowStart: now });
    else authEntry.count++;
  }

  // Custom Domain Routing
  const isKnownHost = KNOWN_HOSTS.some(h => host === h || host.endsWith('.' + h));
  if (!isKnownHost) {
    const customerId = await lookupCustomDomain(host);
    if (!customerId) {
      return new Response(JSON.stringify({ error: 'domain_not_configured', message: 'This custom domain is not configured.' }), { status: 404, headers: { 'content-type': 'application/json' } });
    }
    const originHeaders = new Headers(request.headers);
    originHeaders.set('x-hooksniff-customer-id', customerId);
    originHeaders.set('x-hooksniff-custom-domain', host);
    const originResponse = await fetch(ORIGIN + url.pathname + url.search, { method, headers: originHeaders, body: method !== 'GET' && method !== 'HEAD' ? request.body : undefined });
    const response = addSecurityHeaders(originResponse);
    response.headers.set('x-custom-domain', 'true');
    return response;
  }

  // Normal routing
  const isNeverCache = NEVER_CACHE.some(p => url.pathname.startsWith(p));
  if (isNeverCache || method !== 'GET') {
    const originResponse = await fetch(ORIGIN + url.pathname + url.search, { method, headers: request.headers, body: method !== 'GET' && method !== 'HEAD' ? request.body : undefined });
    const response = addSecurityHeaders(originResponse);
    response.headers.set('x-cache', 'SKIP');
    return response;
  }

  const cacheTtl = Object.entries(CACHE_TTL).find(([path]) => url.pathname.startsWith(path));
  if (cacheTtl) {
    const ttl = cacheTtl[1];
    const cacheKey = getCacheKey(request);
    const cached = await getFromEdgeCache(cacheKey);
    if (cached) { const r = addSecurityHeaders(cached); r.headers.set('x-cache', 'HIT'); return r; }
    const originResponse = await fetch(ORIGIN + url.pathname + url.search, { method, headers: request.headers });
    if (originResponse.ok) { const r = await putToEdgeCache(cacheKey, originResponse, ttl); const f = addSecurityHeaders(r); f.headers.set('x-cache', 'MISS'); return f; }
    return addSecurityHeaders(originResponse);
  }

  const originResponse = await fetch(ORIGIN + url.pathname + url.search, { method, headers: request.headers });
  return addSecurityHeaders(originResponse);
  }
};
