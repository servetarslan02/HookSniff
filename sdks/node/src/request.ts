import { ApiException, type XOR } from "./util";
import type { HttpErrorOut, HTTPValidationError } from "./HttpErrors";
import { createErrorFromStatus, HookSniffError } from "./errors";

export const LIB_VERSION = "1.0.0";
const USER_AGENT = `hooksniff-libs/${LIB_VERSION}/javascript`;

export enum HttpMethod {
  GET = "GET",
  HEAD = "HEAD",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  CONNECT = "CONNECT",
  OPTIONS = "OPTIONS",
  TRACE = "TRACE",
  PATCH = "PATCH",
}

export type HookSniffRequestContext = {
  /** The API base URL */
  baseUrl: string;
  /** The 'bearer' scheme access token */
  token: string;
  /** Time in milliseconds to wait for requests to get a response. */
  timeout?: number;
  /** Enable debug logging */
  debug?: boolean;
  /**
   * Custom fetch implementation to use for HTTP requests.
   */
  fetch?: typeof fetch;
} & XOR<
  {
    /** List of delays (in milliseconds) to wait before each retry attempt.*/
    retryScheduleInMs?: number[];
  },
  {
    /** The number of times the client will retry if a server-side error
     *  or timeout is received.
     *  Default: 2
     */
    numRetries?: number;
  }
>;

type QueryParameter = string | boolean | number | Date | string[] | null | undefined;

export class HookSniffRequest {
  constructor(
    private readonly method: HttpMethod,
    private path: string
  ) {}

  private body?: string;
  private queryParams: Record<string, string> = {};
  private headerParams: Record<string, string> = {};

  public setPathParam(name: string, value: string) {
    const newPath = this.path.replace(`{${name}}`, encodeURIComponent(value));
    if (this.path === newPath) {
      throw new Error(`path parameter ${name} not found`);
    }
    this.path = newPath;
  }

  public setQueryParams(params: { [name: string]: QueryParameter }) {
    for (const [name, value] of Object.entries(params)) {
      this.setQueryParam(name, value);
    }
  }

  public setQueryParam(name: string, value: QueryParameter) {
    if (value === undefined || value === null) {
      return;
    }

    if (typeof value === "string") {
      this.queryParams[name] = value;
    } else if (typeof value === "boolean" || typeof value === "number") {
      this.queryParams[name] = value.toString();
    } else if (value instanceof Date) {
      this.queryParams[name] = value.toISOString();
    } else if (Array.isArray(value)) {
      if (value.length > 0) {
        this.queryParams[name] = value.join(",");
      }
    } else {
      const _assert_unreachable: never = value;
      throw new Error(`query parameter ${name} has unsupported type`);
    }
  }

  public setHeaderParam(name: string, value?: string) {
    if (value === undefined) {
      return;
    }

    this.headerParams[name] = value;
  }

  public setBody(value: any) {
    this.body = JSON.stringify(value);
  }

  /**
   * Send this request, returning the request body as a caller-specified type.
   *
   * - 422 → `ApiException<HTTPValidationError>`
   * - 4xx → `ApiException<HttpErrorOut>`
   * - 429 → Auto-retry with Retry-After header
   * - 5xx → Auto-retry with exponential backoff
   */
  public async send<R>(
    ctx: HookSniffRequestContext,
    parseResponseBody: (jsonObject: any) => R
  ): Promise<R> {
    const response = await this.sendInner(ctx);
    if (response.status === 204) {
      return <R>null;
    }
    const responseBody = await response.text();
    return parseResponseBody(JSON.parse(responseBody));
  }

  /** Same as `send`, but the response body is discarded, not parsed. */
  public async sendNoResponseBody(ctx: HookSniffRequestContext): Promise<void> {
    await this.sendInner(ctx);
  }

