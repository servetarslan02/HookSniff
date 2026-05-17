import { useTranslations } from 'next-intl';
import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

// Revalidate every hour for ISR
export const revalidate = 3600;


export const metadata: Metadata = {
  title: 'Retry Strategies',
  description: 'Configure automatic retry policies for failed webhook deliveries',
};


export default function RetriesPage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Retries & Retry Policy</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        HookSniff automatically retries failed webhook deliveries with exponential backoff and jitter.
      </p>

      {/* Backoff Schedule */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("exponentialBackoff")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Failed deliveries are retried up to <strong>3 times</strong> (default) with exponential backoff:
        </p>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 mb-6">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t("attempt")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t("delayAfterFailure")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t("cumulativeTime")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-medium">1</td><td className="px-4 py-3">~1 second</td><td className="px-4 py-3">~1s</td></tr>
              <tr><td className="px-4 py-3 font-medium">2</td><td className="px-4 py-3">~2 seconds</td><td className="px-4 py-3">~3s</td></tr>
              <tr><td className="px-4 py-3 font-medium">3</td><td className="px-4 py-3">~4 seconds</td><td className="px-4 py-3">~7s</td></tr>
            </tbody>
          </table></div>
        </div>
        <p className="text-gray-600 dark:text-slate-400 mb-2">
          Default policy: base delay 1s, multiplier 2x, max delay 1 hour. Jitter (0–25%) is applied to all delays to prevent <strong>thundering herd</strong> problems.
        </p>
        <p className="text-gray-600 dark:text-slate-400">
          The number of retry attempts is configurable per endpoint (1–100). Platform default is set by the admin.
        </p>
      </section>

      {/* Failure Detection */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What Counts as a Failure?</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>HTTP status code <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">5xx</code> (server errors)</li>
          <li>HTTP status code <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">429</code> (rate limited)</li>
          <li>HTTP status code <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">408</code> (request timeout)</li>
          <li>Connection timeout (30 seconds default)</li>
          <li>{t("dnsFailure")}</li>
          <li>{t("tlsHandshakeFailure")}</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          Only <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">2xx</code> responses are considered successful. Other <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">4xx</code> errors (400, 401, 403, 404, etc.) are <strong>not retried</strong> — they indicate a client-side issue.
        </p>
      </section>

      {/* Custom Retry Policy */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("customRetryPolicy")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Configure retry behavior per endpoint:
        </p>
        <CodeBlock
          code={`curl -X PUT https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints/ep_abc123/retry-policy \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "max_attempts": 5,
    "base_delay_ms": 2000,
    "max_delay_ms": 600000,
    "multiplier": 2.0
  }'`}
        />
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 mt-4">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t("parameter")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t("defaultVal")}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t("description")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono text-sm">max_attempts</td><td className="px-4 py-3">3</td><td className="px-4 py-3">{t("maxDeliveryAttempts")} (1–100)</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">base_delay_ms</td><td className="px-4 py-3">1,000</td><td className="px-4 py-3">Base delay in milliseconds before first retry</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">max_delay_ms</td><td className="px-4 py-3">3,600,000</td><td className="px-4 py-3">Maximum delay cap (1 hour)</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">multiplier</td><td className="px-4 py-3">2.0</td><td className="px-4 py-3">Backoff multiplier (1.0 = linear, 2.0 = exponential)</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Replay */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("replayingFailedWebhooks")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          After a delivery is moved to the DLQ, you can replay it:
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks/wh_xyz789/replay \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          Replay resets the attempt counter and re-queues the delivery with a fresh retry schedule.
        </p>
      </section>

      {/* DLQ Behavior */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("dlqBehavior")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          When max attempts are exhausted:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>Delivery status is set to <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">failed</code></li>
          <li>All attempt details (status codes, errors, timestamps) are preserved</li>
          <li>{t("originalRetained")}</li>
          <li>DLQ entries are retained based on your plan's retention period (Developer: 7 days, Startup: 14 days, Pro: 180 days, Enterprise: 365 days)</li>
          <li>{t("inspectDlqEntries")}</li>
        </ul>
      </section>
    </article>
  );
}
