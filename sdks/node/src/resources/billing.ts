/**
 * HookSniff API Resource: Billing
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";
import { PlanInfoModel, PortalModel, type PlanInfo, type PortalOutput } from "../models";

export type { PlanInfo, PortalOutput };

export class Billing {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** Get current plan info */
  async getPlan(): Promise<PlanInfo> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/billing/plan");
    return req.send<PlanInfo>(this.ctx, (json) =>
      PlanInfoModel._fromJsonObject(json as Record<string, unknown>)
    );
  }

  /** Upgrade plan */
  async upgrade(plan: string, idempotencyKey?: string): Promise<PortalOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/billing/upgrade");
    if (idempotencyKey) req.setHeaderParam("idempotency-key", idempotencyKey);
    req.setBody({ plan });
    return req.send<PortalOutput>(this.ctx, (json) =>
      PortalModel._fromJsonObject(json as Record<string, unknown>)
    );
  }

  /** Open customer portal */
  async portal(): Promise<PortalOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/billing/portal");
    return req.send<PortalOutput>(this.ctx, (json) =>
      PortalModel._fromJsonObject(json as Record<string, unknown>)
    );
  }
}
