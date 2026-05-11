/**
 * HookSniff SDK — Serialization Models
 *
 * Each model provides _toJsonObject() and _fromJsonObject() for
 * type-safe serialization/deserialization between SDK and API format.
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

function requireField(json: Record<string, unknown>, field: string, context = "response"): unknown {
  if (!(field in json) || json[field] === undefined) {
    throw new Error(`HookSniff: missing required field "${field}" in ${context}`);
  }
  return json[field];
}

function optionalString(json: Record<string, unknown> | undefined, field: string): string | null {
  if (!json) return null;
  const val = json[field];
  return val === null || val === undefined ? null : String(val);
}

function optionalNumber(json: Record<string, unknown> | undefined, field: string, defaultValue = 0): number {
  if (!json) return defaultValue;
  const val = json[field];
  if (val === null || val === undefined) return defaultValue;
  const num = Number(val);
  return Number.isNaN(num) ? defaultValue : num;
}

function optionalBoolean(json: Record<string, unknown> | undefined, field: string, defaultValue = false): boolean {
  if (!json) return defaultValue;
  const val = json[field];
  if (val === null || val === undefined) return defaultValue;
  return Boolean(val);
}

function toRecord(val: unknown): Record<string, unknown> | undefined {
  if (val === null || val === undefined) return undefined;
  if (typeof val === "object" && !Array.isArray(val)) return val as Record<string, unknown>;
  return undefined;
}

function validateRequired(obj: Record<string, unknown>, fields: string[], context: string): void {
  for (const field of fields) {
    if (obj[field] === undefined || obj[field] === null) {
      throw new Error(`HookSniff: required field "${field}" is missing in ${context}`);
    }
  }
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
    // If url is provided, validate as create (url is required for create)
    // If url is NOT provided, this is an update — only send provided fields
    if ("url" in obj) {
      validateRequired(obj as unknown as Record<string, unknown>, ["url"], "EndpointCreateInput");
    }
    const result: Record<string, unknown> = {};
    if (obj.url !== undefined) result.url = obj.url;
    if (obj.description !== undefined) result.description = obj.description;
    if (obj.rate_limit !== undefined) result.rate_limit = obj.rate_limit;
    if (obj.active !== undefined) result.active = obj.active;
    return result;
  }

  static _fromJsonObject(json: Record<string, unknown>): EndpointOutput {
    return {
      id: String(requireField(json, "id", "EndpointOutput")),
      url: String(requireField(json, "url", "EndpointOutput")),
      description: String(json.description ?? ""),
      rate_limit: optionalNumber(json, "rate_limit"),
      active: optionalBoolean(json, "active", true),
      created_at: String(json.created_at ?? ""),
      updated_at: String(json.updated_at ?? ""),
    };
  }
}

export class EndpointSecretModel {
  static _fromJsonObject(json: Record<string, unknown>): EndpointSecretOutput {
    return {
      key: String(requireField(json, "key", "EndpointSecretOutput")),
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
    validateRequired(
      obj as unknown as Record<string, unknown>,
      ["endpoint_id", "event", "data"],
      "WebhookSendInput"
    );
    return {
      endpoint_id: obj.endpoint_id,
      event: obj.event,
      data: obj.data,
    };
  }

  static _toBatchJsonObject(obj: WebhookBatchInput): Record<string, unknown> {
    validateRequired(
      obj as unknown as Record<string, unknown>,
      ["endpoint_id", "events"],
      "WebhookBatchInput"
    );
    return {
      endpoint_id: obj.endpoint_id,
      events: obj.events,
    };
  }
}

export class DeliveryModel {
  static _fromJsonObject(json: Record<string, unknown>): DeliveryOutput {
    return {
      id: String(requireField(json, "id", "DeliveryOutput")),
      endpoint_id: String(requireField(json, "endpoint_id", "DeliveryOutput")),
      event: String(requireField(json, "event", "DeliveryOutput")),
      status: optionalString(json, "status") ?? "unknown",
      response_code: optionalNumber(json, "response_code"),
      response_body: String(json.response_body ?? ""),
      created_at: String(json.created_at ?? ""),
      delivered_at: optionalString(json, "delivered_at"),
      attempt_count: optionalNumber(json, "attempt_count"),
    };
  }
}

export class DeliveryListModel {
  static _fromJsonObject(json: Record<string, unknown>): DeliveryListOutput {
    const rawData = json.data;
    const data: DeliveryOutput[] = Array.isArray(rawData)
      ? rawData.map((item) => {
          const record = toRecord(item);
          if (!record) {
            throw new Error(`HookSniff: expected object in delivery list, got ${typeof item}`);
          }
          return DeliveryModel._fromJsonObject(record);
        })
      : [];
    return {
      data,
      has_more: optionalBoolean(json, "has_more"),
    };
  }
}

export class BatchModel {
  static _fromJsonObject(json: Record<string, unknown>): BatchOutput {
    return {
      batch_id: String(requireField(json, "batch_id", "BatchOutput")),
      count: optionalNumber(json, "count"),
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
    validateRequired(
      obj as unknown as Record<string, unknown>,
      ["email", "password"],
      "RegisterInput"
    );
    return { email: obj.email, password: obj.password };
  }

  static _toLoginJsonObject(obj: LoginInput): Record<string, unknown> {
    validateRequired(
      obj as unknown as Record<string, unknown>,
      ["email", "password"],
      "LoginInput"
    );
    const result: Record<string, unknown> = { email: obj.email, password: obj.password };
    if (obj.totp_code !== undefined) result.totp_code = obj.totp_code;
    return result;
  }

  static _fromJsonObject(json: Record<string, unknown>): AuthOutput {
    return {
      token: String(requireField(json, "token", "AuthOutput")),
      user_id: String(requireField(json, "user_id", "AuthOutput")),
      email: String(requireField(json, "email", "AuthOutput")),
      plan: optionalString(json, "plan") ?? "free",
      is_admin: optionalBoolean(json, "is_admin"),
    };
  }

  static _from2faJsonObject(json: Record<string, unknown>): TwoFactorSetupOutput {
    return {
      secret: String(requireField(json, "secret", "TwoFactorSetupOutput")),
      qr_code_url: String(requireField(json, "qr_code_url", "TwoFactorSetupOutput")),
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
      total: optionalNumber(json, "total"),
      delivered: optionalNumber(json, "delivered"),
      failed: optionalNumber(json, "failed"),
    };
  }
}

export class TrendResponseModel {
  static _fromJsonObject(json: Record<string, unknown>): TrendResponse {
    const rawData = json.data;
    const data: TrendPoint[] = Array.isArray(rawData)
      ? rawData.map((item) => {
          const record = toRecord(item);
          if (!record) {
            throw new Error(`HookSniff: expected object in trend data, got ${typeof item}`);
          }
          return TrendPointModel._fromJsonObject(record);
        })
      : [];
    return { data };
  }
}

export class SuccessRateModel {
  static _fromJsonObject(json: Record<string, unknown>): SuccessRateResponse {
    return {
      rate: optionalNumber(json, "rate"),
      total: optionalNumber(json, "total"),
      delivered: optionalNumber(json, "delivered"),
      failed: optionalNumber(json, "failed"),
    };
  }
}

export class LatencyModel {
  static _fromJsonObject(json: Record<string, unknown>): LatencyResponse {
    return {
      p50: optionalNumber(json, "p50"),
      p95: optionalNumber(json, "p95"),
      p99: optionalNumber(json, "p99"),
      avg: optionalNumber(json, "avg"),
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
    validateRequired(
      obj as unknown as Record<string, unknown>,
      ["name"],
      "ApiKeyCreateInput"
    );
    const result: Record<string, unknown> = { name: obj.name };
    if (obj.expires_at !== undefined) result.expires_at = obj.expires_at;
    return result;
  }

  static _fromJsonObject(json: Record<string, unknown>): ApiKeyOutput {
    return {
      id: String(requireField(json, "id", "ApiKeyOutput")),
      name: String(requireField(json, "name", "ApiKeyOutput")),
      key: String(requireField(json, "key", "ApiKeyOutput")),
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
      id: String(requireField(json, "id", "AlertRule")),
      name: String(requireField(json, "name", "AlertRule")),
      condition: String(json.condition ?? ""),
      threshold: optionalNumber(json, "threshold"),
      enabled: optionalBoolean(json, "enabled", true),
      created_at: String(json.created_at ?? ""),
    };
  }
}

export class AlertNotificationModel {
  static _fromJsonObject(json: Record<string, unknown>): AlertNotification {
    return {
      id: String(requireField(json, "id", "AlertNotification")),
      rule_id: String(requireField(json, "rule_id", "AlertNotification")),
      message: String(json.message ?? ""),
      severity: optionalString(json, "severity") ?? "info",
      created_at: String(json.created_at ?? ""),
      read: optionalBoolean(json, "read"),
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
      plan: optionalString(json, "plan") ?? "free",
      webhooks_remaining: optionalNumber(json, "webhooks_remaining"),
      webhooks_used: optionalNumber(json, "webhooks_used"),
      endpoints_remaining: optionalNumber(json, "endpoints_remaining"),
      current_period_end: String(json.current_period_end ?? ""),
    };
  }
}

export class PortalModel {
  static _fromJsonObject(json: Record<string, unknown>): PortalOutput {
    return {
      url: String(requireField(json, "url", "PortalOutput")),
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
    const db = toRecord(json.db);
    const queue = toRecord(json.queue);
    const otel = toRecord(json.otel);

    return {
      status: optionalString(json, "status") ?? "unknown",
      db: {
        status: optionalString(db, "status") ?? "unknown",
        latency_ms: optionalNumber(db, "latency_ms"),
      },
      queue: {
        status: optionalString(queue, "status") ?? "unknown",
        latency_ms: optionalNumber(queue, "latency_ms"),
        pending: optionalNumber(queue, "pending"),
      },
      otel: otel
        ? {
            enabled: optionalBoolean(otel, "enabled"),
            endpoint: String(otel.endpoint ?? ""),
            headers_configured: optionalBoolean(otel, "headers_configured"),
          }
        : undefined,
      uptime_seconds: optionalNumber(json, "uptime_seconds"),
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
      id: String(requireField(json, "id", "SearchResult")),
      type: String(json.type ?? ""),
      data: json.data,
      score: optionalNumber(json, "score"),
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
      id: String(requireField(json, "id", "TeamMember")),
      email: String(requireField(json, "email", "TeamMember")),
      role: optionalString(json, "role") ?? "member",
      joined_at: String(json.joined_at ?? ""),
    };
  }
}
