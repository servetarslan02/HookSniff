import CodeBlock from '@/components/CodeBlock';

export default function IntegrationsPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Integration Guides</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Connect HookSniff with popular platforms. Use our inbound proxy to receive webhooks from third-party services, or send webhooks to your own endpoints.
      </p>

      {/* Stripe */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Stripe Webhooks</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Forward Stripe webhook events through HookSniff for reliable delivery and monitoring:
        </p>
        <ol className="space-y-3 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>1.</strong> Create an endpoint in HookSniff pointing to your server</li>
          <li><strong>2.</strong> In Stripe Dashboard → Developers → Webhooks, set the endpoint URL to your HookSniff inbound proxy</li>
          <li><strong>3.</strong> Select the events you want to receive (e.g., <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm">payment_intent.succeeded</code>)</li>
          <li><strong>4.</strong> Verify Stripe's signature in your handler alongside HookSniff's signature</li>
        </ol>
        <CodeBlock
          code={`// Your server receives webhooks from HookSniff
// Verify both HookSniff AND Stripe signatures
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  // 1. Verify HookSniff signature
  const hooksniffSig = req.headers['webhook-signature'];
  if (!verifyHookSniffSignature(req.body, hooksniffSig, 'whsec_your_secret')) {
    return res.status(401).send('Invalid HookSniff signature');
  }

  // 2. Verify Stripe signature
  const stripeSig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, stripeSig, 'whsec_stripe_secret');

  // 3. Process the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      handlePayment(event.data.object);
      break;
  }

  res.status(200).json({ received: true });
});`}
        />
      </section>

      {/* GitHub */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">GitHub Webhooks</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Route GitHub webhook events through HookSniff for reliable delivery:
        </p>
        <ol className="space-y-3 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>1.</strong> Create a HookSniff endpoint for your GitHub webhook receiver</li>
          <li><strong>2.</strong> In GitHub repo → Settings → Webhooks → Add webhook</li>
          <li><strong>3.</strong> Set Payload URL to your HookSniff inbound proxy URL</li>
          <li><strong>4.</strong> Set Content type to <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm">application/json</code></li>
          <li><strong>5.</strong> Enter your secret and select events</li>
        </ol>
        <CodeBlock
          code={`// Verify GitHub webhook signature
function verifyGitHubSignature(payload: string, signature: string, secret: string): boolean {
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}`}
        />
      </section>

      {/* Shopify */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Shopify Webhooks</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Forward Shopify webhook events for order tracking, inventory management, and more:
        </p>
        <ol className="space-y-3 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>1.</strong> Create a HookSniff endpoint for your Shopify webhook handler</li>
          <li><strong>2.</strong> In Shopify Admin → Settings → Notifications → Webhooks</li>
          <li><strong>3.</strong> Set the URL to your HookSniff inbound proxy</li>
          <li><strong>4.</strong> Choose events (e.g., <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm">orders/create</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm">inventory_levels/update</code>)</li>
          <li><strong>5.</strong> Verify the HMAC header (<code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm">X-Shopify-Hmac-SHA256</code>)</li>
        </ol>
      </section>

      {/* Generic Receiver */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Generic Webhook Receiver</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Build a universal webhook receiver that works with any provider:
        </p>
        <CodeBlock
          code={`import express from 'express';
import { HookSniff } from '@hooksniff/sdk';

const app = express();
const hr = new HookSniff({ apiKey: process.env.HOOKRELAY_KEY! });

app.post('/webhooks/:provider', express.raw({ type: 'application/json' }), async (req, res) => {
  const provider = req.params.provider;
  const payload = JSON.parse(req.body);

  // Normalize the event based on provider
  const normalized = normalizeEvent(provider, payload);

  // Forward through HookSniff
  const delivery = await hr.webhooks.send({
    endpointId: 'ep_abc123',
    event: normalized.type,
    data: normalized.data,
  });

  res.status(200).json({ deliveryId: delivery.id });
});

function normalizeEvent(provider: string, payload: any) {
  switch (provider) {
    case 'stripe':
      return { type: payload.type, data: payload.data.object };
    case 'github':
      return { type: payload.event, data: payload.body };
    case 'shopify':
      return { type: payload.topic, data: payload };
    default:
      return { type: 'unknown.event', data: payload };
  }
}`}
        />
      </section>

      {/* Inbound Proxy */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Inbound Proxy</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Use HookSniff's inbound proxy to receive webhooks from third-party services. The proxy:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>Accepts incoming webhooks on your behalf</li>
          <li>Validates payloads and logs delivery attempts</li>
          <li>Forwards to your actual endpoint with HookSniff's signature</li>
          <li>Provides retry logic and monitoring for inbound webhooks</li>
        </ul>
      </section>
    </article>
  );
}
