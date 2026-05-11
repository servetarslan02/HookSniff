/**
 * HookSniff API Resource: Webhooks
 *
 * Send, list, get, replay, and batch webhooks.
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";
import {
  WebhookModel,
  DeliveryModel,
  DeliveryListModel,
  BatchModel,
  type WebhookSendInput,
  type WebhookBatchInput,
  type DeliveryOutput,
  type DeliveryListOutput,
  type BatchOutput,
} from "../models";
import { paginate, collectAll, type Page, type PaginationOptions } from "../pagination";

export type { WebhookSendInput, WebhookBatchInput, DeliveryOutput, DeliveryListOutput, BatchOutput };

export class Webhooks {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** Send a single webhook */
  async send(input: WebhookSendInput, idempotencyKey?: string): Promise<DeliveryOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/webhooks");
    if (idempotencyKey) req.setHeaderParam("idempotency-key", idempotencyKey);
    req.setBody(WebhookModel._toJsonObject(input));
    return req.send<DeliveryOutput>(this.ctx, (json) =>
      DeliveryModel._fromJsonObject(json as Record<string, unknown>)
    );
  }

  /** Send batch webhooks */
  async batch(input: WebhookBatchInput, idempotencyKey?: string): Promise<BatchOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/webhooks/batch");
    if (idempotencyKey) req.setHeaderParam("idempotency-key", idempotencyKey);
    req.setBody(WebhookModel._toBatchJsonObject(input));
    return req.send<BatchOutput>(this.ctx, (json) =>
      BatchModel._fromJsonObject(json as Record<string, unknown>)
    );
  }

  /** List deliveries (single page) */
  async list(options?: { limit?: number; offset?: number }): Promise<DeliveryListOutput> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/webhooks");
    if (options?.limit) req.setQueryParams({ limit: options.limit });
    if (options?.offset) req.setQueryParams({ offset: options.offset });
    return req.send<DeliveryListOutput>(this.ctx, (json) =>
      DeliveryListModel._fromJsonObject(json as Record<string, unknown>)
    );
  }

  /** Iterate through all deliveries with automatic pagination */
  listAll(options?: PaginationOptions): AsyncGenerator<DeliveryOutput, void, undefined> {
    return paginate(async ({ limit, offset }) => {
      const page = await this.list({ limit, offset });
      return { data: page.data, has_more: page.has_more };
    }, options);
  }

  /** Collect all deliveries into an array */
  async listAllArray(options?: PaginationOptions): Promise<DeliveryOutput[]> {
    return collectAll(async ({ limit, offset }) => {
      const page = await this.list({ limit, offset });
      return { data: page.data, has_more: page.has_more };
    }, options);
  }

  /** Get a specific delivery */
  async get(id: string): Promise<DeliveryOutput> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/webhooks/{id}");
    req.setPathParam("id", id);
    return req.send<DeliveryOutput>(this.ctx, (json) =>
      DeliveryModel._fromJsonObject(json as Record<string, unknown>)
    );
  }

  /** Replay a delivery */
  async replay(id: string, idempotencyKey?: string): Promise<DeliveryOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/webhooks/{id}/replay");
    req.setPathParam("id", id);
    if (idempotencyKey) req.setHeaderParam("idempotency-key", idempotencyKey);
    return req.send<DeliveryOutput>(this.ctx, (json) =>
      DeliveryModel._fromJsonObject(json as Record<string, unknown>)
    );
  }
}
