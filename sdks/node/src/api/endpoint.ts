import {
  type EndpointHeadersIn,
  EndpointHeadersInSerializer,
} from "../models/endpointHeadersIn";
import {
  type EndpointHeadersOut,
  EndpointHeadersOutSerializer,
} from "../models/endpointHeadersOut";
import {
  type EndpointHeadersPatchIn,
  EndpointHeadersPatchInSerializer,
} from "../models/endpointHeadersPatchIn";
import { type EndpointIn, EndpointInSerializer } from "../models/endpointIn";
import { type EndpointOut, EndpointOutSerializer } from "../models/endpointOut";
import { type EndpointPatch, EndpointPatchSerializer } from "../models/endpointPatch";
import {
  type EndpointSecretOut,
  EndpointSecretOutSerializer,
} from "../models/endpointSecretOut";
import {
  type EndpointSecretRotateIn,
  EndpointSecretRotateInSerializer,
} from "../models/endpointSecretRotateIn";
import {
  type EndpointUpdate,
  EndpointUpdateSerializer,
} from "../models/endpointUpdate";
import {
  type ListResponseEndpointOut,
  ListResponseEndpointOutSerializer,
} from "../models/listResponseEndpointOut";
import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/** Options for listing endpoints */
export interface EndpointListOptions {
  /** Maximum number of endpoints to return (default: 20, max: 100) */
  limit?: number;
  /** Cursor for pagination (from previous response's `iterator` field) */
  iterator?: string | null;
  /** Sort order: "ascending" or "descending" */
  order?: string;
}

/** Options for creating an endpoint */
export interface EndpointCreateOptions {
  /** Idempotency key for safe retries */
  idempotencyKey?: string;
}

/** Options for rotating endpoint secret */
export interface EndpointRotateSecretOptions {
  /** Idempotency key for safe retries */
  idempotencyKey?: string;
}

/**
 * Manage webhook endpoints.
 *
 * Endpoints are the URLs where HookSniff delivers your webhooks.
 * Each endpoint belongs to an application and can filter events by type.
 *
 * @example
 * ```ts
 * const hs = new HookSniff("hooksniff_xxx");
 *
 * // List all endpoints
 * const endpoints = await hs.endpoint.list();
 *
 * // Create a new endpoint
 * const endpoint = await hs.endpoint.create({
 *   url: "https://example.com/webhook",
 *   filterTypes: ["order.created", "order.updated"],
 * });
 *
 * // Get endpoint details
 * const details = await hs.endpoint.get(endpoint.id);
 *
 * // Update endpoint
 * await hs.endpoint.update(endpoint.id, { url: "https://new-url.com/webhook" });
 *
 * // Delete endpoint
 * await hs.endpoint.delete(endpoint.id);
 *
 * // Rotate signing secret
 * await hs.endpoint.rotateSecret(endpoint.id, { key: "whsec_new..." });
 * ```
 */
export class Endpoint {
  public constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /**
   * List all endpoints for the authenticated application.
   *
   * @param options - Pagination and sorting options
   * @returns A paginated list of endpoints
   *
   * @example
   * ```ts
   * const { data, done } = await hs.endpoint.list({ limit: 10 });
   * for (const ep of data) {
   *   console.log(`${ep.id}: ${ep.url}`);
   * }
   * ```
   */
  public list(options?: EndpointListOptions): Promise<ListResponseEndpointOut> {
    const request = new HookSniffRequest(HttpMethod.GET, "/api/v1/endpoint");

    request.setQueryParams({
      limit: options?.limit,
      iterator: options?.iterator,
      order: options?.order,
    });

    return request.send(
      this.requestCtx,
      ListResponseEndpointOutSerializer._fromJsonObject
    );
  }

  /**
   * Create a new endpoint.
   *
   * @param endpointIn - The endpoint configuration
   * @param options - Request options (idempotency key)
   * @returns The created endpoint
   *
   * @example
   * ```ts
   * const endpoint = await hs.endpoint.create({
   *   url: "https://example.com/webhook",
   *   filterTypes: ["order.created"],
   *   metadata: { env: "production" },
   * });
   * console.log(endpoint.id); // "ep_abc123"
   * ```
   */
  public create(
    endpointIn: EndpointIn,
    options?: EndpointCreateOptions
  ): Promise<EndpointOut> {
    const request = new HookSniffRequest(HttpMethod.POST, "/api/v1/endpoint");

    request.setHeaderParam("idempotency-key", options?.idempotencyKey);
    request.setBody(EndpointInSerializer._toJsonObject(endpointIn));

    return request.send(this.requestCtx, EndpointOutSerializer._fromJsonObject);
  }

  /**
   * Get an endpoint by ID.
   *
   * @param endpointId - The endpoint's unique ID
   * @returns The endpoint details
   *
   * @example
   * ```ts
   * const endpoint = await hs.endpoint.get("ep_abc123");
   * console.log(endpoint.url, endpoint.filterTypes);
   * ```
   */
  public get(endpointId: string): Promise<EndpointOut> {
    const request = new HookSniffRequest(
      HttpMethod.GET,
      "/api/v1/endpoint/{endpoint_id}"
    );

    request.setPathParam("endpoint_id", endpointId);

    return request.send(this.requestCtx, EndpointOutSerializer._fromJsonObject);
  }

