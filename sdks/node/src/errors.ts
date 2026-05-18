/**
 * HookSniff Error Classes
 *
 * Provides specific error types for different HTTP status codes.
 * All errors extend `HookSniffError` which extends `Error`.
 */

/** Base error class for all HookSniff errors */
export class HookSniffError extends Error {
  public readonly statusCode: number;
  public readonly headers: Record<string, string>;

  constructor(statusCode: number, message: string, headers: Record<string, string> = {}) {
    super(message);
    this.name = "HookSniffError";
    this.statusCode = statusCode;
    this.headers = headers;
  }
}

/** 400 Bad Request — The request was malformed or missing required fields */
export class BadRequestError extends HookSniffError {
  public readonly detail?: string;

  constructor(detail?: string, headers: Record<string, string> = {}) {
    super(400, detail || "Bad request", headers);
    this.name = "BadRequestError";
    this.detail = detail;
  }
}

/** 401 Unauthorized — Invalid or missing authentication */
export class UnauthorizedError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(401, message || "Unauthorized", headers);
    this.name = "UnauthorizedError";
  }
}

/** 403 Forbidden — Insufficient permissions */
export class ForbiddenError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(403, message || "Forbidden", headers);
    this.name = "ForbiddenError";
  }
}

/** 404 Not Found — Resource does not exist */
export class NotFoundError extends HookSniffError {
  public readonly resourceType?: string;
  public readonly resourceId?: string;

  constructor(message?: string, headers: Record<string, string> = {}) {
    super(404, message || "Not found", headers);
    this.name = "NotFoundError";
  }
}

/** 409 Conflict — Resource already exists or conflict with current state */
export class ConflictError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(409, message || "Conflict", headers);
    this.name = "ConflictError";
  }
}

/** 422 Unprocessable Entity — Validation error */
export class UnprocessableEntityError extends HookSniffError {
  public readonly validationErrors: ValidationErrorItem[];

  constructor(
    validationErrors: ValidationErrorItem[] = [],
    message?: string,
    headers: Record<string, string> = {}
  ) {
    super(422, message || "Unprocessable entity", headers);
    this.name = "UnprocessableEntityError";
    this.validationErrors = validationErrors;
  }
}

/** 429 Too Many Requests — Rate limit exceeded */
export class RateLimitError extends HookSniffError {
  public readonly retryAfter?: number;

  constructor(retryAfter?: number, headers: Record<string, string> = {}) {
    super(429, `Rate limit exceeded${retryAfter ? ` (retry after ${retryAfter}s)` : ""}`, headers);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

/** 500 Internal Server Error */
export class InternalServerError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(500, message || "Internal server error", headers);
    this.name = "InternalServerError";
  }
}

/** 502 Bad Gateway */
export class BadGatewayError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(502, message || "Bad gateway", headers);
    this.name = "BadGatewayError";
  }
}

/** 503 Service Unavailable */
export class ServiceUnavailableError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(503, message || "Service unavailable", headers);
    this.name = "ServiceUnavailableError";
  }
}

/** 504 Gateway Timeout */
export class GatewayTimeoutError extends HookSniffError {
  constructor(message?: string, headers: Record<string, string> = {}) {
    super(504, message || "Gateway timeout", headers);
    this.name = "GatewayTimeoutError";
  }
}

/** Validation error item from 422 responses */
export interface ValidationErrorItem {
  /** Location of the error (e.g., ["body", "email"]) */
  loc: string[];
  /** Error message */
  msg: string;
  /** Error type (e.g., "value_error", "type_error") */
  type: string;
}

/**
 * Create the appropriate error class from a status code and response body.
 */
export function createErrorFromStatus(
  statusCode: number,
  body: any,
  headers: Record<string, string> = {}
): HookSniffError {
  switch (statusCode) {
    case 400:
      return new BadRequestError(body?.detail, headers);
    case 401:
      return new UnauthorizedError(body?.detail, headers);
    case 403:
      return new ForbiddenError(body?.detail, headers);
    case 404:
      return new NotFoundError(body?.detail, headers);
    case 409:
      return new ConflictError(body?.detail, headers);
    case 422:
      return new UnprocessableEntityError(body?.detail || [], body?.detail, headers);
    case 429: {
      const retryAfter = headers["retry-after"]
        ? parseInt(headers["retry-after"], 10)
        : undefined;
      return new RateLimitError(retryAfter, headers);
    }
    case 500:
      return new InternalServerError(body?.detail, headers);
    case 502:
      return new BadGatewayError(body?.detail, headers);
    case 503:
      return new ServiceUnavailableError(body?.detail, headers);
    case 504:
      return new GatewayTimeoutError(body?.detail, headers);
    default:
      return new HookSniffError(
        statusCode,
        body?.detail || `HTTP ${statusCode}`,
        headers
      );
  }
}
