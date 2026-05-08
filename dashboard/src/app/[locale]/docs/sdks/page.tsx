import { useTranslations } from 'next-intl';

export default function SdksPage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('sdks')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Official SDKs for Python and Node.js. Install via your package manager and start sending webhooks in seconds.
      </p>

      {/* Python SDK */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🐍</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Python SDK</h2>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('installation')}</h3>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono mb-6">
{`pip install hooksniff`}
        </pre>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('quickStartSdk')}</h3>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto mb-6">
{`import hooksniff
import os

# Initialize the client
client = hooksniff.Client(api_key=os.environ["HOOKRELAY_KEY"])

# Create an endpoint
endpoint = client.endpoints.create(
    url="https://myapp.com/webhook",
    description="Production webhook"
)
print(f"Endpoint ID: {endpoint.id}")
print(f"Signing Secret: {endpoint.signing_secret}")

# Send a webhook
delivery = client.webhooks.send(
    endpoint_id=endpoint.id,
    event="order.created",
    data={
        "order_id": "12345",
        "total": 99.99,
        "currency": "USD",
    }
)
print(f"Delivery ID: {delivery.id}")
print(f"Status: {delivery.status}")`}
        </pre>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('verifySignatures')}</h3>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto mb-6">
{`from flask import Flask, request, abort
import hooksniff

app = Flask(__name__)

@app.route("/webhook", methods=["POST"])
def handle_webhook():
    signature = request.headers.get("X-HookSniff-Signature")
    if not hooksniff.verify_signature(
        payload=request.data,
        signature=signature,
        secret="whsec_your_signing_secret"
    ):
        abort(401)

    event = request.json
    print(f"Received: {event['event']}")
    return "", 200`}
        </pre>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('errorHandling')}</h3>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
{`import hooksniff

try:
    delivery = client.webhooks.send(
        endpoint_id="ep_abc123",
        event="test.event",
        data={"test": True}
    )
except hooksniff.RateLimitError as e:
    print(f"Rate limited. Retry after {e.retry_after}s")
except hooksniff.AuthenticationError:
    print("Invalid API key")
except hooksniff.HookSniffError as e:
    print(f"Error: {e.message}")`}
        </pre>
      </section>

      {/* Node.js SDK */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">📦</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Node.js SDK</h2>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Installation</h3>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono mb-6">
{`npm install @hooksniff/sdk`}
        </pre>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Start</h3>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto mb-6">
{`import { HookSniff } from '@hooksniff/sdk';

const hr = new HookSniff({ apiKey: process.env.HOOKRELAY_KEY! });

// Create an endpoint
const endpoint = await hr.endpoints.create({
  url: 'https://myapp.com/webhook',
  description: 'Production webhook',
});
console.log('Endpoint:', endpoint.id);
console.log('Secret:', endpoint.signing_secret);

// Send a webhook
const delivery = await hr.webhooks.send({
  endpointId: endpoint.id,
  event: 'order.created',
  data: {
    order_id: '12345',
    total: 99.99,
    currency: 'USD',
  },
});
console.log('Delivery:', delivery.id, delivery.status);`}
        </pre>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('verifySignatures')}</h3>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto mb-6">
{`import express from 'express';
import { verifySignature } from '@hooksniff/sdk';
import { useTranslations } from 'next-intl';

const app = express();

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-hooksniff-signature'] as string;

  if (!verifySignature(req.body, signature, 'whsec_your_secret')) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(req.body);
  console.log('Received:', event.event);
  res.status(200).send('OK');
});`}
        </pre>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('typescriptSupport')}</h3>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
{`import type { Endpoint, Delivery, WebhookEvent } from '@hooksniff/sdk';

// Full type safety for all API responses
const endpoints: Endpoint[] = await hr.endpoints.list();
const delivery: Delivery = await hr.webhooks.send({
  endpointId: 'ep_abc123',
  event: 'user.created',
  data: { email: 'user@example.com' } satisfies WebhookEvent,
});`}
        </pre>
      </section>

      {/* Community SDKs */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('communitySdks')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Community-maintained SDKs are available for other languages. These are not officially supported but are actively maintained.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { lang: 'Go', pkg: 'github.com/hooksniff/hooksniff-go', status: 'Stable' },
            { lang: 'Ruby', pkg: 'gem install hooksniff', status: 'Beta' },
            { lang: 'PHP', pkg: 'composer require hooksniff/hooksniff-php', status: 'Beta' },
            { lang: 'Rust', pkg: 'cargo add hooksniff', status: 'Alpha' },
          ].map((sdk) => (
            <div key={sdk.lang} className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 dark:text-white">{sdk.lang}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  sdk.status === 'Stable' ? 'bg-green-50 text-green-700' :
                  sdk.status === 'Beta' ? 'bg-yellow-50 text-yellow-700' :
                  'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400'
                }`}>
                  {sdk.status}
                </span>
              </div>
              <code className="text-xs font-mono text-gray-600 dark:text-slate-400">{sdk.pkg}</code>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
