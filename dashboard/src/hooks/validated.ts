'use client';

import type { ZodType, z } from 'zod';

/**
 * Schema-validated fetcher wrapper for React Query.
 * Wraps an async fetcher so the result is validated against a Zod schema.
 */
export function validated<T extends ZodType>(
  fetcher: () => Promise<unknown>,
  schema: T
): () => Promise<z.infer<T>> {
  return async () => {
    const data = await fetcher();
    try {
      return schema.parse(data);
    } catch (err) {
      console.error('[validated] Schema validation failed:', err, '\nRaw data:', data);
      throw err;
    }
  };
}
