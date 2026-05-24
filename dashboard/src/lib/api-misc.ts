// 2FA, SSO, transforms, billing extended, analytics API clients

import { apiFetch } from './api';
import type { TransformRule, BillingUsage, BillingSubscription, Invoice, PortalResponse, RefundResponse, OverageSettings, DeliveryTrendResponse, SuccessRateData, LatencyTrendResponse } from './api-types';

export const twoFactorApi = {
  enable: (token: string) =>
    apiFetch<{ secret: string; qr_code: string; otpauth_url?: string; backup_codes: string[] }>('/auth/2fa/enable', { method: 'POST', token }),

  confirm: (token: string, code: string) =>
    apiFetch<{ success: boolean; backup_codes: string[] }>('/auth/2fa/confirm', { method: 'POST', body: { code }, token }),

  verify: (tempToken: string, code: string, backupCode?: string) =>
    apiFetch<{ token: string; customer: { id: string; email: string; name?: string; plan: string; is_admin?: boolean; api_key?: string; avatar_url?: string }; refresh_token?: string }>('/auth/2fa/verify', {
      method: 'POST',
      body: backupCode ? { temp_token: tempToken, backup_code: backupCode } : { temp_token: tempToken, code },
    }),

  disable: (token: string, password: string) =>
    apiFetch<{ success: boolean }>('/auth/2fa/disable', { method: 'POST', body: { password }, token }),

  getStatus: (token: string) =>
    apiFetch<{ enabled: boolean; last_used_at?: string }>('/auth/2fa/status', { token }),
};

export const ssoApi = {
  testSso: (token: string, teamId?: string) =>
    apiFetch<{ valid: boolean; provider?: string; message?: string; issues?: string[]; details?: Record<string, Record<string, unknown>> }>(`/sso/test${teamId ? `?team_id=${teamId}` : ''}`, { method: 'POST', token }),
  deleteSso: (token: string, teamId?: string) =>
    apiFetch<{ deleted: boolean }>(`/sso/config${teamId ? `?team_id=${teamId}` : ''}`, { method: 'DELETE', token }),
  getLoginUrl: (email: string) =>
    `/v1/sso/login?email=${encodeURIComponent(email)}`,
};

export const transformsApi = {
  list: (token: string, endpointId: string) =>
    apiFetch<TransformRule[]>(`/endpoints/${endpointId}/transforms`, { token }),

  create: (token: string, endpointId: string, data: { rule: TransformRule['rule_json'] }) =>
    apiFetch<TransformRule>(`/endpoints/${endpointId}/transforms`, { method: 'POST', body: data, token }),

  update: (token: string, endpointId: string, ruleId: string, data: { rule: TransformRule['rule_json'] }) =>
    apiFetch<TransformRule>(`/endpoints/${endpointId}/transforms/${ruleId}`, { method: 'PUT', body: data, token }),

  delete: (token: string, endpointId: string, ruleId: string) =>
    apiFetch<{ success: boolean }>(`/endpoints/${endpointId}/transforms/${ruleId}`, { method: 'DELETE', token }),

  test: (token: string, endpointId: string, data: { payload: unknown; config: TransformRule['rule_json'] }) =>
    apiFetch<Record<string, unknown>>(`/endpoints/${endpointId}/transforms/test`, { method: 'POST', body: data, token }),
};

export const billingApiExtended = {
  getUsage: (token?: string) =>
    apiFetch<BillingUsage>('/billing/usage', { token }),

  getSubscription: (token?: string) =>
    apiFetch<BillingSubscription>('/billing/subscription', { token }),

  upgrade: (token: string, plan: string, billingPeriod?: string, discountCode?: string) =>
    apiFetch<{ checkout_url?: string; message?: string; requires_contact?: boolean; contact_url?: string; prorated_amount_cents?: number }>('/billing/upgrade', { method: 'POST', body: { plan, billing_period: billingPeriod || 'monthly', ...(discountCode ? { discount_code: discountCode } : {}) }, token }),

  getInvoices: (token: string) =>
    apiFetch<Invoice[]>('/billing/invoices', { token }),

  openPortal: (token: string) =>
    apiFetch<PortalResponse>('/billing/portal', { method: 'POST', token }),

  requestRefund: (token: string, reason: string) =>
    apiFetch<RefundResponse>('/billing/refund', { method: 'POST', body: { reason }, token }),

  pause: (token: string, days?: number) =>
    apiFetch<{ message?: string; paused_until?: string; plan_preserved?: string; keeps_access_until_period_end?: boolean }>('/billing/pause', { method: 'POST', body: { days: days || 30 }, token }),

  resume: (token: string) =>
    apiFetch<{ message?: string; checkout_url?: string; plan?: string }>('/billing/resume', { method: 'POST', token }),

  getOverageSettings: (token?: string) =>
    apiFetch<OverageSettings>('/billing/settings', { token }),

  updateOverageSettings: (token: string, data: { allow_overage?: boolean; overage_email_notification?: boolean }) =>
    apiFetch<OverageSettings>('/billing/settings', { method: 'PUT', body: data, token }),
};

export const analyticsApi = {
  deliveryTrend: (token: string, range: string = '24h') =>
    apiFetch<DeliveryTrendResponse>(`/analytics/deliveries?range=${range}`, { token }),

  successRate: (token: string, range: string = '24h') =>
    apiFetch<SuccessRateData>(`/analytics/success-rate?range=${range}`, { token }),

  latencyTrend: (token: string, range: string = '24h') =>
    apiFetch<LatencyTrendResponse>(`/analytics/latency?range=${range}`, { token }),
};
