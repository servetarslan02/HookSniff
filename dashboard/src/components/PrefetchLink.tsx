'use client';

import { useCallback, type ComponentProps, type MouseEvent } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { useQueryClient } from '@tanstack/react-query';

type LinkProps = ComponentProps<typeof Link>;

interface PrefetchLinkProps extends Omit<LinkProps, 'prefetch'> {
  /** React Query keys to prefetch on hover */
  prefetchData?: Array<{
    queryKey: readonly unknown[];
    queryFn: () => Promise<unknown>;
    staleTime?: number;
  }>;
  /** Prefetch the route chunk on hover (default: true) */
  prefetchRoute?: boolean;
  /** Delay before prefetching in ms (default: 100) */
  hoverDelay?: number;
}

/**
 * Next.js Link with hover-based prefetching for both route chunks and data.
 *
 * Stripe/Linear pattern:
 * - Hover over a nav link → route JS chunk starts downloading
 * - Simultaneously, API data is prefetched into React Query cache
 * - By the time user clicks, everything is ready → instant page load
 * - Small delay prevents accidental prefetches on quick mouse-overs
 *
 * @example
 * <PrefetchLink
 *   href="/deliveries"
 *   prefetchData={[{
 *     queryKey: ['deliveries', 'list'],
 *     queryFn: () => api.getDeliveries(),
 *   }]}
 * >
 *   Deliveries
 * </PrefetchLink>
 */
export function PrefetchLink({
  prefetchData,
  prefetchRoute = true,
  hoverDelay = 100,
  onMouseEnter,
  children,
  ...linkProps
}: PrefetchLinkProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleMouseEnter = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      onMouseEnter?.(e);

      // Small delay to avoid prefetching on accidental hovers
      const timer = setTimeout(() => {
        // Prefetch route chunk
        if (prefetchRoute) {
          router.prefetch(linkProps.href as string);
        }

        // Prefetch React Query data
        if (prefetchData) {
          for (const query of prefetchData) {
            queryClient.prefetchQuery({
              queryKey: query.queryKey,
              queryFn: query.queryFn,
              staleTime: query.staleTime ?? 5 * 60 * 1000, // 5 min default
            });
          }
        }
      }, hoverDelay);

      // Cleanup if mouse leaves before delay
      const handleMouseLeave = () => clearTimeout(timer);
      const target = e.currentTarget;
      target.addEventListener('mouseleave', handleMouseLeave, { once: true });
    },
    [onMouseEnter, prefetchRoute, prefetchData, hoverDelay, router, queryClient, linkProps.href]
  );

  return (
    <Link {...linkProps} prefetch={false} onMouseEnter={handleMouseEnter}>
      {children}
    </Link>
  );
}

/**
 * Hook for programmatic data prefetching.
 * Useful for prefetching on focus, visibility change, or custom triggers.
 *
 * @example
 * const { prefetch } = usePrefetch();
 *
 * // Prefetch when user focuses search
 * <input onFocus={() => prefetch({
 *   queryKey: ['search', 'recent'],
 *   queryFn: () => api.getRecentSearches(),
 * })} />
 */
export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetch = useCallback(
    (query: {
      queryKey: readonly unknown[];
      queryFn: () => Promise<unknown>;
      staleTime?: number;
    }) => {
      queryClient.prefetchQuery({
        queryKey: query.queryKey,
        queryFn: query.queryFn,
        staleTime: query.staleTime ?? 5 * 60 * 1000,
      });
    },
    [queryClient]
  );

  const prefetchMany = useCallback(
    (
      queries: Array<{
        queryKey: readonly unknown[];
        queryFn: () => Promise<unknown>;
        staleTime?: number;
      }>
    ) => {
      for (const query of queries) {
        queryClient.prefetchQuery({
          queryKey: query.queryKey,
          queryFn: query.queryFn,
          staleTime: query.staleTime ?? 5 * 60 * 1000,
        });
      }
    },
    [queryClient]
  );

  return { prefetch, prefetchMany };
}
