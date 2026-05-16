import { useTranslations } from 'next-intl';
import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

// Revalidate every hour for ISR
export const revalidate = 3600;


export const metadata: Metadata = {
  title: 'Core Concepts',
  description: "Learn the core concepts behind HookSniff's webhook delivery system",
};


export default function ConceptsPage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t("concepts")}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Understand the fundamental building blocks of HookSniff.
      </p>

      {/* Endpoints */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("endpoints")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          An <strong>endpoint</strong> represents a URL where webhook payloads are delivered. Each endpoint has:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>URL</strong> — The target URL that receives webhook POST requests</li>
          <li><strong>{t("events")}</strong> — Optional event filter (e.g., only deliver <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.created</code> events)</li>
          <li><strong>{t("signingSecret")}</strong> — HMAC-SHA256 secret for payload verification (<code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">whsec_</code> prefix)</li>
          <li><strong>{t("status")}</strong> — Active or inactive; inactive endpoints skip delivery</li>
        </ul>
        <CodeBlock
          code={`{
  "id": "ep_abc123",
  "url": "https://myapp.com/webhook",
  "description": "Order notifications",
  "signing_secret": "whsec_abc123xyz789...",
  "is_active": true,
  "event_filter": "order.*",
  "created_at": "2026-01-15T10:30:00Z"
}`}
        />
      </section>

      {/* Webhooks & Deliveries */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Webhooks & Deliveries</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          A <strong>webhook</strong> is an event you send via the API. A <strong>delivery</strong> is the attempt to deliver that webhook to an endpoint.
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>{t("eventTypes")}</strong> — String identifiers like <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.created</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">user.updated</code></li>
          <li><strong>{t("payloads")}</strong> — JSON data sent as the request body</li>
          <li><strong>{t("deliveryStatus")}</strong> — <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">pending</code>, <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">delivered</code>, or <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">failed</code></li>
          <li><strong>{t("attemptTracking")}</strong> — Each delivery attempt is recorded with status code, response body, and duration</li>
        </ul>
      </section>

      {/* Retries */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("retries")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Failed deliveries are automatically retried using <strong>exponential backoff with jitter</strong>. The default schedule:
        </p>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 mb-4">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t("attempt")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t("delay")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t("cumulative")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3">1</td><td className="px-4 py-3">{t("immediate")}</td><td className="px-4 py-3">0</td></tr>
              <tr><td className="px-4 py-3">2</td><td className="px-4 py-3">10 seconds</td><td className="px-4 py-3">10s</td></tr>
              <tr><td className="px-4 py-3">3</td><td className="px-4 py-3">30 seconds</td><td className="px-4 py-3">40s</td></tr>
              <tr><td className="px-4 py-3">4</td><td className="px-4 py-3">2 minutes</td><td className="px-4 py-3">~2.5m</td></tr>
              <tr><td className="px-4 py-3">5</td><td className="px-4 py-3">10 minutes</td><td className="px-4 py-3">~12.5m</td></tr>
              <tr><td className="px-4 py-3">6</td><td className="px-4 py-3">30 minutes</td><td className="px-4 py-3">~42.5m</td></tr>
            </tbody>
          </table></div>
        </div>
        <p className="text-gray-600 dark:text-slate-400">
          After <strong>6 failed attempts</strong>, the delivery is marked as failed and moved to the Dead Letter Queue. See <a href="/docs/retries" className="text-brand-600 hover:text-brand-700">Retries & DLQ</a> for details.
        </p>
      </section>

      {/* Dead Letter Queue */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Dead Letter Queue (DLQ)</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          When a delivery exhausts all retry attempts, it's preserved in the <strong>{t("deadLetterQueue")}</strong>. DLQ entries include:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>{t("originalPayload")}</li>
          <li>{t("allAttempts")}</li>
          <li>Ability to <strong>replay</strong> — re-queue the delivery for another attempt</li>
          <li>Configurable retention (default: 30 days)</li>
        </ul>
      </section>

      {/* API Keys */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("apiKeys")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          API keys authenticate your requests. Keys use the <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">hr_live_</code> prefix and are sent via Bearer auth:
        </p>
        <CodeBlock
          code={`Authorization: Bearer hr_live_abc123xyz789`}
        />
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mt-4">
          <li>Keys are <strong>Argon2 hashed</strong> in the database — plaintext is never stored</li>
          <li>Multiple keys per account — rotate without downtime</li>
          <li>Scoped to your plan's rate limits</li>
        </ul>
      </section>

      {/* FIFO Delivery */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("fifoDelivery")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          HookSniff delivers webhooks in <strong>{t("fifoOrder")}</strong> (first-in, first-out) per endpoint. Each delivery includes a sequence number:
        </p>
        <CodeBlock
          code={`{
  "delivery_id": "wh_xyz789",
  "sequence_number": 42,
  "event": "order.created",
  "data": { "order_id": "12345" },
  "timestamp": "2026-01-15T10:30:00Z"
}`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          Use sequence numbers to detect gaps or reorder events on your end.
        </p>
      </section>
    </article>
  );
}
