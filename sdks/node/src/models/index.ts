/**
 * HookSniff SDK — Serialization Models
 *
 * Each model provides _toJsonObject() and _fromJsonObject() for
 * type-safe serialization/deserialization between SDK and API format.
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

function requireField(json: Record<string, unknown>, field: string): unknown {
  if (!(field in json) || json[field] === undefined) {
    throw new Error(`HookSniff: missing required field "${field}" in API response`);
  }
  return json[field];
}

function optionalString(json: Record<string, unknown>, field: string): string | null {
  const val = json[field];
  return val === null || val === undefined ? null : String(val);
}

function optionalNumber(json: Record<string, unknown>, field: string): number | null {
  const val = json[field];
  return val === null || val === undefined ? null : Number(val);
}

function optionalBoolean(json: Record<string, unknown>, field: string): boolean | null {
  const val = json[field];
  return val === null || val === undefined ? null : Boolean(val);
}

// ─── Endpoint ───────────────────────────────────────────────────────────────

export interface EndpointCreateInput {
  url: string;
  description?: string;
  rate_limit?: number;
  active?: boolean;
}

export interface EndpointUpdateInput {
  url?: string;
  description?: string;
  rate_limit?: number;
  active?: boolean;
}

export interface EndpointOutput {
  id: string;
  url: string;
  description: string;
  rate_limit: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EndpointSecretOutput {
  key: string;
}

export class EndpointModel {
  static _toJsonObject(obj: EndpointCreateInput | EndpointUpdateInput): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    if (obj.url !== undefined) result.url = obj.url;
    if (obj.description !== undefined) result.description = obj.description;
    if (obj.rate_limit !== undefined) result.rate_limit = obj.rate_limit;
    if (obj.active !== undefined) result.active = obj.active;
    return result;
  }

  static _fromJsonObject(json: Record<string, unknown>): EndpointOutput {
    return {
      id: String(requireField(json, "id")),
      url: String(requireField(json, "url")),
      description: String(json.description ?? ""),
      rate_limit: Number(json.rate_limit ?? 0),
      active: Boolean(json.active ?? true),
      created_at: String(json.created_at ?? ""),
      updated_at: String(json.updated_at ?? ""),
    };
  }
}

export class EndpointSecretModel {
  static _fromJsonObject(json: Record<string, unknown>): EndpointSecretOutput {
    return {
      key: String(requireField(json, "key")),
    };
  }
}

// ─── Webhook / Delivery ─────────────────────────────────────────────────────

export interface WebhookSendInput {
  endpoint_id: string;
  event: string;
  data: Record<string, unknown>;
}

export interface WebhookBatchInput {
  endpoint_id: string;
  events: Array<{ event: string; data: Record<string, unknown> }>;
}

export interface DeliveryOutput {
  id: string;
  endpoint_id: string;
  event: string;
  status: string;
  response_code: number;
  response_body: string;
  created_at: string;
  delivered_at: string | null;
  attempt_count: number;
}

export interface DeliveryListOutput {
  data: DeliveryOutput[];
  has_more: boolean;
}

export interface BatchOutput {
  batch_id: string;
  count: number;
}

export class WebhookModel {
  static _toJsonObject(obj: WebhookSendInput): Record<string, unknown> {
    return {
      endpoint_id: obj.endpoint_id,
      event: obj.event,
      data: obj.data,
    };
  }

  static _toBatchJsonObject(obj: WebhookBatchInput): Record<string, unknown> {
    return {
      endpoint_id: obj.endpoint_id,
      events: obj.events,
    };
  }
}

export class DeliveryModel {
  static _fromJsonObject(json: Record<string, unknown>): DeliveryOutput {
    return {
      id: String(requireField(json, "id")),
      endpoint_id: String(requireField(json, "endpoint_id")),
      event: String(requireField(json, "event")),
      status: String(json.status ?? "unknown"),
      response_code: Number(json.response_code ?? 0),
      response_body: String(json.response_body ?? ""),
      created_at: String(json.created_at ?? ""),
      delivered_at: optionalString(json, "delivered_at"),
      attempt_count: Number(json.attempt_count ?? 0),
    };
  }
}

export class DeliveryListModel {
  static _fromJsonObject(json: Record<string, unknown>): DeliveryListOutput {
    const rawData = json.data;
    const data = Array.isArray(rawData)
      ? rawData.map((item) =>
          typeof item === "object" && item !== null
            ? DeliveryModel._fromJsonObject(item as Record<string, unknown>)
            : item
        )
      : [];
    return {
      data,
      has_more: Boolean(json.has_more ?? false),
    };
  }
}

export class BatchModel {
  static _fromJsonObject(json: Record<string, unknown>): BatchOutput {
    return {
      batch_id: String(requireField(json, "batch_id")),
      count: Number(json.count ?? 0),
    };
  }
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface RegisterInput {
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
  totp_code?: string;
}

export interface AuthOutput {
  token: string;
  user_id: string;
  email: string;
  plan: string;
  is_admin: boolean;
}

export interface TwoFactorSetupOutput {
  secret: string;
  qr_code_url: string;
}

export class AuthModel {
  static _toRegisterJsonObject(obj: RegisterInput): Record<string, unknown> {
    return { email: obj.email, password: obj.password };
  }

  static _toLoginJsonObject(obj: LoginInput): Record<string, unknown> {
    const result: Record<string, unknown> = { email: obj.email, password: obj.password };
    if (obj.totp_code) result.totp_code = obj.totp_code;
    return result;
  }

  static _fromJsonObject(json: Record<string, unknown>): AuthOutput {
    return {
      token: String(requireField(json, "token")),
      user_id: String(requireField(json, "user_id")),
      email: String(requireField(json, "email")),
      plan: String(json.plan ?? "free"),
      is_admin: Boolean(json.is_admin ?? false),
    };
  }

  static _from2faJsonObject(json: Record<string, unknown>): TwoFactorSetupOutput {
    return {
      secret: String(requireField(json, "secret")),
      qr_code_url: String(requireField(json, "qr_code_url")),
    };
  }
}

// ─── Analytics ──────────────────────────────────────────────────────────────

export interface TrendPoint {
  date: string;
  total: number;
  delivered: number;
  failed: number;
}

export interface TrendResponse {
  data: TrendPoint[];
}

export interface SuccessRateResponse {
  rate: number;
  total: number;
  delivered: number;
  failed: number;
}

export interface LatencyResponse {
  p50: number;
  p95: number;
  p99: number;
  avg: number;
}

export class TrendPointModel {
  static _fromJsonObject(json: Record<string, unknown>): TrendPoint {
    return {
      date: String(json.date ?? ""),
      total: Number(json.total ?? 0),
      delivered: Number(json.delivered ?? 0),
      failed: Number(json.failed ?? 0),
    };
  }
}

export class TrendResponseModel {
  static _fromJsonObject(json: Record<string, unknown>): TrendResponse {
    const rawData = json.data;
    const data = Array.isArray(rawData)
      ? rawData.map((item) =>
          typeof item === "object" && item !== null
            ? TrendPointModel._fromJsonObject(item as Record<string, unknown>)
            : item
        )
      : [];
    return { data };
  }
}

export class SuccessRateModel {
  static _fromJsonObject(json: Record<string, unknown>): SuccessRateResponse {
    return {
      rate: Number(json.rate ?? 0),
      total: Number(json.total ?? 0),
      delivered: Number(json.delivered ?? 0),
      failed: Number(json.failed ?? 0),
    };
  }
}

export class LatencyModel {
  static _fromJsonObject(json: Record<string, unknown>): LatencyResponse {
    return {
      p50: Number(json.p50 ?? 0),
      p95: Number(json.p95 ?? 0),
      p99: Number(json.p99 ?? 0),
      avg: Number(json.avg ?? 0),
    };
  }
}

// ─── API Keys ───────────────────────────────────────────────────────────────

export interface ApiKeyCreateInput {
  name: string;
  expires_at?: string;
}

export interface ApiKeyOutput {
  id: string;
  name: string;
  key: string;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
}

export class ApiKeyModel {
  static _toJsonObject(obj: ApiKeyCreateInput): Record<string, unknown> {
    const result: Record<string, unknown> = { name: obj.name };
    if (obj.expires_at) result.expires_at = obj.expires_at;
    return result;
  }

  static _fromJsonObject(json: Record<string, unknown>): ApiKeyOutput {
    return {
      id: String(requireField(json, "id")),
      name: String(requireField(json, "name")),
      key: String(requireField(json, "key")),
      created_at: String(json.created_at ?? ""),
      expires_at: optionalString(json, "expires_at"),
      last_used_at: optionalString(json, "last_used_at"),
    };
  }
}

// ─── Alerts ─────────────────────────────────────────────────────────────────

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  created_at: string;
}

export interface AlertNotification {
  id: string;
  rule_id: string;
  message: string;
  severity: string;
  created_at: string;
  read: boolean;
}

export class AlertRuleModel {
  static _fromJsonObject(json: Record<string, unknown>): AlertRule {
    return {
      id: String(requireField(json, "id")),
      name: String(requireField(json, "name")),
      condition: String(json.condition ?? ""),
      threshold: Number(json.threshold ?? 0),
      enabled: Boolean(json.enabled ?? true),
      created_at: String(json.created_at ?? ""),
    };
  }
}

export class AlertNotificationModel {
  static _fromJsonObject(json: Record<string, unknown>): AlertNotification {
    return {
      id: String(requireField(json, "id")),
      rule_id: String(requireField(json, "rule_id")),
      message: String(json.message ?? ""),
      severity: String(json.severity ?? "info"),
      created_at: String(json.created_at ?? ""),
      read: Boolean(json.read ?? false),
    };
  }
}

// ─── Billing ────────────────────────────────────────────────────────────────

export interface PlanInfo {
  plan: string;
  webhooks_remaining: number;
  webhooks_used: number;
  endpoints_remaining: number;
  current_period_end: string;
}

export interface PortalOutput {
  url: string;
}

export class PlanInfoModel {
  static _fromJsonObject(json: Record<string, unknown>): PlanInfo {
    return {
      plan: String(json.plan ?? "free"),
      webhooks_remaining: Number(json.webhooks_remaining ?? 0),
      webhooks_used: Number(json.webhooks_used ?? 0),
      endpoints_remaining: Number(json.endpoints_remaining ?? 0),
      current_period_end: String(json.current_period_end ?? ""),
    };
  }
}

export class PortalModel {
  static _fromJsonObject(json: Record<string, unknown>): PortalOutput {
    return {
      url: String(requireField(json, "url")),
    };
  }
}

// ─── Health ─────────────────────────────────────────────────────────────────

export interface HealthOutput {
  status: string;
  db: { status: string; latency_ms: number };
  queue: { status: string; latency_ms: number; pending: number };
  otel?: { enabled: boolean; endpoint: string; headers_configured: boolean };
  uptime_seconds: number;
}

export class HealthModel {
  static _fromJsonObject(json: Record<string, unknown>): HealthOutput {
    const db = json.db as Record<string, unknown> | undefined;
    const queue = json.queue as Record<string, unknown> | undefined;
    const otel = json.otel as Record<string, unknown> | undefined;

    return {
      status: String(json.status ?? "unknown"),
      db: {
        status: String(db?.status ?? "unknown"),
        latency_ms: Number(db?.latency_ms ?? 0),
      },
      queue: {
        status: String(queue?.status ?? "unknown"),
        latency_ms: Number(queue?.latency_ms ?? 0),
        pending: Number(queue?.pending ?? 0),
      },
      otel: otel
        ? {
            enabled: Boolean(otel.enabled ?? false),
            endpoint: String(otel.endpoint ?? ""),
            headers_configured: Boolean(otel.headers_configured ?? false),
          }
        : undefined,
      uptime_seconds: Number(json.uptime_seconds ?? 0),
    };
  }
}

// ─── Search ─────────────────────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  type: string;
  data: unknown;
  score: number;
}

export class SearchModel {
  static _fromJsonObject(json: Record<string, unknown>): SearchResult {
    return {
      id: String(requireField(json, "id")),
      type: String(json.type ?? ""),
      data: json.data,
      score: Number(json.score ?? 0),
    };
  }
}

// ─── Teams ──────────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  email: string;
  role: string;
  joined_at: string;
}

export class TeamMemberModel {
  static _fromJsonObject(json: Record<string, unknown>): TeamMember {
    return {
      id: String(requireField(json, "id")),
      email: String(requireField(json, "email")),
      role: String(json.role ?? "member"),
      joined_at: String(json.joined_at ?? ""),
    };
  }
}
