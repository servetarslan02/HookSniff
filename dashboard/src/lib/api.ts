// In production, "/api" is rewritten by Vercel to the GCP Cloud Run API (see vercel.json).
// In development, point directly to the local API server.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? "/api" : "http://localhost:3000/v1");

const REQUEST_TIMEOUT_MS = 30_000;

export interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, token, signal } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  // If caller provided an external signal, forward its abort
  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: "Unknown error" }));
      throw new Error(error.error?.message || `API error: ${res.status}`);
    }

    return res.json();
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

// Endpoint API
export interface RetryPolicyConfig {
  max_attempts: number;
  backoff: 'exponential' | 'linear' | 'fixed';
  initial_delay_secs: number;
  max_delay_secs: number;
}

export const endpointsApi = {
  list: (token: string) =>
    apiFetch<Endpoint[]>("/endpoints", { token }),

  create: (token: string, data: { url: string; description?: string }) =>
    apiFetch<Endpoint>("/endpoints", { method: "POST", body: data, token }),

  update: (token: string, id: string, data: Partial<Endpoint> & { retry_policy?: RetryPolicyConfig }) =>
    apiFetch<Endpoint>(`/endpoints/${id}`, { method: "PUT", body: data, token }),

  updateRetryPolicy: (token: string, id: string, policy: RetryPolicyConfig) =>
    apiFetch<Endpoint>(`/endpoints/${id}/retry-policy`, { method: "PUT", body: policy, token }),

  delete: (token: string, id: string) =>
    apiFetch<{ deleted: boolean }>(`/endpoints/${id}`, { method: "DELETE", token }),
};

// Webhook API
export const webhooksApi = {
  list: (token: string, params?: { page?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.status) searchParams.set("status", params.status);
    const qs = searchParams.toString();
    return apiFetch<DeliveryListResponse>(`/webhooks${qs ? `?${qs}` : ""}`, { token });
  },

  create: (token: string, data: { endpoint_id: string; event?: string; data: unknown }) =>
    apiFetch<Delivery>("/webhooks", { method: "POST", body: data, token }),

  get: (token: string, id: string) =>
    apiFetch<DeliveryDetail>(`/webhooks/${id}`, { token }),

  getAttempts: (token: string, id: string) =>
    apiFetch<DeliveryAttempt[]>(`/webhooks/${id}/attempts`, { token }),

  replay: (token: string, id: string) =>
    apiFetch<Delivery>(`/webhooks/${id}/replay`, { method: 'POST', token }),

  batch: (token: string, data: { webhooks: Array<{ endpoint_id: string; event?: string; data: unknown }> }) =>
    apiFetch<{ deliveries: Delivery[] }>('/webhooks/batch', { method: 'POST', body: data, token }),
};

// Stats API
export const statsApi = {
  get: (token: string) =>
    apiFetch<StatsResponse>("/stats", { token }),
};

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ token: string; user: { id: string; email: string; name?: string; plan: string }; api_key: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
  register: (email: string, password: string, name?: string) =>
    apiFetch<{ token: string; user: { id: string; email: string; name?: string; plan: string }; api_key: string }>('/auth/register', {
      method: 'POST',
      body: { email, password, name },
    }),
};

// Generic API client (axios-style wrapper — returns { data } for compatibility)
export const api = {
  get: async <T = unknown>(path: string, token?: string) => ({ data: await apiFetch<T>(path, { token }) }),
  post: async <T = unknown>(path: string, body?: unknown, token?: string) => ({ data: await apiFetch<T>(path, { method: 'POST', body, token }) }),
  put: async <T = unknown>(path: string, body?: unknown, token?: string) => ({ data: await apiFetch<T>(path, { method: 'PUT', body, token }) }),
  delete: async <T = unknown>(path: string, token?: string) => ({ data: await apiFetch<T>(path, { method: 'DELETE', token }) }),
};

// Types
export interface Endpoint {
  id: string;
  url: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  routing_strategy?: string;
  fallback_url?: string;
  avg_response_ms?: number;
  failure_streak?: number;
  retry_policy?: RetryPolicyConfig;
  signing_secret?: string;
  event_filter?: string[];
  custom_headers?: Record<string, string>;
}

export interface Delivery {
  id: string;
  endpoint_id: string;
  event?: string;
  status: "pending" | "delivered" | "failed";
  attempt_count: number;
  response_status?: number;
  created_at: string;
}

export interface DeliveryDetail extends Delivery {
  request_headers?: Record<string, string>;
  request_body?: string | Record<string, unknown>;
  endpoint_url?: string;
  updated_at?: string;
  error_message?: string;
}

