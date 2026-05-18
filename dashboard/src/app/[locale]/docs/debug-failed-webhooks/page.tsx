import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Debug Failed Webhooks',
  description: 'How to investigate and fix failed webhook deliveries',
};

export default async function DebugFailedWebhooksPage() {
  const t = await getTranslations('docsDebugFailed');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* Step 1 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('step1')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('step1Desc')}</p>
        <CodeBlock
          code={`curl "https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks?status=failed&per_page=10" \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
      </section>

      {/* Step 2 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('step2')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('step2Desc')}</p>
        <CodeBlock
          code={`curl "https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks/wh_xyz789/attempts" \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t('step2Field1').split(' — ')[0]}</strong> — {t('step2Field1').split(' — ')[1]}</li>
          <li><strong>{t('step2Field2').split(' — ')[0]}</strong> — {t('step2Field2').split(' — ')[1]}</li>
          <li><strong>{t('step2Field3').split(' — ')[0]}</strong> — {t('step2Field3').split(' — ')[1]}</li>
          <li><strong>{t('step2Field4').split(' — ')[0]}</strong> — {t('step2Field4').split(' — ')[1]}</li>
        </ul>
      </section>

      {/* Common Patterns */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('commonPatterns')}</h2>
        <div className="space-y-6 not-prose">
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">500 Internal Server Error</h4>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{t('fix5xx')}</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">401 Unauthorized</h4>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{t('fix401')}</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">404 Not Found</h4>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{t('fix404')}</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Connection Timeout</h4>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{t('fixTimeout')}</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">DNS Failure</h4>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{t('fixDns')}</p>
          </div>
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">TLS Error</h4>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{t('fixTls')}</p>
          </div>
        </div>
      </section>

      {/* Step 3 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('step4')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('step4Desc')}</p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks/wh_xyz789/replay \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">{t('step4Tip')}</p>
      </section>
    </article>
  );
}
