/**
 * HookSniff API Resource: Endpoints
 *
 * Manage webhook endpoints — create, list, update, delete, rotate secrets.
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";

export interface EndpointCreateInput {
  url: string;
  description?: string;
  rate_limit?: number;
  active?: boolean;
}

export interface EndpointUpdateInput {
  url?: string;
  description?: string;
  rate_limit?: number;
  active?: boolean;
}

export interface EndpointOutput {
  id: string;
  url: string;
  description: string;
  rate_limit: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EndpointSecretOutput {
  key: string;
}

export class Endpoints {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List all endpoints */
  async list(): Promise<EndpointOutput[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/endpoints");
    return req.send<EndpointOutput[]>(this.ctx);
  }

  /** Create a new endpoint */
  async create(input: EndpointCreateInput, idempotencyKey?: string): Promise<EndpointOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/endpoints");
    if (idempotencyKey) req.setHeaderParam("idempotency-key", idempotencyKey);
    req.setBody(input);
    return req.send<EndpointOutput>(this.ctx);
  }

  /** Get an endpoint by ID */
  async get(id: string): Promise<EndpointOutput> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/endpoints/{id}");
    req.setPathParam("id", id);
    return req.send<EndpointOutput>(this.ctx);
  }

  /** Update an endpoint */
  async update(id: string, input: EndpointUpdateInput): Promise<EndpointOutput> {
    const req = new HookSniffRequest(HttpMethod.PUT, "/v1/endpoints/{id}");
    req.setPathParam("id", id);
    req.setBody(input);
    return req.send<EndpointOutput>(this.ctx);
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
    return req.send<EndpointSecretOutput>(this.ctx);
  }
}
