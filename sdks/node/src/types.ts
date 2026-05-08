export interface HookSniffConfig {
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

export interface SearchOptions {
  query?: string;
  event?: string;
  status?: string;
  endpointId?: string;
  page?: number;
  perPage?: number;
}

export interface SearchResult {
  results: Delivery[];
  total: number;
  page: number;
  perPage: number;
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

export interface WebhookPayload<T = Record<string, unknown>> {
  event: string;
  data: T;
  timestamp?: string;
  id?: string;
}

// Common event payload types
export interface OrderCreatedPayload {
  order_id: string;
  customer: {
    id: string;
    email: string;
    name: string;
  };
  items: Array<{
    sku: string;
    name: string;
    quantity: number;
    unit_price: number;
  }>;
  total: number;
  currency: string;
  shipping_method: string;
  created_at: string;
}

export interface OrderCompletedPayload {
  order_id: string;
  status: string;
  completed_at: string;
  total_charged: number;
  payment_method: string;
}

export interface PaymentFailedPayload {
  payment_id: string;
  order_id: string;
  amount: number;
  currency: string;
  error: {
    code: string;
    message: string;
    decline_code?: string;
  };
  customer_id: string;
  attempted_at: string;
}

export interface PaymentSucceededPayload {
  payment_id: string;
  amount: number;
  currency: string;
  method: string;
  card_brand: string;
  card_last4: string;
  receipt_url?: string;
  paid_at: string;
}

export interface UserRegisteredPayload {
  user_id: string;
  email: string;
  name: string;
  plan: string;
  registered_at: string;
  source: string;
}

export interface UserUpdatedPayload {
  user_id: string;
  changes: Record<string, { old: unknown; new: unknown }>;
  updated_at: string;
}

export interface InvoiceCreatedPayload {
  invoice_id: string;
  customer_id: string;
  amount_due: number;
  currency: string;
  period_start: string;
  period_end: string;
  status: string;
}

// --- Webhook Handler Types ---

export interface WebhookHandlerOptions {
  /** The signing secret to verify incoming webhooks */
  secret: string;
  /** Custom event handlers keyed by event name */
  handlers?: Record<string, (payload: WebhookPayload) => void | Promise<void>>;
  /** Called for events with no specific handler */
  onEvent?: (payload: WebhookPayload) => void | Promise<void>;
  /** Tolerance for timestamp-based signature verification (seconds) */
  tolerance?: number;
  /** Custom header name for the signature */
  signatureHeader?: string;
}

export interface WebhookVerificationResult {
  valid: boolean;
  payload?: WebhookPayload;
  error?: string;
}
