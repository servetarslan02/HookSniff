import { describe, it, expect } from 'vitest';
import {
  SystemHealthSchema,
  QueueStatusSchema,
  FailedDeliveriesResponseSchema,
  DeadLettersResponseSchema,
  RateLimitViolationsResponseSchema,
  ApiLatencyResponseSchema,
  PlatformSettingsSchema,
  DeliverySchema,
  DeliveryListResponseSchema,
} from '@/schemas/api';

describe('SystemHealthSchema', () => {
  it('accepts full health response', () => {
    const result = SystemHealthSchema.safeParse({
      status: 'healthy',
      _cache: 'MISS',
      database: { status: 'healthy', latency_ms: 23 },
      redis: { status: 'healthy', latency_ms: 31, note: 'connected' },
      api: { status: 'healthy', uptime_seconds: 1051 },
      queue: { pending: 0, processing: 0, failed: 0 },
      checks: {
        database: { status: 'healthy', latency_ms: 23 },
        redis: { status: 'healthy', latency_ms: 31, note: 'connected' },
        queue: { status: 'healthy', latency_ms: 24, pending_count: 0 },
        last_delivery: { status: 'healthy', last_delivered_at: '2024-01-01T00:00:00Z' },
        db_size: { status: 'healthy', size: '34 MB' },
        recent_errors: { status: 'healthy', errors: [{ id: '1', event: 'test', error: null, created_at: '2024-01-01' }] },
        queue_detail: { status: 'healthy', pending: 0, processing: 0, failed_last_hour: 0 },
      },
    });
    expect(result.success).toBe(true);
  });

  it('accepts minimal response', () => {
    expect(SystemHealthSchema.safeParse({}).success).toBe(true);
    expect(SystemHealthSchema.safeParse({ status: 'healthy' }).success).toBe(true);
  });

  it('handles null error fields in recent_errors', () => {
    const result = SystemHealthSchema.safeParse({
      checks: {
        recent_errors: {
          status: 'healthy',
          errors: [{ id: '1', event: 'order.created', error: null, created_at: '2024-01-01' }],
        },
      },
    });
    expect(result.success).toBe(true);
  });
});

describe('QueueStatusSchema', () => {
  it('accepts valid queue status', () => {
    const result = QueueStatusSchema.safeParse({
      pending: 5, processing: 2, failed: 1, total: 8,
      oldest_pending_at: null, failed_last_hour: 0,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    expect(QueueStatusSchema.safeParse({ pending: 5 }).success).toBe(false);
  });
});

describe('FailedDeliveriesResponseSchema', () => {
  it('accepts valid response', () => {
    const result = FailedDeliveriesResponseSchema.safeParse({
      deliveries: [{
        id: 'd1', customer_email: null, endpoint_url: 'https://ex.com',
        event_type: 'test', attempt_count: 3, response_status: 500,
        error_message: 'Server error', created_at: '2024-01-01',
      }],
      count: 1,
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty deliveries', () => {
    expect(FailedDeliveriesResponseSchema.safeParse({ deliveries: [], count: 0 }).success).toBe(true);
  });
});

describe('DeadLettersResponseSchema', () => {
  it('accepts valid response', () => {
    expect(DeadLettersResponseSchema.safeParse({ dead_letters: [], count: 0 }).success).toBe(true);
  });
});

describe('RateLimitViolationsResponseSchema', () => {
  it('accepts valid violations', () => {
    const result = RateLimitViolationsResponseSchema.safeParse({
      violations: [{
        id: 'v1', customer_email: 't@t.com', ip: '1.2.3.4',
        requests_count: 150, limit_per_window: 100, window_seconds: 60,
        created_at: '2024-01-01',
      }],
      count: 1,
    });
    expect(result.success).toBe(true);
  });
});

describe('ApiLatencyResponseSchema', () => {
  it('accepts valid latency data', () => {
    const result = ApiLatencyResponseSchema.safeParse({
      endpoints: [{
        endpoint_id: 'ep1', url: 'https://ex.com', total_deliveries: 100,
        avg_latency_ms: 150.5, p95_latency_ms: 300, failed_count: 2, error_rate: 0.02,
      }],
      period: '24h',
    });
    expect(result.success).toBe(true);
  });

  it('accepts empty endpoints', () => {
    expect(ApiLatencyResponseSchema.safeParse({ endpoints: [], period: '24h' }).success).toBe(true);
  });
});

describe('DeliverySchema', () => {
  it('accepts valid delivery', () => {
    const result = DeliverySchema.safeParse({
      id: 'd1', endpoint_id: 'ep1', event: 'test', status: 'delivered',
      attempt_count: 1, response_status: 200, created_at: '2024-01-01',
    });
    expect(result.success).toBe(true);
  });

  it('handles null response_status', () => {
    const result = DeliverySchema.safeParse({
      id: 'd1', endpoint_id: 'ep1', event: null, status: 'pending',
      attempt_count: 0, response_status: null, created_at: '2024-01-01',
    });
    expect(result.success).toBe(true);
  });

  it('accepts any status string', () => {
    expect(DeliverySchema.safeParse({
      id: 'd1', endpoint_id: 'ep1', status: 'custom_status',
      attempt_count: 0, created_at: '2024-01-01',
    }).success).toBe(true);
  });
});

describe('DeliveryListResponseSchema', () => {
  it('accepts valid list response', () => {
    expect(DeliveryListResponseSchema.safeParse({
      deliveries: [{
        id: 'd1', endpoint_id: 'ep1', status: 'delivered',
        attempt_count: 1, created_at: '2024-01-01',
      }],
      total: 1, page: 1, per_page: 25,
    }).success).toBe(true);
  });
});

describe('PlatformSettingsSchema', () => {
  it('rejects incomplete data', () => {
    expect(PlatformSettingsSchema.safeParse({ default_plan: 'free' }).success).toBe(false);
  });

  it('accepts full settings', () => {
    const result = PlatformSettingsSchema.safeParse({
      default_plan: 'developer',
      max_endpoints_free: 5, max_endpoints_startup: 20, max_endpoints_pro: 50, max_endpoints_enterprise: 200,
      max_webhooks_free: 1000, max_webhooks_startup: 10000, max_webhooks_pro: 50000, max_webhooks_enterprise: 500000,
      rate_limit_free: 100, rate_limit_startup: 500, rate_limit_pro: 1000, rate_limit_enterprise: 5000,
      retention_days_free: 7, retention_days_startup: 14, retention_days_pro: 180, retention_days_enterprise: 365,
      retry_max_attempts: 3,
      maintenance_mode: false,
      signup_enabled: true,
      plan_price_startup: 14, plan_price_pro: 29, plan_price_enterprise: 99, plan_price_business: 99,
      backup_retention_days: 30,
      global_rate_limit: 1000,
    });
    expect(result.success).toBe(true);
  });
});
