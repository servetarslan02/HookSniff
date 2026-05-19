import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { Check, X } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Retry Strategies',
  description: 'Configure automatic retry policies for failed webhook deliveries',
};

export default async function RetriesPage() {
  const t = await getTranslations('docsRetries');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('theProblem')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('problemDesc1')}</p>
        <p className="text-gray-600 dark:text-slate-400">{t('problemDesc2')}</p>
      </section>

      {/* The Solution */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('howHandles')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('howHandlesDesc')}</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>{t('exponentialBackoff').split(' — ')[0]}</strong> — {t('exponentialBackoff').split(' — ')[1]}</li>
          <li><strong>{t('jitter').split(' — ')[0]}</strong> — {t('jitter').split(' — ')[1]}</li>
          <li><strong>{t('configurable').split(' — ')[0]}</strong> — {t('configurable').split(' — ')[1]}</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('defaultSchedule')}</p>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 mb-6">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('attempt')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('delayAfterFailure')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('cumulativeTime')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-medium">1</td><td className="px-4 py-3">~1 saniye</td><td className="px-4 py-3">~1s</td></tr>
              <tr><td className="px-4 py-3 font-medium">2</td><td className="px-4 py-3">~2 saniye</td><td className="px-4 py-3">~3s</td></tr>
              <tr><td className="px-4 py-3 font-medium">3</td><td className="px-4 py-3">~4 saniye</td><td className="px-4 py-3">~7s</td></tr>
            </tbody>
          </table></div>
        </div>
        <p className="text-gray-600 dark:text-slate-400">{t('platformDefault')}</p>
      </section>

      {/* What Counts as a Failure */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whatCounts')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('whatCountsDesc')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-4">
          <div className="p-4 border border-green-200 dark:border-green-900/30 rounded-xl bg-green-50/50 dark:bg-green-900/10">
            <h4 className="text-sm font-semibold text-green-800 dark:text-green-400 mb-2"><Check size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-emerald-500" /> {t('retryable')}</h4>
            <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
              <li><code className="bg-green-100 dark:bg-green-900/30 px-1 py-0.5 rounded text-xs">5xx</code> {t('retryable5xx')}</li>
              <li><code className="bg-green-100 dark:bg-green-900/30 px-1 py-0.5 rounded text-xs">429</code> {t('retryable429')}</li>
              <li><code className="bg-green-100 dark:bg-green-900/30 px-1 py-0.5 rounded text-xs">408</code> {t('retryable408')}</li>
              <li>{t('retryableTimeout')}</li>
              <li>{t('retryableDns')}</li>
              <li>{t('retryableTls')}</li>
            </ul>
          </div>
          <div className="p-4 border border-red-200 dark:border-red-900/30 rounded-xl bg-red-50/50 dark:bg-red-900/10">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2"><X size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-red-500" /> {t('notRetried')}</h4>
            <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
              <li><code className="bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded text-xs">400</code> {t('notRetried400')}</li>
              <li><code className="bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded text-xs">401</code> {t('notRetried401')}</li>
              <li><code className="bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded text-xs">403</code> {t('notRetried403')}</li>
              <li><code className="bg-red-100 dark:bg-red-900/30 px-1 py-0.5 rounded text-xs">404</code> {t('notRetried404')}</li>
              <li>{t('notRetried4xx')}</li>
            </ul>
          </div>
        </div>
        <p className="text-gray-600 dark:text-slate-400">{t('only2xx')}</p>
      </section>

      {/* Custom Retry Policy */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('customPolicy')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('customPolicyDesc')}</p>
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
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('parameter')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('default')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('description')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono text-sm">max_attempts</td><td className="px-4 py-3">3</td><td className="px-4 py-3">{t('maxAttempts')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">base_delay_ms</td><td className="px-4 py-3">1,000</td><td className="px-4 py-3">{t('baseDelay')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">max_delay_ms</td><td className="px-4 py-3">3,600,000</td><td className="px-4 py-3">{t('maxDelay')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">multiplier</td><td className="px-4 py-3">2.0</td><td className="px-4 py-3">{t('multiplier')}</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Replay */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('replaying')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('replayingDesc')}</p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks/wh_xyz789/replay \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">{t('replayingTip')}</p>
      </section>

      {/* When to Customize */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whenCustomize')}</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t('paymentWebhooks').split(' — ')[0]}</strong> — {t('paymentWebhooks').split(' — ')[1]}</li>
          <li><strong>{t('analyticsEvents').split(' — ')[0]}</strong> — {t('analyticsEvents').split(' — ')[1]}</li>
          <li><strong>{t('slowReceivers').split(' — ')[0]}</strong> — {t('slowReceivers').split(' — ')[1]}</li>
          <li><strong>{t('highVolume').split(' — ')[0]}</strong> — {t('highVolume').split(' — ')[1]}</li>
        </ul>
      </section>
    </article>
  );
}
