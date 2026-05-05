export interface HookRelayConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface RetryPolicy {
  maxAttempts?: number;
  backoff?: "exponential" | "linear" | "fixed";
  initialDelaySecs?: number;
  maxDelaySecs?: number;
}

export interface Endpoint {
  id: string;
  url: string;
  description?: string;
  isActive: boolean;
  retryPolicy?: RetryPolicy;
  createdAt: string;
}

export interface CreateEndpointRequest {
  url: string;
  description?: string;
  retryPolicy?: RetryPolicy;
}

export interface Delivery {
  id: string;
  endpointId: string;
  event?: string;
  status: "pending" | "delivered" | "failed";
  attemptCount: number;
  responseStatus?: number;
  replayCount: number;
  createdAt: string;
}

export interface SendWebhookRequest {
  endpointId: string;
  event?: string;
  data: Record<string, unknown>;
}

export interface DeliveryList {
  deliveries: Delivery[];
  total: number;
  page: number;
  perPage: number;
}

export interface BatchWebhookRequest {
  webhooks: SendWebhookRequest[];
}

export interface BatchResult {
  deliveries: Delivery[];
  errors: BatchError[];
}

export interface BatchError {
  index: number;
  error: string;
}

export interface DeliveryAttempt {
  id: string;
  attemptNumber: number;
  statusCode?: number;
  responseBody?: string;
  durationMs?: number;
  errorMessage?: string;
  createdAt: string;
}

export interface ExportOptions {
  format?: "json" | "csv";
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface Stats {
  totalDeliveries: number;
  delivered: number;
  failed: number;
  pending: number;
  successRate: number;
  endpointsCount: number;
}

export interface Customer {
  id: string;
  email: string;
  apiKey?: string;
  plan: string;
  webhookLimit: number;
  webhookCount: number;
  createdAt: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
