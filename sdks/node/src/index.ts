import * as crypto from "crypto";
import type {
  HookSniffConfig,
  Endpoint,
  CreateEndpointRequest,
  Delivery,
  SendWebhookRequest,
  DeliveryList,
  BatchResult,
  DeliveryAttempt,
  ExportOptions,
  SearchOptions,
  SearchResult,
  Stats,
  Customer,
  ApiError,
  WebhookPayload,
  OrderCreatedPayload,
  OrderCompletedPayload,
  PaymentFailedPayload,
  PaymentSucceededPayload,
  UserRegisteredPayload,
  UserUpdatedPayload,
  InvoiceCreatedPayload,
  WebhookHandlerOptions,
  WebhookVerificationResult,
} from "./types";

export { WebhookVerifier, verifyWebhook } from "./verify";
export type { VerificationResult } from "./verify";

export type {
  HookSniffConfig,
  Endpoint,
  CreateEndpointRequest,
  Delivery,
  SendWebhookRequest,
  DeliveryList,
  BatchResult,
  DeliveryAttempt,
  ExportOptions,
  SearchOptions,
  SearchResult,
  Stats,
  Customer,
  WebhookPayload,
  OrderCreatedPayload,
  OrderCompletedPayload,
  PaymentFailedPayload,
  PaymentSucceededPayload,
  UserRegisteredPayload,
  UserUpdatedPayload,
  InvoiceCreatedPayload,
  WebhookHandlerOptions,
  WebhookVerificationResult,
};

class HookSniffError extends Error {
  public statusCode?: number;
  public errorCode?: string;

  constructor(message: string, statusCode?: number, errorCode?: string) {
    super(message);
    this.name = "HookSniffError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

export class AuthenticationError extends HookSniffError {
  constructor(message = "Unauthorized: invalid or missing API key") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends HookSniffError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends HookSniffError {
  constructor(message = "Rate limit exceeded") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
    this.name = "RateLimitError";
  }
}

export class ValidationError extends HookSniffError {
  constructor(message = "Bad request") {
    super(message, 400, "BAD_REQUEST");
    this.name = "ValidationError";
  }
}

export class PayloadTooLargeError extends HookSniffError {
  constructor(message = "Payload too large") {
    super(message, 413, "PAYLOAD_TOO_LARGE");
    this.name = "PayloadTooLargeError";
  }
}

/**
 * Verify a webhook signature using HMAC-SHA256.
 *
 * @param payload - The raw request body as a string
 * @param signature - The signature from the X-HookSniff-Signature header
 * @param secret - The endpoint's signing secret (starts with "whsec_")
 * @returns True if the signature is valid
 */
export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!payload || !signature || !secret) return false;

  const expectedHex = signature.startsWith("sha256=")
    ? signature.slice(7)
    : signature;

  const computed = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  // Constant-time comparison (decode hex to raw bytes for correct comparison)
  const computedBuf = Buffer.from(computed, "hex");
  const expectedBuf = Buffer.from(expectedHex, "hex");

  if (computedBuf.length !== expectedBuf.length || computedBuf.length === 0) {
    return false;
  }

  return crypto.timingSafeEqual(computedBuf, expectedBuf);
}

// Map snake_case API responses to camelCase
function mapEndpoint(data: any): Endpoint {
  return {
    id: data.id,
    url: data.url,
    description: data.description,
    isActive: data.is_active,
    retryPolicy: data.retry_policy
      ? {
          maxAttempts: data.retry_policy.max_attempts,
          backoff: data.retry_policy.backoff,
          initialDelaySecs: data.retry_policy.initial_delay_secs,
          maxDelaySecs: data.retry_policy.max_delay_secs,
        }
      : undefined,
    createdAt: data.created_at,
  };
}

