import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';

// Revalidate every hour for ISR
export const revalidate = 3600;


export const metadata: Metadata = {
  title: 'API Reference',
  description: 'Complete API reference for HookSniff webhook delivery service',
};


// Force SSR — SSG output was missing on Vercel for this page
export const dynamic = 'force-dynamic';

// Force redeploy — docs/api page fix
export default function ApiReferencePage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('apiReference')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Complete reference for the HookSniff REST API. Base URL: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">https://hooksniff-api-1046140057667.europe-west1.run.app/v1</code>
      </p>

      {/* Endpoints API */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('endpointsApi')}</h2>

        <ApiMethod
          method="GET"
          path="/endpoints"
          description={t('listEndpoints')}
          response={`[
  {
    "id": "ep_abc123",
    "url": "https://myapp.com/webhook",
    "description": "Order notifications",
    "is_active": true,
    "created_at": "2026-01-15T10:30:00Z"
  }
]`}
        />

        <ApiMethod
          method="POST"
          path="/endpoints"
          description={t('createEndpointApi')}
          request={`{
  "url": "https://myapp.com/webhook",
  "description": "Order notifications"  // optional
}`}
          response={`{
  "id": "ep_abc123",
  "url": "https://myapp.com/webhook",
  "description": "Order notifications",
  "signing_secret": "whsec_abc123xyz789...",
  "is_active": true,
  "created_at": "2026-01-15T10:30:00Z"
}`}
        />

        <ApiMethod
          method="DELETE"
          path="/endpoints/:id"
          description={t('deleteEndpointApi')}
          response={`{ "deleted": true }`}
        />

        <ApiMethod
          method="PUT"
          path="/endpoints/:id"
          description="Update an endpoint's URL, description, or event filter."
          request={`{
  "url": "https://myapp.com/webhook-v2",
  "description": "Updated endpoint",
  "is_active": true
}`}
          response={`{
  "id": "ep_abc123",
  "url": "https://myapp.com/webhook-v2",
  "description": "Updated endpoint",
  "is_active": true,
  "updated_at": "2026-01-16T10:00:00Z"
}`}
        />

        <ApiMethod
          method="POST"
          path="/endpoints/:id/rotate-secret"
          description="Rotate the signing secret. Old secret becomes invalid immediately."
          response={`{
  "id": "ep_abc123",
  "signing_secret": "whsec_NEW_SECRET_HERE..."
}`}
        />

        <ApiMethod
          method="PUT"
          path="/endpoints/:id/retry-policy"
          description="Configure per-endpoint retry policy."
          request={`{
  "max_attempts": 5,
  "base_delay_ms": 2000,
  "max_delay_ms": 600000,
  "multiplier": 2.0
}`}
          response={`{
  "id": "rp_abc123",
  "endpoint_id": "ep_abc123",
  "max_attempts": 5,
  "base_delay_ms": 2000,
  "max_delay_ms": 600000,
  "multiplier": 2.0,
  "schedule": [
    { "attempt": 1, "delay_ms": 2000, "delay_human": "2.0s" },
    { "attempt": 2, "delay_ms": 4000, "delay_human": "4.0s" },
    { "attempt": 3, "delay_ms": 8000, "delay_human": "8.0s" }
  ]
}`}
        />
      </section>

      {/* Webhooks API */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('webhooksApi')}</h2>

        <ApiMethod
          method="POST"
          path="/webhooks"
          description={t('sendWebhookApi')}
          request={`{
  "endpoint_id": "ep_abc123",
  "event": "order.created",       // optional
  "data": {                        // your payload
    "order_id": "12345",
    "total": 99.99
  }
}`}
          response={`{
  "id": "wh_xyz789",
  "endpoint_id": "ep_abc123",
  "event": "order.created",
  "status": "pending",
  "attempt_count": 0,
  "created_at": "2026-01-15T10:30:00Z"
}`}
        />

        <ApiMethod
          method="GET"
          path="/webhooks"
          description={t('listWebhooksApi')}
          request={`// Query Parameters:
// ?page=1          — page number
// ?per_page=20     — results per page
// ?status=delivered — filter by status
// ?event=order.created — filter by event type`}
          response={`{
  "deliveries": [
    {
      "id": "wh_xyz789",
      "endpoint_id": "ep_abc123",
      "event": "order.created",
      "status": "delivered",
      "attempt_count": 1,
      "response_status": 200,
      "created_at": "2026-01-15T10:30:00Z"
    }
  ],
  "total": 142,
  "page": 1,
  "per_page": 20
}`}
        />

        <ApiMethod
          method="GET"
          path="/webhooks/:id"
          description={t('getWebhookApi')}
          response={`{
  "id": "wh_xyz789",
  "endpoint_id": "ep_abc123",
  "event": "order.created",
  "status": "delivered",
  "attempt_count": 2,
  "response_status": 200,
  "attempts": [
    { "attempt": 1, "status": 500, "timestamp": "2026-01-15T10:30:00Z" },
    { "attempt": 2, "status": 200, "timestamp": "2026-01-15T10:35:00Z" }
  ],
  "created_at": "2026-01-15T10:30:00Z"
}`}
        />

        <ApiMethod
          method="POST"
          path="/webhooks/batch"
          description="Send multiple webhooks in a single request."
          request={`{
  "webhooks": [
    { "endpoint_id": "ep_abc123", "event": "order.created", "data": { "order_id": "1" } },
    { "endpoint_id": "ep_abc123", "event": "order.created", "data": { "order_id": "2" } }
  ]
}`}
          response={`{
  "results": [
    { "id": "wh_001", "status": "pending" },
    { "id": "wh_002", "status": "pending" }
  ]
}`}
        />

        <ApiMethod
          method="POST"
          path="/webhooks/:id/replay"
          description="Replay a failed or delivered webhook. Resets attempt counter."
          response={`{
  "id": "wh_replayed_001",
  "original_id": "wh_xyz789",
  "status": "pending"
}`}
        />

        <ApiMethod
          method="GET"
          path="/webhooks/:id/attempts"
          description="Get all delivery attempts for a webhook."
          response={`{
  "attempts": [
    {
      "attempt": 1,
      "status": 500,
      "response_body": "Internal Server Error",
      "duration_ms": 1234,
      "timestamp": "2026-01-15T10:30:00Z"
    },
    {
      "attempt": 2,
      "status": 200,
      "response_body": "OK",
      "duration_ms": 456,
      "timestamp": "2026-01-15T10:31:00Z"
    }
  ]
}`}
        />

        <ApiMethod
          method="GET"
          path="/webhooks/export"
          description="Export deliveries as CSV or JSON."
          request={`// Query Parameters:
// ?format=csv       — csv or json
// ?status=failed    — filter by status
// ?from=2026-01-01  — start date
// ?to=2026-01-31    — end date`}
          response={`// CSV format (downloadable file)
// id,endpoint_id,event,status,attempt_count,created_at
// wh_001,ep_abc123,order.created,delivered,1,2026-01-15T10:30:00Z`}
        />
      </section>

      {/* Stats API */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('statsApi')}</h2>

        <ApiMethod
          method="GET"
          path="/stats"
          description={t('getStatsApi')}
          response={`{
  "total_deliveries": 12847,
  "delivered": 12453,
  "failed": 127,
  "pending": 267,
  "success_rate": 96.93,
  "endpoints_count": 8
}`}
        />
      </section>

      {/* Auth API */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Authentication</h2>

        <ApiMethod
          method="POST"
          path="/auth/register"
          description="Create a new account."
          request={`{
  "email": "user@example.com",
  "password": "securepassword123"
}`}
          response={`{
  "token": "eyJhbGciOiJIUzI1...",
  "customer": { "id": "cust_abc123", "email": "user@example.com" }
}`}
        />

        <ApiMethod
          method="POST"
          path="/auth/login"
          description="Login and get JWT token."
          request={`{
  "email": "user@example.com",
  "password": "securepassword123"
}`}
          response={`{
  "token": "eyJhbGciOiJIUzI1...",
  "customer": { "id": "cust_abc123", "email": "user@example.com" }
}`}
        />

        <ApiMethod
          method="POST"
          path="/auth/forgot-password"
          description="Request a password reset email."
          request={`{ "email": "user@example.com" }`}
          response={`{ "message": "If the email exists, a reset link has been sent." }`}
        />

        <ApiMethod
          method="POST"
          path="/auth/reset-password"
          description="Reset password using the token from email."
          request={`{
  "token": "reset_token_from_email",
  "new_password": "newsecurepassword123"
}`}
          response={`{ "message": "Password reset successfully." }`}
        />

        <ApiMethod
          method="POST"
          path="/auth/verify-email"
          description="Verify email address using the token from verification email."
          request={`{ "token": "verification_token_from_email" }`}
          response={`{ "message": "Email verified successfully." }`}
        />

        <ApiMethod
          method="POST"
          path="/auth/2fa/enable"
          description="Enable two-factor authentication. Returns a TOTP secret."
          response={`{
  "secret": "JBSWY3DPEHPK3PXP",
  "otpauth_url": "otpauth://totp/HookSniff:user@example.com?secret=..."
}`}
        />

        <ApiMethod
          method="POST"
          path="/auth/2fa/verify"
          description="Verify 2FA code during login."
          request={`{ "code": "123456" }`}
          response={`{ "verified": true }`}
        />

        <ApiMethod
          method="GET"
          path="/auth/me"
          description="Get current user profile."
          response={`{
  "id": "cust_abc123",
  "email": "user@example.com",
  "plan": "developer",
  "two_factor_enabled": false,
  "created_at": "2026-01-15T10:00:00Z"
}`}
        />
      </section>

      {/* API Keys API */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">API Keys</h2>

        <ApiMethod
          method="GET"
          path="/api-keys"
          description="List all API keys for the authenticated account."
          response={`[
  {
    "id": "key_abc123",
    "name": "Production Key",
    "prefix": "hr_live_abc...",
    "created_at": "2026-01-15T10:00:00Z",
    "last_used_at": "2026-01-16T12:00:00Z"
  }
]`}
        />

        <ApiMethod
          method="POST"
          path="/api-keys"
          description="Create a new API key. The full key is only shown once."
          request={`{ "name": "Production Key" }`}
          response={`{
  "id": "key_abc123",
  "name": "Production Key",
  "key": "hr_live_FULL_KEY_SHOWN_ONCE...",
  "prefix": "hr_live_abc...",
  "created_at": "2026-01-15T10:00:00Z"
}`}
        />

        <ApiMethod
          method="DELETE"
          path="/api-keys/:id"
          description="Delete an API key. Immediately invalid."
          response={`{ "deleted": true }`}
        />

        <ApiMethod
          method="POST"
          path="/api-keys/:id/rotate"
          description="Rotate an API key. Old key becomes invalid immediately."
          response={`{
  "id": "key_abc123",
  "key": "hr_live_NEW_KEY_SHOWN_ONCE...",
  "prefix": "hr_live_def..."
}`}
        />
      </section>

      {/* Analytics API */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Analytics</h2>

        <ApiMethod
          method="GET"
          path="/analytics/deliveries"
          description="Get delivery trend data over time."
          request={`// Query Parameters:
// ?period=7d   — 1d, 7d, 30d, 90d`}
          response={`{
  "data": [
    { "date": "2026-01-15", "delivered": 1200, "failed": 12 },
    { "date": "2026-01-16", "delivered": 1350, "failed": 8 }
  ]
}`}
        />

        <ApiMethod
          method="GET"
          path="/analytics/success-rate"
          description="Get delivery success rate over time."
          response={`{
  "current": 96.93,
  "trend": [
    { "date": "2026-01-15", "rate": 97.2 },
    { "date": "2026-01-16", "rate": 96.5 }
  ]
}`}
        />

        <ApiMethod
          method="GET"
          path="/analytics/latency"
          description="Get delivery latency metrics."
          response={`{
  "avg_ms": 456,
  "p50_ms": 320,
  "p95_ms": 1200,
  "p99_ms": 3400
}`}
        />
      </section>

      {/* Alerts API */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Alerts</h2>

        <ApiMethod
          method="GET"
          path="/alerts"
          description="List all alert rules."
          response={`[
  {
    "id": "alert_abc123",
    "name": "High failure rate",
    "condition": "failure_rate > 10%",
    "is_active": true,
    "created_at": "2026-01-15T10:00:00Z"
  }
]`}
        />

        <ApiMethod
          method="POST"
          path="/alerts"
          description="Create a new alert rule."
          request={`{
  "name": "High failure rate",
  "condition": "failure_rate > 10%",
  "webhook_url": "https://myapp.com/alerts"
}`}
          response={`{
  "id": "alert_abc123",
  "name": "High failure rate",
  "condition": "failure_rate > 10%",
  "is_active": true
}`}
        />

        <ApiMethod
          method="POST"
          path="/alerts/:id/test"
          description="Send a test alert to verify configuration."
          response={`{ "sent": true }`}
        />
      </section>

      {/* Teams API */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Teams</h2>

        <ApiMethod
          method="GET"
          path="/teams"
          description="List all teams."
          response={`[
  {
    "id": "team_abc123",
    "name": "Engineering",
    "member_count": 3,
    "created_at": "2026-01-15T10:00:00Z"
  }
]`}
        />

        <ApiMethod
          method="POST"
          path="/teams"
          description="Create a new team."
          request={`{ "name": "Engineering" }`}
          response={`{
  "id": "team_abc123",
  "name": "Engineering",
  "member_count": 1
}`}
        />

        <ApiMethod
          method="POST"
          path="/teams/:id/invite"
          description="Invite a member to the team."
          request={`{
  "email": "colleague@example.com",
  "role": "member"
}`}
          response={`{
  "invite_id": "inv_abc123",
  "email": "colleague@example.com",
  "status": "pending"
}`}
        />

        <ApiMethod
          method="PUT"
          path="/teams/:id/members/:uid/role"
          description="Change a team member's role."
          request={`{ "role": "admin" }`}
          response={`{ "updated": true }`}
        />
      </section>

      {/* Search API */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Search</h2>

        <ApiMethod
          method="GET"
          path="/search"
          description="Search webhook deliveries by event type, status, endpoint, or date range."
          request={`// Query Parameters:
// ?q=order               — search term
// ?status=failed         — filter by status
// ?endpoint_id=ep_abc123 — filter by endpoint
// ?from=2026-01-01       — start date
// ?to=2026-01-31         — end date
// ?page=1&per_page=20    — pagination`}
          response={`{
  "results": [
    {
      "id": "wh_xyz789",
      "event": "order.created",
      "status": "failed",
      "endpoint_id": "ep_abc123",
      "created_at": "2026-01-15T10:30:00Z"
    }
  ],
  "total": 42,
  "page": 1
}`}
        />
      </section>

      {/* Inbound Webhooks API */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Inbound Webhooks</h2>

        <ApiMethod
          method="POST"
          path="/inbound/configs"
          description="Create an inbound webhook configuration for receiving webhooks from external providers."
          request={`{
  "provider": "github",
  "endpoint_id": "ep_abc123",
  "secret": "webhook_secret_from_provider"
}`}
          response={`{
  "id": "inbound_abc123",
  "provider": "github",
  "inbound_url": "https://hooksniff-api.../v1/inbound/github",
  "endpoint_id": "ep_abc123"
}`}
        />

        <ApiMethod
          method="POST"
          path="/inbound/:provider"
          description="Receive an inbound webhook from an external provider (Stripe, GitHub, Shopify). Automatically routes to configured endpoint."
          request={`// Provider-specific payload (e.g., GitHub push event)
// Headers: X-GitHub-Event, X-Hub-Signature-256`}
          response={`{
  "received": true,
  "delivery_id": "wh_inbound_001"
}`}
        />
      </section>

      {/* Billing API */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Billing</h2>

        <ApiMethod
          method="GET"
          path="/billing/usage"
          description="Get current billing period usage."
          response={`{
  "plan": "startup",
  "webhooks_used": 5432,
  "webhooks_limit": 10000,
  "endpoints_used": 8,
  "endpoints_limit": 20,
  "period_start": "2026-01-01T00:00:00Z",
  "period_end": "2026-01-31T23:59:59Z"
}`}
        />

        <ApiMethod
          method="POST"
          path="/billing/upgrade"
          description="Upgrade to a different plan."
          request={`{ "plan": "pro" }`}
          response={`{
  "checkout_url": "https://polar.sh/checkout/...",
  "plan": "pro"
}`}
        />

        <ApiMethod
          method="POST"
          path="/billing/portal"
          description="Open the billing management portal."
          response={`{
  "url": "https://polar.sh/portal/..."
}`}
        />
      </section>

      {/* Environments API */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Environments</h2>

        <ApiMethod
          method="GET"
          path="/environments"
          description="List all environments (dev, staging, production)."
          response={`[
  {
    "id": "env_abc123",
    "name": "production",
    "variables": { "WEBHOOK_URL": "https://api.example.com" }
  }
]`}
        />

        <ApiMethod
          method="POST"
          path="/environments"
          description="Create a new environment."
          request={`{ "name": "staging" }`}
          response={`{
  "id": "env_def456",
  "name": "staging",
  "variables": {}
}`}
        />

        <ApiMethod
          method="GET"
          path="/environments/:id/variables"
          description="List variables for an environment."
          response={`[
  { "key": "WEBHOOK_URL", "value": "https://api.example.com" },
  { "key": "API_KEY", "value": "hr_live_..." }
]`}
        />
      </section>

      {/* Error Codes */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('errorCodes')}</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('errorCodes.code')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('errorCodes.meaning')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('errorCodes.description')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono">400</td><td className="px-4 py-3">{t('errorCodes.badRequest')}</td><td className="px-4 py-3">{t('errorCodes.invalidBody')}</td></tr>
              <tr><td className="px-4 py-3 font-mono">401</td><td className="px-4 py-3">{t('errorCodes.unauthorized')}</td><td className="px-4 py-3">{t('errorCodes.missingKey')}</td></tr>
              <tr><td className="px-4 py-3 font-mono">403</td><td className="px-4 py-3">{t('errorCodes.forbidden')}</td><td className="px-4 py-3">{t('errorCodes.insufficient')}</td></tr>
              <tr><td className="px-4 py-3 font-mono">404</td><td className="px-4 py-3">{t('errorCodes.notFound')}</td><td className="px-4 py-3">{t('errorCodes.notFoundDesc')}</td></tr>
              <tr><td className="px-4 py-3 font-mono">429</td><td className="px-4 py-3">{t('errorCodes.rateLimited')}</td><td className="px-4 py-3">Too many requests — check Retry-After header</td></tr>
              <tr><td className="px-4 py-3 font-mono">500</td><td className="px-4 py-3">{t('errorCodes.serverError')}</td><td className="px-4 py-3">Internal error — contact support if persistent</td></tr>
            </tbody>
          </table></div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-950 rounded-xl">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('errorFormat')}</h3>
          <pre className="text-sm font-mono text-gray-700 dark:text-slate-300 overflow-x-auto">
{`{
  "error": {
    "code": "rate_limited",
    "message": "Rate limit exceeded. Try again in 30 seconds."
  }
}`}
          </pre>
        </div>
      </section>
    </article>
  );
}

function ApiMethod({
  method,
  path,
  description,
  request,
  response,
}: {
  method: string;
  path: string;
  description: string;
  request?: string;
  response: string;
}) {
  const t = useTranslations('docs');
  const methodColors: Record<string, string> = {
    GET: 'bg-green-100 text-green-800',
    POST: 'bg-blue-100 text-blue-800',
    DELETE: 'bg-red-100 text-red-800',
    PUT: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className="mb-8 p-6 border border-gray-200 dark:border-slate-700 rounded-xl">
      <div className="flex items-center gap-3 mb-3">
        <span className={`px-2 py-0.5 rounded-sm text-xs font-bold ${methodColors[method] || ''}`}>
          {method}
        </span>
        <code className="font-mono text-sm text-gray-900 dark:text-white">{path}</code>
      </div>
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">{description}</p>
      {request && (
        <div className="mb-3">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-2">{t('request')}</h4>
          <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
            {request}
          </pre>
        </div>
      )}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-2">{t('response')}</h4>
        <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
          {response}
        </pre>
      </div>
    </div>
  );
}
