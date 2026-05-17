import { useTranslations } from 'next-intl';
import CodeBlock from '@/components/CodeBlock';
import Link from 'next/link';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Dead Letter Queue',
  description: 'Manage failed webhook deliveries with the dead letter queue',
};

export default function DlqPage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Dead Letter Queue (DLQ)</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Failed deliveries shouldn&apos;t vanish. The DLQ preserves them so you can understand what went wrong and fix it.
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">The Problem</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          After all retries are exhausted, what happens to the event? In most webhook systems, it&apos;s silently dropped. You never know it failed, and the data is lost forever.
        </p>
        <p className="text-gray-600 dark:text-slate-400">
          This is especially painful for critical events like payments or order updates — losing them means lost revenue or unhappy customers.
        </p>
      </section>

      {/* The Solution */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How the DLQ Works</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          When a delivery exhausts all retry attempts, HookSniff moves it to the Dead Letter Queue instead of dropping it. The DLQ preserves everything:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>Original payload</strong> — The full event data</li>
          <li><strong>All attempt details</strong> — Status codes, response bodies, timestamps for every retry</li>
          <li><strong>Timing</strong> — When each attempt was made and how long it took</li>
          <li><strong>Error context</strong> — Why each attempt failed</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400">
          You can inspect DLQ entries via the API or dashboard, and <strong>replay</strong> them with one click after fixing the issue.
        </p>
      </section>

      {/* When Webhooks Go to DLQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">When Do Webhooks Go to the DLQ?</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          A delivery is moved to the DLQ when:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li>All retry attempts have been exhausted (default: 3 attempts, configurable per endpoint)</li>
          <li>The endpoint is disabled</li>
          <li>The delivery has been pending for too long (stale delivery timeout)</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mb-4">Common failure reasons:</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>Endpoint returning <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">5xx</code> errors consistently</li>
          <li>Endpoint unreachable (DNS failure, connection timeout)</li>
          <li>TLS certificate issues</li>
          <li>Endpoint returning <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">429</code> rate limits that don&apos;t clear</li>
        </ul>
      </section>

      {/* Inspecting DLQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Inspecting DLQ Entries</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Query failed deliveries via the API:
        </p>
        <CodeBlock
          code={`curl "https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks?status=failed" \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4 mb-4">
          Response includes full delivery details:
        </p>
        <CodeBlock
          code={`{
  "id": "wh_xyz789",
  "endpoint_id": "ep_abc123",
  "event": "order.created",
  "status": "failed",
  "attempt_count": 3,
  "attempts": [
    { "attempt": 1, "status": 500, "error": "Internal Server Error", "timestamp": "2026-01-15T10:30:00Z" },
    { "attempt": 2, "status": 500, "error": "Internal Server Error", "timestamp": "2026-01-15T10:30:01Z" },
    { "attempt": 3, "status": 500, "error": "Internal Server Error", "timestamp": "2026-01-15T10:30:03Z" }
  ],
  "payload": { "order_id": "12345", "total": 99.99 },
  "created_at": "2026-01-15T10:30:00Z"
}`}
        />
      </section>

      {/* Replaying from DLQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Replaying Failed Deliveries</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Once you&apos;ve fixed the issue, replay the delivery. This resets the attempt counter and re-queues with a fresh retry schedule:
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks/wh_xyz789/replay \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          You can also replay from the dashboard with one click. Batch replay is available for multiple failed deliveries.
        </p>
      </section>

      {/* DLQ Retention */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">DLQ Retention</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          DLQ entries are retained based on your plan:
        </p>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Retention</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Max DLQ Entries</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3">Developer ($0)</td><td className="px-4 py-3">7 days</td><td className="px-4 py-3">100</td></tr>
              <tr><td className="px-4 py-3">Startup ($24/mo)</td><td className="px-4 py-3">14 days</td><td className="px-4 py-3">30,000</td></tr>
              <tr><td className="px-4 py-3">Pro ($49/mo)</td><td className="px-4 py-3">30 days</td><td className="px-4 py-3">100,000</td></tr>
              <tr><td className="px-4 py-3">Enterprise ($149/mo)</td><td className="px-4 py-3">Custom</td><td className="px-4 py-3">Unlimited</td></tr>
            </tbody>
          </table></div>
        </div>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          After retention expires, DLQ entries are permanently deleted. Export important data before it expires.
        </p>
      </section>
    </article>
  );
}
