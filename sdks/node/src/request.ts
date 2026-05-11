/**
 * HookSniff HTTP Request Helper
 *
 * Modern, zero-dependency HTTP client using native fetch.
 * Handles auth, retries, error mapping, and idempotency keys.
 */

export const LIB_VERSION = "0.4.0";
const USER_AGENT = `hooksniff-sdk/${LIB_VERSION} (node)`;

export type HookSniffRequestContext = {
  baseUrl: string;
  token: string;
  timeout?: number;
  numRetries?: number;
  fetch?: typeof globalThis.fetch;
};

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
  HEAD = "HEAD",
  OPTIONS = "OPTIONS",
}

export class ApiException extends Error {
  public headers: Record<string, string> = {};

  constructor(
    public code: number,
    public statusText: string,
    public body: unknown,
    headers: Headers
  ) {
    super(`HookSniff API Error ${code} ${statusText}: ${JSON.stringify(body)}`);
    headers.forEach((value, name) => {
      this.headers[name] = value;
    });
  }
}

export class HookSniffRequest {
  private body?: string;
  private queryParams: Record<string, string> = {};
  private headerParams: Record<string, string> = {};
  private bodySet = false;

  constructor(
    private readonly method: HttpMethod,
    private path: string
  ) {}

  setPathParam(name: string, value: string): void {
    const encoded = encodeURIComponent(value);
    // Replace ALL occurrences of {name} in the path
    while (this.path.includes(`{${name}}`)) {
      this.path = this.path.replace(`{${name}}`, encoded);
    }
  }

  setQueryParams(params: Record<string, string | number | boolean | null | undefined>): void {
    for (const [name, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      this.queryParams[name] = String(value);
    }
  }

  setHeaderParam(name: string, value?: string): void {
    if (value !== undefined) {
      this.headerParams[name] = value;
    }
  }

  setBody(value: unknown): void {
    if (this.bodySet) {
      console.warn("HookSniff: setBody() called twice — overwriting previous body");
    }
    this.body = JSON.stringify(value);
    this.bodySet = true;
  }

  async send<T>(ctx: HookSniffRequestContext, parser?: (json: unknown) => T): Promise<T> {
    const response = await this.sendWithRetry(ctx);

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();

    // Empty body check
    if (!text || text.trim().length === 0) {
      if (parser) {
        throw new ApiException(
          response.status,
          response.statusText,
          "Empty response body",
          response.headers
        );
      }
      return undefined as T;
    }

    // Safe JSON parse
    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      throw new ApiException(
        response.status,
        response.statusText,
        `Invalid JSON response: ${text.substring(0, 200)}`,
        response.headers
      );
    }

    // Safe parser execution
    if (parser) {
      try {
        return parser(json);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new ApiException(
          response.status,
          response.statusText,
          `Response parsing failed: ${message}`,
          response.headers
        );
      }
    }

    return json as T;
  }

  async sendVoid(ctx: HookSniffRequestContext): Promise<void> {
    const response = await this.sendWithRetry(ctx);
    // Consume response body to free the connection
    await response.text().catch(() => {});
  }

  private async sendWithRetry(ctx: HookSniffRequestContext): Promise<Response> {
    const url = new URL(ctx.baseUrl + this.path);
    for (const [name, value] of Object.entries(this.queryParams)) {
      url.searchParams.set(name, value);
    }

    // Auto idempotency key for POST
    if (this.headerParams["idempotency-key"] === undefined && this.method === HttpMethod.POST) {
      this.headerParams["idempotency-key"] = `auto_${generateIdempotencyKey()}`;
    }

    const headers: Record<string, string> = {
      accept: "application/json",
      authorization: `Bearer ${ctx.token}`,
      "user-agent": USER_AGENT,
      ...this.headerParams,
    };

    if (this.body !== undefined) {
      headers["content-type"] = "application/json";
    }

    const fetchFn = ctx.fetch ?? globalThis.fetch;
    const maxRetries = ctx.numRetries ?? 2;
    const retryBaseMs = 50;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const controller = new AbortController();
      let timeoutId: ReturnType<typeof setTimeout> | undefined;

      try {
        if (ctx.timeout) {
          timeoutId = setTimeout(() => controller.abort(), ctx.timeout);
        }

        const response = await fetchFn(url, {
          method: this.method,
          headers,
          body: this.body,
          signal: controller.signal,
        });

        // Don't retry on 4xx — only 5xx
        if (response.status < 500) {
          if (response.status >= 400) {
            const errorBody = await response.text().catch(() => "Unknown error");
            let parsed: unknown;
            try {
              parsed = JSON.parse(errorBody);
            } catch {
              parsed = errorBody;
            }
            throw new ApiException(
              response.status,
              response.statusText,
              parsed,
              response.headers
            );
          }
          return response;
        }

        // 5xx — will retry
        const errorBody = await response.text().catch(() => "Unable to read response body");
        let parsed: unknown;
        try {
          parsed = JSON.parse(errorBody);
        } catch {
          parsed = errorBody;
        }
        lastError = new ApiException(response.status, response.statusText, parsed, response.headers);
      } catch (err) {
        if (err instanceof ApiException && err.code < 500) {
          throw err; // Don't retry client errors
        }
        lastError = err instanceof Error ? err : new Error(String(err));
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
      }

      // Exponential backoff with jitter: 50ms, 100ms, 200ms, ... + random jitter
      if (attempt < maxRetries) {
        const backoff = retryBaseMs * Math.pow(2, attempt);
        const jitter = Math.random() * retryBaseMs;
        await new Promise((r) => setTimeout(r, backoff + jitter));
      }
    }

    throw lastError ?? new Error("Request failed after retries");
  }
}

/**
 * Generate a unique idempotency key.
 * Uses crypto.randomUUID() when available (Node 18.4+),
 * falls back to timestamp + Math.random() for older runtimes.
 */
function generateIdempotencyKey(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `auto_${crypto.randomUUID()}`;
    }
  } catch {
    // crypto not available, fall through
  }
  // Fallback: timestamp + random hex (collision-safe for idempotency)
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  const random2 = Math.random().toString(36).substring(2, 10);
  return `auto_${timestamp}-${random}-${random2}`;
}
