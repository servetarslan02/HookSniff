'use client';

import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

interface InfiniteVirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  overscan?: number;
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  className?: string;
  emptyMessage?: string;
  /** Daha fazla veri var mı? */
  hasMore?: boolean;
  /** Veri yükleniyor mu? */
  isLoading?: boolean;
  /** Daha fazla veri yükle */
  onLoadMore?: () => void;
  /** Loading spinner customizasyonu */
  loadingComponent?: ReactNode;
}

/**
 * InfiniteVirtualList — Virtual Scrolling + Infinite Scroll birleşimi
 * 
 * 100.000+ kayıt olsa bile sadece görünür satırlar render edilir.
 * Scroll sonuna yaklaşırken otomatik olarak daha fazla veri yüklenir.
 */
export function InfiniteVirtualList<T>({
  items,
  height,
  itemHeight,
  overscan = 5,
  renderItem,
  keyExtractor,
  className = '',
  emptyMessage = 'Veri bulunamadı',
  hasMore = false,
  isLoading = false,
  onLoadMore,
  loadingComponent,
}: InfiniteVirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  // RAF ile throttle
  const rafRef = useRef<number>(0);
  const throttledScroll = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Infinite scroll
  const { sentinelRef } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: onLoadMore || (() => {}),
    rootMargin: '0px 0px 400px 0px',
  });

  if (items.length === 0 && !isLoading) {
    return (
      <div className={`flex items-center justify-center text-gray-400 dark:text-gray-500 py-12 ${className}`} style={{ height }}>
        {emptyMessage}
      </div>
    );
  }

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + height) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = startIndex * itemHeight;

  return (
    <div
      ref={containerRef}
      onScroll={throttledScroll}
      className={`overflow-auto ${className}`}
      style={{ height, willChange: 'transform' }}
    >
      <div style={{ height: totalHeight + (hasMore ? 60 : 0), position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, i) => (
            <div key={keyExtractor(item, startIndex + i)} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + i)}
            </div>
          ))}
        </div>

        {/* Infinite scroll sentinel */}
        {hasMore && (
          <div ref={sentinelRef} className="flex items-center justify-center py-4">
            {isLoading ? (
              loadingComponent || (
                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                  <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-brand-500 rounded-full animate-spin" />
                  <span className="text-sm">Yükleniyor...</span>
                </div>
              )
            ) : (
              <div className="h-1" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
