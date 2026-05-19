import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Monitor Webhook Performance',
  description: 'Track delivery metrics, set up alerts, and monitor webhook health',
};

export default async function MonitorPerformancePage() {
  const t = await getTranslations('docsMonitor');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whyMonitoring')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('whyMonitoringDesc')}
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('keyMetrics')}</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('metric')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('target')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('alertWhen')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3">{t('deliverySuccessRate')}</td><td className="px-4 py-3">&gt;99.5%</td><td className="px-4 py-3">&lt;99%</td></tr>
              <tr><td className="px-4 py-3">{t('p95Latency')}</td><td className="px-4 py-3">&lt;2s</td><td className="px-4 py-3">&gt;5s</td></tr>
              <tr><td className="px-4 py-3">{t('consecutiveFailures')}</td><td className="px-4 py-3">0</td><td className="px-4 py-3">&gt;5</td></tr>
              <tr><td className="px-4 py-3">{t('dlqDepth')}</td><td className="px-4 py-3">0</td><td className="px-4 py-3">&gt;100</td></tr>
              <tr><td className="px-4 py-3">{t('retryRate')}</td><td className="px-4 py-3">&lt;5%</td><td className="px-4 py-3">&gt;10%</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('builtIn')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('builtInDesc')}</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t('builtIn1').split(' — ')[0]}</strong> — {t('builtIn1').split(' — ')[1]}</li>
          <li><strong>{t('builtIn2').split(' — ')[0]}</strong> — {t('builtIn2').split(' — ')[1]}</li>
          <li><strong>{t('builtIn3').split(' — ')[0]}</strong> — {t('builtIn3').split(' — ')[1]}</li>
          <li><strong>{t('builtIn4').split(' — ')[0]}</strong> — {t('builtIn4').split(' — ')[1]}</li>
          <li><strong>{t('builtIn5').split(' — ')[0]}</strong> — {t('builtIn5').split(' — ')[1]}</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('grafana')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('grafanaDesc')}
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('grafanaMetrics')}</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">hooksniff_deliveries_total</code> — Total deliveries by status</li>
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">hooksniff_delivery_duration_seconds</code> — Delivery latency histogram</li>
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">hooksniff_retries_total</code> — Total retry attempts</li>
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">hooksniff_dlq_depth</code> — Current DLQ size</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('settingUpAlerts')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('alertsDesc')}</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t('alert1').split(' — ')[0]}</strong> — {t('alert1').split(' — ')[1]}</li>
          <li><strong>{t('alert2').split(' — ')[0]}</strong> — {t('alert2').split(' — ')[1]}</li>
          <li><strong>{t('alert3').split(' — ')[0]}</strong> — {t('alert3').split(' — ')[1]}</li>
          <li><strong>{t('alert4').split(' — ')[0]}</strong> — {t('alert4').split(' — ')[1]}</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mt-4">{t('seeDashboard')}</p>
      </section>
    </article>
  );
}
