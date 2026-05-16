import { z } from 'zod';

// ── Endpoint Schema ──
export const EndpointSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  description: z.string().nullish(),
  is_active: z.boolean(),
  created_at: z.string(),
  routing_strategy: z.string().nullish(),
  fallback_url: z.string().nullish(),
  avg_response_ms: z.number().nullish(),
  failure_streak: z.number().nullish(),
  retry_policy: z
    .object({
      max_attempts: z.number(),
      backoff: z.string(),
      initial_delay_secs: z.number(),
      max_delay_secs: z.number(),
    })
    .nullish(),
  signing_secret: z.string().nullish(),
  allowed_ips: z.array(z.string()).nullish(),
  event_filter: z.array(z.string()).nullish(),
  custom_headers: z.record(z.string(), z.string()).nullish(),
  application_id: z.string().nullish(),
  format: z.string().nullish(),
});
export type EndpointValidated = z.infer<typeof EndpointSchema>;

// ── Delivery Schema ──
export const DeliverySchema = z.object({
  id: z.string(),
  endpoint_id: z.string(),
  event: z.string().optional(),
  status: z.enum(['pending', 'delivered', 'failed']),
  attempt_count: z.number(),
  response_status: z.number().optional(),
  created_at: z.string(),
});
export type DeliveryValidated = z.infer<typeof DeliverySchema>;

// ── Delivery List Response Schema ──
export const DeliveryListResponseSchema = z.object({
  deliveries: z.array(DeliverySchema),
  total: z.number(),
  page: z.number(),
  per_page: z.number(),
});

// ── Admin Stats Schema ──
export const AdminStatsSchema = z.object({
  total_users: z.number(),
  total_deliveries: z.number(),
  total_revenue: z.number(),
  active_users_today: z.number(),
  total_endpoints: z.number(),
  active_endpoints: z.number(),
  users_by_plan: z.array(
    z.object({
      plan: z.string(),
      count: z.number(),
    })
  ),
  recent_signups: z.array(
    z.object({
      id: z.string(),
      email: z.string(),
      name: z.string().optional(),
      plan: z.string(),
      created_at: z.string(),
    })
  ),
  trends: z.object({
    total_users_yesterday: z.number(),
    total_deliveries_yesterday: z.number(),
    revenue_yesterday: z.number(),
    active_users_yesterday: z.number(),
    active_webhooks: z.number(),
  }),
});
export type AdminStatsValidated = z.infer<typeof AdminStatsSchema>;

// ── Revenue Schema ──
export const RevenueSchema = z.object({
  mrr: z.number(),
  arr: z.number().optional(),
  churn_rate: z.number().optional(),
  mrr_trend: z.number().optional(),
  collected_revenue: z.number().optional(),
  monthly_revenue: z.array(z.object({ month: z.string(), revenue: z.number() })).optional(),
  revenue_by_plan: z.array(z.object({ plan: z.string(), revenue: z.number(), count: z.number() })).optional(),
  by_plan: z.array(z.object({ plan: z.string(), revenue: z.number(), count: z.number() })).optional(),
});
export type RevenueValidated = z.infer<typeof RevenueSchema>;

// ── Audit Log Entry Schema ──
export const AuditLogEntrySchema = z.object({
  id: z.string(),
  customer_id: z.string().optional(),
  user_id: z.string().optional(),
  action: z.string(),
  resource_type: z.string(),
  resource_id: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  created_at: z.string(),
});
export type AuditLogEntryValidated = z.infer<typeof AuditLogEntrySchema>;

// ── Audit Log Response Schema ──
export const AuditLogResponseSchema = z.object({
  entries: z.array(AuditLogEntrySchema),
  total: z.number(),
  page: z.number().optional(),
  per_page: z.number().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

// ── Feature Flag Schema ──
export const FeatureFlagSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  is_enabled: z.boolean(),
  rollout_percentage: z.number().optional(),
  enabled_for_plans: z.array(z.string()).optional(),
  created_by: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type FeatureFlagValidated = z.infer<typeof FeatureFlagSchema>;

// ── Feature Flags Response Schema ──
export const FeatureFlagsResponseSchema = z.object({
  flags: z.array(FeatureFlagSchema),
});

// ── Deploy Info Schema ──
export const DeployInfoSchema = z.object({
  version: z.string(),
  git_commit: z.string().optional(),
  build_time: z.string().optional(),
  environment: z.string(),
});
export type DeployInfoValidated = z.infer<typeof DeployInfoSchema>;

// ── Admin User Schema ──
export const AdminUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullish(),
  plan: z.string(),
  role: z.string(),
  status: z.enum(['active', 'banned']),
  is_active: z.boolean().nullish(),
  is_admin: z.boolean().nullish(),
  created_at: z.string(),
  total_deliveries: z.number().nullish(),
  total_endpoints: z.number().nullish(),
});
export type AdminUserValidated = z.infer<typeof AdminUserSchema>;

