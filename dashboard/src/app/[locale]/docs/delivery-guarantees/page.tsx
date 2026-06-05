import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Check } from '@/components/icons';
import { getTranslations, setRequestLocale } from 'next-intl/server';


export const metadata: Metadata = {
  title: 'Delivery Guarantees',
  description: 'Understand HookSniff webhook delivery guarantees and reliability',
};

async function DeliveryGuaranteesContent({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations('docsDeliveryGuarantees');

  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* Guarantee */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('atLeastOnce')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('atLeastOnceDesc')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li>{t('guarantee1')}</li>
          <li>{t('guarantee2')}</li>
          <li>{t('guarantee3')}</li>
          <li>{t('guarantee4')}</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400">
          <strong>Important:</strong> {t('importantNote')}
        </p>
      </section>

      {/* Why not exactly-once */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whyNotExactlyOnce')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('whyNotExactlyOnceDesc')}
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('practicalSolution')}
        </p>
      </section>

      {/* How to be idempotent */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('howToBeIdempotent')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('howToBeIdempotentDesc')}
        </p>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
{`CREATE TABLE processed_webhooks (
  delivery_id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Before processing:
SELECT 1 FROM processed_webhooks WHERE delivery_id = $1;
-- If exists, skip. If not, process and insert.`}
        </pre>
      </section>

      {/* What can go wrong */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whatCanGoWrong')}</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('scenario')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('hooksniffBehavior')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3">{t('endpointReturns2xx')}</td><td className="px-4 py-3">{t('deliveryMarkedDelivered')} <Check size={14} strokeWidth={1.75} className="inline-block align-text-bottom text-emerald-500" /></td></tr>
              <tr><td className="px-4 py-3">{t('endpointReturns5xx')}</td><td className="px-4 py-3">{t('retriedWithBackoff')}</td></tr>
              <tr><td className="px-4 py-3">{t('endpointReturns429')}</td><td className="px-4 py-3">{t('retriedWithBackoff')}</td></tr>
              <tr><td className="px-4 py-3">{t('endpointReturns4xx')}</td><td className="px-4 py-3">{t('notRetriedClientError')}</td></tr>
              <tr><td className="px-4 py-3">{t('connectionTimeout')}</td><td className="px-4 py-3">{t('retriedWithBackoff')}</td></tr>
              <tr><td className="px-4 py-3">{t('dnsFailure')}</td><td className="px-4 py-3">{t('retriedWithBackoff')}</td></tr>
              <tr><td className="px-4 py-3">{t('allRetriesExhausted')}</td><td className="px-4 py-3">{t('movedToDlq')}</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* Data durability */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('dataDurability')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('dataDurabilityDesc')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>Delivered events:</strong> {t('deliveredEvents')}</li>
          <li><strong>Failed events (DLQ):</strong> {t('failedEventsDlq')}</li>
          <li><strong>Attempt details:</strong> {t('attemptDetails')}</li>
        </ul>
      </section>
    </article>
  );
}

export default async function DeliveryGuaranteesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-700" /><div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" /><div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" /><div className="h-64 w-full rounded bg-gray-200 dark:bg-gray-700" /></div>}>
      <DeliveryGuaranteesContent locale={locale} />
    </Suspense>
  );
}
