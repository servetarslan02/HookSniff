import { ArrowRight } from '@/components/icons';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Deliveries — HookSniff Docs',
  description: 'Track webhook deliveries, inspect payloads, and replay failed attempts.',
};

export default async function DeliveriesPage() {
  const t = await getTranslations('docsDeliveries');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
        <ArrowRight size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('title')}
      </h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">{t('subtitle')}</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whatIs')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('whatIsDesc')}</p>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('lifecycle')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('lifecycleDesc')}</p>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr><th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Status</th><th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Description</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              <tr><td className="px-4 py-3"><code className="bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded text-xs">pending</code></td><td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('statusPending')}</td></tr>
              <tr><td className="px-4 py-3"><code className="bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded text-xs">success</code></td><td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('statusSuccess')}</td></tr>
              <tr><td className="px-4 py-3"><code className="bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded text-xs">failed</code></td><td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('statusFailed')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}