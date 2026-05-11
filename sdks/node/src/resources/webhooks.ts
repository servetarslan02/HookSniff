/**
 * HookSniff API Resource: Webhooks
 *
 * Send, list, get, replay, and batch webhooks.
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";

export interface WebhookSendInput {
  endpoint_id: string;
  event: string;
  data: Record<string, unknown>;
}

export interface WebhookBatchInput {
  endpoint_id: string;
  events: Array<{ event: string; data: Record<string, unknown> }>;
}

export interface DeliveryOutput {
  id: string;
  endpoint_id: string;
  event: string;
  status: string;
  response_code: number;
  response_body: string;
  created_at: string;
  delivered_at: string | null;
  attempt_count: number;
}

export interface DeliveryListOutput {
  data: DeliveryOutput[];
  has_more: boolean;
}

export interface BatchOutput {
  batch_id: string;
  count: number;
}

export class Webhooks {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** Send a single webhook */
  async send(input: WebhookSendInput, idempotencyKey?: string): Promise<DeliveryOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/webhooks");
    if (idempotencyKey) req.setHeaderParam("idempotency-key", idempotencyKey);
    req.setBody(input);
    return req.send<DeliveryOutput>(this.ctx);
  }

  /** Send batch webhooks */
  async batch(input: WebhookBatchInput, idempotencyKey?: string): Promise<BatchOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/webhooks/batch");
    if (idempotencyKey) req.setHeaderParam("idempotency-key", idempotencyKey);
    req.setBody(input);
    return req.send<BatchOutput>(this.ctx);
  }

  /** List deliveries */
  async list(options?: { limit?: number; offset?: number }): Promise<DeliveryListOutput> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/webhooks");
    if (options?.limit) req.setQueryParams({ limit: options.limit });
    if (options?.offset) req.setQueryParams({ offset: options.offset });
    return req.send<DeliveryListOutput>(this.ctx);
  }

  /** Get a specific delivery */
  async get(id: string): Promise<DeliveryOutput> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/webhooks/{id}");
    req.setPathParam("id", id);
    return req.send<DeliveryOutput>(this.ctx);
  }

  /** Replay a delivery */
  async replay(id: string, idempotencyKey?: string): Promise<DeliveryOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/webhooks/{id}/replay");
    req.setPathParam("id", id);
    if (idempotencyKey) req.setHeaderParam("idempotency-key", idempotencyKey);
    return req.send<DeliveryOutput>(this.ctx);
  }
}
