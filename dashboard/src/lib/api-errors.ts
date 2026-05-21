/**
 * HookSniff Custom Error Classes
 *
 * Preserves error codes for i18n-friendly error handling.
 * The API returns { error: { code: string } }.
 */

/**
 * Structured API error with error code.
 * Components use `code` for i18n lookup.
 */
export class HookSniffError extends Error {
  /** API error code (e.g., 'INVALID_CREDENTIALS', 'SAML_MISSING_SIGNATURE') */
  public readonly code: string;
  /** HTTP status code */
  public readonly status: number;
  /** Whether this is a network/timeout error */
  public readonly isNetworkError: boolean;

  constructor(params: {
    message: string;
    code: string;
    status: number;
    isNetworkError?: boolean;
  }) {
    super(params.message);
    this.name = 'HookSniffError';
    this.code = params.code;
    this.status = params.status;
    this.isNetworkError = params.isNetworkError ?? false;
  }
}

/**
 * Create a HookSniffError from an API response.
 */
export function createApiError(
  responseBody: unknown,
  status: number
): HookSniffError {
  if (responseBody && typeof responseBody === 'object' && 'error' in responseBody) {
    const err = (responseBody as { error: { code?: string; message?: string } }).error;
    return new HookSniffError({
      message: err.message || `API error: ${status}`,
      code: err.code || 'UNKNOWN',
      status,
    });
  }

  return new HookSniffError({
    message: typeof responseBody === 'string' ? responseBody : `API error: ${status}`,
    code: 'UNKNOWN',
    status,
  });
}

/**
 * Create a network/timeout error.
 */
export function createNetworkError(message: string): HookSniffError {
  return new HookSniffError({
    message,
    code: 'NETWORK_ERROR',
    status: 0,
    isNetworkError: true,
  });
}