export interface DeliveryAttempt {
  id: string;
  delivery_id: string;
  attempt_number: number;
  status: 'delivered' | 'failed';
  response_status?: number;
  response_headers?: Record<string, string>;
  response_body?: string;
  error_message?: string;
  duration_ms?: number;
  created_at: string;
}

export interface DeliveryListResponse {
  deliveries: Delivery[];
  total: number;
  page: number;
  per_page: number;
}

export interface StatsResponse {
  total_deliveries: number;
  delivered: number;
  failed: number;
  pending: number;
  success_rate: number;
  endpoints_count: number;
}

// Admin types
export interface AdminStatsResponse {
  total_users: number;
  total_deliveries: number;
  total_revenue: number;
  active_users_today: number;
  users_by_plan: { plan: string; count: number }[];
  recent_signups: { id: string; email: string; name?: string; plan: string; created_at: string }[];
}

export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  page: number;
  per_page: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name?: string;
  plan: string;
  status: 'active' | 'banned';
  created_at: string;
}

export interface AdminUserDetail {
  user: AdminUser;
  endpoints: { id: string; url: string; is_active: boolean; created_at: string }[];
  recent_deliveries: Delivery[];
  usage_stats: { total_deliveries: number; success_rate: number; endpoints_count: number };
}

export interface RevenueResponse {
  monthly_revenue: { month: string; revenue: number }[];
  revenue_by_plan: { plan: string; revenue: number; count: number }[];
  mrr: number;
  churn_rate: number;
}

// Team types
export interface Team {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  member_count?: number;
}

export interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  name?: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'webhook_failed' | 'alert' | 'system' | 'billing';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  link?: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  page: number;
  per_page: number;
}

// Analytics types
export interface TimeBucket {
  timestamp: string;
  successful: number;
  failed: number;
  total: number;
}

export interface DeliveryTrendResponse {
  range: string;
  buckets: TimeBucket[];
}

export interface SuccessRateData {
  range: string;
  successful: number;
  failed: number;
  pending: number;
  success_rate: number;
}

export interface LatencyBucket {
  timestamp: string;
  avg_ms: number;
  p95_ms: number;
}

export interface LatencyTrendResponse {
  range: string;
  buckets: LatencyBucket[];
  overall_avg_ms: number;
}

// Admin API
export const adminApi = {
  getStats: (token: string) =>
    apiFetch<AdminStatsResponse>('/admin/stats', { token }),

  listUsers: (token: string, params?: { page?: number; search?: string; plan?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.plan) searchParams.set('plan', params.plan);
    if (params?.status) searchParams.set('status', params.status);
    const qs = searchParams.toString();
    return apiFetch<AdminUsersResponse>(`/admin/users${qs ? `?${qs}` : ''}`, { token });
  },

  getUserDetail: (token: string, id: string) =>
    apiFetch<AdminUserDetail>(`/admin/users/${id}`, { token }),

  updateUserPlan: (token: string, id: string, plan: string) =>
    apiFetch<{ success: boolean }>(`/admin/users/${id}/plan`, { method: 'PUT', body: { plan }, token }),

  updateUserStatus: (token: string, id: string, status: 'active' | 'banned') =>
    apiFetch<{ success: boolean }>(`/admin/users/${id}/status`, { method: 'PUT', body: { is_active: status === 'active' }, token }),

  getRevenue: (token: string) =>
    apiFetch<RevenueResponse>('/admin/revenue', { token }),
};

// Team API
export const teamsApi = {
  list: (token: string) =>
    apiFetch<Team[]>('/teams', { token }),

  create: (token: string, data: { name: string; description?: string }) =>
    apiFetch<Team>('/teams', { method: 'POST', body: data, token }),

  get: (token: string, id: string) =>
    apiFetch<Team>(`/teams/${id}`, { token }),

  listMembers: (token: string, teamId: string) =>
    apiFetch<TeamMember[]>(`/teams/${teamId}/members`, { token }),

  inviteMember: (token: string, teamId: string, data: { email: string; role: string }) =>
    apiFetch<{ success: boolean }>(`/teams/${teamId}/members`, { method: 'POST', body: data, token }),

  removeMember: (token: string, teamId: string, memberId: string) =>
    apiFetch<{ success: boolean }>(`/teams/${teamId}/members/${memberId}`, { method: 'DELETE', token }),

  updateRole: (token: string, teamId: string, memberId: string, role: string) =>
    apiFetch<{ success: boolean }>(`/teams/${teamId}/members/${memberId}/role`, { method: 'PUT', body: { role }, token }),
};

