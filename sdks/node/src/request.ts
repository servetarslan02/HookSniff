/**
 * HookSniff SDK — HTTP Request Client

 * Handles auth, retries with exponential backoff, timeout, and idempotency keys.
 */

import { ApiException, type XOR } from "./util";
import type { HttpErrorOut, HTTPValidationError } from "./HttpErrors";

export const LIB_VERSION = "0.5.0";
const USER_AGENT = `hooksniff-sdk/${LIB_VERSION}`;

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
  /** The API base URL, like "https://hooksniff-api-xxx.run.app/v1" */
  baseUrl: string;
  /** The 'bearer' scheme access token */
  token: string;
  /** Time in milliseconds to wait for requests to get a response. */
  timeout?: number;
  /**
   * Custom fetch implementation to use for HTTP requests.
   * Useful for testing, adding custom middleware, or running in non-standard environments.
   */
  fetch?: typeof fetch;
} & XOR<
  {
    /** List of delays (in milliseconds) to wait before each retry attempt. */
    retryScheduleInMs?: number[];
  },
  {
    /** The number of times the client will retry if a server-side error or timeout is received. Default: 2 */
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
    if (value === undefined || value === null) return;

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
    if (value === undefined) return;
    this.headerParams[name] = value;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setBody(value: any) {
    this.body = JSON.stringify(value);
  }

  /**
   * Send this request, returning the response body parsed as type R.
   *
   * 422 → ApiException<HTTPValidationError>
   * 4xx → ApiException<HttpErrorOut>
   * 5xx → retried with exponential backoff
   */
  public async send<R>(
    ctx: HookSniffRequestContext,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parseResponseBody: (jsonObject: any) => R
  ): Promise<R> {
    const response = await this.sendInner(ctx);
    if (response.status === 204) {
      return <R>null;
    }
    const responseBody = await response.text();
    return parseResponseBody(JSON.parse(responseBody));
  }

  /** Same as `send`, but the response body is discarded. */
  public async sendNoResponseBody(ctx: HookSniffRequestContext): Promise<void> {
    await this.sendInner(ctx);
  }

  private async sendInner(ctx: HookSniffRequestContext): Promise<Response> {
    const url = new URL(ctx.baseUrl + this.path);
    for (const [name, value] of Object.entries(this.queryParams)) {
      url.searchParams.set(name, value);
    }

    // Auto idempotency key for POST
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

    const response = await sendWithRetry(
      url,
      {
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
      },
      ctx.retryScheduleInMs,
      ctx.retryScheduleInMs?.[0],
      ctx.retryScheduleInMs?.length || ctx.numRetries,
      ctx.fetch
    );
    return filterResponseForErrors(response);
  }
}

async function filterResponseForErrors(response: Response): Promise<Response> {
  if (response.status < 300) {
    return response;
  }

  const responseBody = await response.text();

  if (response.status === 422) {
    throw new ApiException<HTTPValidationError>(
      response.status,
      JSON.parse(responseBody) as HTTPValidationError,
      response.headers
    );
  }

  if (response.status >= 400 && response.status <= 499) {
    throw new ApiException<HttpErrorOut>(
      response.status,
      JSON.parse(responseBody) as HttpErrorOut,
      response.headers
    );
  }
  throw new ApiException(response.status, responseBody, response.headers);
}

type HookSniffRequestInit = RequestInit & {
  headers: Record<string, string>;
};

async function sendWithRetry(
  url: URL,
  init: HookSniffRequestInit,
  retryScheduleInMs?: number[],
  nextInterval = 50,
  triesLeft = 2,
  fetchImpl: typeof fetch = fetch,
  retryCount = 1
): Promise<Response> {
  const sleep = (interval: number) =>
    new Promise((resolve) => setTimeout(resolve, interval));

  try {
    const response = await fetchImpl(url, init);
    if (triesLeft <= 0 || response.status < 500) {
      return response;
    }
  } catch (e) {
    if (triesLeft <= 0) {
      throw e;
    }
  }

  await sleep(nextInterval);
  init.headers["hooksniff-retry-count"] = retryCount.toString();
  nextInterval = retryScheduleInMs?.[retryCount] || nextInterval * 2;
  return await sendWithRetry(
    url,
    init,
    retryScheduleInMs,
    nextInterval,
    --triesLeft,
    fetchImpl,
    ++retryCount
  );
}
