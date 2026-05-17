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
  event: z.string().nullish(),
  status: z.enum(['pending', 'delivered', 'failed']),
  attempt_count: z.number(),
  response_status: z.number().nullish(),
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
      name: z.string().nullish(),
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
});
export type RevenueValidated = z.infer<typeof RevenueSchema>;

// ── Audit Log Entry Schema ──
export const AuditLogEntrySchema = z.object({
  id: z.string(),
  customer_id: z.string().optional(),
  customer_email: z.string().nullish(),
  action: z.string(),
  resource_type: z.string(),
  resource_id: z.string().nullish(),
  details: z.record(z.string(), z.unknown()).nullish(),
  ip_address: z.string().nullish(),
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

// ── Endpoint Health Schema ──
export const EndpointHealthSchema = z.object({
  id: z.string(),
  url: z.string(),
  description: z.string().nullable(),
  is_active: z.boolean(),
  health_status: z.string(),
  success_rate: z.number(),
  avg_response_ms: z.number(),
  p95_response_ms: z.number(),
  total_deliveries: z.number(),
  successful: z.number(),
  failed: z.number(),
  consecutive_failures: z.number(),
  last_failure_at: z.string().nullable(),
  uptime_24h: z.number(),
});
export type EndpointHealthValidated = z.infer<typeof EndpointHealthSchema>;

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
  git_commit: z.string().nullish(),
  build_time: z.string().nullish(),
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
  months: z.number().optional(),
});

