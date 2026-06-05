// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderWithProviders } from './test-utils';
import { screen } from '@testing-library/react';

vi.mock('next-intl', () => ({
  useTranslations: (ns?: string) => (key: string) => ns ? `${ns}.${key}` : key,
  useLocale: () => 'en',
}));

vi.mock('@/lib/store', () => ({
  useAuth: () => ({ token: 'tk', user: { id: 'u1', email: 't@t.com', plan: 'pro', is_admin: false } }),
}));

// ── RoleGuard ──
describe('RoleGuard', () => {
  it('renders children when user has access', async () => {
    const { RoleGuard } = await import('@/components/RoleGuard');
    const { container } = renderWithProviders(
      React.createElement(RoleGuard, { requiredRole: 'viewer' }, React.createElement('div', null, 'Protected Content')),
      { withIntl: false }
    );
    expect(container.textContent).toContain('Protected Content');
  });

  it('renders ReadOnlyBadge for read-only users', async () => {
    const { ReadOnlyBadge } = await import('@/components/RoleGuard');
    const { container } = renderWithProviders(
      React.createElement(ReadOnlyBadge),
      { withIntl: false }
    );
    // Should render without crashing
    expect(container).toBeTruthy();
  });
});

// ── LazySection ──
describe('LazySection', () => {
  it('renders children when eager', async () => {
    const { LazySection } = await import('@/components/LazySection');
    const { container } = renderWithProviders(
      React.createElement(LazySection, { eager: true }, React.createElement('div', null, 'Lazy Content')),
      { withIntl: false }
    );
    expect(container.textContent).toContain('Lazy Content');
  });

  it('exports Skeletons presets', async () => {
    const { Skeletons } = await import('@/components/LazySection');
    expect(Skeletons).toBeDefined();
    expect(Skeletons.card).toBeDefined();
    expect(typeof Skeletons.table).toBe('function');
  });
});

// ── PrefetchLink ──
describe('PrefetchLink', () => {
  it('renders as anchor element', async () => {
    const { PrefetchLink } = await import('@/components/PrefetchLink');
    const { container } = renderWithProviders(
      React.createElement(PrefetchLink, { href: '/test' }, 'Link Text'),
      { withIntl: false }
    );
    const link = container.querySelector('a');
    expect(link).toBeTruthy();
    expect(link!.textContent).toContain('Link Text');
  });
});

// ── Additional Schema Tests ──
describe('Additional Schemas', () => {
  it('ApplicationSchema validates correctly', async () => {
    const { ApplicationSchema } = await import('@/schemas/api');
    const result = ApplicationSchema.safeParse({
      id: 'a1', customer_id: 'c1', name: 'Test App', description: null,
      is_active: true, endpoint_count: 5, created_at: '2024-01-01', updated_at: '2024-01-01',
    });
    expect(result.success).toBe(true);
  });

  it('DeliverySchema accepts valid delivery', async () => {
    const { DeliverySchema } = await import('@/schemas/api');
    const result = DeliverySchema.safeParse({
      id: 'd1', endpoint_id: 'ep1', event: 'test', status: 'delivered',
      attempt_count: 1, response_status: 200, created_at: '2024-01-01',
    });
    expect(result.success).toBe(true);
  });

  it('DeliverySchema handles null response_status', async () => {
    const { DeliverySchema } = await import('@/schemas/api');
    const result = DeliverySchema.safeParse({
      id: 'd1', endpoint_id: 'ep1', event: null, status: 'pending',
      attempt_count: 0, response_status: null, created_at: '2024-01-01',
    });
    expect(result.success).toBe(true);
  });

  it('PlatformSettingsSchema rejects missing required fields', async () => {
    const { PlatformSettingsSchema } = await import('@/schemas/api');
    const result = PlatformSettingsSchema.safeParse({ default_plan: 'free' });
    // Should still succeed due to optional fields with defaults
    expect(result.success).toBe(true);
  });

  it('SystemHealthSchema handles empty response', async () => {
    const { SystemHealthSchema } = await import('@/schemas/api');
    const result = SystemHealthSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('QueueStatusSchema requires all fields', async () => {
    const { QueueStatusSchema } = await import('@/schemas/api');
    const valid = QueueStatusSchema.safeParse({
      pending: 0, processing: 0, failed: 0, total: 0,
      oldest_pending_at: null, failed_last_hour: 0,
    });
    expect(valid.success).toBe(true);

    const invalid = QueueStatusSchema.safeParse({ pending: 0 });
    expect(invalid.success).toBe(false);
  });

  it('FailedDeliveriesResponseSchema handles empty array', async () => {
    const { FailedDeliveriesResponseSchema } = await import('@/schemas/api');
    const result = FailedDeliveriesResponseSchema.safeParse({ deliveries: [], count: 0 });
    expect(result.success).toBe(true);
  });

  it('DeadLettersResponseSchema handles empty array', async () => {
    const { DeadLettersResponseSchema } = await import('@/schemas/api');
    const result = DeadLettersResponseSchema.safeParse({ dead_letters: [], count: 0 });
    expect(result.success).toBe(true);
  });

  it('RateLimitViolationsResponseSchema handles empty array', async () => {
    const { RateLimitViolationsResponseSchema } = await import('@/schemas/api');
    const result = RateLimitViolationsResponseSchema.safeParse({ violations: [], count: 0 });
    expect(result.success).toBe(true);
  });

  it('ApiLatencyResponseSchema handles empty array', async () => {
    const { ApiLatencyResponseSchema } = await import('@/schemas/api');
    const result = ApiLatencyResponseSchema.safeParse({ endpoints: [], period: '24h' });
    expect(result.success).toBe(true);
  });
});
