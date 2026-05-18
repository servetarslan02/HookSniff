import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Dead Letter Queue',
  description: 'Manage failed webhook deliveries with the dead letter queue',
};

export default async function DlqPage() {
  const t = await getTranslations('docsDlq');
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('howWorks')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('howWorksDesc')}</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>{t('originalPayload').split(' — ')[0]}</strong> — {t('originalPayload').split(' — ')[1]}</li>
          <li><strong>{t('allAttempts').split(' — ')[0]}</strong> — {t('allAttempts').split(' — ')[1]}</li>
          <li><strong>{t('timing').split(' — ')[0]}</strong> — {t('timing').split(' — ')[1]}</li>
          <li><strong>{t('errorContext').split(' — ')[0]}</strong> — {t('errorContext').split(' — ')[1]}</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400">{t('inspectTip')}</p>
      </section>

      {/* When Webhooks Go to DLQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whenDlq')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('whenDlqDesc')}</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li>{t('whenDlq1')}</li>
          <li>{t('whenDlq2')}</li>
          <li>{t('whenDlq3')}</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('commonFailures')}</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>{t('failure5xx')}</li>
          <li>{t('failureDns')}</li>
          <li>{t('failureTls')}</li>
          <li>{t('failure429')}</li>
        </ul>
      </section>

      {/* Inspecting DLQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('inspecting')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('inspectingDesc')}</p>
        <CodeBlock
          code={`curl "https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks?status=failed" \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4 mb-4">{t('responseIncludes')}</p>
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('replaying')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('replayingDesc')}</p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks/wh_xyz789/replay \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">{t('replayingTip')}</p>
      </section>

      {/* DLQ Retention */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('retention')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('retentionDesc')}</p>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('retentionCol')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('maxDlq')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3">Developer ($0)</td><td className="px-4 py-3">7 gün</td><td className="px-4 py-3">100</td></tr>
              <tr><td className="px-4 py-3">Startup ($24/ay)</td><td className="px-4 py-3">14 gün</td><td className="px-4 py-3">30.000</td></tr>
              <tr><td className="px-4 py-3">Pro ($49/ay)</td><td className="px-4 py-3">180 gün</td><td className="px-4 py-3">100.000</td></tr>
              <tr><td className="px-4 py-3">Enterprise ($149/ay)</td><td className="px-4 py-3">Özel</td><td className="px-4 py-3">Sınırsız</td></tr>
            </tbody>
          </table></div>
        </div>
        <p className="text-gray-600 dark:text-slate-400 mt-4">{t('retentionExpired')}</p>
      </section>
    </article>
  );
}
