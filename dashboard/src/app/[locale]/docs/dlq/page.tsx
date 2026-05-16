import { useTranslations } from 'next-intl';
import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

// Revalidate every hour for ISR
export const revalidate = 3600;


export const metadata: Metadata = {
  title: 'Dead Letter Queue',
  description: 'Manage failed webhook deliveries with the dead letter queue',
};


export default function DlqPage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t("deadLetterQueue")}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Failed webhook deliveries are preserved in the Dead Letter Queue (DLQ) for inspection and replay.
      </p>

      {/* What is DLQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What is the Dead Letter Queue?</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          The DLQ is a holding area for webhook deliveries that have exhausted all retry attempts. Instead of being silently dropped, these deliveries are preserved with full context so you can:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>{t("understandWhy")}</li>
          <li>{t("inspectPayload")}</li>
          <li>{t("replayDeliveries")}</li>
          <li>{t("auditFailed")}</li>
        </ul>
      </section>

      {/* When Webhooks Go to DLQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">When Do Webhooks Go to the DLQ?</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          A delivery is moved to the DLQ when:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>All retry attempts have been exhausted (default: 6 attempts)</li>
          <li>{t("endpointDisabled")}</li>
          <li>The delivery has been pending for too long (stale delivery timeout)</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          Common failure reasons:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>Endpoint returning <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">5xx</code> errors consistently</li>
          <li>Endpoint unreachable (DNS failure, connection timeout)</li>
          <li>{t("tlsIssues")}</li>
          <li>Endpoint returning <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">4xx</code> errors (client-side issue)</li>
        </ul>
      </section>

      {/* Inspecting DLQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("inspectingDlq")}</h2>
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
  "attempt_count": 6,
  "attempts": [
    { "attempt": 1, "status": 500, "error": "Internal Server Error", "timestamp": "2026-01-15T10:30:00Z" },
    { "attempt": 2, "status": 500, "error": "Internal Server Error", "timestamp": "2026-01-15T10:30:10Z" },
    { "attempt": 3, "status": 500, "error": "Internal Server Error", "timestamp": "2026-01-15T10:30:40Z" },
    { "attempt": 4, "status": 500, "error": "Internal Server Error", "timestamp": "2026-01-15T10:32:40Z" },
    { "attempt": 5, "status": 500, "error": "Internal Server Error", "timestamp": "2026-01-15T10:42:40Z" },
    { "attempt": 6, "status": 500, "error": "Internal Server Error", "timestamp": "2026-01-15T11:12:40Z" }
  ],
  "payload": { "order_id": "12345", "total": 99.99 },
  "created_at": "2026-01-15T10:30:00Z"
}`}
        />
      </section>

      {/* Replaying from DLQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("replayingFailed")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Once you've fixed the issue, replay the delivery:
        </p>
        <CodeBlock
          code={`# Replay a single delivery
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks/wh_xyz789/replay \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          Replay resets the attempt counter and re-queues the delivery with a fresh retry schedule. You can also replay from the dashboard with one click.
        </p>
      </section>

      {/* DLQ Retention */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("dlqRetention")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          DLQ entries are retained based on your plan:
        </p>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t("plan")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t("retention")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t("maxDlq")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3">{t("developer")}</td><td className="px-4 py-3">7 days</td><td className="px-4 py-3">100</td></tr>
              <tr><td className="px-4 py-3">{t("startup")}</td><td className="px-4 py-3">14 days</td><td className="px-4 py-3">1,000</td></tr>
              <tr><td className="px-4 py-3">{t("pro")}</td><td className="px-4 py-3">30 days</td><td className="px-4 py-3">5,000</td></tr>
              <tr><td className="px-4 py-3">{t("enterprise")}</td><td className="px-4 py-3">Custom</td><td className="px-4 py-3">Custom</td></tr>
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
