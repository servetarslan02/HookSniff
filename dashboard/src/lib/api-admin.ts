// Admin API client

import { apiFetch } from './api';
import type { AdminStatsResponse, DeployInfo, AdminUsersResponse, AdminUserDetail, RevenueResponse, AuditLogResponse, UserAnalytics, ChurnUser, AlertRuleAdmin, FeatureFlag, PlatformSettings, Broadcast, BroadcastListResponse, SecurityEvent, SecurityStats, IpBlockEntry } from './api-types';

export const adminApi = {
  getStats: (token: string) =>
    apiFetch<AdminStatsResponse>('/admin/stats', { token }),

  listUsers: (token: string, params?: { page?: number; search?: string; plan?: string; status?: string; created_after?: string; created_before?: string; sort_field?: string; sort_dir?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.plan) searchParams.set('plan', params.plan);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.created_after) searchParams.set('created_after', params.created_after);
    if (params?.created_before) searchParams.set('created_before', params.created_before);
    if (params?.sort_field) searchParams.set('sort_field', params.sort_field);
    if (params?.sort_dir) searchParams.set('sort_dir', params.sort_dir);
    const qs = searchParams.toString();
    return apiFetch<AdminUsersResponse>(`/admin/users${qs ? `?${qs}` : ''}`, { token });
  },

  getUserDetail: (token: string, id: string) =>
    apiFetch<AdminUserDetail>(`/admin/users/${id}`, { token }),

  updateUserPlan: (token: string, id: string, plan: string) =>
    apiFetch<{ success: boolean }>(`/admin/users/${id}/plan`, { method: 'PUT', body: { plan }, token }),

  getUserPlanHistory: (token: string, id: string) =>
    apiFetch<{ history: Array<{ action: string; details: Record<string, unknown>; created_at: string }> }>(`/admin/users/${id}/plan-history`, { token }),

  sendUserEmail: (token: string, id: string, subject: string, body: string) =>
    apiFetch<{ message: string }>(`/admin/users/${id}/send-email`, { method: 'POST', body: { subject, body }, token }),

  updateUserStatus: (token: string, id: string, status: 'active' | 'banned', reason?: string) =>
    apiFetch<{ success: boolean }>(`/admin/users/${id}/status`, { method: 'PUT', body: { is_active: status === 'active', reason }, token }),

  getRevenue: (token: string) =>
    apiFetch<RevenueResponse>('/admin/revenue', { token }),

  getAuditLogs: (token: string, params?: { limit?: number; offset?: number; action?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) {
      searchParams.set('per_page', params.limit.toString());
      const page = params.offset ? Math.floor(params.offset / params.limit) + 1 : 1;
      searchParams.set('page', page.toString());
    }
    if (params?.action) searchParams.set('action', params.action);
    const qs = searchParams.toString();
    return apiFetch<AuditLogResponse>(`/admin/audit-logs${qs ? `?${qs}` : ''}`, { token });
  },

  impersonateUser: (token: string, userId: string) =>
    apiFetch<{ token: string; expires_in: number }>(`/admin/users/${userId}/impersonate`, { method: 'POST', token }),

  getUserAnalytics: (token: string, userId: string, days?: number) => {
    const qs = days ? `?days=${days}` : '';
    return apiFetch<UserAnalytics>(`/admin/users/${userId}/analytics${qs}`, { token });
  },

  getUserEndpoints: (token: string, userId: string) =>
    apiFetch<{ endpoints: Array<{ id: string; url: string; description: string | null; is_active: boolean; created_at: string; total_deliveries: number; last_delivery_at: string | null }> }>(`/admin/users/${userId}/endpoints`, { token }),

  getUserWebhooks: (token: string, userId: string, params?: { page?: number; per_page?: number; status?: string; event_type?: string; since?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.per_page) searchParams.set("per_page", params.per_page.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.event_type) searchParams.set("event_type", params.event_type);
    if (params?.since) searchParams.set("since", params.since);
    const qs = searchParams.toString();
    return apiFetch<{ webhooks: Array<{ id: string; endpoint_id: string; status: string; event: string | null; created_at: string; attempt_count: number; response_status: number | null; response_body: string | null; error_message: string | null }>; total: number; page: number; per_page: number }>(`/admin/users/${userId}/webhooks${qs ? `?${qs}` : ""}`, { token });
  },

  getUserApiKeys: (token: string, userId: string) =>
    apiFetch<{ api_keys: Array<{ prefix: string; name: string; created_at: string; is_active: boolean }> }>(`/admin/users/${userId}/api-keys`, { token }),

  getUserApplications: (token: string, userId: string) =>
    apiFetch<{ applications: Array<{ id: string; name: string; description: string | null; created_at: string; endpoint_count: number }> }>(`/admin/users/${userId}/applications`, { token }),

  getUserUsage: (token: string, userId: string) =>
    apiFetch<{ total_deliveries: number; successful: number; failed: number; pending: number; success_rate: number; endpoints_count: number; active_endpoints: number; last_30_days: number; last_7_days: number; top_events: Array<{ event: string | null; count: number }> }>(`/admin/users/${userId}/usage`, { token }),

  adminUserTestWebhook: (token: string, userId: string, data: { endpoint_url: string; event_type?: string; payload: Record<string, unknown> }) =>
    apiFetch<{ status_code: number; response_body: string; duration_ms: number }>(`/admin/users/${userId}/test-webhook`, { method: "POST", body: data, token }),

  adminUserReplayDelivery: (token: string, userId: string, deliveryId: string) =>
    apiFetch<{ message: string; original_id: string; new_delivery_id: string }>(`/admin/users/${userId}/webhooks/${deliveryId}/replay`, { method: "POST", token }),

  testWebhook: (token: string, data: { endpoint_url: string; event_type: string; payload: Record<string, unknown> }) =>
    apiFetch<{ status_code: number; response_body: string; duration_ms: number }>(`/admin/test-webhook`, { method: 'POST', body: data, token }),

  getChurn: (token: string) =>
    apiFetch<{ users: ChurnUser[] }>('/admin/churn', { token }),

  exportUsers: (_token: string, params?: { format?: string; plan?: string; status?: string; created_after?: string }) => {
    const searchParams = new URLSearchParams();
    searchParams.set('format', params?.format || 'csv');
    if (params?.plan) searchParams.set('plan', params.plan);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.created_after) searchParams.set('created_after', params.created_after);
    return `/admin/users/export?${searchParams.toString()}`;
  },

  exportRevenue: (_token: string, months?: number) => {
    const searchParams = new URLSearchParams();
    searchParams.set('format', 'csv');
    if (months) searchParams.set('months', months.toString());
    return `/admin/revenue/export?${searchParams.toString()}`;
  },

  getSettings: (token: string) =>
    apiFetch<PlatformSettings>('/admin/settings', { token }),

  updateSettings: (token: string, settings: PlatformSettings) =>
    apiFetch<{ message: string }>('/admin/settings', { method: 'PUT', body: settings, token }),

  listAlerts: (token: string) =>
    apiFetch<AlertRuleAdmin[]>('/admin/alerts', { token }),

  createAlert: (token: string, data: { name: string; condition: string; threshold: number; channels: string[] }) =>
    apiFetch<AlertRuleAdmin>('/admin/alerts', { method: 'POST', body: data, token }),

  updateAlert: (token: string, id: string, data: { name?: string; condition?: string; threshold?: number; channels?: string[]; is_active?: boolean }) =>
    apiFetch<AlertRuleAdmin>(`/admin/alerts/${id}`, { method: 'PUT', body: data, token }),

  deleteAlert: (token: string, id: string) =>
    apiFetch<{ deleted: boolean }>(`/admin/alerts/${id}`, { method: 'DELETE', token }),

  listFeatureFlags: (token: string) =>
    apiFetch<{ flags: FeatureFlag[] }>('/admin/feature-flags', { token }),

  createFeatureFlag: (token: string, data: { name: string; description?: string | null; is_enabled?: boolean; rollout_percentage?: number; enabled_for_plans?: string[] }) =>
    apiFetch<FeatureFlag>('/admin/feature-flags', { method: 'POST', body: data, token }),

  updateFeatureFlag: (token: string, id: string, data: { name?: string; description?: string | null; is_enabled?: boolean; rollout_percentage?: number; enabled_for_plans?: string[] }) =>
    apiFetch<FeatureFlag>(`/admin/feature-flags/${id}`, { method: 'PUT', body: data, token }),

  deleteFeatureFlag: (token: string, id: string) =>
    apiFetch<{ success: boolean }>(`/admin/feature-flags/${id}`, { method: 'DELETE', token }),

  getDeployInfo: (token: string) =>
    apiFetch<DeployInfo>('/admin/deploy-info', { token }),

  getSystemHealth: (token: string) =>
    apiFetch<Record<string, unknown>>('/health', { token }),

  getFailedDeliveries: (token: string, params?: { limit?: number; since?: string; user_id?: string }) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set('limit', params.limit.toString());
    if (params?.since) qs.set('since', params.since);
    if (params?.user_id) qs.set('user_id', params.user_id);
    return apiFetch<{ deliveries: Array<{ id: string; customer_id: string; endpoint_id: string; event_type: string | null; status: string; attempt_count: number; response_status: number | null; response_body: string | null; created_at: string; error_message: string | null; customer_email: string | null; endpoint_url: string | null }>; count: number }>(`/admin/deliveries/failed?${qs}`, { token });
  },

  getDeadLetters: (token: string, params?: { limit?: number; since?: string }) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set('limit', params.limit.toString());
    if (params?.since) qs.set('since', params.since);
    return apiFetch<{ dead_letters: Array<{ id: string; delivery_id: string; endpoint_id: string; customer_id: string; payload: unknown; reason: string | null; attempts: number; created_at: string; customer_email: string | null; endpoint_url: string | null }>; count: number }>(`/admin/deliveries/dead-letters?${qs}`, { token });
  },

  getQueueStatus: (token: string) =>
    apiFetch<{ pending: number; processing: number; failed: number; total: number; oldest_pending_at: string | null; failed_last_hour: number }>('/admin/queue/status', { token }),

  getRateLimitViolations: (token: string, params?: { limit?: number; since?: string }) => {
    const qs = new URLSearchParams();
    if (params?.limit) qs.set('limit', params.limit.toString());
    if (params?.since) qs.set('since', params.since);
    return apiFetch<{ violations: Array<{ id: string; customer_id: string | null; endpoint_id: string | null; ip: string | null; requests_count: number; limit_per_window: number; window_seconds: number; created_at: string; customer_email: string | null }>; count: number }>(`/admin/rate-limit-violations?${qs}`, { token });
  },

  getApiLatency: (token: string, params?: { period?: string }) => {
    const qs = new URLSearchParams();
    if (params?.period) qs.set('period', params.period);
    return apiFetch<{ endpoints: Array<{ endpoint_id: string; url: string; total_deliveries: number; avg_latency_ms: number | null; p95_latency_ms: number | null; failed_count: number; error_rate: number }>; period: string }>(`/admin/api-latency?${qs}`, { token });
  },

  addNote: (token: string, userId: string, content: string) =>
    apiFetch<{ note: { id: string; customer_id: string; admin_user_id: string; content: string; created_at: string }; message: string }>(`/admin/users/${userId}/notes`, { method: 'POST', body: { content }, token }),

  getNotes: (token: string, userId: string) =>
    apiFetch<{ notes: Array<{ id: string; customer_id: string; admin_user_id: string; content: string; created_at: string }>; total: number }>(`/admin/users/${userId}/notes`, { token }),

  addTag: (token: string, userId: string, tag: string) =>
    apiFetch<{ tag: string; added: boolean; message: string }>(`/admin/users/${userId}/tags`, { method: 'POST', body: { tag }, token }),

  removeTag: (token: string, userId: string, tag: string) =>
    apiFetch<{ tag: string; removed: boolean; message: string }>(`/admin/users/${userId}/tags/${tag}`, { method: 'DELETE', token }),

  getTags: (token: string, userId: string) =>
    apiFetch<{ tags: Array<{ id: string; customer_id: string; tag: string; admin_user_id: string; created_at: string }>; total: number }>(`/admin/users/${userId}/tags`, { token }),

  getCommunications: (token: string, userId: string, params?: { type?: string; page?: number; per_page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    const qs = searchParams.toString();
    return apiFetch<{ communications: Array<{ id: string; customer_id: string; type: string; subject: string | null; details: unknown; admin_user_id: string | null; created_at: string }>; total: number; page: number; per_page: number }>(`/admin/users/${userId}/communications${qs ? `?${qs}` : ''}`, { token });
  },

  getUserInvoices: (token: string, userId: string, params?: { page?: number; per_page?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    if (params?.status) searchParams.set('status', params.status);
    const qs = searchParams.toString();
    return apiFetch<{ invoices: Array<{ id: string; customer_id: string; amount_cents: number; currency: string; plan: string; status: string; provider: string; provider_invoice_id: string | null; paid_at: string | null; created_at: string }>; total: number; page: number; per_page: number }>(`/admin/users/${userId}/invoices${qs ? `?${qs}` : ''}`, { token });
  },

  getUserPayments: (token: string, userId: string, params?: { page?: number; per_page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    const qs = searchParams.toString();
    return apiFetch<{ payments: Array<{ id: string; customer_id: string; amount_cents: number; currency: string; status: string; provider: string; provider_transaction_id: string | null; metadata: unknown; created_at: string }>; total: number; page: number; per_page: number }>(`/admin/users/${userId}/payments${qs ? `?${qs}` : ''}`, { token });
  },

  getRevenueMetrics: (token: string) =>
    apiFetch<{ mrr: number; arr: number; arpu: number; ltv: number; nrr: number; expansion_revenue: number; total_customers: number; paying_customers: number; churn_rate: number; avg_months_retained: number }>('/admin/revenue/metrics', { token }),

  getRevenueCohorts: (token: string, months?: number) => {
    const qs = months ? `?months=${months}` : '';
    return apiFetch<{ cohorts: Array<{ cohort_month: string; customers_signed_up: number; customers_active: number; total_revenue_cents: number; retention_rate: number }>; months: number }>(`/admin/revenue/cohorts${qs}`, { token });
  },

  refundUser: (token: string, userId: string, amount_cents: number, reason: string, currency?: string) =>
    apiFetch<{ refund: { id: string; customer_id: string; email?: string; amount_cents: number; currency: string; reason: string | null; status: string; created_at: string }; message: string }>(`/admin/users/${userId}/refund`, { method: 'POST', body: { amount_cents, reason, ...(currency ? { currency } : {}) }, token }),

  getUserRefunds: (token: string, userId: string, params?: { page?: number; per_page?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    const qs = searchParams.toString();
    return apiFetch<{ refunds: Array<{ id: string; customer_id: string; email?: string; amount_cents: number; currency: string; reason: string | null; admin_user_id: string | null; provider: string; provider_refund_id: string | null; status: string; created_at: string }>; total: number; page: number; per_page: number }>(`/admin/users/${userId}/refunds${qs ? `?${qs}` : ''}`, { token });
  },

  getAllRefunds: (token: string, params?: { page?: number; per_page?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.per_page) searchParams.set('per_page', params.per_page.toString());
    if (params?.status) searchParams.set('status', params.status);
    const qs = searchParams.toString();
    return apiFetch<{ refunds: Array<{ id: string; customer_id: string; email?: string; amount_cents: number; currency: string; reason: string | null; admin_user_id: string | null; provider: string; provider_refund_id: string | null; status: string; created_at: string }>; total: number; page: number; per_page: number }>(`/admin/refunds${qs ? `?${qs}` : ''}`, { token });
  },

  exportUserData: (token: string, userId: string) =>
    apiFetch<{ export_date: string; account: { id: string; email: string; name: string | null; plan: string; is_active: boolean; email_verified: boolean; created_at: string }; endpoints: unknown[]; deliveries: unknown[]; invoices: unknown[]; notes: unknown[]; tags: unknown[]; communications: unknown[]; audit_logs: unknown[] }>(`/admin/users/${userId}/export`, { token }),

  deleteUserData: (token: string, userId: string, reason: string) =>
    apiFetch<{ message: string; deleted_at: string }>(`/admin/users/${userId}/data`, { method: 'DELETE', body: { confirm: true, reason }, token }),

  sendBulkEmail: (token: string, data: { subject: string; body: string; plan_filter?: string; status_filter?: string }) =>
    apiFetch<{ total_sent: number; total_failed: number; message: string }>(`/admin/bulk-email`, { method: 'POST', body: data, token }),

  listBroadcasts: (token: string, params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return apiFetch<BroadcastListResponse>(`/admin/broadcasts${qs ? `?${qs}` : ''}`, { token });
  },

  getBroadcast: (token: string, id: string) =>
    apiFetch<Broadcast>(`/admin/broadcasts/${id}`, { token }),

  createBroadcast: (token: string, data: Record<string, unknown>) =>
    apiFetch<Broadcast>(`/admin/broadcasts`, { method: 'POST', body: data, token }),

  updateBroadcast: (token: string, id: string, data: Record<string, unknown>) =>
    apiFetch<Broadcast>(`/admin/broadcasts/${id}`, { method: 'PUT', body: data, token }),

  deleteBroadcast: (token: string, id: string) =>
    apiFetch<{ deleted: boolean }>(`/admin/broadcasts/${id}`, { method: 'DELETE', token }),

  listSecurityEvents: (token: string, params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return apiFetch<{ events: SecurityEvent[]; total: number; page: number; per_page: number }>(`/admin/security/events${qs ? `?${qs}` : ''}`, { token });
  },

  getSecurityStats: (token: string) =>
    apiFetch<SecurityStats>('/admin/security/stats', { token }),

  resolveSecurityEvent: (token: string, id: string) =>
    apiFetch<{ resolved: boolean }>(`/admin/security/events/${id}/resolve`, { method: 'PUT', token }),

  resolveAllSecurityEvents: (token: string, data: { event_type?: string; severity?: string }) =>
    apiFetch<{ resolved_count: number }>('/admin/security/resolve-all', { method: 'POST', body: data, token }),

  listIpBlocklist: (token: string, params?: Record<string, string>) => {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return apiFetch<{ entries: IpBlockEntry[]; total: number; page: number; per_page: number }>(`/admin/security/blocklist${qs ? `?${qs}` : ''}`, { token });
  },

  blockIp: (token: string, data: { ip_address: string; reason?: string; expires_hours?: number }) =>
    apiFetch<IpBlockEntry>('/admin/security/blocklist', { method: 'POST', body: data, token }),

  unblockIp: (token: string, id: string) =>
    apiFetch<{ unblocked: boolean }>(`/admin/security/blocklist/${id}`, { method: 'DELETE', token }),

  checkIpBlocked: (token: string, ip: string) =>
    apiFetch<{ ip_address: string; is_blocked: boolean }>('/admin/security/blocklist/check', { method: 'POST', body: { ip_address: ip }, token }),
};