function mapDelivery(data: any): Delivery {
  return {
    id: data.id,
    endpointId: data.endpoint_id,
    event: data.event,
    status: data.status,
    attemptCount: data.attempt_count,
    responseStatus: data.response_status,
    replayCount: data.replay_count ?? 0,
    createdAt: data.created_at,
  };
}

function mapAttempt(data: any): DeliveryAttempt {
  return {
    id: data.id,
    attemptNumber: data.attempt_number,
    statusCode: data.status_code,
    responseBody: data.response_body,
    durationMs: data.duration_ms,
    errorMessage: data.error_message,
    createdAt: data.created_at,
  };
}

class EndpointsResource {
  constructor(private client: HookSniff) {}

  async create(req: CreateEndpointRequest): Promise<Endpoint> {
    const body: any = { url: req.url };
    if (req.description) body.description = req.description;
    if (req.retryPolicy) {
      body.retry_policy = {
        max_attempts: req.retryPolicy.maxAttempts,
        backoff: req.retryPolicy.backoff,
        initial_delay_secs: req.retryPolicy.initialDelaySecs,
        max_delay_secs: req.retryPolicy.maxDelaySecs,
      };
    }
    const resp = await this.client._request("POST", "/endpoints", body);
    return mapEndpoint(resp);
  }

  async get(endpointId: string): Promise<Endpoint> {
    const resp = await this.client._request("GET", `/endpoints/${endpointId}`);
    return mapEndpoint(resp);
  }

  async list(page = 1, perPage = 20): Promise<{ endpoints: Endpoint[]; total: number; page: number; perPage: number }> {
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    const resp = await this.client._request("GET", `/endpoints?${params.toString()}`);
    const data = resp as any;
    return {
      endpoints: (data.endpoints || (Array.isArray(data) ? data : [])).map(mapEndpoint),
      total: data.total ?? (Array.isArray(data) ? data.length : 0),
      page: data.page ?? page,
      perPage: data.per_page ?? perPage,
    };
  }

  async delete(endpointId: string): Promise<boolean> {
    const resp = await this.client._request(
      "DELETE",
      `/endpoints/${endpointId}`
    );
    return (resp as any).deleted ?? true;
  }

  async rotateSecret(endpointId: string): Promise<{ secret: string }> {
    const resp = await this.client._request("POST", `/endpoints/${endpointId}/rotate-secret`);
    return resp as { secret: string };
  }
}

class WebhooksResource {
  constructor(private client: HookSniff) {}

  async send(req: SendWebhookRequest): Promise<Delivery> {
    const body: any = {
      endpoint_id: req.endpointId,
      data: req.data,
    };
    if (req.event) body.event = req.event;
    const resp = await this.client._request("POST", "/webhooks", body);
    return mapDelivery(resp);
  }

  async get(deliveryId: string): Promise<Delivery> {
    const resp = await this.client._request(
      "GET",
      `/webhooks/${deliveryId}`
    );
    return mapDelivery(resp);
  }

