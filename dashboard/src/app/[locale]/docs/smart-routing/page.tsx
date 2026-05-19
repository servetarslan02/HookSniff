import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Smart Routing',
  description: 'Route webhooks intelligently with round-robin, latency-based, and failover strategies',
};

export default async function SmartRoutingPage() {
  const t = await getTranslations('docsSmartRouting');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('theProblem')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('problemDesc')}
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('routingStrategies')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('routingDesc')}
        </p>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 mb-4">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('strategy')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('howItWorks')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('bestFor')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-medium">{t('roundRobin')}</td><td className="px-4 py-3">{t('roundRobinDesc')}</td><td className="px-4 py-3">{t('roundRobinBest')}</td></tr>
              <tr><td className="px-4 py-3 font-medium">{t('latencyBased')}</td><td className="px-4 py-3">{t('latencyBasedDesc')}</td><td className="px-4 py-3">{t('latencyBest')}</td></tr>
              <tr><td className="px-4 py-3 font-medium">{t('failover')}</td><td className="px-4 py-3">{t('failoverDesc')}</td><td className="px-4 py-3">{t('failoverBest')}</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('configuration')}</h2>
        <CodeBlock
          code={`curl -X PUT https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints/ep_abc123/routing \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "strategy": "failover",
    "endpoints": [
      { "url": "https://primary.myapp.com/webhook", "priority": 1 },
      { "url": "https://backup.myapp.com/webhook", "priority": 2 }
    ]
  }'`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('healthMonitoring')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('healthDesc')}
        </p>
        <CodeBlock
          code={`curl https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints/ep_abc123/health \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          {t('healthNote')}
        </p>
      </section>
    </article>
  );
}
