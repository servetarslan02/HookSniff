/**
 * HookSniff API Resource: Service Tokens
 *
 * Manage service tokens for API access — create, list, update, delete, reveal.
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";

export interface ServiceTokenOutput {
  id: string;
  name: string | null;
  token_prefix: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}

export interface ServiceTokenCreateOutput extends ServiceTokenOutput {
  token: string;
  message: string;
}

export class ServiceTokens {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List all service tokens */
  async list(): Promise<ServiceTokenOutput[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/service-tokens");
    return req.send<ServiceTokenOutput[]>(this.ctx, (json) => {
      return Array.isArray(json) ? json : [];
    });
  }

  /** Create a new service token (full token shown only once) */
  async create(name: string): Promise<ServiceTokenCreateOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/service-tokens");
    req.setBody({ name });
    return req.send<ServiceTokenCreateOutput>(this.ctx);
  }

  /** Update a service token (e.g. rename) */
  async update(id: string, input: { name?: string }): Promise<ServiceTokenOutput> {
    const req = new HookSniffRequest(HttpMethod.PUT, `/v1/service-tokens/${id}`);
    req.setBody(input);
    return req.send<ServiceTokenOutput>(this.ctx);
  }

  /** Delete a service token */
  async delete(id: string): Promise<{ success: boolean }> {
    const req = new HookSniffRequest(HttpMethod.DELETE, `/v1/service-tokens/${id}`);
    return req.send<{ success: boolean }>(this.ctx);
  }

  /** Reveal the full token value (only available once after creation) */
  async reveal(id: string): Promise<{ token: string | null; message?: string }> {
    const req = new HookSniffRequest(HttpMethod.POST, `/v1/service-tokens/${id}/reveal`);
    return req.send<{ token: string | null; message?: string }>(this.ctx);
  }
}
