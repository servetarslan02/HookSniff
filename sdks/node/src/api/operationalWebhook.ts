import {
  type OperationalWebhookEndpointIn, OperationalWebhookEndpointInSerializer,
} from "../models/operationalWebhookEndpointIn";
import {
  type OperationalWebhookEndpointOut, OperationalWebhookEndpointOutSerializer,
} from "../models/operationalWebhookEndpointOut";
import {
  type OperationalWebhookDeliveryOut, OperationalWebhookDeliveryOutSerializer,
} from "../models/operationalWebhookDeliveryOut";
import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";

/**
 * Manage operational webhook endpoints and view delivery logs.
 *
 * Operational webhooks notify you about system events like
 * delivery failures, endpoint disabling, etc.
 */
export class OperationalWebhook {
  public constructor(private readonly requestCtx: HookSniffRequestContext) {}

  public list(): Promise<OperationalWebhookEndpointOut[]> {
    const request = new HookSniffRequest(HttpMethod.GET, "/api/v1/operational-webhooks");
    return request.send(this.requestCtx, (arr: any[]) =>
      arr.map(OperationalWebhookEndpointOutSerializer._fromJsonObject)
    );
  }

  public create(body: OperationalWebhookEndpointIn): Promise<OperationalWebhookEndpointOut> {
    const request = new HookSniffRequest(HttpMethod.POST, "/api/v1/operational-webhooks");
    request.setBody(OperationalWebhookEndpointInSerializer._toJsonObject(body));
    return request.send(this.requestCtx, OperationalWebhookEndpointOutSerializer._fromJsonObject);
  }

  public get(endpointId: string): Promise<OperationalWebhookEndpointOut> {
    const request = new HookSniffRequest(HttpMethod.GET, "/api/v1/operational-webhooks/{id}");
    request.setPathParam("id", endpointId);
    return request.send(this.requestCtx, OperationalWebhookEndpointOutSerializer._fromJsonObject);
  }

  public update(endpointId: string, body: Partial<OperationalWebhookEndpointIn>): Promise<OperationalWebhookEndpointOut> {
    const request = new HookSniffRequest(HttpMethod.PUT, "/api/v1/operational-webhooks/{id}");
    request.setPathParam("id", endpointId);
    request.setBody(OperationalWebhookEndpointInSerializer._toJsonObject(body as OperationalWebhookEndpointIn));
    return request.send(this.requestCtx, OperationalWebhookEndpointOutSerializer._fromJsonObject);
  }

  public delete(endpointId: string): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.DELETE, "/api/v1/operational-webhooks/{id}");
    request.setPathParam("id", endpointId);
    return request.sendNoResponseBody(this.requestCtx);
  }

  public listDeliveries(endpointId: string): Promise<OperationalWebhookDeliveryOut[]> {
    const request = new HookSniffRequest(HttpMethod.GET, "/api/v1/operational-webhooks/{id}/deliveries");
    request.setPathParam("id", endpointId);
    return request.send(this.requestCtx, (arr: any[]) =>
      arr.map(OperationalWebhookDeliveryOutSerializer._fromJsonObject)
    );
  }
}
