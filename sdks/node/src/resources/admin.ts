/**
 * HookSniff API Resource: Admin
 *
 * Admin-only endpoints — stats, users, revenue, settings, feature flags, deploy info.
 */

import { HookSniffRequest, HttpMethod, type HookSniffRequestContext } from "../request";

export interface AdminStatsOutput {
  total_users: number;
  total_deliveries: number;
  total_revenue: number;
  active_users_today: number;
  total_endpoints: number;
  active_endpoints: number;
  users_by_plan: Array<{ plan: string; count: number }>;
  recent_signups: Array<{ id: string; email: string; name?: string; plan: string; created_at: string }>;
  trends: {
    total_users_yesterday: number;
    total_deliveries_yesterday: number;
    revenue_yesterday: number;
    active_users_yesterday: number;
    active_webhooks: number;
  };
}

export interface AdminUserOutput {
  id: string;
  email: string;
  name?: string;
  plan: string;
  role: string;
  status: "active" | "banned";
  created_at: string;
}

export interface FeatureFlagOutput {
  id: string;
  name: string;
  description: string | null;
  is_enabled: boolean;
  rollout_percentage: number;
  enabled_for_plans: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeployInfoOutput {
  version: string;
  git_commit: string | null;
  build_time: string | null;
  environment: string;
}

export interface PlatformSettingsOutput {
  default_plan: string;
  max_endpoints_free: number;
  max_endpoints_pro: number;
  max_webhooks_free: number;
  max_webhooks_pro: number;
  rate_limit_free: number;
  rate_limit_pro: number;
  retry_max_attempts: number;
  retention_days_free: number;
  retention_days_pro: number;
  maintenance_mode: boolean;
  signup_enabled: boolean;
  plan_price_pro: number;
  plan_price_business: number;
  global_rate_limit: number;
  cors_origins: string | null;
}

export class Admin {
  constructor(private readonly ctx: HookSniffRequestContext) {}

  /** Get system stats */
  async getStats(): Promise<AdminStatsOutput> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/admin/stats");
    return req.send<AdminStatsOutput>(this.ctx);
  }

