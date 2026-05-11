/**
 * HookSniff HTTP Request Helper
 *
 * Modern, zero-dependency HTTP client using native fetch.
 * Handles auth, retries, error mapping, and idempotency keys.
 */

export const LIB_VERSION = "0.4.0";
const USER_AGENT = `hooksniff-sdk/${LIB_VERSION}/node`;

export type HookSniffRequestContext = {
  baseUrl: string;
  token: string;
  timeout?: number;
  numRetries?: number;
};

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  PATCH = "PATCH",
}

export class ApiException extends Error {
  public headers: Record<string, string> = {};

  constructor(
    public code: number,
    public body: unknown,
    headers: Headers
  ) {
    super(`HookSniff API Error ${code}: ${JSON.stringify(body)}`);
    headers.forEach((value, name) => {
      this.headers[name] = value;
    });
  }
}

export class HookSniffRequest {
  private body?: string;
  private queryParams: Record<string, string> = {};
  private headerParams: Record<string, string> = {};

  constructor(
    private readonly method: HttpMethod,
    private path: string
  ) {}

  setPathParam(name: string, value: string): void {
    this.path = this.path.replace(`{${name}}`, encodeURIComponent(value));
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
    this.body = JSON.stringify(value);
  }

  async send<T>(ctx: HookSniffRequestContext, parser?: (json: unknown) => T): Promise<T> {
    const response = await this.sendWithRetry(ctx);

    if (response.status === 204) {
      return undefined as T;
    }

    const text = await response.text();
    const json = JSON.parse(text);
    return parser ? parser(json) : (json as T);
  }

  async sendVoid(ctx: HookSniffRequestContext): Promise<void> {
    await this.sendWithRetry(ctx);
  }

  private async sendWithRetry(ctx: HookSniffRequestContext): Promise<Response> {
    const url = new URL(ctx.baseUrl + this.path);
    for (const [name, value] of Object.entries(this.queryParams)) {
      url.searchParams.set(name, value);
    }

    // Auto idempotency key for POST
    if (this.headerParams["idempotency-key"] === undefined && this.method === HttpMethod.POST) {
      this.headerParams["idempotency-key"] = `auto_${crypto.randomUUID()}`;
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

    const maxRetries = ctx.numRetries ?? 2;
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = ctx.timeout
          ? setTimeout(() => controller.abort(), ctx.timeout)
          : undefined;

        const response = await fetch(url, {
          method: this.method,
          headers,
          body: this.body,
          signal: controller.signal,
        });

        if (timeoutId) clearTimeout(timeoutId);

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
            throw new ApiException(response.status, parsed, response.headers);
          }
          return response;
        }

        // 5xx — will retry
        lastError = new ApiException(response.status, await response.text(), response.headers);
      } catch (err) {
        if (err instanceof ApiException && err.code < 500) {
          throw err; // Don't retry client errors
        }
        lastError = err instanceof Error ? err : new Error(String(err));
      }

      // Exponential backoff: 50ms, 100ms, 200ms, ...
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 50 * Math.pow(2, attempt)));
      }
    }

    throw lastError ?? new Error("Request failed after retries");
  }
}
