/**
 * Inbound Webhook — Manage inbound webhook configurations.
 *
 * Receive and verify webhooks from external services (Stripe, GitHub, Shopify, etc.)
 * and route them to HookSniff endpoints.
 */
import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

export interface InboundConfig {
  id: string;
  customerId: string;
  provider: string;
  secret: string;
  endpointId?: string | null;
  enabled: boolean;
  createdAt: string;
}

export interface InboundConfigIn {
  provider: string;
  secret: string;
  endpointId?: string | null;
  enabled?: boolean;
}

const InboundConfigFromJson = (json: any): InboundConfig => ({
  id: json['id'],
  customerId: json['customer_id'],
  provider: json['provider'],
  secret: json['secret'],
  endpointId: json['endpoint_id'] ?? null,
  enabled: json['enabled'],
  createdAt: json['created_at'],
});

const InboundConfigToJson = (obj: InboundConfigIn): any => ({
  'provider': obj.provider,
  'secret': obj.secret,
  'endpoint_id': obj.endpointId,
  'enabled': obj.enabled,
});

export class Inbound {
  public constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /** List all inbound webhook configurations. */
  public listConfigs(): Promise<InboundConfig[]> {
    const request = new HookSniffRequest(HttpMethod.GET, "/api/v1/inbound/configs");
    return request.send(this.requestCtx, (arr: any[]) => arr.map(InboundConfigFromJson));
  }

  /** Create a new inbound webhook configuration. */
  public createConfig(body: InboundConfigIn): Promise<InboundConfig> {
    const request = new HookSniffRequest(HttpMethod.POST, "/api/v1/inbound/configs");
    request.setBody(InboundConfigToJson(body));
    return request.send(this.requestCtx, InboundConfigFromJson);
  }

  /** Update an inbound webhook configuration. */
  public updateConfig(id: string, body: Partial<InboundConfigIn>): Promise<InboundConfig> {
    const request = new HookSniffRequest(HttpMethod.PUT, "/api/v1/inbound/configs/{id}");
    request.setPathParam("id", id);
    request.setBody(InboundConfigToJson(body as InboundConfigIn));
    return request.send(this.requestCtx, InboundConfigFromJson);
  }

  /** Delete an inbound webhook configuration. */
  public deleteConfig(id: string): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.DELETE, "/api/v1/inbound/configs/{id}");
    request.setPathParam("id", id);
    return request.sendNoResponseBody(this.requestCtx);
  }
}
