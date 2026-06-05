'use client';
import { useRef, useEffect, useState } from 'react';

/**
 * Simple hook to prevent re-fetching data when switching tabs.
 * Once data is fetched, it stays in memory until page refresh.
 */
export function useTabCache<T>(key: string, fetcher: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cacheRef = useRef<Map<string, { data: T; time: number }>>(new Map());
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (fetchingRef.current) return;
    
    // Check cache (valid for 5 minutes)
    const cached = cacheRef.current.get(key);
    if (cached && Date.now() - cached.time < 300_000) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    fetchingRef.current = true;
    fetcher()
      .then((d) => {
        setData(d);
        cacheRef.current.set(key, { data: d, time: Date.now() });
      })
      .catch((e) => setError(e?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, deps);

  return { data, loading, error };
}

// Global cache shared across tab instances
const globalCache = new Map<string, { data: unknown; time: number }>();

export function useCachedFetch<T>(key: string, fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(() => {
    const cached = globalCache.get(key);
    if (cached && Date.now() - cached.time < 300_000) return cached.data as T;
    return null;
  });
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) return; // Already cached
    
    fetcher()
      .then((d) => {
        setData(d);
        globalCache.set(key, { data: d, time: Date.now() });
      })
      .catch((e) => setError(e?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, deps);

  return { data, loading, error, refetch: () => {
    setLoading(true);
    globalCache.delete(key);
    fetcher().then((d) => { setData(d); globalCache.set(key, { data: d, time: Date.now() }); }).finally(() => setLoading(false));
  }};
}