// ── Refund Schema ──
export const RefundSchema = z.object({
  id: z.string(),
  customer_id: z.string(),
  email: z.string().optional(),
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
  max_endpoints_startup: z.number().optional(),
  max_endpoints_pro: z.number(),
  max_endpoints_enterprise: z.number().optional(),
  max_webhooks_free: z.number(),
  max_webhooks_startup: z.number().optional(),
  max_webhooks_pro: z.number(),
  max_webhooks_enterprise: z.number().optional(),
  rate_limit_free: z.number(),
  rate_limit_startup: z.number().optional(),
  rate_limit_pro: z.number(),
  rate_limit_enterprise: z.number().optional(),
  retry_max_attempts: z.number(),
  retention_days_free: z.number(),
  retention_days_startup: z.number().optional(),
  retention_days_pro: z.number(),
  retention_days_enterprise: z.number().optional(),
  maintenance_mode: z.boolean(),
  signup_enabled: z.boolean(),
  plan_price_startup: z.number().optional(),
  plan_price_pro: z.number(),
  plan_price_enterprise: z.number().optional(),
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

// ── Application Schema ──
export const ApplicationSchema = z.object({
  id: z.string(),
  customer_id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  is_active: z.boolean(),
  endpoint_count: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type ApplicationValidated = z.infer<typeof ApplicationSchema>;

// ── Invoice Schema ──
export const InvoiceSchema = z.object({
  id: z.string(),
  date: z.string(),
  amount: z.number(),
  status: z.enum(['paid', 'pending', 'failed']),
  plan: z.string(),
});
export type InvoiceValidated = z.infer<typeof InvoiceSchema>;

// ── Billing Usage Schema ──
export const BillingUsageSchema = z.object({
  deliveries_used: z.number(),
  deliveries_limit: z.number(),
  endpoints_count: z.number(),
  endpoints_limit: z.number(),
  webhooks: z.object({
    used: z.number(),
    limit: z.number(),
    remaining: z.number(),
  }).optional(),
  endpoints: z.object({
    used: z.number(),
    limit: z.number(),
    remaining: z.number(),
  }).optional(),
  plan: z.string().optional(),
});
export type BillingUsageValidated = z.infer<typeof BillingUsageSchema>;

// ── Billing Subscription Schema ──
export const BillingSubscriptionSchema = z.object({
  plan: z.string(),
  status: z.string(),
  payment_provider: z.string(),
  stripe_subscription_id: z.string().optional(),
  polar_subscription_id: z.string().optional(),
  iyzico_subscription_id: z.string().optional(),
  webhook_limit: z.number(),
  endpoint_limit: z.number(),
  retention_days: z.number(),
  monthly_price_cents: z.number(),
  cancel_at_period_end: z.boolean(),
  billing_period: z.string(),
  current_period_end: z.string().optional(),
});
export type BillingSubscriptionValidated = z.infer<typeof BillingSubscriptionSchema>;

// ── Overage Settings Schema ──
export const OverageSettingsSchema = z.object({
  allow_overage: z.boolean(),
  overage_email_notification: z.boolean(),
  plan: z.string(),
  daily_limit: z.number(),
  overage_price: z.number(),
});
export type OverageSettingsValidated = z.infer<typeof OverageSettingsSchema>;

// ── Team Schema ──
export const TeamSchema = z.object({
  id: z.string(),
  name: z.string(),
  created_at: z.string().optional(),
  member_count: z.number().optional(),
});
export type TeamValidated = z.infer<typeof TeamSchema>;

// ── Team Member Schema ──
export const TeamMemberSchema = z.object({
  id: z.string(),
  customer_id: z.string(),
  team_id: z.string(),
  email: z.string(),
  name: z.string().nullish(),
  role: z.string(),
  joined_at: z.string().optional(),
});
export type TeamMemberValidated = z.infer<typeof TeamMemberSchema>;

// ── Alerts Response Schema ──
export const AlertsListResponseSchema = z.array(AlertRuleSchema);
export type AlertsListResponseValidated = z.infer<typeof AlertsListResponseSchema>;

// ── Transform Rule Schema ──
export const TransformRuleSchema = z.object({
  id: z.string(),
  endpoint_id: z.string(),
  rule_json: z.object({
    filter: z.object({
      include: z.array(z.string()).optional(),
      exclude: z.array(z.string()).optional(),
    }).optional(),
    mappings: z.array(z.object({
      source: z.string(),
      target: z.string(),
    })).optional(),
    enrich: z.object({
      fields: z.record(z.string(), z.unknown()),
    }).optional(),
  }),
  created_at: z.string(),
});
export type TransformRuleValidated = z.infer<typeof TransformRuleSchema>;

// ── Inbound Config Schema ──
export const InboundConfigSchema = z.object({
  id: z.string(),
  provider: z.string(),
  endpoint_id: z.string().nullable(),
  enabled: z.boolean(),
  secret: z.string(),
  created_at: z.string(),
});
export type InboundConfigValidated = z.infer<typeof InboundConfigSchema>;

// ── SSO Config Schema ──
export const SsoConfigSchema = z.object({
  provider: z.string().optional(),
  enabled: z.boolean().optional(),
  metadata_url: z.string().optional(),
  entity_id: z.string().optional(),
  sso_url: z.string().optional(),
  certificate_set: z.boolean().optional(),
  issuer_url: z.string().optional(),
  client_id: z.string().optional(),
  client_secret_set: z.boolean().optional(),
});
export type SsoConfigValidated = z.infer<typeof SsoConfigSchema>;

// ── Admin User Detail Schemas (for /admin/users/[id] page) ──

export const UserEndpointsResponseSchema = z.object({
  endpoints: z.array(z.object({
    id: z.string(),
    url: z.string(),
    description: z.string().nullable(),
    is_active: z.boolean(),
    created_at: z.string(),
    total_deliveries: z.number(),
    last_delivery_at: z.string().nullable(),
  })),
});

export const UserWebhooksResponseSchema = z.object({
  webhooks: z.array(z.object({
    id: z.string(),
    endpoint_id: z.string(),
    status: z.string(),
    event: z.string().nullable(),
    created_at: z.string(),
    attempt_count: z.number(),
    response_status: z.number().nullable(),
    response_body: z.string().nullable(),
    error_message: z.string().nullable(),
  })),
  total: z.number(),
  page: z.number(),
  per_page: z.number(),
});

export const UserApiKeysResponseSchema = z.object({
  api_keys: z.array(z.object({
    prefix: z.string(),
    name: z.string(),
    created_at: z.string(),
    is_active: z.boolean(),
  })),
});

export const UserApplicationsResponseSchema = z.object({
  applications: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    created_at: z.string(),
    endpoint_count: z.number(),
  })),
});

export const UserUsageResponseSchema = z.object({
  total_deliveries: z.number(),
  successful: z.number(),
  failed: z.number(),
  pending: z.number(),
  success_rate: z.number(),
  endpoints_count: z.number(),
  active_endpoints: z.number(),
  last_30_days: z.number(),
  last_7_days: z.number(),
  top_events: z.array(z.object({
    event: z.string().nullable(),
    count: z.number(),
  })),
});

export const UserAnalyticsResponseSchema = z.object({
  daily_deliveries: z.array(z.object({
    date: z.string(),
    success: z.number(),
    failed: z.number(),
  })).optional(),
  top_events: z.array(z.object({
    event: z.string().nullable(),
    count: z.number(),
  })).optional(),
  endpoint_health: z.array(z.object({
    url: z.string(),
    success_rate: z.number(),
    avg_latency_ms: z.number(),
  })).optional(),
});

export const UserPlanHistoryResponseSchema = z.object({
  history: z.array(z.object({
    action: z.string(),
    details: z.record(z.string(), z.unknown()),
    created_at: z.string(),
  })),
});

export const NotesResponseSchema = z.object({
  notes: z.array(z.object({
    id: z.string(),
    customer_id: z.string(),
    admin_user_id: z.string(),
    content: z.string(),
    created_at: z.string(),
  })),
  total: z.number(),
});

export const TagsResponseSchema = z.object({
  tags: z.array(z.object({
    id: z.string(),
    customer_id: z.string(),
    tag: z.string(),
    admin_user_id: z.string(),
    created_at: z.string(),
  })),
  total: z.number(),
});

export const CommunicationsResponseSchema = z.object({
  communications: z.array(z.object({
    id: z.string(),
    customer_id: z.string(),
    type: z.string(),
    subject: z.string().nullable(),
    details: z.unknown(),
    admin_user_id: z.string().nullable(),
    created_at: z.string(),
  })),
  total: z.number(),
  page: z.number(),
  per_page: z.number(),
});

export const UserInvoicesResponseSchema = z.object({
  invoices: z.array(z.object({
    id: z.string(),
    customer_id: z.string(),
    amount_cents: z.number(),
    currency: z.string(),
    plan: z.string(),
    status: z.string(),
    provider: z.string(),
    provider_invoice_id: z.string().nullable(),
    paid_at: z.string().nullable(),
    created_at: z.string(),
  })),
  total: z.number(),
  page: z.number(),
  per_page: z.number(),
});

export const UserPaymentsResponseSchema = z.object({
  payments: z.array(z.object({
    id: z.string(),
    customer_id: z.string(),
    amount_cents: z.number(),
    currency: z.string(),
    status: z.string(),
    provider: z.string(),
    provider_transaction_id: z.string().nullable(),
    metadata: z.unknown(),
    created_at: z.string(),
  })),
  total: z.number(),
  page: z.number(),
  per_page: z.number(),
});

export const UserRefundsResponseSchema = z.object({
  refunds: z.array(z.object({
    id: z.string(),
    customer_id: z.string(),
    email: z.string().optional(),
    amount_cents: z.number(),
    currency: z.string(),
    reason: z.string().nullable(),
    admin_user_id: z.string().nullable(),
    provider: z.string(),
    provider_refund_id: z.string().nullable(),
    status: z.string(),
    created_at: z.string(),
  })),
  total: z.number(),
  page: z.number(),
  per_page: z.number(),
});

export const DeliveryDetailResponseSchema = z.object({
  id: z.string(),
  endpoint_id: z.string(),
  event: z.string().nullable().optional(),
  status: z.string(),
  attempt_count: z.number(),
  response_status: z.number().nullable().optional(),
  response_body: z.string().nullable().optional(),
  error_message: z.string().nullable().optional(),
  created_at: z.string(),
  endpoint_url: z.string().nullable().optional(),
  request_body: z.any().nullable().optional(),
  request_headers: z.record(z.string(), z.string()).nullable().optional(),
});

export const DeliveryAttemptResponseSchema = z.object({
  id: z.string(),
  attempt_number: z.number(),
  status: z.string(),
  response_status: z.number().nullable().optional(),
  response_body: z.string().nullable().optional(),
  error_message: z.string().nullable().optional(),
  duration_ms: z.number().nullable().optional(),
  created_at: z.string(),
});

// ── Latency Trend Schema ──
export const LatencyBucketSchema = z.object({
  ts: z.string(),
  avg_ms: z.number(),
  p95_ms: z.number(),
});
export const LatencyTrendSchema = z.object({
  buckets: z.array(LatencyBucketSchema),
});

// ── API Key Schema ──
export const ApiKeySchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  api_key_prefix: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  last_used_at: z.string().nullable(),
});

