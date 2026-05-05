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

// --- AI Center Types ---

export interface AiStatus {
  activeEvents: number;
  criticalEvents: number;
  pendingActions: number;
  blockedItems: number;
  avgRiskScore: number;
  highRiskEndpoints: number;
}

export interface AiEvent {
  id: string;
  eventType: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description?: string;
  actionTaken?: string;
  targetType?: string;
  targetId?: string;
  resolved: boolean;
  createdAt: string;
}

export interface RiskScore {
  id: string;
  targetType: string;
  targetId: string;
  score: number;
  factors?: Record<string, number>;
  createdAt: string;
}

export interface AiAction {
  id: string;
  actionType: string;
  description: string;
  targetType?: string;
  targetId?: string;
  status: "pending" | "approved" | "executed" | "rejected" | "rolled_back";
  riskLevel: "low" | "medium" | "high" | "critical";
  autoApproved: boolean;
  executedAt?: string;
  createdAt: string;
}

export interface AiProvider {
  name: string;
  enabled: boolean;
  capabilities: string[];
  apiKeyEnv: string;
  docs: string;
}
