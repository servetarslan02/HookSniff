/**
 * Safely extract error message from unknown error type.
 * @param err - The error to extract message from
 * @param fallback - i18n fallback string (callers should pass translated text)
 */
export function getErrorMessage(err: unknown, fallback = 'Unknown error'): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
  return fallback;
}
