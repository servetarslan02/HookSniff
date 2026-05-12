/**
 * HookSniff Error Catalog
 * Item 282: Centralized error codes and user-friendly messages.
 * Item 283: User-facing error messages instead of developer-facing ones.
 */

/** Error codes used by the HookSniff API */
export const ERROR_CODES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  TWO_FACTOR_REQUIRED: 'TWO_FACTOR_REQUIRED',
  INVALID_2FA_CODE: 'INVALID_2FA_CODE',

  // Validation
  BAD_REQUEST: 'BAD_REQUEST',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_URL: 'INVALID_URL',
  INVALID_PAYLOAD: 'INVALID_PAYLOAD',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ENDPOINT_NOT_FOUND: 'ENDPOINT_NOT_FOUND',
  DELIVERY_NOT_FOUND: 'DELIVERY_NOT_FOUND',
  CUSTOMER_NOT_FOUND: 'CUSTOMER_NOT_FOUND',
  TEAM_NOT_FOUND: 'TEAM_NOT_FOUND',

  // Rate Limiting
  RATE_LIMITED: 'RATE_LIMITED',
  WEBHOOK_LIMIT_EXCEEDED: 'WEBHOOK_LIMIT_EXCEEDED',
  ENDPOINT_LIMIT_EXCEEDED: 'ENDPOINT_LIMIT_EXCEEDED',

  // Billing
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  PLAN_UPGRADE_REQUIRED: 'PLAN_UPGRADE_REQUIRED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',

  // Server Errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',

  // Conflicts
  CONFLICT: 'CONFLICT',
  DUPLICATE_EMAIL: 'DUPLICATE_EMAIL',
  DUPLICATE_ENDPOINT: 'DUPLICATE_ENDPOINT',
  DUPLICATE_DOMAIN: 'DUPLICATE_DOMAIN',

  // CSRF
  CSRF_TOKEN_INVALID: 'CSRF_TOKEN_INVALID',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * User-friendly error messages mapped to error codes.
 * These are safe to display to end users.
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Auth
  UNAUTHORIZED: 'Please sign in to continue.',
  FORBIDDEN: 'You don\'t have permission to perform this action.',
  TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address first.',
  TWO_FACTOR_REQUIRED: 'Two-factor authentication is required.',
  INVALID_2FA_CODE: 'Invalid verification code. Please try again.',

  // Validation
  BAD_REQUEST: 'The request couldn\'t be processed. Please check your input.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_URL: 'Please enter a valid URL.',
  INVALID_PAYLOAD: 'The data format is invalid. Please check and try again.',
  MISSING_REQUIRED_FIELD: 'Please fill in all required fields.',
  PAYLOAD_TOO_LARGE: 'The file or data is too large.',

  // Resources
  NOT_FOUND: 'The requested resource was not found.',
  ENDPOINT_NOT_FOUND: 'The webhook endpoint was not found.',
  DELIVERY_NOT_FOUND: 'The delivery record was not found.',
  CUSTOMER_NOT_FOUND: 'The account was not found.',
  TEAM_NOT_FOUND: 'The team was not found.',

  // Rate Limiting
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  WEBHOOK_LIMIT_EXCEEDED: 'You\'ve reached your monthly webhook limit. Please upgrade your plan.',
  ENDPOINT_LIMIT_EXCEEDED: 'You\'ve reached your endpoint limit. Please upgrade your plan.',

  // Billing
  PAYMENT_REQUIRED: 'A payment method is required to continue.',
  SUBSCRIPTION_EXPIRED: 'Your subscription has expired. Please renew to continue.',
  PLAN_UPGRADE_REQUIRED: 'This feature requires a plan upgrade.',
  PAYMENT_FAILED: 'Payment processing failed. Please check your payment method.',

  // Server
  INTERNAL_ERROR: 'Something went wrong. Please try again later.',
  SERVICE_UNAVAILABLE: 'The service is temporarily unavailable. Please try again later.',
  DATABASE_ERROR: 'A system error occurred. Please try again later.',
  EXTERNAL_SERVICE_ERROR: 'An external service is unavailable. Please try again later.',

  // Conflicts
  CONFLICT: 'This action conflicts with the current state. Please refresh and try again.',
  DUPLICATE_EMAIL: 'An account with this email already exists.',
  DUPLICATE_ENDPOINT: 'An endpoint with this URL already exists.',
  DUPLICATE_DOMAIN: 'This domain is already registered.',

  // CSRF
  CSRF_TOKEN_INVALID: 'Security token expired. Please refresh the page and try again.',
};

/**
 * Get a user-friendly error message for an error code.
 * Falls back to the generic message if the code is unknown.
 */
export function getUserFriendlyMessage(code: string): string {
  return ERROR_MESSAGES[code as ErrorCode] ?? ERROR_MESSAGES.INTERNAL_ERROR;
}

/**
 * Extract error code from API response.
 * The API returns { error: { code: string, message: string } }
 */
export function extractErrorCode(err: unknown): string | null {
  if (err && typeof err === 'object') {
    // Check for { error: { code: "..." } }
    if ('error' in err && err.error && typeof err.error === 'object' && 'code' in err.error) {
      return String((err.error as { code: unknown }).code);
    }
    // Check for { code: "..." }
    if ('code' in err) {
      return String((err as { code: unknown }).code);
    }
  }
  return null;
}