  /**
   * Update an endpoint (full replacement).
   *
   * @param endpointId - The endpoint's unique ID
   * @param endpointUpdate - The new endpoint configuration
   * @returns The updated endpoint
   */
  public update(
    endpointId: string,
    endpointUpdate: EndpointUpdate
  ): Promise<EndpointOut> {
    const request = new HookSniffRequest(
      HttpMethod.PUT,
      "/api/v1/endpoint/{endpoint_id}"
    );

    request.setPathParam("endpoint_id", endpointId);
    request.setBody(EndpointUpdateSerializer._toJsonObject(endpointUpdate));

    return request.send(this.requestCtx, EndpointOutSerializer._fromJsonObject);
  }

  /**
   * Delete an endpoint.
   *
   * @param endpointId - The endpoint's unique ID
   *
   * @example
   * ```ts
   * await hs.endpoint.delete("ep_abc123");
   * ```
   */
  public delete(endpointId: string): Promise<void> {
    const request = new HookSniffRequest(
      HttpMethod.DELETE,
      "/api/v1/endpoint/{endpoint_id}"
    );

    request.setPathParam("endpoint_id", endpointId);

    return request.sendNoResponseBody(this.requestCtx);
  }

  /**
   * Partially update an endpoint.
   *
   * @param endpointId - The endpoint's unique ID
   * @param endpointPatch - Fields to update
   * @returns The updated endpoint
   */
  public patch(
    endpointId: string,
    endpointPatch: EndpointPatch
  ): Promise<EndpointOut> {
    const request = new HookSniffRequest(
      HttpMethod.PATCH,
      "/api/v1/endpoint/{endpoint_id}"
    );

    request.setPathParam("endpoint_id", endpointId);
    request.setBody(EndpointPatchSerializer._toJsonObject(endpointPatch));

    return request.send(this.requestCtx, EndpointOutSerializer._fromJsonObject);
  }

  /**
   * Get the additional headers sent with webhooks to this endpoint.
   *
   * @param endpointId - The endpoint's unique ID
   * @returns The endpoint's custom headers
   */
  public getHeaders(endpointId: string): Promise<EndpointHeadersOut> {
    const request = new HookSniffRequest(
      HttpMethod.GET,
      "/api/v1/endpoint/{endpoint_id}/headers"
    );

    request.setPathParam("endpoint_id", endpointId);

    return request.send(this.requestCtx, EndpointHeadersOutSerializer._fromJsonObject);
  }

  /**
   * Set the additional headers sent with webhooks to this endpoint.
   *
   * @param endpointId - The endpoint's unique ID
   * @param endpointHeadersIn - Headers to set
   */
  public updateHeaders(
    endpointId: string,
    endpointHeadersIn: EndpointHeadersIn
  ): Promise<void> {
    const request = new HookSniffRequest(
      HttpMethod.PUT,
      "/api/v1/endpoint/{endpoint_id}/headers"
    );

    request.setPathParam("endpoint_id", endpointId);
    request.setBody(EndpointHeadersInSerializer._toJsonObject(endpointHeadersIn));

    return request.sendNoResponseBody(this.requestCtx);
  }

  /**
   * Partially update the headers sent with webhooks to this endpoint.
   *
   * @param endpointId - The endpoint's unique ID
   * @param endpointHeadersPatchIn - Headers to add or modify
   */
  public patchHeaders(
    endpointId: string,
    endpointHeadersPatchIn: EndpointHeadersPatchIn
  ): Promise<void> {
    const request = new HookSniffRequest(
      HttpMethod.PATCH,
      "/api/v1/endpoint/{endpoint_id}/headers"
    );

    request.setPathParam("endpoint_id", endpointId);
    request.setBody(EndpointHeadersPatchInSerializer._toJsonObject(endpointHeadersPatchIn));

    return request.sendNoResponseBody(this.requestCtx);
  }

  /**
   * Get the endpoint's signing secret.
   *
   * Use this secret to verify webhook signatures.
   *
   * @param endpointId - The endpoint's unique ID
   * @returns The endpoint's secret
   *
   * @example
   * ```ts
   * const { key } = await hs.endpoint.getSecret("ep_abc123");
   * // Use key to verify webhook signatures
   * ```
   */
  public getSecret(endpointId: string): Promise<EndpointSecretOut> {
    const request = new HookSniffRequest(
      HttpMethod.GET,
      "/api/v1/endpoint/{endpoint_id}/secret"
    );

    request.setPathParam("endpoint_id", endpointId);

    return request.send(this.requestCtx, EndpointSecretOutSerializer._fromJsonObject);
  }

  /**
   * Rotate the endpoint's signing secret.
   *
   * The previous secret remains valid for 24 hours after rotation.
   *
   * @param endpointId - The endpoint's unique ID
   * @param endpointSecretRotateIn - The new secret (or omit for auto-generation)
   * @param options - Request options
   *
   * @example
   * ```ts
   * // Auto-generate new secret
   * await hs.endpoint.rotateSecret("ep_abc123", {});
   *
   * // Use specific secret
   * await hs.endpoint.rotateSecret("ep_abc123", { key: "whsec_new..." });
   * ```
   */
  public rotateSecret(
    endpointId: string,
    endpointSecretRotateIn: EndpointSecretRotateIn,
    options?: EndpointRotateSecretOptions
  ): Promise<void> {
    const request = new HookSniffRequest(
      HttpMethod.POST,
      "/api/v1/endpoint/{endpoint_id}/secret/rotate"
    );

    request.setPathParam("endpoint_id", endpointId);
    request.setHeaderParam("idempotency-key", options?.idempotencyKey);
    request.setBody(EndpointSecretRotateInSerializer._toJsonObject(endpointSecretRotateIn));

    return request.sendNoResponseBody(this.requestCtx);
  }
}
