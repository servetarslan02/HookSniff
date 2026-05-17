/**
 * HookSniff SDK — Alerts Resource
 */

import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";
import type { AlertRule, CreateAlertRequest } from "../models";

export class Alerts {
  constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /** List all alert rules. */
  public list(): Promise<AlertRule[]> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/alerts");
    return request.send(this.requestCtx, (json) => json as AlertRule[]);
  }

  /** Get an alert rule by ID. */
  public get(alertId: string): Promise<AlertRule> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/alerts/{id}");
    request.setPathParam("id", alertId);
    return request.send(this.requestCtx, (json) => json as AlertRule);
  }

  /** Create a new alert rule. */
  public create(body: CreateAlertRequest): Promise<AlertRule> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/alerts");
    request.setBody(body);
    return request.send(this.requestCtx, (json) => json as AlertRule);
  }

  /** Delete an alert rule. */
  public delete(alertId: string): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.DELETE, "/v1/alerts/{id}");
    request.setPathParam("id", alertId);
    return request.sendNoResponseBody(this.requestCtx);
  }

  /** Test an alert rule (send test notification). */
  public test(alertId: string): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/alerts/{id}/test");
    request.setPathParam("id", alertId);
    return request.sendNoResponseBody(this.requestCtx);
  }
}