  async list(
    status?: string,
    page = 1,
    perPage = 20
  ): Promise<DeliveryList> {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
    });
    if (status) params.set("status", status);
    const resp = await this.client._request(
      "GET",
      `/webhooks?${params.toString()}`
    );
    const data = resp as any;
    return {
      deliveries: (data.deliveries || []).map(mapDelivery),
      total: data.total,
      page: data.page,
      perPage: data.per_page,
    };
  }

  async replay(deliveryId: string): Promise<Delivery> {
    const resp = await this.client._request(
      "POST",
      `/webhooks/${deliveryId}/replay`
    );
    return mapDelivery(resp);
  }

  async batch(webhooks: SendWebhookRequest[]): Promise<BatchResult> {
    const body = {
      webhooks: webhooks.map((w) => ({
        endpoint_id: w.endpointId,
        event: w.event,
        data: w.data,
      })),
    };
    const resp = await this.client._request("POST", "/webhooks/batch", body);
    const data = resp as any;
    return {
      deliveries: (data.deliveries || []).map(mapDelivery),
      errors: data.errors || [],
    };
  }

  async attempts(deliveryId: string): Promise<DeliveryAttempt[]> {
    const resp = await this.client._request(
      "GET",
      `/webhooks/${deliveryId}/attempts`
    );
    return (resp as any[]).map(mapAttempt);
  }

  async export(options: ExportOptions = {}): Promise<Delivery[] | string> {
    const params = new URLSearchParams();
    if (options.format) params.set("format", options.format);
    if (options.status) params.set("status", options.status);
    if (options.dateFrom) params.set("date_from", options.dateFrom);
    if (options.dateTo) params.set("date_to", options.dateTo);

    const resp = await this.client._request(
      "GET",
      `/webhooks/export?${params.toString()}`
    );

    if (options.format === "csv") return resp as string;
    return (resp as any[]).map(mapDelivery);
  }

  async search(options: SearchOptions = {}): Promise<SearchResult> {
    const params = new URLSearchParams();
    if (options.query) params.set("q", options.query);
    if (options.event) params.set("event", options.event);
    if (options.status) params.set("status", options.status);
    if (options.endpointId) params.set("endpoint_id", options.endpointId);
    params.set("page", String(options.page || 1));
    params.set("per_page", String(options.perPage || 20));

    const resp = (await this.client._request(
      "GET",
      `/search?${params.toString()}`
    )) as any;
    return {
      results: (resp.results || []).map(mapDelivery),
      total: resp.total || 0,
      page: resp.page || 1,
      perPage: resp.per_page || 20,
    };
  }
}

/**
 * HookSniff API client.
 *
 * @example
 * ```typescript
 * import { HookSniff } from '@hooksniff/sdk';
 *
 * const client = new HookSniff({ apiKey: 'hr_live_...' });
 *
 * const endpoint = await client.endpoints.create({
 *   url: 'https://myapp.com/webhook',
 *   description: 'Orders',
 * });
 *
 * const delivery = await client.webhooks.send({
 *   endpointId: endpoint.id,
 *   event: 'order.created',
 *   data: { orderId: '12345', amount: 99.99 },
 * });
 * ```
 */

export class HookSniff {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  public endpoints: EndpointsResource;
  public webhooks: WebhooksResource;

  constructor(config: HookSniffConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || "https://api.hooksniff.com/v1").replace(
      /\/$/,
      ""
    );
    this.timeout = config.timeout || 30000;

