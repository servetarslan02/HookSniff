/**
 * HookSniff SDK — Billing Resource
 */

import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";
import type {
  SubscriptionResponse,
  UpgradeRequest,
  UpgradeResponse,
  UsageResponse,
  InvoiceResponse,
  BillingPortalResponse,
} from "../models";

export class Billing {
  constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /** Get current subscription. */
  public subscription(): Promise<SubscriptionResponse> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/billing/subscription");
    return request.send(this.requestCtx, (json) => json as SubscriptionResponse);
  }

  /** Get usage for current billing period. */
  public usage(): Promise<UsageResponse> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/billing/usage");
    return request.send(this.requestCtx, (json) => json as UsageResponse);
  }

  /** Get invoices. */
  public invoices(): Promise<InvoiceResponse[]> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/billing/invoices");
    return request.send(this.requestCtx, (json) => json as InvoiceResponse[]);
  }

  /** Upgrade plan. Returns checkout URL. */
  public upgrade(body: UpgradeRequest): Promise<UpgradeResponse> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/billing/upgrade");
    request.setBody(body);
    return request.send(this.requestCtx, (json) => json as UpgradeResponse);
  }

  /** Open billing portal (Polar.sh/Stripe). */
  public portal(): Promise<BillingPortalResponse> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/billing/portal");
    return request.send(this.requestCtx, (json) => json as BillingPortalResponse);
  }
}
