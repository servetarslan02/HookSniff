import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'CloudEvents',
  description: 'Send webhooks in CloudEvents v1.0 format',
};

export default async function CloudEventsPage() {
  const t = await getTranslations('docsCloudevents');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whyCloudEvents')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('whyCloudEventsDesc')}
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('standardVsCloud')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-4">
          <div className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{t('standardHooksniff')}</h4>
            <pre className="text-xs font-mono text-gray-600 dark:text-slate-400 overflow-x-auto">
{`{
  "event": "order.created",
  "data": {
    "order_id": "12345",
    "total": 99.99
  },
  "timestamp": "2026-01-15T10:30:00Z"
}`}
            </pre>
          </div>
          <div className="p-4 border border-brand-200 dark:border-brand-900/30 rounded-xl bg-brand-50/50 dark:bg-brand-900/10">
            <h4 className="text-sm font-semibold text-brand-800 dark:text-brand-400 mb-2">{t('cloudeventsV1')}</h4>
            <pre className="text-xs font-mono text-brand-700 dark:text-brand-300 overflow-x-auto">
{`{
  "specversion": "1.0",
  "type": "order.created",
  "source": "/hooksniff",
  "id": "wh_abc123",
  "time": "2026-01-15T10:30:00Z",
  "datacontenttype": "application/json",
  "data": {
    "order_id": "12345",
    "total": 99.99
  }
}`}
            </pre>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('enableCloudEvents')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('enableDesc')}
        </p>
        <CodeBlock
          code={`# In .env or environment variable
WEBHOOK_FORMAT=cloudevents`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          {t('enableNote')}
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('benefits')}</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t('benefit1').split(' — ')[0]}</strong> — {t('benefit1').split(' — ')[1]}</li>
          <li><strong>{t('benefit2').split(' — ')[0]}</strong> — {t('benefit2').split(' — ')[1]}</li>
          <li><strong>{t('benefit3').split(' — ')[0]}</strong> — {t('benefit3').split(' — ')[1]}</li>
          <li><strong>{t('benefit4').split(' — ')[0]}</strong> — {t('benefit4').split(' — ')[1]}</li>
        </ul>
      </section>
    </article>
  );
}
