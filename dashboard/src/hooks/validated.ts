'use client';

/**
 * Schema-validated fetcher wrapper for React Query.
 * Wraps an async fetcher so the result is validated against a Zod schema.
 */
export function validated<T>(
  fetcher: () => Promise<unknown>,
  schema: { safeParse: (data: unknown) => { success: true; data: T } | { success: false; error: unknown } }
): () => Promise<T | unknown> {
  return async () => {
    const data = await fetcher();
    const parsed = schema.safeParse(data);

    if (!parsed.success) {
      return data;
    }

    return {
      ...(data as Record<string, unknown>),
      ...(parsed.data as Record<string, unknown>),
    } as T;
  };
}
