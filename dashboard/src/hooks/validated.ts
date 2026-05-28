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
    return schema.parse(data);
  };
}