  private async sendInner(ctx: HookSniffRequestContext): Promise<Response> {
    const url = new URL(ctx.baseUrl + this.path);
    for (const [name, value] of Object.entries(this.queryParams)) {
      url.searchParams.set(name, value);
    }

    if (
      this.headerParams["idempotency-key"] === undefined &&
      this.method.toUpperCase() === "POST"
    ) {
      this.headerParams["idempotency-key"] = `auto_${crypto.randomUUID()}`;
    }

    const randomId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

    if (this.body != null) {
      this.headerParams["content-type"] = "application/json";
    }

    const isCredentialsSupported = "credentials" in Request.prototype;

    const requestInit: HookSniffRequestInit = {
      method: this.method.toString(),
      body: this.body,
      headers: {
        accept: "application/json, */*;q=0.8",
        authorization: `Bearer ${ctx.token}`,
        "user-agent": USER_AGENT,
        "hooksniff-req-id": randomId.toString(),
        ...this.headerParams,
      },
      credentials: isCredentialsSupported ? "same-origin" : undefined,
      signal: ctx.timeout !== undefined ? AbortSignal.timeout(ctx.timeout) : undefined,
    };

    if (ctx.debug) {
      console.log(`[HookSniff] ${this.method} ${url.toString()}`);
    }

    const response = await sendWithRetry(
      url,
      requestInit,
      ctx.retryScheduleInMs,
      ctx.retryScheduleInMs?.[0],
      ctx.retryScheduleInMs?.length || ctx.numRetries,
      ctx.fetch,
      ctx.debug
    );
    return filterResponseForErrors(response);
  }
}

async function filterResponseForErrors(response: Response): Promise<Response> {
  if (response.status < 300) {
    return response;
  }

  const responseBody = await response.text();
  let parsedBody: any;
  try {
    parsedBody = JSON.parse(responseBody);
  } catch {
    parsedBody = { detail: responseBody };
  }

  const headers: Record<string, string> = {};
  response.headers.forEach((value, name) => {
    headers[name] = value;
  });

  throw createErrorFromStatus(response.status, parsedBody, headers);
}

type HookSniffRequestInit = RequestInit & {
  headers: Record<string, string>;
};

/**
 * Send a request with automatic retry for 429 (rate limit) and 5xx errors.
 *
 * - 429: Respects `Retry-After` header, falls back to exponential backoff
 * - 5xx: Exponential backoff
 * - 4xx: No retry (except 429)
 */
async function sendWithRetry(
  url: URL,
  init: HookSniffRequestInit,
  retryScheduleInMs?: number[],
  nextInterval = 50,
  triesLeft = 2,
  fetchImpl: typeof fetch = fetch,
  debug = false,
  retryCount = 1
): Promise<Response> {
  const sleep = (interval: number) =>
    new Promise((resolve) => setTimeout(resolve, interval));

  try {
    const response = await fetchImpl(url, init);

    // 429 Rate Limit — retry with Retry-After
    if (response.status === 429 && triesLeft > 0) {
      const retryAfter = response.headers.get("Retry-After");
      let delayMs: number;

      if (retryAfter) {
        // Retry-After can be seconds or HTTP date
        const seconds = parseInt(retryAfter, 10);
        if (!isNaN(seconds)) {
          delayMs = seconds * 1000;
        } else {
          const date = new Date(retryAfter);
          delayMs = date.getTime() - Date.now();
          if (delayMs < 0) delayMs = nextInterval;
        }
      } else {
        delayMs = nextInterval;
      }

      if (debug) {
        console.log(`[HookSniff] 429 rate limited, retrying in ${delayMs}ms (attempt ${retryCount})`);
      }

      await sleep(delayMs);
      init.headers["hooksniff-retry-count"] = retryCount.toString();
      nextInterval = retryScheduleInMs?.[retryCount] || nextInterval * 2;
      return await sendWithRetry(
        url, init, retryScheduleInMs, nextInterval, --triesLeft, fetchImpl, debug, ++retryCount
      );
    }

    // 5xx Server Error — retry
    if (response.status >= 500 && triesLeft > 0) {
      if (debug) {
        console.log(`[HookSniff] ${response.status} server error, retrying in ${nextInterval}ms (attempt ${retryCount})`);
      }

      await sleep(nextInterval);
      init.headers["hooksniff-retry-count"] = retryCount.toString();
      nextInterval = retryScheduleInMs?.[retryCount] || nextInterval * 2;
      return await sendWithRetry(
        url, init, retryScheduleInMs, nextInterval, --triesLeft, fetchImpl, debug, ++retryCount
      );
    }

    return response;
  } catch (e) {
    if (triesLeft <= 0) {
      throw e;
    }

    if (debug) {
      console.log(`[HookSniff] Request failed, retrying in ${nextInterval}ms (attempt ${retryCount})`);
    }

    await sleep(nextInterval);
    init.headers["hooksniff-retry-count"] = retryCount.toString();
    nextInterval = retryScheduleInMs?.[retryCount] || nextInterval * 2;
    return await sendWithRetry(
      url, init, retryScheduleInMs, nextInterval, --triesLeft, fetchImpl, debug, ++retryCount
    );
  }
}
