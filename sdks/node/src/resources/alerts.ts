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
import { paginate, collectAll, type PaginationOptions } from "../pagination";

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

  /** Iterate through all alert rules with automatic pagination */
  listAllRules(options?: PaginationOptions): AsyncGenerator<AlertRule, void, undefined> {
    return paginate(async ({ limit, offset }) => {
      const req = new HookSniffRequest(HttpMethod.GET, "/v1/alerts/rules");
      req.setQueryParams({ limit, offset });
      return req.send<{ data: AlertRule[]; has_more: boolean }>(this.ctx, (json) => {
        const obj = json as Record<string, unknown>;
        const data = Array.isArray(obj.data)
          ? obj.data.map((item) =>
              typeof item === "object" && item !== null
                ? AlertRuleModel._fromJsonObject(item as Record<string, unknown>)
                : item
            )
          : [];
        return { data, has_more: Boolean(obj.has_more ?? false) };
      });
    }, options);
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

  /** Iterate through all alert notifications with automatic pagination */
  listAllNotifications(options?: PaginationOptions): AsyncGenerator<AlertNotification, void, undefined> {
    return paginate(async ({ limit, offset }) => {
      const req = new HookSniffRequest(HttpMethod.GET, "/v1/alerts/notifications");
      req.setQueryParams({ limit, offset });
      return req.send<{ data: AlertNotification[]; has_more: boolean }>(this.ctx, (json) => {
        const obj = json as Record<string, unknown>;
        const data = Array.isArray(obj.data)
          ? obj.data.map((item) =>
              typeof item === "object" && item !== null
                ? AlertNotificationModel._fromJsonObject(item as Record<string, unknown>)
                : item
            )
          : [];
        return { data, has_more: Boolean(obj.has_more ?? false) };
      });
    }, options);
  }
}
