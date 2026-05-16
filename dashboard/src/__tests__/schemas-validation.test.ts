// ─────────────────────────────────────────────────────────────────
// Zod Schema Validation Unit Tests
// schemas/api.ts için comprehensive testler
// ─────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import {
  EndpointSchema,
  DeliverySchema,
  DeliveryListResponseSchema,
  AdminStatsSchema,
  RevenueSchema,
  AuditLogEntrySchema,
  AuditLogResponseSchema,
  FeatureFlagSchema,
  FeatureFlagsResponseSchema,
  DeployInfoSchema,
  AdminUserSchema,
  AdminUsersResponseSchema,
  AdminUserDetailSchema,
  StatsResponseSchema,
  HealthResponseSchema,
  DeliveryTrendSchema,
  SuccessRateSchema,
  WsEventSchema,
  SystemHealthSchema,
  QueueStatusSchema,
  RevenueMetricsSchema,
  CohortSchema,
  RevenueCohortsResponseSchema,
  AlertRuleSchema,
  PlatformSettingsSchema,
} from '@/schemas/api';

// ════════════════════════════════════════════════════════════════
// Endpoint Schema
// ════════════════════════════════════════════════════════════════

describe('EndpointSchema', () => {
  const validEndpoint = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    url: 'https://example.com/webhook',
    is_active: true,
    created_at: '2026-05-16T00:00:00Z',
  };

  it('accepts valid endpoint', () => {
    const result = EndpointSchema.safeParse(validEndpoint);
    expect(result.success).toBe(true);
  });

  it('requires id', () => {
    const { id, ...rest } = validEndpoint;
    const result = EndpointSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('requires url to be valid', () => {
    const result = EndpointSchema.safeParse({ ...validEndpoint, url: 'not-a-url' });
    expect(result.success).toBe(false);
  });

  it('requires is_active to be boolean', () => {
    const result = EndpointSchema.safeParse({ ...validEndpoint, is_active: 'yes' });
    expect(result.success).toBe(false);
  });

  it('accepts optional fields', () => {
    const full = {
      ...validEndpoint,
      description: 'My endpoint',
      routing_strategy: 'round-robin',
      fallback_url: 'https://fallback.com',
      avg_response_ms: 150,
      failure_streak: 0,
      retry_policy: { max_attempts: 3, backoff: 'exponential', initial_delay_secs: 10, max_delay_secs: 3600 },
      signing_secret: 'whsec_abc123',
      event_filter: ['order.created'],
      custom_headers: { 'X-Custom': 'value' },
      application_id: 'app-123',
      format: 'json',
    };
    const result = EndpointSchema.safeParse(full);
    expect(result.success).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// Delivery Schema
// ════════════════════════════════════════════════════════════════

describe('DeliverySchema', () => {
  const validDelivery = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    endpoint_id: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
    event: 'order.created',
    status: 'delivered' as const,
    attempt_count: 1,
    response_status: 200,
    created_at: '2026-05-16T00:00:00Z',
  };

  it('accepts valid delivery', () => {
    const result = DeliverySchema.safeParse(validDelivery);
    expect(result.success).toBe(true);
  });

  it('accepts all valid statuses', () => {
    for (const status of ['pending', 'delivered', 'failed']) {
      const result = DeliverySchema.safeParse({ ...validDelivery, status });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid status', () => {
    const result = DeliverySchema.safeParse({ ...validDelivery, status: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('requires attempt_count to be number', () => {
    const result = DeliverySchema.safeParse({ ...validDelivery, attempt_count: 'one' });
    expect(result.success).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════
// Admin Stats Schema
// ════════════════════════════════════════════════════════════════

describe('AdminStatsSchema', () => {
  const validStats = {
    total_users: 100,
    total_deliveries: 5000,
    total_revenue: 9900,
    active_users_today: 25,
    total_endpoints: 150,
    active_endpoints: 120,
    users_by_plan: [
      { plan: 'free', count: 80 },
      { plan: 'pro', count: 20 },
    ],
    recent_signups: [
      {
        id: 'user-1',
        email: 'new@test.com',
        name: 'Test User',
        plan: 'free',
        created_at: '2026-05-16T00:00:00Z',
      },
    ],
    trends: {
      total_users_yesterday: 95,
      total_deliveries_yesterday: 4800,
      revenue_yesterday: 9500,
      active_users_yesterday: 22,
      active_webhooks: 30,
    },
  };

  it('accepts valid admin stats', () => {
    const result = AdminStatsSchema.safeParse(validStats);
    expect(result.success).toBe(true);
  });

  it('requires numeric fields', () => {
    const result = AdminStatsSchema.safeParse({
      ...validStats,
      total_users: 'not-a-number',
    });
    expect(result.success).toBe(false);
  });

  it('accepts empty arrays', () => {
    const result = AdminStatsSchema.safeParse({
      ...validStats,
      users_by_plan: [],
      recent_signups: [],
    });
    expect(result.success).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// WsEvent Schema
// ════════════════════════════════════════════════════════════════

describe('WsEventSchema', () => {
  it('accepts valid WS event', () => {
    const event = {
      type: 'delivery.created',
      seq: 42,
      ts: Date.now(),
      data: { delivery_id: 'del-123', status: 'delivered' },
    };
    const result = WsEventSchema.safeParse(event);
    expect(result.success).toBe(true);
  });

  it('accepts event without seq', () => {
    const event = {
      type: 'queue.updated',
      ts: Date.now(),
      data: { pending: 10 },
    };
    const result = WsEventSchema.safeParse(event);
    expect(result.success).toBe(true);
  });

  it('requires type field', () => {
    const event = { ts: Date.now(), data: {} };
    const result = WsEventSchema.safeParse(event);
    expect(result.success).toBe(false);
  });

  it('requires ts field', () => {
    const event = { type: 'test', data: {} };
    const result = WsEventSchema.safeParse(event);
    expect(result.success).toBe(false);
  });

  it('requires data field', () => {
    const event = { type: 'test', ts: Date.now() };
    const result = WsEventSchema.safeParse(event);
    expect(result.success).toBe(false);
  });

  it('accepts empty data object', () => {
    const event = { type: 'test', ts: Date.now(), data: {} };
    const result = WsEventSchema.safeParse(event);
    expect(result.success).toBe(true);
  });

  it('accepts nested data', () => {
    const event = {
      type: 'delivery.created',
      ts: Date.now(),
      data: {
        delivery_id: 'del-123',
        endpoint: { url: 'https://example.com', is_active: true },
        metadata: { source: 'api', retries: 3 },
      },
    };
    const result = WsEventSchema.safeParse(event);
    expect(result.success).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// Revenue Schema
// ════════════════════════════════════════════════════════════════

describe('RevenueSchema', () => {
  it('accepts valid revenue', () => {
    const revenue = {
      mrr: 5000,
      arr: 60000,
      churn_rate: 2.5,
      mrr_trend: 5.0,
      collected_revenue: 45000,
      monthly_revenue: [
        { month: '2026-01', revenue: 4500 },
        { month: '2026-02', revenue: 4800 },
      ],
      revenue_by_plan: [
        { plan: 'pro', revenue: 3000, count: 30 },
        { plan: 'business', revenue: 2000, count: 10 },
      ],
    };
    const result = RevenueSchema.safeParse(revenue);
    expect(result.success).toBe(true);
  });

  it('requires mrr', () => {
    const result = RevenueSchema.safeParse({ arr: 60000 });
    expect(result.success).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════
// Health Response Schema
// ════════════════════════════════════════════════════════════════

describe('HealthResponseSchema', () => {
  it('accepts valid health response', () => {
    const health = {
      status: 'healthy',
      uptime_seconds: 86400,
      version: '2.0.0',
    };
    const result = HealthResponseSchema.safeParse(health);
    expect(result.success).toBe(true);
  });

  it('accepts minimal health response', () => {
    const health = { status: 'ok', uptime_seconds: 0 };
    const result = HealthResponseSchema.safeParse(health);
    expect(result.success).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// Delivery Trend Schema
// ════════════════════════════════════════════════════════════════

describe('DeliveryTrendSchema', () => {
  it('accepts valid trend data', () => {
    const trend = {
      range: '24h',
      buckets: [
        { timestamp: '2026-05-16T00:00:00Z', successful: 100, failed: 5, total: 105 },
        { timestamp: '2026-05-16T01:00:00Z', successful: 95, failed: 3, total: 98 },
      ],
    };
    const result = DeliveryTrendSchema.safeParse(trend);
    expect(result.success).toBe(true);
  });

  it('accepts empty buckets', () => {
    const trend = { buckets: [] };
    const result = DeliveryTrendSchema.safeParse(trend);
    expect(result.success).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// Success Rate Schema
// ════════════════════════════════════════════════════════════════

describe('SuccessRateSchema', () => {
  it('accepts valid success rate', () => {
    const rate = {
      range: '7d',
      successful: 950,
      failed: 30,
      pending: 20,
      success_rate: 95.0,
    };
    const result = SuccessRateSchema.safeParse(rate);
    expect(result.success).toBe(true);
  });

  it('requires all fields', () => {
    const result = SuccessRateSchema.safeParse({ successful: 100 });
    expect(result.success).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════
// Queue Status Schema
// ════════════════════════════════════════════════════════════════

describe('QueueStatusSchema', () => {
  it('accepts valid queue status', () => {
    const queue = {
      pending: 10,
      processing: 5,
      failed: 2,
      total: 17,
      oldest_pending_at: '2026-05-16T00:00:00Z',
      failed_last_hour: 1,
    };
    const result = QueueStatusSchema.safeParse(queue);
    expect(result.success).toBe(true);
  });

  it('accepts null oldest_pending_at', () => {
    const queue = {
      pending: 0,
      processing: 0,
      failed: 0,
      total: 0,
      oldest_pending_at: null,
      failed_last_hour: 0,
    };
    const result = QueueStatusSchema.safeParse(queue);
    expect(result.success).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// Alert Rule Schema
// ════════════════════════════════════════════════════════════════

describe('AlertRuleSchema', () => {
  it('accepts valid alert rule', () => {
    const alert = {
      id: 'alert-1',
      name: 'High failure rate',
      condition: 'failure_rate > 10%',
      threshold: 10,
      channels: ['email', 'slack'],
      is_active: true,
      created_at: '2026-05-16T00:00:00Z',
    };
    const result = AlertRuleSchema.safeParse(alert);
    expect(result.success).toBe(true);
  });

  it('requires name', () => {
    const alert = {
      id: 'alert-1',
      condition: 'test',
      threshold: 5,
      channels: ['email'],
      is_active: true,
      created_at: '2026-05-16T00:00:00Z',
    };
    const result = AlertRuleSchema.safeParse(alert);
    expect(result.success).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════
// System Health Schema
// ════════════════════════════════════════════════════════════════

describe('SystemHealthSchema', () => {
  it('accepts valid system health', () => {
    const health = {
      status: 'healthy',
      database: { status: 'ok', latency_ms: 5 },
      redis: { status: 'ok', latency_ms: 2 },
      api: { status: 'ok', uptime_seconds: 86400 },
      queue: { pending: 10, processing: 5, failed: 2 },
    };
    const result = SystemHealthSchema.safeParse(health);
    expect(result.success).toBe(true);
  });

  it('accepts partial system health', () => {
    const health = { status: 'degraded' };
    const result = SystemHealthSchema.safeParse(health);
    expect(result.success).toBe(true);
  });

  it('accepts empty object', () => {
    const result = SystemHealthSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// Platform Settings Schema
// ════════════════════════════════════════════════════════════════

describe('PlatformSettingsSchema', () => {
  it('accepts valid platform settings', () => {
    const settings = {
      default_plan: 'free',
      max_endpoints_free: 5,
      max_endpoints_pro: 50,
      max_webhooks_free: 1000,
      max_webhooks_pro: 100000,
      rate_limit_free: 100,
      rate_limit_pro: 1000,
      retry_max_attempts: 3,
      retention_days_free: 7,
      retention_days_pro: 30,
      maintenance_mode: false,
      signup_enabled: true,
      plan_price_pro: 29,
      plan_price_business: 99,
      resend_api_key: null,
      email_sender: null,
      webhook_secret: null,
      backup_retention_days: 30,
      global_rate_limit: 10000,
      cors_origins: null,
    };
    const result = PlatformSettingsSchema.safeParse(settings);
    expect(result.success).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// Revenue Metrics Schema
// ════════════════════════════════════════════════════════════════

describe('RevenueMetricsSchema', () => {
  it('accepts valid revenue metrics', () => {
    const metrics = {
      mrr: 5000,
      arr: 60000,
      arpu: 50,
      ltv: 600,
      nrr: 95,
      expansion_revenue: 500,
      total_customers: 100,
      paying_customers: 80,
      churn_rate: 2.5,
      avg_months_retained: 12,
    };
    const result = RevenueMetricsSchema.safeParse(metrics);
    expect(result.success).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════
// Cross-Schema Integration
// ════════════════════════════════════════════════════════════════

describe('Cross-schema validation', () => {
  it('DeliveryListResponseSchema wraps DeliverySchema correctly', () => {
    const response = {
      deliveries: [
        {
          id: 'del-1',
          endpoint_id: 'ep-1',
          status: 'delivered' as const,
          attempt_count: 1,
          created_at: '2026-05-16T00:00:00Z',
        },
      ],
      total: 1,
      page: 1,
      per_page: 20,
    };
    const result = DeliveryListResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it('AdminUsersResponseSchema wraps AdminUserSchema correctly', () => {
    const response = {
      users: [
        {
          id: 'user-1',
          email: 'admin@test.com',
          plan: 'pro',
          role: 'admin',
          status: 'active' as const,
          created_at: '2026-05-16T00:00:00Z',
        },
      ],
      total: 1,
      page: 1,
      per_page: 20,
    };
    const result = AdminUsersResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it('AuditLogResponseSchema wraps AuditLogEntrySchema correctly', () => {
    const response = {
      entries: [
        {
          id: 'log-1',
          action: 'user.login',
          resource_type: 'session',
          created_at: '2026-05-16T00:00:00Z',
        },
      ],
      total: 1,
      limit: 10,
      offset: 0,
    };
    const result = AuditLogResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });

  it('FeatureFlagsResponseSchema wraps FeatureFlagSchema correctly', () => {
    const response = {
      flags: [
        {
          id: 'flag-1',
          name: 'new_dashboard',
          description: 'New dashboard UI',
          is_enabled: true,
          rollout_percentage: 50,
        },
      ],
    };
    const result = FeatureFlagsResponseSchema.safeParse(response);
    expect(result.success).toBe(true);
  });
});