// ── Admin Users Response Schema ──
export const AdminUsersResponseSchema = z.object({
  users: z.array(AdminUserSchema),
  total: z.number(),
  page: z.number(),
  per_page: z.number(),
});

// ── Admin User Detail Schema ──
export const AdminUserDetailSchema = z.object({
  user: AdminUserSchema,
  endpoints: z.array(z.object({
    id: z.string(),
    url: z.string(),
    is_active: z.boolean(),
    created_at: z.string(),
  })).optional(),
  recent_deliveries: z.array(DeliverySchema).optional(),
  usage_stats: z.object({
    total_deliveries: z.number(),
    success_rate: z.number(),
    endpoints_count: z.number(),
  }).optional(),
});

// ── Stats Response Schema ──
export const StatsResponseSchema = z.object({
  total_deliveries: z.number(),
  delivered: z.number(),
  failed: z.number(),
  pending: z.number(),
  success_rate: z.number(),
  endpoints_count: z.number(),
});

// ── Health Schema ──
export const HealthResponseSchema = z.object({
  status: z.string(),
  uptime_seconds: z.number(),
  version: z.string().optional(),
});

// ── Delivery Trend Schema ──
export const DeliveryTrendSchema = z.object({
  range: z.string().optional(),
  buckets: z.array(
    z.object({
      timestamp: z.string(),
      successful: z.number(),
      failed: z.number(),
      total: z.number(),
    })
  ),
});

// ── Success Rate Schema ──
export const SuccessRateSchema = z.object({
  range: z.string().optional(),
  successful: z.number(),
  failed: z.number(),
  pending: z.number(),
  success_rate: z.number(),
});

// ── WS Event Schema ──
export const WsEventSchema = z.object({
  type: z.string(),
  seq: z.number().optional(),
  ts: z.number(),
  data: z.record(z.string(), z.unknown()),
});
export type WsEvent = z.infer<typeof WsEventSchema>;

// ── System Health Schema ──
export const SystemHealthSchema = z.object({
  status: z.string().optional(),
  database: z.object({ status: z.string(), latency_ms: z.number() }).optional(),
  redis: z.object({ status: z.string(), latency_ms: z.number() }).optional(),
  api: z.object({ status: z.string(), uptime_seconds: z.number() }).optional(),
  queue: z.object({ pending: z.number(), processing: z.number(), failed: z.number() }).optional(),
  checks: z.object({
    database: z.object({ status: z.string(), latency_ms: z.number() }).optional(),
    queue: z.object({ status: z.string(), latency_ms: z.number(), pending_count: z.number().optional() }).optional(),
    redis: z.object({ status: z.string(), latency_ms: z.number() }).optional(),
    last_delivery: z.object({ status: z.string(), last_delivered_at: z.string().optional() }).optional(),
    db_size: z.object({ status: z.string(), size: z.string().optional() }).optional(),
    recent_errors: z.object({
      status: z.string(),
      errors: z.array(z.object({
        id: z.string(),
        event: z.string().optional(),
        error: z.string().optional(),
        created_at: z.string(),
      })).optional(),
    }).optional(),
    queue_detail: z.object({
      status: z.string(),
      pending: z.number().optional(),
      processing: z.number().optional(),
      failed_last_hour: z.number().optional(),
    }).optional(),
  }).optional(),
});
export type SystemHealthValidated = z.infer<typeof SystemHealthSchema>;

// ── Queue Status Schema ──
export const QueueStatusSchema = z.object({
  pending: z.number(),
  processing: z.number(),
  failed: z.number(),
  total: z.number(),
  oldest_pending_at: z.string().nullable().optional(),
  failed_last_hour: z.number(),
});

