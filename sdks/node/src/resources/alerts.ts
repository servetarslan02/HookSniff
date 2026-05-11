/**
 * HookSniff API Resource: Alerts
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  created_at: string;
}

export interface AlertNotification {
  id: string;
  rule_id: string;
  message: string;
  severity: string;
  created_at: string;
  read: boolean;
}

export class Alerts {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List alert rules */
  async listRules(): Promise<AlertRule[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/alerts/rules");
    return req.send<AlertRule[]>(this.ctx);
  }

  /** List alert notifications */
  async listNotifications(options?: { limit?: number }): Promise<AlertNotification[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/alerts/notifications");
    if (options?.limit) req.setQueryParams({ limit: options.limit });
    return req.send<AlertNotification[]>(this.ctx);
  }
}
