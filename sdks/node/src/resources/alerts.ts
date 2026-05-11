/**
 * HookSniff API Resource: Alerts
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";
import {
  AlertRuleModel,
  AlertNotificationModel,
  type AlertRule,
  type AlertNotification,
} from "../models";

export type { AlertRule, AlertNotification };

export class Alerts {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** List alert rules */
  async listRules(): Promise<AlertRule[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/alerts/rules");
    return req.send<AlertRule[]>(this.ctx, (json) => {
      const arr = Array.isArray(json) ? json : [];
      return arr.map((item) =>
        typeof item === "object" && item !== null
          ? AlertRuleModel._fromJsonObject(item as Record<string, unknown>)
          : item
      );
    });
  }

  /** List alert notifications */
  async listNotifications(options?: { limit?: number }): Promise<AlertNotification[]> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/alerts/notifications");
    if (options?.limit) req.setQueryParams({ limit: options.limit });
    return req.send<AlertNotification[]>(this.ctx, (json) => {
      const arr = Array.isArray(json) ? json : [];
      return arr.map((item) =>
        typeof item === "object" && item !== null
          ? AlertNotificationModel._fromJsonObject(item as Record<string, unknown>)
          : item
      );
    });
  }
}
