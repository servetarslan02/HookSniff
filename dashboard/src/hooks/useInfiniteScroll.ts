'use client';

import { useRef, useCallback, useEffect, useState } from 'react';

interface UseInfiniteScrollOptions {
  /** Daha fazla veri var mı? */
  hasMore: boolean;
  /** Veri yükleniyor mu? */
  isLoading: boolean;
  /** Daha fazla veri yükle fonksiyonu */
  onLoadMore: () => void;
  /** Sayfanın altından ne kadar px önce tetiklensin (default: 200) */
  threshold?: number;
  /** Root margin for IntersectionObserver (default: '0px 0px 200px 0px') */
  rootMargin?: string;
}

/**
 * Infinite Scroll — IntersectionObserver tabanlı
 * 
 * Scroll sonuna yaklaşırken otomatik olarak daha fazla veri yükler.
 * Eski pagination kodunun yerine geçer.
 */
export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 200,
  rootMargin = '0px 0px 200px 0px',
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  // Guard: çift tetiklemeyi önle
  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading && !loadingRef.current) {
        loadingRef.current = true;
        onLoadMore();
        // Reset after a short delay to prevent rapid-fire
        setTimeout(() => { loadingRef.current = false; }, 300);
      }
    },
    [hasMore, isLoading, onLoadMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin,
      threshold: 0,
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [handleIntersect, rootMargin]);

  return { sentinelRef };
}

/**
 * usePaginatedInfiniteScroll — Sayfalı API'ler için infinite scroll
 * 
 * Mevcut page-based API'lerle uyumlu çalışır.
 * Otomatik olarak sayfa numarasını artırır.
 */
export function usePaginatedInfiniteScroll({
  hasMore,
  isLoading,
  currentPage,
  onPageChange,
  threshold = 200,
}: {
  hasMore: boolean;
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  threshold?: number;
}) {
  const handleLoadMore = useCallback(() => {
    onPageChange(currentPage + 1);
  }, [currentPage, onPageChange]);

  return useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: handleLoadMore,
    threshold,
  });
}
