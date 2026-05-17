/**
 * HookSniff SDK — API Keys Resource
 */

import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";
import type { PostOptions } from "../util";
import type { ApiKeyInfo, CreateApiKeyResponse } from "../models";

export interface ApiKeyCreateOptions extends PostOptions {
  name?: string;
  scopes?: string[];
  expires_in_days?: number;
}

export class ApiKeys {
  constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /** List all API keys. */
  public list(): Promise<ApiKeyInfo[]> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/api-keys");
    return request.send(this.requestCtx, (json) => json as ApiKeyInfo[]);
  }

  /** Create a new API key. Returns the full key (only shown once). */
  public create(options?: ApiKeyCreateOptions): Promise<CreateApiKeyResponse> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/api-keys");
    request.setBody({
      name: options?.name,
      scopes: options?.scopes,
      expires_in_days: options?.expires_in_days,
    });
    if (options?.idempotencyKey) {
      request.setHeaderParam("idempotency-key", options.idempotencyKey);
    }
    return request.send(this.requestCtx, (json) => json as CreateApiKeyResponse);
  }

  /** Delete an API key. */
  public delete(keyId: string): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.DELETE, "/v1/api-keys/{id}");
    request.setPathParam("id", keyId);
    return request.sendNoResponseBody(this.requestCtx);
  }

  /** Rotate an API key (old key invalidated, new key returned). */
  public rotate(keyId: string): Promise<CreateApiKeyResponse> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/api-keys/{id}/rotate");
    request.setPathParam("id", keyId);
    return request.send(this.requestCtx, (json) => json as CreateApiKeyResponse);
  }
}