  /** List users */
  async listUsers(params?: { page?: number; search?: string; plan?: string; status?: string }): Promise<{ users: AdminUserOutput[]; total: number; page: number; per_page: number }> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/admin/users");
    if (params) req.setQueryParams(params as Record<string, string>);
    return req.send(this.ctx);
  }

  /** Get user detail */
  async getUserDetail(id: string): Promise<{ user: AdminUserOutput; endpoints: unknown[]; recent_deliveries: unknown[]; usage_stats: unknown }> {
    const req = new HookSniffRequest(HttpMethod.GET, `/v1/admin/users/${id}`);
    return req.send(this.ctx);
  }

  /** Update user plan */
  async updateUserPlan(id: string, plan: string): Promise<{ success: boolean }> {
    const req = new HookSniffRequest(HttpMethod.PUT, `/v1/admin/users/${id}/plan`);
    req.setBody({ plan });
    return req.send(this.ctx);
  }

  /** Update user status (active/banned) */
  async updateUserStatus(id: string, isActive: boolean): Promise<{ success: boolean }> {
    const req = new HookSniffRequest(HttpMethod.PUT, `/v1/admin/users/${id}/status`);
    req.setBody({ is_active: isActive });
    return req.send(this.ctx);
  }

  /** Impersonate user */
  async impersonateUser(id: string): Promise<{ token: string; user_id: string; email: string; expires_in: number }> {
    const req = new HookSniffRequest(HttpMethod.POST, `/v1/admin/users/${id}/impersonate`);
    return req.send(this.ctx);
  }

  /** Get revenue data */
  async getRevenue(): Promise<{ monthly_revenue: unknown[]; revenue_by_plan: unknown[]; mrr: number; churn_rate: number }> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/admin/revenue");
    return req.send(this.ctx);
  }

  /** Get churn report */
  async getChurn(): Promise<{ users: Array<{ id: string; email: string; name?: string; plan: string; amount: number; churn_date: string }> }> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/admin/churn");
    return req.send(this.ctx);
  }

  /** Get audit logs */
  async getAuditLogs(params?: { limit?: number; offset?: number; action?: string }): Promise<{ entries: unknown[]; total: number; page: number; per_page: number }> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/admin/audit-logs");
    if (params) req.setQueryParams(params as Record<string, string>);
    return req.send(this.ctx);
  }

  /** Get platform settings */
  async getSettings(): Promise<PlatformSettingsOutput> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/admin/settings");
    return req.send<PlatformSettingsOutput>(this.ctx);
  }

  /** Update platform settings */
  async updateSettings(settings: Partial<PlatformSettingsOutput>): Promise<{ message: string }> {
    const req = new HookSniffRequest(HttpMethod.PUT, "/v1/admin/settings");
    req.setBody(settings);
    return req.send(this.ctx);
  }

  /** List feature flags */
  async listFeatureFlags(): Promise<{ flags: FeatureFlagOutput[] }> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/admin/feature-flags");
    return req.send(this.ctx);
  }

  /** Create feature flag */
  async createFeatureFlag(input: { name: string; description?: string; is_enabled?: boolean; rollout_percentage?: number; enabled_for_plans?: string[] }): Promise<FeatureFlagOutput> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/admin/feature-flags");
    req.setBody(input);
    return req.send<FeatureFlagOutput>(this.ctx);
  }

  /** Update feature flag */
  async updateFeatureFlag(id: string, input: Partial<{ name: string; description: string; is_enabled: boolean; rollout_percentage: number; enabled_for_plans: string[] }>): Promise<FeatureFlagOutput> {
    const req = new HookSniffRequest(HttpMethod.PUT, `/v1/admin/feature-flags/${id}`);
    req.setBody(input);
    return req.send<FeatureFlagOutput>(this.ctx);
  }

  /** Delete feature flag */
  async deleteFeatureFlag(id: string): Promise<{ success: boolean }> {
    const req = new HookSniffRequest(HttpMethod.DELETE, `/v1/admin/feature-flags/${id}`);
    return req.send<{ success: boolean }>(this.ctx);
  }

  /** Get deploy info */
  async getDeployInfo(): Promise<DeployInfoOutput> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/admin/deploy-info");
    return req.send<DeployInfoOutput>(this.ctx);
  }

  /** Test webhook */
  async testWebhook(data: { endpoint_url: string; event_type: string; payload: Record<string, unknown> }): Promise<{ status_code: number; response_body: string; duration_ms: number }> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/admin/test-webhook");
    req.setBody(data);
    return req.send(this.ctx);
  }

  /** List admin alerts */
  async listAlerts(): Promise<Array<{ id: string; name: string; condition: string; threshold: number; channels: string[]; is_active: boolean; created_at: string }>> {
    const req = new HookSniffRequest(HttpMethod.GET, "/v1/admin/alerts");
    return req.send(this.ctx);
  }

  /** Create admin alert */
  async createAlert(input: { name: string; condition: string; threshold: number; channels: string[] }): Promise<{ id: string; name: string }> {
    const req = new HookSniffRequest(HttpMethod.POST, "/v1/admin/alerts");
    req.setBody(input);
    return req.send(this.ctx);
  }

  /** Update admin alert */
  async updateAlert(id: string, input: { threshold?: number; channels?: string[]; is_active?: boolean }): Promise<{ id: string }> {
    const req = new HookSniffRequest(HttpMethod.PUT, `/v1/admin/alerts/${id}`);
    req.setBody(input);
    return req.send(this.ctx);
  }

  /** Delete admin alert */
  async deleteAlert(id: string): Promise<{ success: boolean }> {
    const req = new HookSniffRequest(HttpMethod.DELETE, `/v1/admin/alerts/${id}`);
    return req.send<{ success: boolean }>(this.ctx);
  }
}