// ── Portal Config Schema ──
export const PortalConfigSchema = z.object({
  id: z.string().optional(),
  company_name: z.string().optional(),
  logo_url: z.string().nullable().optional(),
  primary_color: z.string().optional(),
  font_family: z.string().optional(),
  dark_mode: z.boolean().optional(),
  show_events: z.boolean().optional(),
  show_deliveries: z.boolean().optional(),
  allowed_events: z.array(z.string()).optional(),
  custom_css: z.string().optional(),
});
export const PortalEmbedCodeSchema = z.object({
  iframe: z.string().optional(),
  portal_url: z.string().optional(),
  react: z.string().optional(),
  script: z.string().optional(),
});
export const PortalProfileSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().nullable(),
  plan: z.string(),
  created_at: z.string(),
});
export const PortalUsageSchema = z.object({
  total_deliveries: z.number(),
  total_endpoints: z.number(),
  success_rate: z.number(),
  period_start: z.string(),
  period_end: z.string(),
});

// ── Rate Limit Schema ──
export const RateLimitSchema = z.object({
  endpoint_id: z.string(),
  requests_per_second: z.number(),
  burst_size: z.number(),
  enabled: z.boolean(),
});

// ── Schema Registry Schema ──
export const SchemaRegistryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  schema: z.any(),
  version: z.number(),
  created_at: z.string(),
});
export const SchemaRegistryListSchema = z.object({
  schemas: z.array(SchemaRegistryItemSchema),
});

// ── Search Schema ──
export const SearchResultSchema = z.object({
  id: z.string(),
  event: z.string().nullable(),
  status: z.string(),
  attempt_count: z.number(),
  response_status: z.number().nullable(),
  created_at: z.string(),
  endpoint_url: z.string(),
});
export const SearchResponseSchema = z.object({
  deliveries: z.array(SearchResultSchema),
  total: z.number(),
  page: z.number(),
  per_page: z.number(),
  query: z.string(),
});

// ── Service Token Schema ──
export const ServiceTokenSchema = z.object({
  id: z.string(),
  name: z.string(),
  token_prefix: z.string(),
  created_at: z.string(),
  last_used_at: z.string().nullable(),
});

// ── Template Schema ──
export const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  industry: z.string().optional(),
  event_types: z.array(z.string()),
  endpoint_count: z.number().optional(),
});
export const TemplateListSchema = z.object({
  templates: z.array(TemplateSchema),
});
