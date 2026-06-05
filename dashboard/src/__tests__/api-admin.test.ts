import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock apiFetch ──────────────────────────────────────────
// We mock the entire api module so adminApi uses our mock apiFetch.
const mockApiFetch = vi.fn();
vi.mock('../lib/api', () => ({
  apiFetch: (...args: unknown[]) => mockApiFetch(...args),
}));

const { adminApi } = await import('../lib/api-admin');

const TOKEN = 'test-token-abc123';

// Helper: assert apiFetch was called with correct URL, method, body
function assertCall(
  expectedPath: string,
  opts?: { method?: string; body?: unknown; token?: string },
) {
  const [url, config] = mockApiFetch.mock.calls[0];
  expect(url).toContain(expectedPath);
  if (opts?.method) {
    expect(config).toMatchObject({ method: opts.method });
  }
  if (opts?.body !== undefined) {
    expect(config).toMatchObject({ body: opts.body });
  }
  if (opts?.token !== undefined) {
    expect(config).toMatchObject({ token: opts.token });
  }
}

describe('adminApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiFetch.mockResolvedValue({}); // default success
  });

  // ── Stats & System ────────────────────────────────────────

  describe('getStats', () => {
    it('calls GET /admin/stats with token', async () => {
      const mockResponse = { total_users: 42, active_users: 30 };
      mockApiFetch.mockResolvedValueOnce(mockResponse);

      const result = await adminApi.getStats(TOKEN);

      assertCall('/admin/stats', { token: TOKEN });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSystemHealth', () => {
    it('calls GET /health', async () => {
      await adminApi.getSystemHealth(TOKEN);
      assertCall('/health', { token: TOKEN });
    });
  });

  describe('getDeployInfo', () => {
    it('calls GET /admin/deploy-info', async () => {
      const mock = { version: '1.2.3', commit_sha: 'abc123' };
      mockApiFetch.mockResolvedValueOnce(mock);

      const result = await adminApi.getDeployInfo(TOKEN);
      assertCall('/admin/deploy-info', { token: TOKEN });
      expect(result).toEqual(mock);
    });
  });

  describe('getQueueStatus', () => {
    it('calls GET /admin/queue/status', async () => {
      await adminApi.getQueueStatus(TOKEN);
      assertCall('/admin/queue/status', { token: TOKEN });
    });
  });

  // ── Users ─────────────────────────────────────────────────

  describe('listUsers', () => {
    it('calls GET /admin/users without params', async () => {
      await adminApi.listUsers(TOKEN);
      assertCall('/admin/users', { token: TOKEN });
      // Should NOT have query string
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).not.toContain('?');
    });

    it('builds query string from all params', async () => {
      await adminApi.listUsers(TOKEN, {
        page: 2,
        search: 'john',
        plan: 'pro',
        status: 'active',
        created_after: '2026-01-01',
        created_before: '2026-06-01',
        sort_field: 'email',
        sort_dir: 'asc',
      });

      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('page=2');
      expect(url).toContain('search=john');
      expect(url).toContain('plan=pro');
      expect(url).toContain('status=active');
      expect(url).toContain('created_after=2026-01-01');
      expect(url).toContain('created_before=2026-06-01');
      expect(url).toContain('sort_field=email');
      expect(url).toContain('sort_dir=asc');
    });

    it('omits falsy params from query string', async () => {
      await adminApi.listUsers(TOKEN, { page: 1 });
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('page=1');
      expect(url).not.toContain('search=');
      expect(url).not.toContain('plan=');
    });
  });

  describe('getUserDetail', () => {
    it('calls GET /admin/users/{id}', async () => {
      await adminApi.getUserDetail(TOKEN, 'user-123');
      assertCall('/admin/users/user-123', { token: TOKEN });
    });
  });

  describe('updateUserPlan', () => {
    it('sends PUT with plan body', async () => {
      await adminApi.updateUserPlan(TOKEN, 'u1', 'enterprise');
      assertCall('/admin/users/u1/plan', {
        method: 'PUT',
        body: { plan: 'enterprise' },
        token: TOKEN,
      });
    });
  });

  describe('getUserPlanHistory', () => {
    it('calls GET /admin/users/{id}/plan-history', async () => {
      await adminApi.getUserPlanHistory(TOKEN, 'u1');
      assertCall('/admin/users/u1/plan-history', { token: TOKEN });
    });
  });

  describe('sendUserEmail', () => {
    it('sends POST with subject and body', async () => {
      await adminApi.sendUserEmail(TOKEN, 'u1', 'Hello', 'World');
      assertCall('/admin/users/u1/send-email', {
        method: 'POST',
        body: { subject: 'Hello', body: 'World' },
        token: TOKEN,
      });
    });
  });

  describe('updateUserStatus', () => {
    it('sends PUT with is_active=true for active status', async () => {
      await adminApi.updateUserStatus(TOKEN, 'u1', 'active');
      assertCall('/admin/users/u1/status', {
        method: 'PUT',
        body: { is_active: true },
        token: TOKEN,
      });
    });

    it('sends PUT with is_active=false and reason for banned', async () => {
      await adminApi.updateUserStatus(TOKEN, 'u1', 'banned', 'spam');
      assertCall('/admin/users/u1/status', {
        method: 'PUT',
        body: { is_active: false, reason: 'spam' },
        token: TOKEN,
      });
    });
  });

  describe('impersonateUser', () => {
    it('sends POST to impersonate endpoint', async () => {
      const mock = { token: 'impersonated-jwt', expires_in: 3600 };
      mockApiFetch.mockResolvedValueOnce(mock);

      const result = await adminApi.impersonateUser(TOKEN, 'u1');
      assertCall('/admin/users/u1/impersonate', { method: 'POST', token: TOKEN });
      expect(result).toEqual(mock);
    });
  });

  // ── User Analytics & Data ─────────────────────────────────

  describe('getUserAnalytics', () => {
    it('calls without days param', async () => {
      await adminApi.getUserAnalytics(TOKEN, 'u1');
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('/admin/users/u1/analytics');
      expect(url).not.toContain('?');
    });

    it('calls with days param', async () => {
      await adminApi.getUserAnalytics(TOKEN, 'u1', 30);
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('/admin/users/u1/analytics?days=30');
    });
  });

  describe('getUserEndpoints', () => {
    it('calls GET /admin/users/{id}/endpoints', async () => {
      await adminApi.getUserEndpoints(TOKEN, 'u1');
      assertCall('/admin/users/u1/endpoints', { token: TOKEN });
    });
  });

  describe('getUserWebhooks', () => {
    it('calls without params', async () => {
      await adminApi.getUserWebhooks(TOKEN, 'u1');
      assertCall('/admin/users/u1/webhooks', { token: TOKEN });
    });

    it('builds query string from all params', async () => {
      await adminApi.getUserWebhooks(TOKEN, 'u1', {
        page: 2,
        per_page: 50,
        status: 'failed',
        event_type: 'order.created',
        since: '2026-01-01',
      });

      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('page=2');
      expect(url).toContain('per_page=50');
      expect(url).toContain('status=failed');
      expect(url).toContain('event_type=order.created');
      expect(url).toContain('since=2026-01-01');
    });
  });

  describe('getUserApiKeys', () => {
    it('calls GET /admin/users/{id}/api-keys', async () => {
      await adminApi.getUserApiKeys(TOKEN, 'u1');
      assertCall('/admin/users/u1/api-keys', { token: TOKEN });
    });
  });

  describe('getUserApplications', () => {
    it('calls GET /admin/users/{id}/applications', async () => {
      await adminApi.getUserApplications(TOKEN, 'u1');
      assertCall('/admin/users/u1/applications', { token: TOKEN });
    });
  });

  describe('getUserUsage', () => {
    it('calls GET /admin/users/{id}/usage', async () => {
      await adminApi.getUserUsage(TOKEN, 'u1');
      assertCall('/admin/users/u1/usage', { token: TOKEN });
    });
  });

  describe('adminUserTestWebhook', () => {
    it('sends POST with webhook test data', async () => {
      const data = {
        endpoint_url: 'https://example.com/hook',
        event_type: 'test.event',
        payload: { hello: 'world' },
      };
      await adminApi.adminUserTestWebhook(TOKEN, 'u1', data);
      assertCall('/admin/users/u1/test-webhook', {
        method: 'POST',
        body: data,
        token: TOKEN,
      });
    });
  });

  describe('adminUserReplayDelivery', () => {
    it('sends POST to replay endpoint', async () => {
      await adminApi.adminUserReplayDelivery(TOKEN, 'u1', 'del-456');
      assertCall('/admin/users/u1/webhooks/del-456/replay', {
        method: 'POST',
        token: TOKEN,
      });
    });
  });

  // ── Revenue ───────────────────────────────────────────────

  describe('getRevenue', () => {
    it('calls GET /admin/revenue', async () => {
      await adminApi.getRevenue(TOKEN);
      assertCall('/admin/revenue', { token: TOKEN });
    });
  });

  describe('getRevenueMetrics', () => {
    it('calls GET /admin/revenue/metrics', async () => {
      const mock = { mrr: 5000, arr: 60000, arpu: 50, ltv: 500 };
      mockApiFetch.mockResolvedValueOnce(mock);

      const result = await adminApi.getRevenueMetrics(TOKEN);
      assertCall('/admin/revenue/metrics', { token: TOKEN });
      expect(result).toEqual(mock);
    });
  });

  describe('getRevenueCohorts', () => {
    it('calls without months param', async () => {
      await adminApi.getRevenueCohorts(TOKEN);
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('/admin/revenue/cohorts');
      expect(url).not.toContain('?');
    });

    it('calls with months param', async () => {
      await adminApi.getRevenueCohorts(TOKEN, 6);
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('/admin/revenue/cohorts?months=6');
    });
  });

  // ── Audit Logs ────────────────────────────────────────────

  describe('getAuditLogs', () => {
    it('calls without params', async () => {
      await adminApi.getAuditLogs(TOKEN);
      assertCall('/admin/audit-logs', { token: TOKEN });
    });

    it('builds query string with limit and offset → pagination math', async () => {
      await adminApi.getAuditLogs(TOKEN, { limit: 20, offset: 40, action: 'login' });
      const [url] = mockApiFetch.mock.calls[0];
      // offset 40 / limit 20 = page 3
      expect(url).toContain('per_page=20');
      expect(url).toContain('page=3');
      expect(url).toContain('action=login');
    });

    it('defaults page to 1 when offset is 0', async () => {
      await adminApi.getAuditLogs(TOKEN, { limit: 10 });
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('page=1');
    });
  });

  // ── Alerts ────────────────────────────────────────────────

  describe('listAlerts', () => {
    it('calls GET /admin/alerts', async () => {
      await adminApi.listAlerts(TOKEN);
      assertCall('/admin/alerts', { token: TOKEN });
    });
  });

  describe('createAlert', () => {
    it('sends POST with alert data', async () => {
      const data = {
        name: 'High Error Rate',
        condition: 'error_rate > 5',
        threshold: 5,
        channels: ['email', 'slack'],
      };
      await adminApi.createAlert(TOKEN, data);
      assertCall('/admin/alerts', {
        method: 'POST',
        body: data,
        token: TOKEN,
      });
    });
  });

  describe('updateAlert', () => {
    it('sends PUT with partial data', async () => {
      await adminApi.updateAlert(TOKEN, 'alert-1', { is_active: false });
      assertCall('/admin/alerts/alert-1', {
        method: 'PUT',
        body: { is_active: false },
        token: TOKEN,
      });
    });
  });

  describe('deleteAlert', () => {
    it('sends DELETE', async () => {
      await adminApi.deleteAlert(TOKEN, 'alert-1');
      assertCall('/admin/alerts/alert-1', { method: 'DELETE', token: TOKEN });
    });
  });

  // ── Feature Flags ─────────────────────────────────────────

  describe('listFeatureFlags', () => {
    it('calls GET /admin/feature-flags', async () => {
      await adminApi.listFeatureFlags(TOKEN);
      assertCall('/admin/feature-flags', { token: TOKEN });
    });
  });

  describe('createFeatureFlag', () => {
    it('sends POST with flag data', async () => {
      const data = {
        name: 'new-dashboard',
        description: 'New dashboard UI',
        is_enabled: true,
        rollout_percentage: 50,
        enabled_for_plans: ['pro', 'enterprise'],
      };
      await adminApi.createFeatureFlag(TOKEN, data);
      assertCall('/admin/feature-flags', {
        method: 'POST',
        body: data,
        token: TOKEN,
      });
    });
  });

  describe('updateFeatureFlag', () => {
    it('sends PUT with updated fields', async () => {
      await adminApi.updateFeatureFlag(TOKEN, 'flag-1', {
        rollout_percentage: 100,
      });
      assertCall('/admin/feature-flags/flag-1', {
        method: 'PUT',
        body: { rollout_percentage: 100 },
        token: TOKEN,
      });
    });
  });

  describe('deleteFeatureFlag', () => {
    it('sends DELETE', async () => {
      await adminApi.deleteFeatureFlag(TOKEN, 'flag-1');
      assertCall('/admin/feature-flags/flag-1', {
        method: 'DELETE',
        token: TOKEN,
      });
    });
  });

  // ── Test Webhook ──────────────────────────────────────────

  describe('testWebhook', () => {
    it('sends POST to /admin/test-webhook', async () => {
      const data = {
        endpoint_url: 'https://example.com/hook',
        event_type: 'test.ping',
        payload: { ts: 123 },
      };
      await adminApi.testWebhook(TOKEN, data);
      assertCall('/admin/test-webhook', {
        method: 'POST',
        body: data,
        token: TOKEN,
      });
    });
  });

  // ── Churn ─────────────────────────────────────────────────

  describe('getChurn', () => {
    it('calls GET /admin/churn', async () => {
      await adminApi.getChurn(TOKEN);
      assertCall('/admin/churn', { token: TOKEN });
    });
  });

  // ── Export (returns URL strings, not apiFetch) ────────────

  describe('exportUsers', () => {
    it('returns default CSV export URL', () => {
      const url = adminApi.exportUsers(TOKEN);
      expect(url).toContain('/admin/users/export?');
      expect(url).toContain('format=csv');
    });

    it('includes plan, status, created_after filters', () => {
      const url = adminApi.exportUsers(TOKEN, {
        format: 'json',
        plan: 'pro',
        status: 'active',
        created_after: '2026-01-01',
      });
      expect(url).toContain('format=json');
      expect(url).toContain('plan=pro');
      expect(url).toContain('status=active');
      expect(url).toContain('created_after=2026-01-01');
    });
  });

  describe('exportRevenue', () => {
    it('returns default revenue export URL', () => {
      const url = adminApi.exportRevenue(TOKEN);
      expect(url).toContain('/admin/revenue/export?');
      expect(url).toContain('format=csv');
      expect(url).not.toContain('months=');
    });

    it('includes months param', () => {
      const url = adminApi.exportRevenue(TOKEN, 12);
      expect(url).toContain('months=12');
    });
  });

  // ── Settings ──────────────────────────────────────────────

  describe('getSettings', () => {
    it('calls GET /admin/settings', async () => {
      await adminApi.getSettings(TOKEN);
      assertCall('/admin/settings', { token: TOKEN });
    });
  });

  describe('updateSettings', () => {
    it('sends PUT with settings body', async () => {
      const settings = {
        maintenance_mode: true,
        default_plan: 'free',
      } as any;
      await adminApi.updateSettings(TOKEN, settings);
      assertCall('/admin/settings', {
        method: 'PUT',
        body: settings,
        token: TOKEN,
      });
    });
  });

  // ── Deliveries ────────────────────────────────────────────

  describe('getFailedDeliveries', () => {
    it('builds query with all params', async () => {
      await adminApi.getFailedDeliveries(TOKEN, {
        limit: 25,
        since: '1h',
        user_id: 'u1',
      });
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('limit=25');
      expect(url).toContain('since=1h');
      expect(url).toContain('user_id=u1');
    });

    it('calls without params', async () => {
      await adminApi.getFailedDeliveries(TOKEN);
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('/admin/deliveries/failed');
    });
  });

  describe('getDeadLetters', () => {
    it('builds query with params', async () => {
      await adminApi.getDeadLetters(TOKEN, { limit: 10, since: '24h' });
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('limit=10');
      expect(url).toContain('since=24h');
    });

    it('calls without params', async () => {
      await adminApi.getDeadLetters(TOKEN);
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('/admin/deliveries/dead-letters');
    });
  });

  // ── Rate Limits & Latency ─────────────────────────────────

  describe('getRateLimitViolations', () => {
    it('builds query with params', async () => {
      await adminApi.getRateLimitViolations(TOKEN, { limit: 50, since: '1h' });
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('limit=50');
      expect(url).toContain('since=1h');
    });
  });

  describe('getApiLatency', () => {
    it('calls without period param', async () => {
      await adminApi.getApiLatency(TOKEN);
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('/admin/api-latency');
    });

    it('calls with period param', async () => {
      await adminApi.getApiLatency(TOKEN, { period: '7d' });
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('period=7d');
    });
  });

  // ── User Notes ────────────────────────────────────────────

  describe('addNote', () => {
    it('sends POST with content', async () => {
      await adminApi.addNote(TOKEN, 'u1', 'High-value customer');
      assertCall('/admin/users/u1/notes', {
        method: 'POST',
        body: { content: 'High-value customer' },
        token: TOKEN,
      });
    });
  });

  describe('getNotes', () => {
    it('calls GET /admin/users/{id}/notes', async () => {
      await adminApi.getNotes(TOKEN, 'u1');
      assertCall('/admin/users/u1/notes', { token: TOKEN });
    });
  });

  // ── User Tags ─────────────────────────────────────────────

  describe('addTag', () => {
    it('sends POST with tag', async () => {
      await adminApi.addTag(TOKEN, 'u1', 'vip');
      assertCall('/admin/users/u1/tags', {
        method: 'POST',
        body: { tag: 'vip' },
        token: TOKEN,
      });
    });
  });

  describe('removeTag', () => {
    it('sends DELETE for specific tag', async () => {
      await adminApi.removeTag(TOKEN, 'u1', 'vip');
      assertCall('/admin/users/u1/tags/vip', {
        method: 'DELETE',
        token: TOKEN,
      });
    });
  });

  describe('getTags', () => {
    it('calls GET /admin/users/{id}/tags', async () => {
      await adminApi.getTags(TOKEN, 'u1');
      assertCall('/admin/users/u1/tags', { token: TOKEN });
    });
  });

  // ── Communications ────────────────────────────────────────

  describe('getCommunications', () => {
    it('calls without params', async () => {
      await adminApi.getCommunications(TOKEN, 'u1');
      assertCall('/admin/users/u1/communications', { token: TOKEN });
    });

    it('builds query with type and pagination', async () => {
      await adminApi.getCommunications(TOKEN, 'u1', {
        type: 'email',
        page: 2,
        per_page: 10,
      });
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('type=email');
      expect(url).toContain('page=2');
      expect(url).toContain('per_page=10');
    });
  });

  // ── Invoices & Payments ───────────────────────────────────

  describe('getUserInvoices', () => {
    it('calls without params', async () => {
      await adminApi.getUserInvoices(TOKEN, 'u1');
      assertCall('/admin/users/u1/invoices', { token: TOKEN });
    });

    it('builds query with all params', async () => {
      await adminApi.getUserInvoices(TOKEN, 'u1', {
        page: 1,
        per_page: 25,
        status: 'paid',
      });
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('page=1');
      expect(url).toContain('per_page=25');
      expect(url).toContain('status=paid');
    });
  });

  describe('getUserPayments', () => {
    it('calls without params', async () => {
      await adminApi.getUserPayments(TOKEN, 'u1');
      assertCall('/admin/users/u1/payments', { token: TOKEN });
    });

    it('builds query with pagination', async () => {
      await adminApi.getUserPayments(TOKEN, 'u1', { page: 3, per_page: 50 });
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('page=3');
      expect(url).toContain('per_page=50');
    });
  });

  // ── Refunds ───────────────────────────────────────────────

  describe('refundUser', () => {
    it('sends POST with amount, reason, and currency', async () => {
      const mock = { refund: { id: 'r1', status: 'pending' }, message: 'ok' };
      mockApiFetch.mockResolvedValueOnce(mock);

      const result = await adminApi.refundUser(TOKEN, 'u1', 5000, 'double charge', 'usd');
      assertCall('/admin/users/u1/refund', {
        method: 'POST',
        body: { amount_cents: 5000, reason: 'double charge', currency: 'usd' },
        token: TOKEN,
      });
      expect(result).toEqual(mock);
    });

    it('sends POST without currency when not provided', async () => {
      await adminApi.refundUser(TOKEN, 'u1', 2000, 'refund');
      const [, config] = mockApiFetch.mock.calls[0];
      expect(config.body).toEqual({ amount_cents: 2000, reason: 'refund' });
      expect(config.body).not.toHaveProperty('currency');
    });
  });

  describe('getUserRefunds', () => {
    it('calls without params', async () => {
      await adminApi.getUserRefunds(TOKEN, 'u1');
      assertCall('/admin/users/u1/refunds', { token: TOKEN });
    });

    it('builds query with pagination', async () => {
      await adminApi.getUserRefunds(TOKEN, 'u1', { page: 2, per_page: 10 });
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('page=2');
      expect(url).toContain('per_page=10');
    });
  });

  describe('getAllRefunds', () => {
    it('calls without params', async () => {
      await adminApi.getAllRefunds(TOKEN);
      assertCall('/admin/refunds', { token: TOKEN });
    });

    it('builds query with status filter', async () => {
      await adminApi.getAllRefunds(TOKEN, { status: 'pending' });
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('status=pending');
    });
  });

  // ── GDPR / Export / Delete ────────────────────────────────

  describe('exportUserData', () => {
    it('calls GET /admin/users/{id}/export', async () => {
      await adminApi.exportUserData(TOKEN, 'u1');
      assertCall('/admin/users/u1/export', { token: TOKEN });
    });
  });

  describe('deleteUserData', () => {
    it('sends DELETE with confirm and reason', async () => {
      await adminApi.deleteUserData(TOKEN, 'u1', 'GDPR request');
      assertCall('/admin/users/u1/data', {
        method: 'DELETE',
        body: { confirm: true, reason: 'GDPR request' },
        token: TOKEN,
      });
    });
  });

  // ── Bulk Email ────────────────────────────────────────────

  describe('sendBulkEmail', () => {
    it('sends POST with all filters', async () => {
      const data = {
        subject: 'Update',
        body: 'Hello!',
        plan_filter: 'pro',
        status_filter: 'active',
      };
      await adminApi.sendBulkEmail(TOKEN, data);
      assertCall('/admin/bulk-email', {
        method: 'POST',
        body: data,
        token: TOKEN,
      });
    });

    it('sends POST without optional filters', async () => {
      await adminApi.sendBulkEmail(TOKEN, { subject: 'Hi', body: 'World' });
      const [, config] = mockApiFetch.mock.calls[0];
      expect(config.body).toEqual({ subject: 'Hi', body: 'World' });
    });
  });

  // ── Broadcasts ────────────────────────────────────────────

  describe('listBroadcasts', () => {
    it('calls without params', async () => {
      await adminApi.listBroadcasts(TOKEN);
      assertCall('/admin/broadcasts', { token: TOKEN });
    });

    it('builds query from params object', async () => {
      await adminApi.listBroadcasts(TOKEN, { status: 'active', page: '2' });
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('status=active');
      expect(url).toContain('page=2');
    });
  });

  describe('getBroadcast', () => {
    it('calls GET /admin/broadcasts/{id}', async () => {
      await adminApi.getBroadcast(TOKEN, 'bc-1');
      assertCall('/admin/broadcasts/bc-1', { token: TOKEN });
    });
  });

  describe('createBroadcast', () => {
    it('sends POST with data', async () => {
      const data = { title: 'Maintenance', message: 'Downtime at 3am' };
      await adminApi.createBroadcast(TOKEN, data);
      assertCall('/admin/broadcasts', {
        method: 'POST',
        body: data,
        token: TOKEN,
      });
    });
  });

  describe('updateBroadcast', () => {
    it('sends PUT with data', async () => {
      await adminApi.updateBroadcast(TOKEN, 'bc-1', { title: 'Updated' });
      assertCall('/admin/broadcasts/bc-1', {
        method: 'PUT',
        body: { title: 'Updated' },
        token: TOKEN,
      });
    });
  });

  describe('deleteBroadcast', () => {
    it('sends DELETE', async () => {
      await adminApi.deleteBroadcast(TOKEN, 'bc-1');
      assertCall('/admin/broadcasts/bc-1', {
        method: 'DELETE',
        token: TOKEN,
      });
    });
  });

  // ── Security ──────────────────────────────────────────────

  describe('listSecurityEvents', () => {
    it('calls without params', async () => {
      await adminApi.listSecurityEvents(TOKEN);
      assertCall('/admin/security/events', { token: TOKEN });
    });

    it('builds query from params', async () => {
      await adminApi.listSecurityEvents(TOKEN, { severity: 'high', page: '1' });
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('severity=high');
      expect(url).toContain('page=1');
    });
  });

  describe('getSecurityStats', () => {
    it('calls GET /admin/security/stats', async () => {
      await adminApi.getSecurityStats(TOKEN);
      assertCall('/admin/security/stats', { token: TOKEN });
    });
  });

  describe('resolveSecurityEvent', () => {
    it('sends PUT to resolve', async () => {
      await adminApi.resolveSecurityEvent(TOKEN, 'evt-1');
      assertCall('/admin/security/events/evt-1/resolve', {
        method: 'PUT',
        token: TOKEN,
      });
    });
  });

  describe('resolveAllSecurityEvents', () => {
    it('sends POST with filters', async () => {
      await adminApi.resolveAllSecurityEvents(TOKEN, {
        event_type: 'brute_force',
        severity: 'high',
      });
      assertCall('/admin/security/resolve-all', {
        method: 'POST',
        body: { event_type: 'brute_force', severity: 'high' },
        token: TOKEN,
      });
    });
  });

  // ── IP Blocklist ──────────────────────────────────────────

  describe('listIpBlocklist', () => {
    it('calls without params', async () => {
      await adminApi.listIpBlocklist(TOKEN);
      assertCall('/admin/security/blocklist', { token: TOKEN });
    });

    it('builds query from params', async () => {
      await adminApi.listIpBlocklist(TOKEN, { page: '2' });
      const [url] = mockApiFetch.mock.calls[0];
      expect(url).toContain('page=2');
    });
  });

  describe('blockIp', () => {
    it('sends POST with IP data', async () => {
      const data = { ip_address: '1.2.3.4', reason: 'DDoS', expires_hours: 24 };
      await adminApi.blockIp(TOKEN, data);
      assertCall('/admin/security/blocklist', {
        method: 'POST',
        body: data,
        token: TOKEN,
      });
    });
  });

  describe('unblockIp', () => {
    it('sends DELETE', async () => {
      await adminApi.unblockIp(TOKEN, 'block-1');
      assertCall('/admin/security/blocklist/block-1', {
        method: 'DELETE',
        token: TOKEN,
      });
    });
  });

  describe('checkIpBlocked', () => {
    it('sends POST with IP to check', async () => {
      await adminApi.checkIpBlocked(TOKEN, '5.6.7.8');
      assertCall('/admin/security/blocklist/check', {
        method: 'POST',
        body: { ip_address: '5.6.7.8' },
        token: TOKEN,
      });
    });
  });
});
