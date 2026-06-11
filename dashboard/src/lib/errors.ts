import { getUserFriendlyMessage } from './error-catalog';

/**
 * Safely extract error message from unknown error type.
 * @param err - The error to extract message from
 * @param fallback - i18n fallback string (callers should pass translated text)
 */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  // HookSniffError with code → try error catalog first
  if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
    const code = String((err as { code: unknown }).code);
    const msg = String((err as { message: unknown }).message);
    // If message is a generic "API error: XXX", use catalog instead
    if (msg.startsWith('API error:') || msg.startsWith('Something went wrong')) {
      return getUserFriendlyMessage(code) || msg;
    }
    return msg;
  }
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) return String((err as { message: unknown }).message);
  return fallback;
}
