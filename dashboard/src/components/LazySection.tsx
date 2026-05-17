'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';

interface LazySectionProps {
  children: ReactNode;
  /** Placeholder shown while loading (default: skeleton) */
  fallback?: ReactNode;
  /** Load content when it's this many pixels from viewport (default: 200) */
  rootMargin?: number;
}

const defaultSkeleton = (
  <div className="glass-card p-6 animate-pulse">
    <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/3 mb-4" />
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm w-full" />
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm w-2/3" />
    </div>
  </div>
);

/**
 * Lazy-loads section content when it enters (or approaches) the viewport.
 * Uses IntersectionObserver for performant scroll-based detection.
 *
 * Usage:
 *   <LazySection>
 *     <HeavyChart />
 *   </LazySection>
 */
export function LazySection({ children, fallback = defaultSkeleton, rootMargin = 200 }: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: `${rootMargin}px` }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return <div ref={ref}>{isVisible ? children : fallback}</div>;
}
