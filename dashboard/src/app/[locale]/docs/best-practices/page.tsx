import { useTranslations } from 'next-intl';
import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Webhook Best Practices',
  description: 'Production patterns for sending and receiving webhooks',
};

export default function BestPracticesPage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Webhook Best Practices</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Production patterns for both sides of a webhook integration: the producer (sender) and the consumer (receiver).
      </p>

      {/* For Producers */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">For Producers (Sending Webhooks)</h2>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Sign Every Payload</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Every outgoing webhook should include an HMAC-SHA256 signature in the headers. This lets consumers verify the payload hasn&apos;t been tampered with. HookSniff does this automatically — every delivery is signed with the endpoint&apos;s signing secret.
        </p>
        <CodeBlock
          code={`X-HookSniff-Signature: v1,base64(hmac_sha256(secret, payload))
X-HookSniff-Timestamp: 1705312200
X-HookSniff-Delivery-Id: wh_abc123`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4 mb-4">
          Never sign a re-serialized version of the payload. Byte differences will break verification. Use the raw request body.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Include an Idempotency Key</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Add a unique identifier to each event so consumers can deduplicate:
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Idempotency-Key: order-12345-created" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint_id": "ep_abc123",
    "event": "order.created",
    "data": {
      "order_id": "12345",
      "total": 99.99,
      "currency": "USD"
    }
  }'`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          Use business logic identifiers (e.g., <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order-{'{id}'}-created</code>), not random UUIDs. This ensures the same operation always produces the same key.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Design Payloads for Stability</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Keep payloads self-contained. Include all the data the consumer needs rather than forcing them to make API calls back to you.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-4">
          <div className="p-4 border border-green-200 dark:border-green-900/30 rounded-xl bg-green-50/50 dark:bg-green-900/10">
            <h4 className="text-sm font-semibold text-green-800 dark:text-green-400 mb-2">✅ Good — Self-contained</h4>
            <pre className="text-xs font-mono text-green-700 dark:text-green-300 overflow-x-auto">
{`{
  "event": "order.shipped",
  "data": {
    "order_id": "ord_123",
    "tracking_number": "1Z999AA10123456784",
    "carrier": "ups",
    "shipped_at": "2026-01-15T14:00:00Z"
  }
}`}
            </pre>
          </div>
          <div className="p-4 border border-red-200 dark:border-red-900/30 rounded-xl bg-red-50/50 dark:bg-red-900/10">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">❌ Bad — Requires follow-up call</h4>
            <pre className="text-xs font-mono text-red-700 dark:text-red-300 overflow-x-auto">
{`{
  "event": "order.shipped",
  "data": {
    "order_id": "ord_123"
  }
}`}
            </pre>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Use Consistent Event Type Naming</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Use <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">resource.action</code> format with dot separators:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.created</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.updated</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.cancelled</code></li>
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">payment.succeeded</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">payment.failed</code></li>
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">user.created</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">user.updated</code></li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400">
          Be specific: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">invoice.payment_failed</code> is better than <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">invoice.error</code>.
        </p>
      </section>

      {/* For Consumers */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">For Consumers (Receiving Webhooks)</h2>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Verify Signatures First</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Before processing any webhook, verify the HMAC signature. Reject requests with missing or invalid signatures immediately.
        </p>
        <CodeBlock
          code={`import hmac, hashlib

def verify_signature(payload: bytes, signature_header: str, secret: str) -> bool:
    parts = signature_header.split(',')
    if len(parts) != 2 or parts[0] != 'v1':
        return False
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).digest()
    import base64
    expected_b64 = base64.b64encode(expected).decode()
    return hmac.compare_digest(parts[1], expected_b64)`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          Use constant-time comparison (<code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">hmac.compare_digest</code>) to prevent timing attacks.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Respond Fast, Process Later</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Return a <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">200 OK</code> within 5 seconds. Do the actual processing asynchronously:
        </p>
        <CodeBlock
          code={`app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  // 1. Verify signature (fast)
  if (!verifySignature(req.body, req.headers['x-hooksniff-signature'], secret)) {
    return res.status(401).send('Invalid signature');
  }

  // 2. Respond immediately
  res.status(200).json({ received: true });

  // 3. Process asynchronously
  processWebhookAsync(JSON.parse(req.body));
});`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          If your endpoint takes too long, HookSniff may time out and retry, leading to duplicate processing.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Handle Duplicates</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Webhooks can be delivered more than once. Track processed delivery IDs:
        </p>
        <CodeBlock
          code={`CREATE TABLE processed_webhooks (
    delivery_id TEXT PRIMARY KEY,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Before processing, check if already processed
SELECT 1 FROM processed_webhooks WHERE delivery_id = $1;`}
        />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Use HTTPS Only</h3>
        <p className="text-gray-600 dark:text-slate-400">
          Always expose webhook endpoints over HTTPS. HookSniff only delivers to HTTPS endpoints by default. HTTP endpoints are rejected unless explicitly allowed.
        </p>
      </section>

      {/* Monitoring */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Monitoring and Alerting</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Track these metrics to catch issues early:
        </p>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 mb-4">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Metric</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Target</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Alert When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3">Delivery success rate</td><td className="px-4 py-3">&gt;99.5%</td><td className="px-4 py-3">&lt;99%</td></tr>
              <tr><td className="px-4 py-3">P95 delivery latency</td><td className="px-4 py-3">&lt;2s</td><td className="px-4 py-3">&gt;5s</td></tr>
              <tr><td className="px-4 py-3">Consecutive failures per endpoint</td><td className="px-4 py-3">0</td><td className="px-4 py-3">&gt;5</td></tr>
              <tr><td className="px-4 py-3">DLQ depth</td><td className="px-4 py-3">0</td><td className="px-4 py-3">&gt;100</td></tr>
            </tbody>
          </table></div>
        </div>
        <p className="text-gray-600 dark:text-slate-400">
          Use HookSniff&apos;s built-in alerts to get notified when these thresholds are crossed. See <a href="/docs/dashboard" className="text-brand-600 hover:text-brand-700">Dashboard Guide</a> for alert configuration.
        </p>
      </section>

      {/* Payload Design */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payload Design Guidelines</h2>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Use a Consistent Envelope</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Every event should follow the same top-level structure:
        </p>
        <CodeBlock
          code={`{
  "event": "order.created",
  "data": {
    "order_id": "12345",
    "total": 99.99,
    "currency": "USD",
    "items": [...]
  },
  "timestamp": "2026-01-15T10:30:00Z"
}`}
        />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Timestamp Format</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Always use ISO 8601 with timezone: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">2026-01-15T10:30:00Z</code>. Never use Unix timestamps in payloads — they are harder to read when debugging.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Version Your Events</h3>
        <p className="text-gray-600 dark:text-slate-400">
          When you change payload shapes, include a version in the event type or payload. Support old versions for at least 6 months after announcing deprecation. Example: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.created.v2</code>.
        </p>
      </section>
    </article>
  );
}
