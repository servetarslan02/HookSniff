/**
 * HookSniff SDK — Auto-pagination iterator
 * Provides `for await` pagination over list endpoints.

 * Usage:
 *   for await (const ep of hooksniff.endpoints.list()) {
 *     console.log(ep.id);
 *   }
 */

export interface ListResponse<T> {
  data: T[];
  iterator?: string | null;
  done?: boolean;
}

export interface PaginationOptions {
  limit?: number;
  iterator?: string | null;
}

/**
 * Creates an async iterator that automatically fetches the next page
 * until all items are consumed.
 */
export function paginatedIterator<T, O extends PaginationOptions = PaginationOptions>(
  fetchPage: (options?: O) => Promise<ListResponse<T>>,
  options?: O
): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]() {
      let currentIterator: string | null | undefined = options?.iterator ?? null;
      let done = false;
      let buffer: T[] = [];
      let bufferIndex = 0;

      return {
        async next(): Promise<IteratorResult<T>> {
          // If buffer has items, return next
          if (bufferIndex < buffer.length) {
            return { value: buffer[bufferIndex++], done: false };
          }

          // If we're done, return
          if (done) {
            return { value: undefined as unknown as T, done: true };
          }

          // Fetch next page
          const pageOptions = {
            ...options,
            iterator: currentIterator,
          } as O;

          const response = await fetchPage(pageOptions);

          buffer = response.data ?? [];
          bufferIndex = 0;

          // Check if there are more pages
          if (response.done === true || !response.iterator || buffer.length === 0) {
            done = true;
          } else {
            currentIterator = response.iterator;
          }

          // If this page was empty, we're done
          if (buffer.length === 0) {
            return { value: undefined as unknown as T, done: true };
          }

          return { value: buffer[bufferIndex++], done: false };
        },
      };
    },
  };
}
