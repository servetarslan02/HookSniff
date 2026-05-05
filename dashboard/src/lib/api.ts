const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/v1";

export interface ApiOptions {
  method?: string;
  body?: unknown;
  token?: string;
}

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(error.error?.message || `API error: ${res.status}`);
  }

  return res.json();
}

// Endpoint API
export const endpointsApi = {
  list: (token: string) =>
    apiFetch<Endpoint[]>("/endpoints", { token }),

  create: (token: string, data: { url: string; description?: string }) =>
    apiFetch<Endpoint>("/endpoints", { method: "POST", body: data, token }),

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
    apiFetch<Delivery>(`/webhooks/${id}`, { token }),

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

// Types
export interface Endpoint {
  id: string;
  url: string;
  description?: string;
  is_active: boolean;
  created_at: string;
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
