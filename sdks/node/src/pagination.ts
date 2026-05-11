/**
 * HookSniff SDK — Pagination Iterator
 *
 * Provides async iteration over paginated API responses.
 * Works with any endpoint that returns { data: T[], has_more: boolean }.
 *
 * Usage:
 *   for await (const delivery of hs.webhooks.listAll()) {
 *     console.log(delivery.id);
 *   }
 */

export interface Page<T> {
  data: T[];
  has_more: boolean;
}

export interface PaginationOptions {
  /** Items per page (default: 50) */
  limit?: number;
  /** Maximum total items to fetch (default: unlimited) */
  maxItems?: number;
}

/**
 * Create an async generator that paginates through API results.
 *
 * @param fetchPage - Function that fetches a page given { limit, offset }
 * @param options - Pagination options (limit, maxItems)
 */
export async function* paginate<T>(
  fetchPage: (params: { limit: number; offset: number }) => Promise<Page<T>>,
  options?: PaginationOptions
): AsyncGenerator<T, void, undefined> {
  const limit = options?.limit ?? 50;
  const maxItems = options?.maxItems ?? Infinity;
  let offset = 0;
  let fetched = 0;

  while (fetched < maxItems) {
    const page = await fetchPage({ limit, offset });

    for (const item of page.data) {
      if (fetched >= maxItems) return;
      yield item;
      fetched++;
    }

    if (!page.has_more) return;
    if (page.data.length === 0) return; // Safety: avoid infinite loop on empty pages

    offset += page.data.length;
  }
}

/**
 * Collect all pages into a single array.
 * Convenience wrapper around paginate() for cases where
 * you need all results at once.
 */
export async function collectAll<T>(
  fetchPage: (params: { limit: number; offset: number }) => Promise<Page<T>>,
  options?: PaginationOptions
): Promise<T[]> {
  const results: T[] = [];
  for await (const item of paginate(fetchPage, options)) {
    results.push(item);
  }
  return results;
}
