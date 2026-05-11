/**
 * HookSniff API Resource: API Keys
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";
import { ApiKeyModel, type ApiKeyCreateInput, type ApiKeyOutput } from "../models";
import { paginate, collectAll, type PaginationOptions } from "../pagination";

export type { ApiKeyCreateInput, ApiKeyOutput };

export class ApiKeys {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List all API keys */
  async list(): Promise<ApiKeyOutput[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/api-keys");
    return req.send<ApiKeyOutput[]>(this.ctx, (json) => {
      const arr = Array.isArray(json) ? json : [];
      return arr.map((item) =>
        typeof item === "object" && item !== null
          ? ApiKeyModel._fromJsonObject(item as Record<string, unknown>)
          : item
      );
    });
  }

  /** Iterate through all API keys with automatic pagination */
  listAll(options?: PaginationOptions): AsyncGenerator<ApiKeyOutput, void, undefined> {
    return paginate(async ({ limit, offset }) => {
      const req = new HookSniffRequest(HttpMethod.GET, "/v1/api-keys");
      req.setQueryParams({ limit, offset });
      return req.send<{ data: ApiKeyOutput[]; has_more: boolean }>(this.ctx, (json) => {
        const obj = json as Record<string, unknown>;
        const data = Array.isArray(obj.data)
          ? obj.data.map((item) =>
              typeof item === "object" && item !== null
                ? ApiKeyModel._fromJsonObject(item as Record<string, unknown>)
                : item
            )
          : [];
        return { data, has_more: Boolean(obj.has_more ?? false) };
      });
    }, options);
  }

  /** Create a new API key */
  async create(input: ApiKeyCreateInput, idempotencyKey?: string): Promise<ApiKeyOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/api-keys");
    if (idempotencyKey) req.setHeaderParam("idempotency-key", idempotencyKey);
    req.setBody(ApiKeyModel._toJsonObject(input));
    return req.send<ApiKeyOutput>(this.ctx, (json) =>
      ApiKeyModel._fromJsonObject(json as Record<string, unknown>)
    );
  }

  /** Delete an API key */
  async delete(id: string): Promise<void> {
    const req = new HookSniffRequest(HttpMethod.DELETE, "/v1/api-keys/{id}");
    req.setPathParam("id", id);
    return req.sendVoid(this.ctx);
  }
}
