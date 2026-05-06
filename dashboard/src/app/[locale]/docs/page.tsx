import { useTranslations } from 'next-intl';

export default function DocsPage() {
  const t = useTranslations('docs');
  const tc = useTranslations('common');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('gettingStarted')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Send your first webhook in under 5 minutes. Hookrelay handles delivery, retries, and monitoring so you can focus on building.
      </p>

      {/* Quick Start */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('quickStart')}</h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('getApiKey')}</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-3">
              Sign up at <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm">hookrelay.io</code> and grab your API key from the dashboard settings.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('createEndpoint')}</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-3">{t('createEndpointDesc')}</p>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
{`curl -X POST https://api.hookrelay.io/v1/endpoints \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://myapp.com/webhook"}'`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('sendWebhook')}</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
{`curl -X POST https://api.hookrelay.io/v1/webhooks \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint_id": "ep_abc123",
    "event": "order.created",
    "data": {"order_id": "12345", "total": 99.99}
  }'`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('verifySignature')}</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-3">Every webhook includes an HMAC-SHA256 signature in the <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm">X-Hookrelay-Signature</code> header:</p>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
{`import hmac, hashlib

def verify_signature(payload: bytes, signature: str, secret: str) -> bool:
    expected = hmac.HMAC(
        secret.encode(), payload, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)`}
            </pre>
          </div>
        </div>
      </section>

      {/* Authentication */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('authentication')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          All API requests require authentication via a Bearer token in the Authorization header:
        </p>
        <pre className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 p-4 rounded-xl text-sm font-mono">
{`Authorization: Bearer hr_live_abc123xyz789`}
        </pre>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <p className="text-sm text-yellow-800">
            <strong>⚠️ Keep your API key secret.</strong> Never expose it in client-side code, public repos, or browser requests. Use environment variables.
          </p>
        </div>
      </section>

      {/* Code Examples */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('codeExamples')}</h2>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Node.js</h3>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto mb-6">
{`const response = await fetch('https://api.hookrelay.io/v1/webhooks', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.HOOKRELAY_KEY}\`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    endpoint_id: 'ep_abc123',
    event: 'user.created',
    data: { email: 'user@example.com' },
  }),
});

const result = await response.json();
console.log('Delivery ID:', result.id);`}
        </pre>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Python</h3>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto mb-6">
{`import requests
import os

response = requests.post(
    'https://api.hookrelay.io/v1/webhooks',
    headers={
        'Authorization': f'Bearer {os.environ["HOOKRELAY_KEY"]}',
        'Content-Type': 'application/json',
    },
    json={
        'endpoint_id': 'ep_abc123',
        'event': 'payment.completed',
        'data': {'amount': 49.99, 'currency': 'USD'},
    },
)

print('Delivery ID:', response.json()['id'])`}
        </pre>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Go</h3>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
{`body := \`{"endpoint_id":"ep_abc123","event":"order.shipped","data":{"tracking":"1Z999"}}\`
req, _ := http.NewRequest("POST", "https://api.hookrelay.io/v1/webhooks", strings.NewReader(body))
req.Header.Set("Authorization", "Bearer "+os.Getenv("HOOKRELAY_KEY"))
req.Header.Set("Content-Type", "application/json")

resp, _ := http.DefaultClient.Do(req)
defer resp.Body.Close()`}
        </pre>
      </section>

      {/* Rate Limits */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('rateLimits')}</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('requestsPerMin')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('webhooksPerMonth')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3">Free</td><td className="px-4 py-3">100</td><td className="px-4 py-3">1,000</td></tr>
              <tr><td className="px-4 py-3">Pro</td><td className="px-4 py-3">1,000</td><td className="px-4 py-3">50,000</td></tr>
              <tr><td className="px-4 py-3">Business</td><td className="px-4 py-3">10,000</td><td className="px-4 py-3">500,000</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}
