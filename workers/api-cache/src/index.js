/**
 * HookSniff API Cache Worker
 * 
 * Caches expensive GET requests in Workers KV to reduce Cloud Run load.
 * 
 * Cacheable endpoints (read-heavy, expensive SQL):
 * - /v1/analytics/* (delivery trends, success rate, latency)
 * - /v1/cortex/stats, /v1/cortex/anomalies, /v1/cortex/predictions
 * - /v1/endpoint-health/* (health stats)
 * - /v1/templates (rarely changes)
 * - /v1/schemas (rarely changes)
 * - /v1/outbound-ips (rarely changes)
 * - /v1/routing (config, rarely changes)
 * 
 * NOT cached:
 * - User-specific data (api-keys, teams, billing)
 * - Real-time data (stream, events)
 * - Write operations (POST, PUT, DELETE)
 */

const API_URL = 'https://hooksniff-api-e6ztf3x2ma-ew.a.run.app';

// D1 Analytics handler functions
async function handleIngest(request, env) {
  try {
    const body = await request.json();
    const { table, rows } = body;
    
    if (!table || !rows || !Array.isArray(rows)) {
      return jsonResponse({ error: 'Missing table or rows' }, 400);
    }

    // Validate table name (whitelist)
    const allowedTables = ['delivery_stats', 'endpoint_health', 'daily_stats', 'error_summary'];
    if (!allowedTables.includes(table)) {
      return jsonResponse({ error: 'Invalid table name' }, 400);
    }

    // Insert rows into D1
    let inserted = 0;
    for (const row of rows) {
      const columns = Object.keys(row);
      const values = Object.values(row);
      const placeholders = columns.map((_, i) => `?${i + 1}`).join(', ');
      const colNames = columns.join(', ');
      
      const sql = `INSERT INTO ${table} (${colNames}) VALUES (${placeholders})`;
      await env.ANALYTICS.prepare(sql).bind(...values).run();
      inserted++;
    }

    return jsonResponse({ success: true, inserted });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

async function handleQuery(request, env) {
  try {
    const body = await request.json();
    const { sql, params } = body;
    
    if (!sql) {
      return jsonResponse({ error: 'Missing sql' }, 400);
    }

    // Only allow SELECT queries
    if (!sql.trim().toUpperCase().startsWith('SELECT')) {
      return jsonResponse({ error: 'Only SELECT queries allowed' }, 403);
    }

    const result = await env.ANALYTICS.prepare(sql).bind(...(params || [])).all();
    return jsonResponse({ success: true, rows: result.results, meta: result.meta });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

async function handleStats(request, env) {
  try {
    // Get table row counts
    const tables = ['delivery_stats', 'endpoint_health', 'daily_stats', 'error_summary'];
    const stats = {};
    
    for (const table of tables) {
      const result = await env.ANALYTICS.prepare(
        `SELECT count(*) as count FROM ${table}`
      ).first();
      stats[table] = result?.count || 0;
    }

    return jsonResponse({ success: true, stats });
  } catch (error) {
    return jsonResponse({ error: error.message }, 500);
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// Cache TTL per endpoint group (seconds)
const CACHE_TTL = {
  analytics: 60,      // 1 minute — changes frequently
  cortex: 120,        // 2 minutes — ML computations
  'endpoint-health': 60, // 1 minute
  templates: 3600,    // 1 hour — rarely changes
  schemas: 3600,      // 1 hour — rarely changes
  'outbound-ips': 86400, // 24 hours — very stable
  routing: 300,       // 5 minutes — config changes
  alerts: 30,         // 30 seconds — near real-time
};

// Endpoints that should NEVER be cached
const NEVER_CACHE = [
  '/v1/auth',
  '/v1/api-keys',
  '/v1/teams',
  '/v1/billing',
  '/v1/admin',
  '/v1/stream',
  '/v1/events',
  '/v1/webhooks',  // delivery list changes constantly
  '/v1/playground',
  '/v1/simulator',
];

function getCacheTtl(pathname) {
  for (const [prefix, ttl] of Object.entries(CACHE_TTL)) {
    if (pathname.includes(`/${prefix}`)) return ttl;
  }
  return 0; // Not cacheable
}

function shouldCache(pathname, method) {
  // Only cache GET requests
  if (method !== 'GET') return false;
  
  // Never cache certain endpoints
  for (const prefix of NEVER_CACHE) {
    if (pathname.startsWith(prefix)) return false;
  }
  
  return getCacheTtl(pathname) > 0;
}

function makeCacheKey(request) {
  const url = new URL(request.url);
  // Include auth header hash to separate user-specific data
  const auth = request.headers.get('Authorization') || '';
  const authHash = auth ? hashCode(auth) : 'anon';
  return `api:${authHash}:${url.pathname}${url.search}`;
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * HookSniff Cache + D1 Analytics Worker
 * 
 * Handles:
 * - API response caching via KV
 * - D1 analytics data ingestion
 * - D1 analytics queries
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const method = request.method;

    // D1 Analytics endpoints
    if (url.pathname === '/internal/analytics/ingest' && method === 'POST') {
      return handleIngest(request, env);
    }
    if (url.pathname === '/internal/analytics/query' && method === 'POST') {
      return handleQuery(request, env);
    }
    if (url.pathname === '/internal/analytics/stats' && method === 'GET') {
      return handleStats(request, env);
    }

    // Existing cache proxy logic
    if (!shouldCache(url.pathname, method)) {
      return fetch(`${API_URL}${url.pathname}${url.search}`, {
        method,
        headers: request.headers,
        body: method !== 'GET' ? request.body : undefined,
      });
    }

    const cacheKey = makeCacheKey(request);
    const ttl = getCacheTtl(url.pathname);
    
    // Try KV cache first
    try {
      const cached = await env.CACHE.get(cacheKey, { type: 'json' });
      if (cached) {
        return new Response(JSON.stringify(cached.data), {
          status: cached.status,
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
            'X-Cache-TTL': `${ttl}s`,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': `public, max-age=${ttl}`,
          },
        });
      }
    } catch (e) {
      console.error('KV read error:', e.message);
    }

    // Cache miss — fetch from API
    try {
      const apiResponse = await fetch(`${API_URL}${url.pathname}${url.search}`, {
        method: 'GET',
        headers: {
          'Authorization': request.headers.get('Authorization') || '',
          'Accept': 'application/json',
          'User-Agent': 'HookSniff-CacheWorker/1.0',
        },
      });

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        
        ctx.waitUntil(
          env.CACHE.put(cacheKey, JSON.stringify({
            data,
            status: apiResponse.status,
            cached_at: new Date().toISOString(),
          }), {
            expirationTtl: ttl,
          })
        );

        return new Response(JSON.stringify(data), {
          status: apiResponse.status,
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'MISS',
            'X-Cache-TTL': `${ttl}s`,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': `public, max-age=${ttl}`,
          },
        });
      }

      return apiResponse;
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'API unreachable',
        message: error.message,
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'ERROR',
        },
      });
    }
  }
};