    this.endpoints = new EndpointsResource(this);
    this.webhooks = new WebhooksResource(this);
  }

  /** @internal */
  async _request(
    method: string,
    path: string,
    body?: Record<string, unknown>
  ): Promise<unknown> {
    const url = `${this.baseUrl}${path}`;
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "hooksniff-node/0.1.0",
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const resp = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      if (resp.ok) {
        const contentType = resp.headers.get("content-type") || "";
        if (contentType.includes("text/csv")) {
          return resp.text();
        }
        return resp.json();
      }

      let message: string;
      try {
        const errBody = (await resp.json()) as ApiError;
        message = errBody.error?.message || `HTTP ${resp.status}`;
      } catch {
        message = `HTTP ${resp.status}`;
      }

      switch (resp.status) {
        case 400:
          throw new ValidationError(message);
        case 401:
          throw new AuthenticationError(message);
        case 404:
          throw new NotFoundError(message);
        case 413:
          throw new PayloadTooLargeError(message);
        case 429:
          throw new RateLimitError(message);
        default:
          throw new HookSniffError(message, resp.status);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async getStats(): Promise<Stats> {
    const resp = (await this._request("GET", "/stats")) as any;
    return {
      totalDeliveries: resp.total_deliveries,
      delivered: resp.delivered,
      failed: resp.failed,
      pending: resp.pending,
      successRate: resp.success_rate,
      endpointsCount: resp.endpoints_count,
    };
  }
}

/**
 * Verify a webhook signature from an incoming request.
 *
 * This is a higher-level convenience wrapper around `verifySignature` that
 * handles common edge cases and returns a structured result.
 *
 * @param payload - The raw request body as a string
 * @param signature - The signature header value (e.g., "sha256=abc123...")
 * @param secret - The endpoint's signing secret (starts with "whsec_")
 * @returns A WebhookVerificationResult with valid flag and parsed payload
 *
 * @example
 * ```typescript
 * import { verifyWebhookSignature } from '@hooksniff/sdk';
 *
 * app.post('/webhook', express.raw({ type: "*\/*" }), (req, res) => {
 *   const result = verifyWebhookSignature(
 *     req.body.toString(),
 *     req.headers['x-hooksniff-signature'],
 *     'whsec_...'
 *   );
 *
 *   if (!result.valid) {
 *     return res.status(401).json({ error: result.error });
 *   }
 *
 *   console.log('Event:', result.payload.event);
 *   res.status(200).json({ received: true });
 * });
 * ```
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string | undefined,
  secret: string
): WebhookVerificationResult {
  if (!signature) {
    return { valid: false, error: "Missing signature header" };
  }

  if (!secret) {
    return { valid: false, error: "Missing signing secret" };
  }

  if (!payload) {
    return { valid: false, error: "Missing request body" };
  }

  const isValid = verifySignature(payload, signature, secret);
  if (!isValid) {
    return { valid: false, error: "Invalid signature" };
  }

  try {
    const parsed = JSON.parse(payload) as WebhookPayload;
    return { valid: true, payload: parsed };
  } catch {
    return { valid: false, error: "Invalid JSON payload" };
  }
}

/**
 * Create a webhook handler middleware for Express, Fastify, or generic HTTP servers.
 *
 * Handles signature verification, event routing, and error handling.
 *
 * @param options - Configuration for the webhook handler
 * @returns A request handler function
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import { createWebhookHandler } from '@hooksniff/sdk';
 *
 * const app = express();
 *
 * // Use raw body for signature verification
 * app.post('/webhooks', express.raw({ type: "*\/*" }), createWebhookHandler({
 *   secret: 'whsec_...',
 *   handlers: {
 *     'order.created': async (payload) => {
 *       console.log('New order:', payload.data);
 *     },
 *     'payment.failed': async (payload) => {
 *       console.log('Payment failed:', payload.data);
 *     },
 *   },
 *   onEvent: async (payload) => {
 *     console.log('Unhandled event:', payload.event);
 *   },
 * }));
 * ```
 */
export function createWebhookHandler(options: WebhookHandlerOptions) {
  const {
    secret,
    handlers = {},
    onEvent,
    signatureHeader = "x-hooksniff-signature",
  } = options;

  return async function webhookHandler(
    req: { body: string | Buffer; headers: Record<string, string | undefined> },
    res: {
      status: (code: number) => { json: (body: unknown) => void };
    },
    next?: (err?: Error) => void
  ) {
    try {
      const body =
        typeof req.body === "string" ? req.body : req.body.toString("utf-8");
      const signature = req.headers[signatureHeader.toLowerCase()];

      const result = verifyWebhookSignature(body, signature, secret);

      if (!result.valid) {
        res.status(401).json({
          error: {
            code: "INVALID_SIGNATURE",
            message: result.error || "Webhook signature verification failed",
          },
        });
        return;
      }

      const payload = result.payload!;

      // Route to specific handler
      const handler = handlers[payload.event];
      if (handler) {
        await handler(payload);
      } else if (onEvent) {
        await onEvent(payload);
      }

      res.status(200).json({ received: true });
    } catch (err) {
      if (next) {
        next(err instanceof Error ? err : new Error(String(err)));
      } else {
        res.status(500).json({
          error: {
            code: "HANDLER_ERROR",
            message: "Internal webhook handler error",
          },
        });
      }
    }
  };
}
