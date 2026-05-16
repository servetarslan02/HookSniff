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
