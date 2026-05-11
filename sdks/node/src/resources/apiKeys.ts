/**
 * HookSniff API Resource: API Keys
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";

export interface ApiKeyCreateInput {
  name: string;
  expires_at?: string;
}

export interface ApiKeyOutput {
  id: string;
  name: string;
  key: string;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
}

export class ApiKeys {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List all API keys */
  async list(): Promise<ApiKeyOutput[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/api-keys");
    return req.send<ApiKeyOutput[]>(this.ctx);
  }

  /** Create a new API key */
  async create(input: ApiKeyCreateInput, idempotencyKey?: string): Promise<ApiKeyOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/api-keys");
    if (idempotencyKey) req.setHeaderParam("idempotency-key", idempotencyKey);
    req.setBody(input);
    return req.send<ApiKeyOutput>(this.ctx);
  }

  /** Delete an API key */
  async delete(id: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, "/v1/api-keys/{id}");
    req.setPathParam("id", id);
    return req.sendVoid(this.ctx);
  }
}
