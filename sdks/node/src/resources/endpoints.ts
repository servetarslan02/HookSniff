/**
 * HookSniff API Resource: Endpoints
 *
 * Manage webhook endpoints — create, list, update, delete, rotate secrets.
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";
import {
  EndpointModel,
  EndpointSecretModel,
  type EndpointCreateInput,
  type EndpointUpdateInput,
  type EndpointOutput,
  type EndpointSecretOutput,
} from "../models";

export type { EndpointCreateInput, EndpointUpdateInput, EndpointOutput, EndpointSecretOutput };

export class Endpoints {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List all endpoints */
  async list(): Promise<EndpointOutput[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/endpoints");
    return req.send<EndpointOutput[]>(this.ctx, (json) => {
      const arr = Array.isArray(json) ? json : [];
      return arr.map((item) =>
        typeof item === "object" && item !== null
          ? EndpointModel._fromJsonObject(item as Record<string, unknown>)
          : item
      );
    });
  }

  /** Create a new endpoint */
  async create(input: EndpointCreateInput, idempotencyKey?: string): Promise<EndpointOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/endpoints");
    if (idempotencyKey) req.setHeaderParam("idempotency-key", idempotencyKey);
    req.setBody(EndpointModel._toJsonObject(input));
    return req.send<EndpointOutput>(this.ctx, (json) =>
      EndpointModel._fromJsonObject(json as Record<string, unknown>)
    );
  }

  /** Get an endpoint by ID */
  async get(id: string): Promise<EndpointOutput> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/endpoints/{id}");
    req.setPathParam("id", id);
    return req.send<EndpointOutput>(this.ctx, (json) =>
      EndpointModel._fromJsonObject(json as Record<string, unknown>)
    );
  }

  /** Update an endpoint */
  async update(id: string, input: EndpointUpdateInput): Promise<EndpointOutput> {
    const req = new HookSniffRequest(HttpMethod.PUT, "/v1/endpoints/{id}");
    req.setPathParam("id", id);
    req.setBody(EndpointModel._toJsonObject(input));
    return req.send<EndpointOutput>(this.ctx, (json) =>
      EndpointModel._fromJsonObject(json as Record<string, unknown>)
    );
  }

  /** Delete an endpoint */
  async delete(id: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, "/v1/endpoints/{id}");
    req.setPathParam("id", id);
    return req.sendVoid(this.ctx);
  }

  /** Rotate the signing secret for an endpoint */
  async rotateSecret(id: string): Promise<EndpointSecretOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/endpoints/{id}/rotate-secret");
    req.setPathParam("id", id);
    return req.send<EndpointSecretOutput>(this.ctx, (json) =>
      EndpointSecretModel._fromJsonObject(json as Record<string, unknown>)
    );
  }
}
