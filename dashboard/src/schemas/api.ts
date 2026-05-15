import { z } from 'zod';

// ── Endpoint Schema ──
export const EndpointSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  description: z.string().optional(),
  is_active: z.boolean(),
  created_at: z.string(),
  routing_strategy: z.string().optional(),
  fallback_url: z.string().optional(),
  avg_response_ms: z.number().optional(),
  failure_streak: z.number().optional(),
  retry_policy: z
    .object({
      max_retries: z.number(),
      backoff_ms: z.number(),
    })
    .optional(),
  signing_secret: z.string().optional(),
  event_filter: z.array(z.string()).optional(),
  custom_headers: z.record(z.string(), z.string()).optional(),
  application_id: z.string().optional(),
  format: z.string().optional(),
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
  limit: z.number(),
  offset: z.number(),
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
  name: z.string().optional(),
  plan: z.string(),
  role: z.string(),
  status: z.enum(['active', 'banned']),
  is_active: z.boolean().optional(),
  created_at: z.string(),
  total_deliveries: z.number().optional(),
  total_endpoints: z.number().optional(),
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
