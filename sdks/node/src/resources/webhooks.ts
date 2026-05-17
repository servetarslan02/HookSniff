/**
 * HookSniff SDK — Webhooks Resource (Send webhooks)
 */

import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";
import type { PostOptions } from "../util";
import type {
  CreateWebhookRequest,
  BatchWebhookRequest,
  Delivery,
  DeliveryListResponse,
  BatchResponse,
  BatchReplayRequest,
} from "../models";
import { paginatedIterator, type PaginationOptions } from "../pagination";

export interface WebhookSendOptions extends PostOptions {}

export interface WebhookListOptions extends PaginationOptions {
  endpoint_id?: string;
  status?: string;
}

export class Webhooks {
  constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /** Send a single webhook. */
  public send(body: CreateWebhookRequest, options?: WebhookSendOptions): Promise<Delivery> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/webhooks");
    request.setBody(body);
    if (options?.idempotencyKey) {
      request.setHeaderParam("idempotency-key", options.idempotencyKey);
    }
    return request.send(this.requestCtx, (json) => json as Delivery);
  }

  /** Send multiple webhooks in a batch. */
  public sendBatch(body: BatchWebhookRequest, options?: PostOptions): Promise<BatchResponse> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/webhooks/batch");
    request.setBody(body);
    if (options?.idempotencyKey) {
      request.setHeaderParam("idempotency-key", options.idempotencyKey);
    }
    return request.send(this.requestCtx, (json) => json as BatchResponse);
  }

  /** Get a delivery by ID. */
  public getDelivery(deliveryId: string): Promise<Delivery> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/webhooks/{id}");
    request.setPathParam("id", deliveryId);
    return request.send(this.requestCtx, (json) => json as Delivery);
  }

  /** List deliveries. */
  public listDeliveries(options?: WebhookListOptions): Promise<DeliveryListResponse> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/webhooks");
    request.setQueryParams({
      limit: options?.limit,
      iterator: options?.iterator,
      endpoint_id: options?.endpoint_id,
      status: options?.status,
    });
    return request.send(this.requestCtx, (json) => json as DeliveryListResponse);
  }

  /** Auto-paginate through all deliveries. */
  public listAllDeliveries(options?: WebhookListOptions): AsyncIterable<Delivery> {
    return paginatedIterator(
      (opts) => this.listDeliveries({ ...options, ...opts }),
      options
    );
  }

  /** Replay a specific delivery. */
  public replay(deliveryId: string): Promise<Delivery> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/webhooks/{id}/replay");
    request.setPathParam("id", deliveryId);
    return request.send(this.requestCtx, (json) => json as Delivery);
  }

  /** Batch replay multiple deliveries. */
  public replayBatch(body: BatchReplayRequest): Promise<BatchResponse> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/webhooks/batch/replay");
    request.setBody(body);
    return request.send(this.requestCtx, (json) => json as BatchResponse);
  }

  /** Get delivery attempts for a delivery. */
  public getAttempts(deliveryId: string): Promise<import("../models").DeliveryAttempt[]> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/webhooks/{id}/attempts");
    request.setPathParam("id", deliveryId);
    return request.send(this.requestCtx, (json) => json as import("../models").DeliveryAttempt[]);
  }
}
