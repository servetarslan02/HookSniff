import { Authentication } from "./api/authentication";
import { Endpoint } from "./api/endpoint";
import { Environment } from "./api/environment";
import { EventType } from "./api/eventType";
import { Health } from "./api/health";
import { Message } from "./api/message";
import { MessageAttempt } from "./api/messageAttempt";
import { Statistics } from "./api/statistics";
import { subscribeToStream, type StreamOptions, type StreamSubscription } from "./stream";
import type { HookSniffRequestContext } from "./request";

export { type PostOptions, ApiException } from "./util";
export { HTTPValidationError, HttpErrorOut, ValidationError } from "./HttpErrors";
export {
  HookSniffError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  UnprocessableEntityError,
  RateLimitError,
  InternalServerError,
  BadGatewayError,
  ServiceUnavailableError,
  GatewayTimeoutError,
  createErrorFromStatus,
  type ValidationErrorItem,
} from "./errors";
export * from "./webhook";
export * from "./webhook-events";
export * from "./stream";
export * from "./models/index";

export type { EndpointListOptions } from "./api/endpoint";
export type { EventTypeListOptions } from "./api/eventType";
export { type MessageListOptions, messageInRaw } from "./api/message";
export type { MessageAttemptListByEndpointOptions, MessageAttemptListByMsgOptions } from "./api/messageAttempt";

export type HookSniffOptions = {
  debug?: boolean;
  serverUrl?: string;
  requestTimeout?: number;
  fetch?: typeof fetch;
} & (
  | { retryScheduleInMs?: number[]; numRetries?: never }
  | { numRetries?: number; retryScheduleInMs?: never }
);

const DEFAULT_BASE_URL = "https://api.hooksniff-1046140057667.europe-west1.run.app";

export class HookSniff {
  protected readonly requestCtx: HookSniffRequestContext;

  public constructor(token: string, options: HookSniffOptions = {}) {
    const baseUrl: string = options.serverUrl ?? DEFAULT_BASE_URL;

    if (options.retryScheduleInMs) {
      this.requestCtx = {
        baseUrl,
        token,
        timeout: options.requestTimeout,
        debug: options.debug,
        retryScheduleInMs: options.retryScheduleInMs,
        fetch: options.fetch,
      };
      return;
    }
    this.requestCtx = {
      baseUrl,
      token,
      timeout: options.requestTimeout,
      debug: options.debug,
      numRetries: options.numRetries ?? 2,
      fetch: options.fetch,
    };
  }

  public get authentication() {
    return new Authentication(this.requestCtx);
  }

  public get endpoint() {
    return new Endpoint(this.requestCtx);
  }

  public get environment() {
    return new Environment(this.requestCtx);
  }

  public get eventType() {
    return new EventType(this.requestCtx);
  }

  public get health() {
    return new Health(this.requestCtx);
  }

  public get message() {
    return new Message(this.requestCtx);
  }

  public get messageAttempt() {
    return new MessageAttempt(this.requestCtx);
  }

  public get statistics() {
    return new Statistics(this.requestCtx);
  }

  /**
   * Subscribe to real-time events via Server-Sent Events (SSE).
   *
   * @example
   * ```ts
   * const sub = hs.stream({
   *   eventTypes: ["order.created"],
   *   onEvent: (event) => console.log(event),
   * });
   *
   * // Later: sub.close();
   * ```
   */
  public stream(options: StreamOptions): StreamSubscription {
    return subscribeToStream(this.requestCtx, options);
  }
}
