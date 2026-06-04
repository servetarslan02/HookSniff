/**
 * HookSniff Health Check Worker
 * 
 * Proxies /health requests to the Cloud Run API.
 * Caches response for 30 seconds to reduce Cloud Run requests.
 * Returns cached response if Cloud Run is unreachable.
 */

const API_URL = 'https://hooksniff-api-e6ztf3x2ma-ew.a.run.app';
const CACHE_TTL = 30; // seconds

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Only handle /health and /v1/health
    if (url.pathname !== '/health' && url.pathname !== '/v1/health') {
      return new Response('Not Found', { status: 404 });
    }

    // Try to get from cache first
    const cacheKey = new Request(request.url, request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);
    
    if (response) {
      // Add cache hit header
      const headers = new Headers(response.headers);
      headers.set('X-Cache', 'HIT');
      headers.set('X-Cache-TTL', `${CACHE_TTL}s`);
      return new Response(response.body, {
        status: response.status,
        headers
      });
    }

    // Cache miss - fetch from Cloud Run
    try {
      const apiResponse = await fetch(`${API_URL}/v1/health`, {
        headers: {
          'User-Agent': 'HookSniff-HealthWorker/1.0',
          'Accept': 'application/json'
        },
        // Timeout after 10 seconds
        signal: AbortSignal.timeout(10000)
      });

      // Clone response for cache
      const responseToCache = apiResponse.clone();
      
      // Add cache headers
      const headers = new Headers(apiResponse.headers);
      headers.set('X-Cache', 'MISS');
      headers.set('Cache-Control', `public, max-age=${CACHE_TTL}`);
      headers.set('Access-Control-Allow-Origin', '*');
      
      response = new Response(apiResponse.body, {
        status: apiResponse.status,
        headers
      });

      // Cache the response
      ctx.waitUntil(cache.put(cacheKey, responseToCache.clone()));
      
      return response;
    } catch (error) {
      // If Cloud Run is unreachable, return error
      return new Response(JSON.stringify({
        status: 'error',
        message: 'API unreachable',
        error: error.message,
        timestamp: new Date().toISOString(),
        worker: 'hooksniff-health'
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'ERROR',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
