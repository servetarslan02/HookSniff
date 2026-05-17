import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Error Codes',
  description: 'HookSniff API error codes reference',
};

export default function ErrorCodesPage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Error Codes</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Reference for all error codes returned by the HookSniff API.
      </p>

      {/* Error Format */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Response Format</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          All errors follow a consistent JSON structure:
        </p>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
{`{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid request body or parameters"
  }
}`}
        </pre>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          The <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">code</code> field is a machine-readable identifier. The <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">message</code> field is a human-readable description.
        </p>
      </section>

      {/* Error Codes Table */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">HTTP Status Codes</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Code</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Meaning</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Common Cause</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 font-mono">400</td>
                <td className="px-4 py-3 font-mono">BAD_REQUEST</td>
                <td className="px-4 py-3">Bad Request</td>
                <td className="px-4 py-3">Invalid JSON, missing required fields, or validation failure</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono">401</td>
                <td className="px-4 py-3 font-mono">UNAUTHORIZED</td>
                <td className="px-4 py-3">Unauthorized</td>
                <td className="px-4 py-3">Missing or invalid API key, expired JWT token</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono">403</td>
                <td className="px-4 py-3 font-mono">FORBIDDEN</td>
                <td className="px-4 py-3">Forbidden</td>
                <td className="px-4 py-3">Insufficient permissions, plan limit exceeded, or admin-only endpoint</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono">404</td>
                <td className="px-4 py-3 font-mono">NOT_FOUND</td>
                <td className="px-4 py-3">Not Found</td>
                <td className="px-4 py-3">Resource doesn&apos;t exist or doesn&apos;t belong to your account</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono">409</td>
                <td className="px-4 py-3 font-mono">CONFLICT</td>
                <td className="px-4 py-3">Conflict</td>
                <td className="px-4 py-3">Duplicate resource, idempotency key collision</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono">413</td>
                <td className="px-4 py-3 font-mono">PAYLOAD_TOO_LARGE</td>
                <td className="px-4 py-3">Payload Too Large</td>
                <td className="px-4 py-3">Request body exceeds 1 MB limit</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono">429</td>
                <td className="px-4 py-3 font-mono">RATE_LIMIT_EXCEEDED</td>
                <td className="px-4 py-3">Rate Limited</td>
                <td className="px-4 py-3">Too many requests — check Retry-After header</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-mono">500</td>
                <td className="px-4 py-3 font-mono">INTERNAL_ERROR</td>
                <td className="px-4 py-3">Internal Server Error</td>
                <td className="px-4 py-3">Unexpected error — contact support if persistent</td>
              </tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Common Errors */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Common Errors and Solutions</h2>

        <div className="space-y-6">
          <div className="p-5 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">401 UNAUTHORIZED</code>
            </h3>
            <p className="text-gray-600 dark:text-slate-400 mb-3">
              Your API key is missing, invalid, or expired.
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-500">
              <strong>Fix:</strong> Check that your Authorization header is <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">Bearer hr_live_...</code> and the key is active in your dashboard settings.
            </p>
          </div>

          <div className="p-5 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">400 BAD_REQUEST</code> — Invalid endpoint_id
            </h3>
            <p className="text-gray-600 dark:text-slate-400 mb-3">
              The endpoint ID doesn&apos;t exist or doesn&apos;t belong to your account.
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-500">
              <strong>Fix:</strong> List your endpoints with <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">GET /v1/endpoints</code> and use a valid ID.
            </p>
          </div>

          <div className="p-5 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">429 RATE_LIMIT_EXCEEDED</code>
            </h3>
            <p className="text-gray-600 dark:text-slate-400 mb-3">
              You&apos;ve exceeded your plan&apos;s requests-per-minute limit.
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-500">
              <strong>Fix:</strong> Wait for the <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">Retry-After</code> header duration, then retry with exponential backoff. Consider upgrading your plan if this happens frequently.
            </p>
          </div>

          <div className="p-5 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">403 FORBIDDEN</code> — Webhook limit exceeded
            </h3>
            <p className="text-gray-600 dark:text-slate-400 mb-3">
              You&apos;ve reached your plan&apos;s monthly webhook limit.
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-500">
              <strong>Fix:</strong> Check usage with <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">GET /v1/billing/usage</code>. Upgrade your plan or wait for the next billing period.
            </p>
          </div>

          <div className="p-5 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">413 PAYLOAD_TOO_LARGE</code>
            </h3>
            <p className="text-gray-600 dark:text-slate-400 mb-3">
              The webhook payload exceeds the 1 MB limit.
            </p>
            <p className="text-sm text-gray-500 dark:text-slate-500">
              <strong>Fix:</strong> Reduce payload size. Send only essential data. If you need to send large payloads, consider uploading to storage and including a URL in the webhook.
            </p>
          </div>
        </div>
      </section>

      {/* Idempotency Errors */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Idempotency Errors</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          When using the <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">Idempotency-Key</code> header:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>If the same key is used within 24 hours, the cached response is returned (not an error)</li>
          <li>If the same key is used with different parameters, a <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">409 CONFLICT</code> is returned</li>
          <li>Keys expire after 24 hours and can be safely reused</li>
        </ul>
      </section>
    </article>
  );
}
