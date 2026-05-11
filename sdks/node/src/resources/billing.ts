/**
 * HookSniff API Resource: Billing
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";

export interface PlanInfo {
  plan: string;
  webhooks_remaining: number;
  webhooks_used: number;
  endpoints_remaining: number;
  current_period_end: string;
}

export interface PortalOutput {
  url: string;
}

export class Billing {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** Get current plan info */
  async getPlan(): Promise<PlanInfo> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/billing/plan");
    return req.send<PlanInfo>(this.ctx);
  }

  /** Upgrade plan */
  async upgrade(plan: string, idempotencyKey?: string): Promise<PortalOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/billing/upgrade");
    if (idempotencyKey) req.setHeaderParam("idempotency-key", idempotencyKey);
    req.setBody({ plan });
    return req.send<PortalOutput>(this.ctx);
  }

  /** Open customer portal */
  async portal(): Promise<PortalOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/billing/portal");
    return req.send<PortalOutput>(this.ctx);
  }
}
