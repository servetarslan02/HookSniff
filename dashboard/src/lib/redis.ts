import { Redis } from '@upstash/redis';

// Singleton Redis client — uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars
let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('Upstash Redis not configured — playground will use in-memory fallback'); // dev only
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

// In-memory fallback for local dev without Redis
const memoryStore = new Map<string, { data?: unknown; count?: number; expires: number }>();

export async function playgroundGet(key: string): Promise<unknown | null> {
  const r = getRedis();
  if (r) {
    try {
      return await r.get(key);
    } catch {
      console.warn('Redis playgroundGet failed, using in-memory fallback');
    }
  }
  // Fallback
  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    memoryStore.delete(key);
    return null;
  }
  return entry.data;
}

export async function playgroundSet(key: string, value: unknown, ttlSeconds = 86400): Promise<void> {
  const r = getRedis();
  if (r) {
    try {
      await r.set(key, value, { ex: ttlSeconds });
      return;
    } catch {
      // Redis error (e.g. rate limit exceeded) — fall through to in-memory
      console.warn('Redis playgroundSet failed, using in-memory fallback');
    }
  }
  // Fallback
  memoryStore.set(key, { data: value, expires: Date.now() + ttlSeconds * 1000 });
}

export async function playgroundDelete(key: string): Promise<void> {
  const r = getRedis();
  if (r) {
    try {
      await r.del(key);
      return;
    } catch {
      console.warn('Redis playgroundDelete failed, using in-memory fallback');
    }
  }
  memoryStore.delete(key);
}

export async function playgroundLpush(key: string, value: unknown, ttlSeconds = 86400): Promise<void> {
  const r = getRedis();
  if (r) {
    try {
      await r.lpush(key, value);
      await r.expire(key, ttlSeconds);
      return;
    } catch {
      console.warn('Redis playgroundLpush failed, using in-memory fallback');
    }
  }
  // Fallback — store as array
  const existing = (await playgroundGet(key)) as unknown[] | null;
  const arr = Array.isArray(existing) ? existing : [];
  arr.unshift(value);
  if (arr.length > 100) arr.pop(); // Keep last 100
  await playgroundSet(key, arr, ttlSeconds);
}

export async function playgroundLrange(key: string, start = 0, stop = -1): Promise<unknown[]> {
  const r = getRedis();
  if (r) {
    try {
      const data = await r.lrange(key, start, stop);
      return Array.isArray(data) ? data : [];
    } catch {
      console.warn('Redis playgroundLrange failed, using in-memory fallback');
    }
  }
  // Fallback
  const existing = (await playgroundGet(key)) as unknown[] | null;
  return Array.isArray(existing) ? existing.slice(start, stop === -1 ? undefined : stop + 1) : [];
}

// ─── Rate Limiting (Playground — herkes için sabit) ───

/**
 * Playground rate limit. Plan limitlerinden yemez.
 * IP bazlı, herkes için aynı.
 */
export async function checkRateLimit(
  ip: string,
  action: 'token' | 'request',
): Promise<{ allowed: boolean; remaining: number; retryAfter: number }> {
  const limits = {
    token: { max: 10, windowSec: 3600 },   // Saatte 10 token
    request: { max: 120, windowSec: 60 },   // Dakikada 120 istek
  };

  const { max, windowSec } = limits[action];
  const key = `rl:${action}:${ip}`;

  const r = getRedis();
  if (r) {
    try {
      const current = await r.incr(key);
      if (current === 1) {
        await r.expire(key, windowSec);
      }
      const ttl = await r.ttl(key);
      return {
        allowed: current <= max,
        remaining: Math.max(0, max - current),
        retryAfter: ttl > 0 ? ttl : windowSec,
      };
    } catch {
      // Redis error — allow request (fail open)
      return { allowed: true, remaining: max, retryAfter: 0 };
    }
  }

  // Fallback — in-memory rate limiting
  const memKey = `rl:${action}:${ip}`;
  const entry = memoryStore.get(memKey) as { count: number; expires: number } | undefined;
  const now = Date.now();

  if (!entry || now > entry.expires) {
    memoryStore.set(memKey, { count: 1, expires: now + windowSec * 1000 });
    return { allowed: true, remaining: max - 1, retryAfter: 0 };
  }

  entry.count++;
  return {
    allowed: entry.count <= max,
    remaining: Math.max(0, max - entry.count),
    retryAfter: Math.ceil((entry.expires - now) / 1000),
  };
}
