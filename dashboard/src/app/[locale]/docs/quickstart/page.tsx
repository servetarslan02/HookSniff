import { useTranslations } from 'next-intl';
import SdkTabs from '@/components/SdkTabs';
import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

// Revalidate every hour for ISR
export const revalidate = 3600;


export const metadata: Metadata = {
  title: 'Quickstart Guide',
  description: 'Get started with HookSniff in 5 minutes',
};


const quickstartTabs = [
  {
    label: 'Node.js',
    code: `import { HookSniff } from 'hooksniff-sdk';

const hr = new HookSniff({ apiKey: process.env.HOOKSNIFF_API_KEY! });

// 1. Create an endpoint
const endpoint = await hr.endpoints.create({
  url: 'https://myapp.com/webhook',
  description: 'Production webhook',
});

// 2. Send a webhook
const delivery = await hr.webhooks.send({
  endpointId: endpoint.id,
  event: 'order.created',
  data: { order_id: '12345', total: 99.99 },
});

console.log('Delivery ID:', delivery.id);`,
  },
  {
    label: 'Python',
    code: `import hooksniff, os

client = hooksniff.Client(api_key=os.environ["HOOKSNIFF_API_KEY"])

# 1. Create an endpoint
endpoint = client.endpoints.create(
    url="https://myapp.com/webhook",
    description="Production webhook"
)

# 2. Send a webhook
delivery = client.webhooks.send(
    endpoint_id=endpoint.id,
    event="order.created",
    data={"order_id": "12345", "total": 99.99}
)

print(f"Delivery ID: {delivery.id}")`,
  },
  {
    label: 'Go',
    code: `body := \`{"endpoint_id":"ep_abc123","event":"order.created","data":{"order_id":"12345","total":99.99}}\`
req, _ := http.NewRequest("POST",
    "https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks",
    strings.NewReader(body))
req.Header.Set("Authorization", "Bearer "+os.Getenv("HOOKSNIFF_API_KEY"))
req.Header.Set("Content-Type", "application/json")

resp, _ := http.DefaultClient.Do(req)
defer resp.Body.Close()`,
  },
  {
    label: 'curl',
    code: `curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint_id": "ep_abc123",
    "event": "order.created",
    "data": {"order_id": "12345", "total": 99.99}
  }'`,
  },
];

export default function QuickstartPage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('quickstart') || 'Quickstart'}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Send your first webhook in under 5 minutes. HookSniff handles delivery, retries, and monitoring.
      </p>

      {/* Step 1 */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Get Your API Key</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-3">
          Sign up at <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">hooksniff.vercel.app</code> and grab your API key from the dashboard settings. Keys are prefixed with <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">hr_live_</code>.
        </p>
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            <strong>⚠️ Keep your API key secret.</strong> Never expose it in client-side code or public repos. Use environment variables.
          </p>
        </div>
      </section>

      {/* Step 2 */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Create an Endpoint</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-3">
          An endpoint is a URL where webhooks will be delivered. Each endpoint gets a unique signing secret for verification.
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://myapp.com/webhook"}'`}
        />
      </section>

      {/* Step 3 - Tabbed SDK Examples */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Send a Webhook</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-3">
          Use the SDK or API to send webhook events to your endpoints.
        </p>
        <SdkTabs tabs={quickstartTabs} />
      </section>

      {/* Step 4 */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Verify Signatures</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-3">
          Every webhook includes an HMAC-SHA256 signature in the <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">X-HookSniff-Signature</code> header. Always verify it:
        </p>
        <CodeBlock
          code={`import hmac, hashlib

def verify_signature(payload: bytes, signature: str, secret: str) -> bool:
    expected = hmac.HMAC(
        secret.encode(), payload, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)`}
        />
      </section>

      {/* Step 5 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Monitor Deliveries</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-3">
          Check delivery status via the API or dashboard:
        </p>
        <CodeBlock
          code={`curl https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
      </section>
    </article>
  );
}
