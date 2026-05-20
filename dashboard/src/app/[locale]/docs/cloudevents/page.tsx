import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'CloudEvents v1.0',
  description: 'Send webhooks in CloudEvents v1.0 format',
};

export default async function CloudEventsPage() {
  const t = await getTranslations('docsCloudevents');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">{t('subtitle')}</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whyCloudEvents')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('whyCloudEventsDesc')}</p>
      </section>

      {/* Quick Start */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('quickStart')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('quickStartDesc')}</p>
        <div className="space-y-4 not-prose">
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('step1Title')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">{t('step1Desc')}</p>
            <CodeBlock code={t('step1Curl')} />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('step2Title')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('step2Desc')}</p>
          </div>
        </div>
      </section>

      {/* Format Comparison */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('standardVsCloud')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-4">
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('standardHooksniff')}</h3>
            <CodeBlock code={`{\n  "event": "order.created",\n  "data": {\n    "order_id": "ord_123",\n    "total": 49.99\n  }\n}`} />
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('cloudeventsV1')}</h3>
            <CodeBlock code={t('envelopeExample')} />
          </div>
        </div>
      </section>

      {/* Field Reference */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('fieldReference')}</h2>
        <ul className="space-y-2">
          <li className="text-gray-600 dark:text-slate-400">• <code>specversion</code> — {t('specversion')}</li>
          <li className="text-gray-600 dark:text-slate-400">• <code>type</code> — {t('type')}</li>
          <li className="text-gray-600 dark:text-slate-400">• <code>source</code> — {t('source')}</li>
          <li className="text-gray-600 dark:text-slate-400">• <code>id</code> — {t('id')}</li>
          <li className="text-gray-600 dark:text-slate-400">• <code>time</code> — {t('time')}</li>
          <li className="text-gray-600 dark:text-slate-400">• <code>datacontenttype</code> — {t('datacontenttype')}</li>
          <li className="text-gray-600 dark:text-slate-400">• <code>data</code> — {t('data')}</li>
        </ul>
      </section>

      {/* Migration Guide */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('migration')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('migrationDesc')}</p>
        <ol className="space-y-2 list-decimal list-inside">
          <li className="text-gray-600 dark:text-slate-400">{t('migrationStep1')}</li>
          <li className="text-gray-600 dark:text-slate-400">{t('migrationStep2')}</li>
          <li className="text-gray-600 dark:text-slate-400">{t('migrationStep3')}</li>
          <li className="text-gray-600 dark:text-slate-400">{t('migrationStep4')}</li>
        </ol>
      </section>

      {/* Benefits */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('benefits')}</h2>
        <ul className="space-y-2">
          <li className="text-gray-600 dark:text-slate-400">✅ {t('benefit1')}</li>
          <li className="text-gray-600 dark:text-slate-400">✅ {t('benefit2')}</li>
          <li className="text-gray-600 dark:text-slate-400">✅ {t('benefit3')}</li>
          <li className="text-gray-600 dark:text-slate-400">✅ {t('benefit4')}</li>
        </ul>
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('bestPractices')}</h2>
        <ul className="space-y-2">
          <li className="text-gray-600 dark:text-slate-400">• {t('bp1')}</li>
          <li className="text-gray-600 dark:text-slate-400">• {t('bp2')}</li>
          <li className="text-gray-600 dark:text-slate-400">• {t('bp3')}</li>
          <li className="text-gray-600 dark:text-slate-400">• {t('bp4')}</li>
        </ul>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('faq')}</h2>
        <div className="space-y-4 not-prose">
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('faq1q')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('faq1a')}</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('faq2q')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('faq2a')}</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('faq3q')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('faq3a')}</p>
          </div>
        </div>
      </section>

      {/* Further Reading */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('furtherReading')}</h2>
        <ul className="space-y-2">
          <li className="text-gray-600 dark:text-slate-400">• {t('fr1')}</li>
          <li className="text-gray-600 dark:text-slate-400">• {t('fr2')}</li>
          <li className="text-gray-600 dark:text-slate-400">• {t('fr3')}</li>
        </ul>
      </section>
    </article>
  );
}
