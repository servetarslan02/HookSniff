'use client';

/**
 * Schema-validated fetcher wrapper for React Query.
 * Wraps an async fetcher so the result is validated against a Zod schema.
 */
export function validated<T>(
  fetcher: () => Promise<unknown>,
  schema: { parse: (data: unknown) => T }
): () => Promise<T> {
  return async () => {
    const data = await fetcher();
    return schema.parse(data);
  };
}
