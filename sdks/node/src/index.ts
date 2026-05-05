import * as crypto from "crypto";
import type {
  HookRelayConfig,
  Endpoint,
  CreateEndpointRequest,
  Delivery,
  SendWebhookRequest,
  DeliveryList,
  BatchResult,
  DeliveryAttempt,
  ExportOptions,
  Stats,
  Customer,
  ApiError,
} from "./types";

export type {
  HookRelayConfig,
  Endpoint,
  CreateEndpointRequest,
  Delivery,
  SendWebhookRequest,
  DeliveryList,
  BatchResult,
  DeliveryAttempt,
  ExportOptions,
  Stats,
  Customer,
};

class HookRelayError extends Error {
  public statusCode?: number;
  public errorCode?: string;

  constructor(message: string, statusCode?: number, errorCode?: string) {
    super(message);
    this.name = "HookRelayError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

export class AuthenticationError extends HookRelayError {
  constructor(message = "Unauthorized: invalid or missing API key") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "AuthenticationError";
  }
}

export class NotFoundError extends HookRelayError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends HookRelayError {
  constructor(message = "Rate limit exceeded") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
    this.name = "RateLimitError";
  }
}

export class ValidationError extends HookRelayError {
  constructor(message = "Bad request") {
    super(message, 400, "BAD_REQUEST");
    this.name = "ValidationError";
  }
}

export class PayloadTooLargeError extends HookRelayError {
  constructor(message = "Payload too large") {
    super(message, 413, "PAYLOAD_TOO_LARGE");
    this.name = "PayloadTooLargeError";
  }
}

/**
 * Verify a webhook signature using HMAC-SHA256.
 *
 * @param payload - The raw request body as a string
 * @param signature - The signature from the X-Hookrelay-Signature header
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

  // Constant-time comparison
  return crypto.timingSafeEqual(
    Buffer.from(computed, "utf-8"),
    Buffer.from(expectedHex, "utf-8")
  );
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
  constructor(private client: HookRelay) {}

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

  async list(): Promise<Endpoint[]> {
    const resp = await this.client._request("GET", "/endpoints");
    return (resp as any[]).map(mapEndpoint);
  }

  async delete(endpointId: string): Promise<boolean> {
    const resp = await this.client._request(
      "DELETE",
      `/endpoints/${endpointId}`
    );
    return (resp as any).deleted ?? true;
  }
}

class WebhooksResource {
  constructor(private client: HookRelay) {}

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
}

/**
 * HookRelay API client.
 *
 * @example
 * ```typescript
 * import { HookRelay } from '@hookrelay/sdk';
 *
 * const client = new HookRelay({ apiKey: 'hr_live_...' });
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
export class HookRelay {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  public endpoints: EndpointsResource;
  public webhooks: WebhooksResource;

  constructor(config: HookRelayConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl || "https://api.hookrelay.dev/v1").replace(
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
      "User-Agent": "hookrelay-node/0.1.0",
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
          throw new HookRelayError(message, resp.status);
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
