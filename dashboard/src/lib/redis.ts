import { Redis } from '@upstash/redis';

// Singleton Redis client — uses UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN env vars
let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('Upstash Redis not configured — playground will use in-memory fallback');
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

// In-memory fallback for local dev without Redis
const memoryStore = new Map<string, { data: unknown; expires: number }>();

export async function playgroundGet(key: string): Promise<unknown | null> {
  const r = getRedis();
  if (r) {
    return r.get(key);
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
    await r.set(key, value, { ex: ttlSeconds });
    return;
  }
  // Fallback
  memoryStore.set(key, { data: value, expires: Date.now() + ttlSeconds * 1000 });
}

export async function playgroundDelete(key: string): Promise<void> {
  const r = getRedis();
  if (r) {
    await r.del(key);
    return;
  }
  memoryStore.delete(key);
}

export async function playgroundLpush(key: string, value: unknown, ttlSeconds = 86400): Promise<void> {
  const r = getRedis();
  if (r) {
    await r.lpush(key, value);
    await r.expire(key, ttlSeconds);
    return;
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
    const data = await r.lrange(key, start, stop);
    return Array.isArray(data) ? data : [];
  }
  // Fallback
  const existing = (await playgroundGet(key)) as unknown[] | null;
  return Array.isArray(existing) ? existing.slice(start, stop === -1 ? undefined : stop + 1) : [];
}