// ── Revenue Metrics Schema ──
export const RevenueMetricsSchema = z.object({
  mrr: z.number(),
  arr: z.number(),
  arpu: z.number(),
  ltv: z.number(),
  nrr: z.number(),
  expansion_revenue: z.number(),
  total_customers: z.number(),
  paying_customers: z.number(),
  churn_rate: z.number(),
  avg_months_retained: z.number(),
});

// ── Cohort Schema ──
export const CohortSchema = z.object({
  cohort_month: z.string(),
  customers_signed_up: z.number(),
  customers_active: z.number(),
  total_revenue_cents: z.number(),
  retention_rate: z.number(),
});

// ── Revenue Cohorts Response Schema ──
export const RevenueCohortsResponseSchema = z.object({
  cohorts: z.array(CohortSchema),
});

// ── Refund Schema ──
export const RefundSchema = z.object({
  id: z.string(),
  customer_id: z.string(),
  amount_cents: z.number(),
  currency: z.string(),
  reason: z.string().nullable().optional(),
  status: z.string(),
  created_at: z.string(),
});

// ── Refunds Response Schema ──
export const RefundsResponseSchema = z.object({
  refunds: z.array(RefundSchema),
  total: z.number(),
});

// ── Platform Settings Schema ──
export const PlatformSettingsSchema = z.object({
  default_plan: z.string(),
  max_endpoints_free: z.number(),
  max_endpoints_pro: z.number(),
  max_webhooks_free: z.number(),
  max_webhooks_pro: z.number(),
  rate_limit_free: z.number(),
  rate_limit_pro: z.number(),
  retry_max_attempts: z.number(),
  retention_days_free: z.number(),
  retention_days_pro: z.number(),
  maintenance_mode: z.boolean(),
  signup_enabled: z.boolean(),
  plan_price_pro: z.number(),
  plan_price_business: z.number(),
  resend_api_key: z.string().nullable().optional(),
  email_sender: z.string().nullable().optional(),
  webhook_secret: z.string().nullable().optional(),
  backup_retention_days: z.number(),
  global_rate_limit: z.number(),
  cors_origins: z.string().nullable().optional(),
});

// ── Alert Rule Schema ──
export const AlertRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  condition: z.string(),
  threshold: z.number(),
  channels: z.array(z.string()),
  is_active: z.boolean(),
  created_at: z.string(),
});

// ── Failed Deliveries Response Schema ──
export const FailedDeliveriesResponseSchema = z.object({
  deliveries: z.array(z.object({
    id: z.string(),
    customer_email: z.string().nullable().optional(),
    endpoint_url: z.string().nullable().optional(),
    event_type: z.string().nullable().optional(),
    attempt_count: z.number(),
    response_status: z.number().nullable().optional(),
    error_message: z.string().nullable().optional(),
    created_at: z.string(),
  })),
  count: z.number(),
});

// ── Dead Letters Response Schema ──
export const DeadLettersResponseSchema = z.object({
  dead_letters: z.array(z.object({
    id: z.string(),
    customer_email: z.string().nullable().optional(),
    endpoint_url: z.string().nullable().optional(),
    reason: z.string().nullable().optional(),
    attempts: z.number(),
    created_at: z.string(),
  })),
  count: z.number(),
});

// ── Rate Limit Violations Response Schema ──
export const RateLimitViolationsResponseSchema = z.object({
  violations: z.array(z.object({
    id: z.string(),
    customer_email: z.string().nullable().optional(),
    ip: z.string().nullable().optional(),
    requests_count: z.number(),
    limit_per_window: z.number(),
    window_seconds: z.number(),
    created_at: z.string(),
  })),
  count: z.number(),
});

// ── API Latency Response Schema ──
export const ApiLatencyResponseSchema = z.object({
  endpoints: z.array(z.object({
    endpoint_id: z.string(),
    url: z.string(),
    total_deliveries: z.number(),
    avg_latency_ms: z.number().nullable().optional(),
    p95_latency_ms: z.number().nullable().optional(),
    failed_count: z.number(),
    error_rate: z.number(),
  })),
  period: z.string(),
});
