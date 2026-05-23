import CodeBlock from '@/components/CodeBlock';
import { BarChart3 } from '@/components/icons';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Analytics — HookSniff Docs',
  description: 'Monitor webhook delivery performance with real-time analytics.',
};

export default async function AnalyticsPage() {
  const t = await getTranslations('docsAnalytics');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
        <BarChart3 size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('title')}
      </h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">{t('subtitle')}</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('overview')}</h2>
        <p className="text-gray-600 dark:text-slate-400">{t('overviewDesc')}</p>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('metrics')}</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr><th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Metric</th><th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Description</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              <tr><td className="px-4 py-3 font-mono text-sm">success_rate</td><td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('metricSuccess')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">avg_latency</td><td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('metricLatency')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">volume</td><td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('metricVolume')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">p95_latency</td><td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('metricP95')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('api')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('apiDesc')}</p>
        <CodeBlock code={`# Delivery trends
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  "https://hooksniff-api-1046140057667.europe-west1.run.app/v1/analytics/deliveries?range=7d"

# Success rate
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  "https://hooksniff-api-1046140057667.europe-west1.run.app/v1/analytics/success-rate?range=30d"

# Latency trend
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  "https://hooksniff-api-1046140057667.europe-west1.run.app/v1/analytics/latency?range=7d"`} />
      </section>
    </article>
  );
}