// Notification API
export const notificationsApi = {
  list: (token: string, params?: { page?: number; type?: string; read?: boolean }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.type) searchParams.set('type', params.type);
    if (params?.read !== undefined) searchParams.set('read', params.read.toString());
    const qs = searchParams.toString();
    return apiFetch<NotificationListResponse>(`/notifications${qs ? `?${qs}` : ''}`, { token });
  },

  getUnreadCount: (token: string) =>
    apiFetch<{ count: number }>('/notifications/unread-count', { token }),

  markAsRead: (token: string, id: string) =>
    apiFetch<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT', token }),

  markAllAsRead: (token: string) =>
    apiFetch<{ success: boolean }>('/notifications/read-all', { method: 'PUT', token }),

  deleteNotification: (token: string, id: string) =>
    apiFetch<{ success: boolean }>(`/notifications/${id}`, { method: 'DELETE', token }),
};

// Billing types
export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
}

// Billing API
export const billingApi = {
  getInvoices: (token: string) =>
    apiFetch<Invoice[]>('/billing/invoices', { token }),
};

// Alert types
export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  channels: string[];
  is_active: boolean;
  created_at: string;
}

// Alert API
export const alertsApi = {
  list: (token?: string) =>
    apiFetch<AlertRule[]>('/alerts', { token }),

  create: (token: string | undefined, data: { name: string; condition: string; threshold: number; channels: string[] }) =>
    apiFetch<AlertRule>('/alerts', { method: 'POST', body: data, token }),

  delete: (token: string | undefined, id: string) =>
    apiFetch<{ success: boolean }>(`/alerts/${id}`, { method: 'DELETE', token }),

  test: (token: string | undefined, id: string) =>
    apiFetch<{ success: boolean }>(`/alerts/${id}/test`, { method: 'POST', token }),
};

// Inbound types
export interface InboundConfig {
  id: string;
  provider: string;
  endpoint_id: string | null;
  enabled: boolean;
  secret: string;
  created_at: string;
}

// Inbound API
export const inboundApi = {
  listConfigs: (token?: string) =>
    apiFetch<InboundConfig[]>('/inbound/configs', { token }),

  createConfig: (token: string | undefined, data: { provider: string; endpoint_id?: string | null; secret: string }) =>
    apiFetch<InboundConfig>('/inbound/configs', { method: 'POST', body: data, token }),
};

// Transform types
export interface TransformRule {
  id: string;
  endpoint_id: string;
  rule_json: {
    filter?: { include?: string[]; exclude?: string[] };
    mappings?: { source: string; target: string }[];
    enrich?: { fields: Record<string, unknown> };
  };
  created_at: string;
}

// Transform API
export const transformsApi = {
  list: (token: string, endpointId: string) =>
    apiFetch<TransformRule[]>(`/endpoints/${endpointId}/transforms`, { token }),

  create: (token: string, endpointId: string, data: { rule: TransformRule['rule_json'] }) =>
    apiFetch<TransformRule>(`/endpoints/${endpointId}/transforms`, { method: 'POST', body: data, token }),

  delete: (token: string, endpointId: string, ruleId: string) =>
    apiFetch<{ success: boolean }>(`/endpoints/${endpointId}/transforms/${ruleId}`, { method: 'DELETE', token }),
};

// Billing usage types
export interface BillingUsage {
  deliveries_used: number;
  deliveries_limit: number;
  endpoints_count: number;
  endpoints_limit: number;
}

export interface BillingSubscription {
  plan: string;
  status: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
}

// Extended Billing API
export const billingApiExtended = {
  getInvoices: (token: string) =>
    apiFetch<Invoice[]>('/billing/invoices', { token }),

  getUsage: (token?: string) =>
    apiFetch<BillingUsage>('/billing/usage', { token }),

  getSubscription: (token?: string) =>
    apiFetch<BillingSubscription>('/billing/subscription', { token }),

  upgrade: (token: string, plan: string) =>
    apiFetch<{ success: boolean; checkout_url?: string }>('/billing/upgrade', { method: 'POST', body: { plan }, token }),
};

// Analytics API
export const analyticsApi = {
  deliveryTrend: (token: string, range: string = '24h') =>
    apiFetch<DeliveryTrendResponse>(`/analytics/deliveries?range=${range}`, { token }),

  successRate: (token: string, range: string = '24h') =>
    apiFetch<SuccessRateData>(`/analytics/success-rate?range=${range}`, { token }),

  latencyTrend: (token: string, range: string = '24h') =>
    apiFetch<LatencyTrendResponse>(`/analytics/latency?range=${range}`, { token }),
};
