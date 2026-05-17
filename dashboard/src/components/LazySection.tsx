'use client';

import { useState, useEffect, useRef, type ReactNode, type CSSProperties } from 'react';

interface LazySectionProps {
  children: ReactNode;
  /** Placeholder shown while loading (default: skeleton) */
  fallback?: ReactNode;
  /** Load content when it's this many pixels from viewport (default: 300) */
  rootMargin?: number;
  /** Fade-in duration in ms (default: 300) */
  fadeMs?: number;
  /** Minimum height to prevent layout shift (default: auto) */
  minHeight?: number | string;
  /** Callback when section becomes visible */
  onVisible?: () => void;
  /** Disable lazy loading (render immediately) */
  eager?: boolean;
}

const defaultSkeleton = (
  <div className="glass-card p-6 animate-pulse space-y-4">
    <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-md w-1/3" />
    <div className="space-y-2.5">
      <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded-md w-full" />
      <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded-md w-5/6" />
      <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded-md w-2/3" />
    </div>
  </div>
);

const tableSkeleton = (
  <div className="glass-card p-6 animate-pulse space-y-3">
    <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-md w-1/4 mb-4" />
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md flex-1" />
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md w-24" />
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md w-16" />
      </div>
    ))}
  </div>
);

const chartSkeleton = (
  <div className="glass-card p-6 animate-pulse">
    <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-md w-1/3 mb-4" />
    <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-xl" />
  </div>
);

/**
 * Lazy-loads section content when it enters (or approaches) the viewport.
 * Uses IntersectionObserver for performant scroll-based detection.
 *
 * Stripe/Linear pattern:
 * - Content loads ~300px before entering viewport (feels instant)
 * - Smooth fade-in transition (no jarring pop-in)
 * - Layout shift prevention with minHeight
 * - Multiple skeleton presets (card, table, chart)
 *
 * @example
 * // Basic usage
 * <LazySection>
 *   <HeavyChart />
 * </LazySection>
 *
 * @example
 * // Table with custom skeleton
 * <LazySection fallback={<TableSkeleton rows={5} />}>
 *   <DeliveryTable data={data} />
 * </LazySection>
 *
 * @example
 * // Prefetch data when section becomes visible
 * <LazySection onVisible={() => queryClient.prefetchQuery(...)}>
 *   <AnalyticsPanel />
 * </LazySection>
 */
export function LazySection({
  children,
  fallback = defaultSkeleton,
  rootMargin = 300,
  fadeMs = 300,
  minHeight,
  onVisible,
  eager = false,
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(eager);
  const [hasFadedIn, setHasFadedIn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (eager) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onVisible?.();
          observer.disconnect();
        }
      },
      { rootMargin: `${rootMargin}px`, threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, onVisible, eager]);

  // Trigger fade-in after mount
  useEffect(() => {
    if (isVisible && !hasFadedIn) {
      // Small delay to ensure the browser has painted the skeleton first
      const timer = requestAnimationFrame(() => setHasFadedIn(true));
      return () => cancelAnimationFrame(timer);
    }
  }, [isVisible, hasFadedIn]);

  const style: CSSProperties = {
    minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight,
    transition: `opacity ${fadeMs}ms ease-out`,
    opacity: hasFadedIn ? 1 : 0,
  };

  return (
    <div ref={ref} style={style}>
      {isVisible ? children : fallback}
    </div>
  );
}

/** Preset skeleton variants for common UI patterns */
export const Skeletons = {
  /** Generic card skeleton */
  card: defaultSkeleton,
  /** Table with rows */
  table: (rows = 5) => (
    <div className="glass-card p-6 animate-pulse space-y-3">
      <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded-md w-1/4 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md flex-1" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md w-24" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md w-16" />
        </div>
      ))}
    </div>
  ),
  /** Chart/graph skeleton */
  chart: chartSkeleton,
  /** Stat cards row */
  statCards: (count = 4) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-5 animate-pulse">
          <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-md w-1/2 mb-3" />
          <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded-md w-2/3" />
        </div>
      ))}
    </div>
  ),
  /** Full page skeleton (header + content) */
  page: (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-md w-1/4" />
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-md w-1/2" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5">
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-md w-1/2 mb-3" />
            <div className="h-7 bg-gray-200 dark:bg-slate-700 rounded-md w-2/3" />
          </div>
        ))}
      </div>
      <div className="glass-card p-6">
        <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-xl" />
      </div>
    </div>
  ),
};
