import type { Metadata } from 'next';
import { Check } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Delivery Guarantees',
  description: 'Understand HookSniff webhook delivery guarantees and reliability',
};

export default function DeliveryGuaranteesPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Delivery Guarantees</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        What guarantees does HookSniff provide? At-least-once delivery with automatic retries.
      </p>

      {/* Guarantee */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">At-Least-Once Delivery</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          HookSniff guarantees <strong>at-least-once delivery</strong>. This means:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li>Every webhook will be delivered at least once</li>
          <li>If delivery fails, it will be retried automatically</li>
          <li>If all retries fail, the event is preserved in the DLQ</li>
          <li>You can replay failed deliveries at any time</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400">
          <strong>Important:</strong> &quot;At-least-once&quot; means duplicates are possible. Your endpoint should be idempotent — able to handle the same event multiple times without side effects.
        </p>
      </section>

      {/* Why not exactly-once */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Why Not Exactly-Once?</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Exactly-once delivery is theoretically impossible in distributed systems. The network can always fail between &quot;I sent it&quot; and &quot;I got the response.&quot;
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          The practical solution is at-least-once delivery + idempotent consumers. HookSniff provides the delivery guarantee; you provide the idempotency.
        </p>
      </section>

      {/* How to be idempotent */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Be Idempotent</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Track processed delivery IDs and skip duplicates:
        </p>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
{`CREATE TABLE processed_webhooks (
    delivery_id TEXT PRIMARY KEY,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Before processing:
SELECT 1 FROM processed_webhooks WHERE delivery_id = $1;
-- If exists, skip. If not, process and insert.`}
        </pre>
      </section>

      {/* What can go wrong */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What Can Go Wrong?</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Scenario</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">HookSniff Behavior</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3">Endpoint returns 2xx</td><td className="px-4 py-3">Delivery marked as delivered <Check size={14} strokeWidth={1.75} className="inline-block align-text-bottom text-emerald-500" /></td></tr>
              <tr><td className="px-4 py-3">Endpoint returns 5xx</td><td className="px-4 py-3">Retried with exponential backoff</td></tr>
              <tr><td className="px-4 py-3">Endpoint returns 429</td><td className="px-4 py-3">Retried with exponential backoff</td></tr>
              <tr><td className="px-4 py-3">Endpoint returns 4xx (other)</td><td className="px-4 py-3">Not retried — client error</td></tr>
              <tr><td className="px-4 py-3">Connection timeout (30s)</td><td className="px-4 py-3">Retried with exponential backoff</td></tr>
              <tr><td className="px-4 py-3">DNS failure</td><td className="px-4 py-3">Retried with exponential backoff</td></tr>
              <tr><td className="px-4 py-3">All retries exhausted</td><td className="px-4 py-3">Moved to DLQ, preserved for replay</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Data durability */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Data Durability</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          All delivery data is stored in PostgreSQL (Neon) with the following retention:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Delivered events:</strong> Retained based on plan (7–365 days)</li>
          <li><strong>Failed events (DLQ):</strong> Retained based on plan (7–365 days)</li>
          <li><strong>Attempt details:</strong> Full response bodies, status codes, timestamps</li>
        </ul>
      </section>
    </article>
  );
}
