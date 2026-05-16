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
          Failed deliveries are retried up to <strong>6 times</strong> with increasing delays:
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
              <tr><td className="px-4 py-3 font-medium">1</td><td className="px-4 py-3">{t("immediate")}</td><td className="px-4 py-3">0</td></tr>
              <tr><td className="px-4 py-3 font-medium">2</td><td className="px-4 py-3">10 seconds</td><td className="px-4 py-3">10s</td></tr>
              <tr><td className="px-4 py-3 font-medium">3</td><td className="px-4 py-3">30 seconds</td><td className="px-4 py-3">40s</td></tr>
              <tr><td className="px-4 py-3 font-medium">4</td><td className="px-4 py-3">2 minutes</td><td className="px-4 py-3">~2.5 min</td></tr>
              <tr><td className="px-4 py-3 font-medium">5</td><td className="px-4 py-3">10 minutes</td><td className="px-4 py-3">~12.5 min</td></tr>
              <tr><td className="px-4 py-3 font-medium">6</td><td className="px-4 py-3">30 minutes</td><td className="px-4 py-3">~42.5 min</td></tr>
            </tbody>
          </table></div>
        </div>
        <p className="text-gray-600 dark:text-slate-400">
          Jitter (±25%) is applied to all delays to prevent <strong>thundering herd</strong> problems when many deliveries fail simultaneously.
        </p>
      </section>

      {/* Failure Detection */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What Counts as a Failure?</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>HTTP status code <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">4xx</code> or <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">5xx</code></li>
          <li>Connection timeout (30 seconds default)</li>
          <li>{t("dnsFailure")}</li>
          <li>{t("tlsHandshakeFailure")}</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          Only <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">2xx</code> responses are considered successful.
        </p>
      </section>

      {/* Custom Retry Policy */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("customRetryPolicy")}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Configure retry behavior per endpoint:
        </p>
        <CodeBlock
          code={`{
  "max_attempts": 5,
  "backoff": "exponential",
  "initial_delay_secs": 30,
  "max_delay_secs": 3600
}`}
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
              <tr><td className="px-4 py-3 font-mono text-sm">max_attempts</td><td className="px-4 py-3">3</td><td className="px-4 py-3">{t("maxDeliveryAttempts")}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">backoff</td><td className="px-4 py-3">exponential</td><td className="px-4 py-3">Strategy: exponential, linear, fixed</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">initial_delay_secs</td><td className="px-4 py-3">10</td><td className="px-4 py-3">{t("delayBeforeFirst")}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">max_delay_secs</td><td className="px-4 py-3">3600</td><td className="px-4 py-3">Maximum delay between retries (1 hour)</td></tr>
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
          <li>DLQ entries are retained for 30 days by default</li>
          <li>{t("inspectDlqEntries")}</li>
        </ul>
      </section>
    </article>
  );
}
