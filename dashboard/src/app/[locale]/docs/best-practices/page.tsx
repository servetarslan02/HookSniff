import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Webhook Best Practices',
  description: 'Production patterns for sending and receiving webhooks',
};

export default async function BestPracticesPage() {
  const t = await getTranslations('docsBestPractices');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* For Producers */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('forProducers')}</h2>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('signPayload')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('signPayloadDesc')}
        </p>
        <CodeBlock
          code={`X-HookSniff-Signature: v1,base64(hmac_sha256(secret, payload))
X-HookSniff-Timestamp: 1705312200
X-HookSniff-Delivery-Id: wh_abc123`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4 mb-4">
          {t('neverResign')}
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('idempotencyKey')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('idempotencyKeyDesc')}
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
          {t('idempotencyKeyTip')}
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('payloadStability')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('payloadStabilityDesc')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-4">
          <div className="p-4 border border-green-200 dark:border-green-900/30 rounded-xl bg-green-50/50 dark:bg-green-900/10">
            <h4 className="text-sm font-semibold text-green-800 dark:text-green-400 mb-2">✅ {t('goodSelfContained')}</h4>
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
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">❌ {t('badFollowUp')}</h4>
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

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('eventNaming')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('eventNamingDesc')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.created</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.updated</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.cancelled</code></li>
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">payment.succeeded</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">payment.failed</code></li>
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">user.created</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">user.updated</code></li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400">
          {t('eventNamingTip')}
        </p>
      </section>

      {/* For Consumers */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('forConsumers')}</h2>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('verifyFirst')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('verifyFirstDesc')}
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
          {t('verifyFirstTip')}
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('respondFast')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('respondFastDesc')}
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
          {t('respondFastTip')}
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('handleDuplicates')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('handleDuplicatesDesc')}
        </p>
        <CodeBlock
          code={`CREATE TABLE processed_webhooks (
    delivery_id TEXT PRIMARY KEY,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Before processing, check if already processed
SELECT 1 FROM processed_webhooks WHERE delivery_id = $1;`}
        />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('httpsOnly')}</h3>
        <p className="text-gray-600 dark:text-slate-400">
          {t('httpsOnlyDesc')}
        </p>
      </section>

      {/* Monitoring */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('monitoring')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('monitoringDesc')}
        </p>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 mb-4">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Metrik</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('target')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('alertWhen')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3">{t('metricDeliveryRate')}</td><td className="px-4 py-3">&gt;99.5%</td><td className="px-4 py-3">&lt;99%</td></tr>
              <tr><td className="px-4 py-3">{t('metricLatency')}</td><td className="px-4 py-3">&lt;2s</td><td className="px-4 py-3">&gt;5s</td></tr>
              <tr><td className="px-4 py-3">{t('metricConsecutive')}</td><td className="px-4 py-3">0</td><td className="px-4 py-3">&gt;5</td></tr>
              <tr><td className="px-4 py-3">{t('metricDlqDepth')}</td><td className="px-4 py-3">0</td><td className="px-4 py-3">&gt;100</td></tr>
            </tbody>
          </table></div>
        </div>
        <p className="text-gray-600 dark:text-slate-400">
          {t('monitoringTip')}
        </p>
      </section>

      {/* Payload Design */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('payloadDesign')}</h2>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('consistentEnvelope')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('consistentEnvelopeDesc')}
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

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('timestampFormat')}</h3>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('timestampFormatDesc')}
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('versionEvents')}</h3>
        <p className="text-gray-600 dark:text-slate-400">
          {t('versionEventsDesc')}
        </p>
      </section>
    </article>
  );
}
