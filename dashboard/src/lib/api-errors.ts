/**
 * HookSniff Custom Error Classes
 * 
 * Preserves error codes and raw messages for i18n-friendly error handling.
 */

/** Error code from the API */
export type ApiErrorCode =
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'BAD_REQUEST'
  | 'PAYLOAD_TOO_LARGE'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'DATABASE_ERROR'
  | 'SERIALIZATION_ERROR'
  | string;

/**
 * Structured API error with code and raw message.
 * Components can use `errorKey` for i18n lookup, or fall back to `message`.
 */
export class HookSniffError extends Error {
  /** API error code (e.g., 'BAD_REQUEST', 'UNAUTHORIZED') */
  public readonly code: ApiErrorCode;
  /** Raw message from the API (may be technical) */
  public readonly rawMessage: string;
  /** HTTP status code */
  public readonly status: number;
  /** Whether this is a network/timeout error */
  public readonly isNetworkError: boolean;

  constructor(params: {
    message: string;
    code: ApiErrorCode;
    status: number;
    isNetworkError?: boolean;
  }) {
    super(params.message);
    this.name = 'HookSniffError';
    this.code = params.code;
    this.rawMessage = params.message;
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
