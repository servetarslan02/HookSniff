import CodeBlock from '@/components/CodeBlock';
import { AlertTriangle, Bell, Check } from '@/components/icons';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Alerts — HookSniff Docs',
  description: 'Configure alert rules to monitor webhook deliveries.',
};

export default async function AlertsPage() {
  const t = await getTranslations('docsAlerts');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
        <Bell size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('title')}
      </h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">{t('subtitle')}</p>
      <div className="mb-8 p-4 border border-amber-200 dark:border-amber-900/30 rounded-xl bg-amber-50/50 dark:bg-amber-900/10">
        <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-2">
          <AlertTriangle size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Note
        </h4>
        <p className="text-sm text-amber-700 dark:text-amber-300">
          The alert evaluation background worker is not yet implemented. The CRUD API is available, but automatic notifications are not active.
        </p>
      </div>
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whatIs')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('whatIsDesc')}</p>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('conditions')}</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr><th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Condition</th><th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Description</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              <tr><td className="px-4 py-3 font-mono text-sm">failure_rate</td><td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('condFailureRate')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">latency</td><td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('condLatency')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">consecutive_failures</td><td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('condConsecutive')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('api')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('apiDesc')}</p>
        <CodeBlock code={`# List alert rules
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://hooksniff-api-1046140057667.europe-west1.run.app/v1/alerts

# Create alert rule
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/alerts \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "High failures", "condition": "failure_rate", "threshold": 5, "channels": ["email"]}'

# Test alert
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/alerts/ALERT_ID/test \\
  -H "Authorization: Bearer YOUR_API_KEY"`} />
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('bestPractices')}</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><Check size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-emerald-500" /> {t('bp1')}</li>
          <li><Check size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-emerald-500" /> {t('bp2')}</li>
          <li><Check size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-emerald-500" /> {t('bp3')}</li>
          <li><Check size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-emerald-500" /> {t('bp4')}</li>
        </ul>
      </section>
    </article>
  );
}