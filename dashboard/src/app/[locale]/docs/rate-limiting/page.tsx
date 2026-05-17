import { useTranslations } from 'next-intl';
import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Rate Limiting',
  description: 'Understand how HookSniff rate limits API requests and webhook deliveries',
};

export default function RateLimitingPage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Rate Limiting</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        HookSniff rate limits API requests per account to protect the platform and ensure fair usage.
      </p>

      {/* How It Works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How Rate Limiting Works</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          HookSniff uses a <strong>sliding window</strong> algorithm. Each API key has a requests-per-minute limit based on your plan. When you exceed the limit, requests return <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">429 Too Many Requests</code>.
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Rate limits apply to all authenticated API endpoints. Health checks and public endpoints are not rate limited.
        </p>
      </section>

      {/* Plan Limits */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Plan Limits</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 mb-4">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Price</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Requests/min</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Webhooks/month</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Endpoints</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-medium">Developer</td><td className="px-4 py-3">$0</td><td className="px-4 py-3">100</td><td className="px-4 py-3">100/day</td><td className="px-4 py-3">5</td></tr>
              <tr><td className="px-4 py-3 font-medium">Startup</td><td className="px-4 py-3">$29/mo</td><td className="px-4 py-3">500</td><td className="px-4 py-3">30,000/day</td><td className="px-4 py-3">50</td></tr>
              <tr><td className="px-4 py-3 font-medium">Pro</td><td className="px-4 py-3">$49/mo</td><td className="px-4 py-3">1,000</td><td className="px-4 py-3">100,000/day</td><td className="px-4 py-3">500</td></tr>
              <tr><td className="px-4 py-3 font-medium">Enterprise</td><td className="px-4 py-3">Custom</td><td className="px-4 py-3">Custom</td><td className="px-4 py-3">Unlimited</td><td className="px-4 py-3">Unlimited</td></tr>
            </tbody>
          </table></div>
        </div>
        <p className="text-gray-600 dark:text-slate-400">
          Yearly billing: 20% discount. Overage pricing: Startup $0.003/event, Pro $0.0001/event.
        </p>
      </section>

      {/* Response Headers */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Rate Limit Headers</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Every API response includes rate limit headers:
        </p>
        <CodeBlock
          code={`X-RateLimit-Limit: 500          // Your plan's limit
X-RateLimit-Remaining: 487      // Remaining requests in window
X-RateLimit-Reset: 1705312260   // Unix timestamp when window resets`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4 mb-4">
          When rate limited (429), the response includes:
        </p>
        <CodeBlock
          code={`HTTP/1.1 429 Too Many Requests
Retry-After: 30                 // Seconds to wait before retrying

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 30 seconds."
  }
}`}
        />
      </section>

      {/* Handling 429 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Handling Rate Limits</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          When you receive a 429 response:
        </p>
        <ol className="space-y-3 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>1.</strong> Stop sending requests</li>
          <li><strong>2.</strong> Wait for the number of seconds in the <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">Retry-After</code> header</li>
          <li><strong>3.</strong> Resume with exponential backoff if retries continue</li>
        </ol>
        <CodeBlock
          code={`async function sendWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);

    if (response.status !== 429) return response;

    const retryAfter = parseInt(response.headers.get('Retry-After') || '30');
    console.log(\`Rate limited. Waiting \${retryAfter}s...\`);
    await new Promise(r => setTimeout(r, retryAfter * 1000));
  }
  throw new Error('Max retries exceeded');
}`}
        />
      </section>

      {/* Webhook Monthly Limits */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Monthly Webhook Limits</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Each plan has a monthly webhook delivery limit. This counts successful API calls to <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">POST /v1/webhooks</code>, not deliveries to endpoints.
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>Developer ($0):</strong> 1,000 webhooks/month — blocked at limit</li>
          <li><strong>Startup ($29/mo):</strong> 30,000 events/day — overage at $0.003/event</li>
          <li><strong>Pro ($49/mo):</strong> 100,000 events/day — overage at $0.0001/event</li>
          <li><strong>Enterprise (Custom):</strong> Unlimited events — custom pricing</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400">
          Check your current usage via the API: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">GET /v1/billing/usage</code>
        </p>
      </section>

      {/* Per-Endpoint Throttling */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Per-Endpoint Throttling</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          In addition to account-level rate limits, HookSniff supports per-endpoint throttling to protect your customers&apos; servers. This uses a token bucket or sliding window algorithm configured per endpoint.
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Per-endpoint throttling is useful when:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>A customer&apos;s server can only handle a certain number of webhooks per second</li>
          <li>You want to prevent burst traffic from overwhelming a slow endpoint</li>
          <li>You need different rate limits for different customers</li>
        </ul>
      </section>
    </article>
  );
}
