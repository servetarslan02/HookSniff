/**
 * HookSniff SDK — Admin Resource
 *
 * Requires admin-level API key.
 */

import { HttpMethod, HookSniffRequest, type HookSniffRequestContext } from "../request";
import { paginatedIterator, type PaginationOptions } from "../pagination";
import type {
  AdminAlertRule,
  AdminAuditLogResponse,
  AdminRevenueResponse,
  AdminSystemStatus,
  CustomerResponse,
  AdminCreateAlertRequest,
  AdminUpdateAlertRequest,
  AdminTestWebhookRequest,
  AdminTestWebhookResponse,
} from "../models";

export interface AdminUserListOptions extends PaginationOptions {
  plan?: string;
  search?: string;
}

export interface AdminAuditLogOptions extends PaginationOptions {
  action?: string;
  actor?: string;
}

export class Admin {
  constructor(private readonly requestCtx: HookSniffRequestContext) {}

  /** Get admin system status. */
  public systemStatus(): Promise<AdminSystemStatus> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/admin/stats");
    return request.send(this.requestCtx, (json) => json as AdminSystemStatus);
  }

  /** List all users (admin). */
  public listUsers(options?: AdminUserListOptions): Promise<{ data: CustomerResponse[]; total: number }> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/admin/users");
    request.setQueryParams({
      limit: options?.limit,
      page: options?.iterator,
      plan: options?.plan,
      search: options?.search,
    });
    return request.send(this.requestCtx, (json) => json as { data: CustomerResponse[]; total: number });
  }

  /** Get a specific user (admin). */
  public getUser(userId: string): Promise<CustomerResponse> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/admin/users/{id}");
    request.setPathParam("id", userId);
    return request.send(this.requestCtx, (json) => json as CustomerResponse);
  }

  /** Update a user's plan (admin). */
  public updateUserPlan(userId: string, plan: string): Promise<CustomerResponse> {
    const request = new HookSniffRequest(HttpMethod.PUT, "/v1/admin/users/{id}/plan");
    request.setPathParam("id", userId);
    request.setBody({ plan });
    return request.send(this.requestCtx, (json) => json as CustomerResponse);
  }

  /** Update a user's status (admin). */
  public updateUserStatus(userId: string, status: string): Promise<CustomerResponse> {
    const request = new HookSniffRequest(HttpMethod.PUT, "/v1/admin/users/{id}/status");
    request.setPathParam("id", userId);
    request.setBody({ status });
    return request.send(this.requestCtx, (json) => json as CustomerResponse);
  }

  /** Export users as CSV (admin). */
  public exportUsers(): Promise<{ data: string }> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/admin/users/export");
    return request.send(this.requestCtx, (json) => json as { data: string });
  }

  /** Get revenue stats (admin). */
  public revenue(options?: { range?: string }): Promise<AdminRevenueResponse> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/admin/revenue");
    request.setQueryParams({ range: options?.range });
    return request.send(this.requestCtx, (json) => json as AdminRevenueResponse);
  }

  /** Get audit log (admin). */
  public auditLog(options?: AdminAuditLogOptions): Promise<AdminAuditLogResponse> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/admin/audit-logs");
    request.setQueryParams({
      limit: options?.limit,
      page: options?.iterator,
      action: options?.action,
      actor: options?.actor,
    });
    return request.send(this.requestCtx, (json) => json as AdminAuditLogResponse);
  }

  /** List alert rules (admin). */
  public listAlerts(): Promise<AdminAlertRule[]> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/admin/alerts");
    return request.send(this.requestCtx, (json) => json as AdminAlertRule[]);
  }

  /** Create alert rule (admin). */
  public createAlert(body: AdminCreateAlertRequest): Promise<AdminAlertRule> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/admin/alerts");
    request.setBody(body);
    return request.send(this.requestCtx, (json) => json as AdminAlertRule);
  }

  /** Update alert rule (admin). */
  public updateAlert(alertId: string, body: AdminUpdateAlertRequest): Promise<AdminAlertRule> {
    const request = new HookSniffRequest(HttpMethod.PUT, "/v1/admin/alerts/{id}");
    request.setPathParam("id", alertId);
    request.setBody(body);
    return request.send(this.requestCtx, (json) => json as AdminAlertRule);
  }

  /** Delete alert rule (admin). */
  public deleteAlert(alertId: string): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.DELETE, "/v1/admin/alerts/{id}");
    request.setPathParam("id", alertId);
    return request.sendNoResponseBody(this.requestCtx);
  }

  /** Replay a delivery (admin). */
  public replayDelivery(deliveryId: string): Promise<void> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/admin/deliveries/{id}/replay");
    request.setPathParam("id", deliveryId);
    return request.sendNoResponseBody(this.requestCtx);
  }

  /** Test a webhook (admin). */
  public testWebhook(body: AdminTestWebhookRequest): Promise<AdminTestWebhookResponse> {
    const request = new HookSniffRequest(HttpMethod.POST, "/v1/admin/test-webhook");
    request.setBody(body);
    return request.send(this.requestCtx, (json) => json as AdminTestWebhookResponse);
  }

  /** Get deploy info (admin). */
  public deployInfo(): Promise<{ version: string; region: string; deployed_at: string }> {
    const request = new HookSniffRequest(HttpMethod.GET, "/v1/admin/deploy-info");
    return request.send(this.requestCtx, (json) =>
      json as { version: string; region: string; deployed_at: string }
    );
  }
}
