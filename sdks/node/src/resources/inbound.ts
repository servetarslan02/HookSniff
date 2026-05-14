/**
 * HookSniff API Resource: Inbound Configs
 *
 * Manage inbound webhook configurations — receive webhooks from external providers.
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";

export interface InboundConfigOutput {
  id: string;
  customer_id: string;
  provider: string;
  secret: string;
  endpoint_id: string | null;
  enabled: boolean;
  created_at: string;
}

export interface InboundConfigCreateInput {
  provider: string;
  secret: string;
  endpoint_id?: string | null;
  enabled?: boolean;
}

export interface InboundConfigUpdateInput {
  secret?: string;
  endpoint_id?: string | null;
  enabled?: boolean;
}

export class Inbound {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List all inbound configs */
  async listConfigs(): Promise<InboundConfigOutput[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/inbound/configs");
    return req.send<InboundConfigOutput[]>(this.ctx, (json) => {
      return Array.isArray(json) ? json : [];
    });
  }

  /** Create a new inbound config */
  async createConfig(input: InboundConfigCreateInput): Promise<InboundConfigOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/inbound/configs");
    req.setBody(input);
    return req.send<InboundConfigOutput>(this.ctx);
  }

  /** Update an inbound config */
  async updateConfig(id: string, input: InboundConfigUpdateInput): Promise<InboundConfigOutput> {
    const req = new HookSniffRequest(HttpMethod.PUT, `/v1/inbound/configs/${id}`);
    req.setBody(input);
    return req.send<InboundConfigOutput>(this.ctx);
  }

  /** Delete an inbound config */
  async deleteConfig(id: string): Promise<{ success: boolean }> {
    const req = new HookSniffRequest(HttpMethod.DELETE, `/v1/inbound/configs/${id}`);
    return req.send<{ success: boolean }>(this.ctx);
  }
}
