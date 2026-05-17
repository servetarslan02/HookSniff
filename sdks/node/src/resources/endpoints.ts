/**
 * HookSniff SDK — Endpoints Resource
 */

import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";
import { paginatedIterator, type ListResponse, type PaginationOptions } from "../pagination";
import type {
  Endpoint,
  EndpointListResponse,
  CreateEndpointRequest,
  UpdateEndpointRequest,
  RotateSecretResponse,
} from "../models";

export interface EndpointListOptions extends PaginationOptions {
  is_active?: boolean;
}

export interface EndpointRotateSecretOptions {
  idempotencyKey?: string;
}

export class Endpoints {
  constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /** List all endpoints for the authenticated user. */
  public list(options?: EndpointListOptions): Promise<EndpointListResponse> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/endpoints");
    request.setQueryParams({
      limit: options?.limit,
      iterator: options?.iterator,
      is_active: options?.is_active,
    });
    return request.send(this.requestCtx, (json) => json as EndpointListResponse);
  }

  /** Auto-paginate through all endpoints. */
  public listAll(options?: EndpointListOptions): AsyncIterable<Endpoint> {
    return paginatedIterator(
      (opts) => this.list({ ...options, ...opts }),
      options
    );
  }

  /** Get a single endpoint by ID. */
  public get(endpointId: string): Promise<Endpoint> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/endpoints/{id}");
    request.setPathParam("id", endpointId);
    return request.send(this.requestCtx, (json) => json as Endpoint);
  }

  /** Create a new endpoint. */
  public create(body: CreateEndpointRequest): Promise<Endpoint> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/endpoints");
    request.setBody(body);
    return request.send(this.requestCtx, (json) => json as Endpoint);
  }

  /** Update an existing endpoint. */
  public update(endpointId: string, body: UpdateEndpointRequest): Promise<Endpoint> {
    const request = new HookSniffRequest(HttpMethod.PUT, "/v1/endpoints/{id}");
    request.setPathParam("id", endpointId);
    request.setBody(body);
    return request.send(this.requestCtx, (json) => json as Endpoint);
  }

  /** Delete an endpoint. */
  public delete(endpointId: string): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.DELETE, "/v1/endpoints/{id}");
    request.setPathParam("id", endpointId);
    return request.sendNoResponseBody(this.requestCtx);
  }

  /** Rotate the signing secret for an endpoint. */
  public rotateSecret(
    endpointId: string,
    options?: EndpointRotateSecretOptions
  ): Promise<RotateSecretResponse> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/endpoints/{id}/rotate-secret");
    request.setPathParam("id", endpointId);
    if (options?.idempotencyKey) {
      request.setHeaderParam("idempotency-key", options.idempotencyKey);
    }
    return request.send(this.requestCtx, (json) => json as RotateSecretResponse);
  }

  /** Get health info for an endpoint. */
  public health(endpointId: string): Promise<import("../models").EndpointHealth> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/endpoints/{id}/health");
    request.setPathParam("id", endpointId);
    return request.send(this.requestCtx, (json) => json as import("../models").EndpointHealth);
  }
}
