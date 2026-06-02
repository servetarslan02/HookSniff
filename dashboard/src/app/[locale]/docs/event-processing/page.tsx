import { Suspense } from 'react';
import { PrefetchLink as Link } from '@/components/PrefetchLink';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';


export const metadata: Metadata = {
  title: 'Event Processing',
  description: 'How HookSniff processes events from ingestion to delivery',
};



async function EventProcessingPageContent(params: Promise<{ locale: string }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('docsEventProcessing');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* Lifecycle */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('lifecycle')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('lifecycleDesc')}</p>
        <ol className="space-y-4 text-gray-600 dark:text-slate-400">
          <li><strong>1. {t('stage1').split(' — ')[0]}</strong> — {t('stage1').split(' — ')[1]}</li>
          <li><strong>2. {t('stage2').split(' — ')[0]}</strong> — {t('stage2').split(' — ')[1]}</li>
          <li><strong>3. {t('stage3').split(' — ')[0]}</strong> — {t('stage3').split(' — ')[1]}</li>
          <li><strong>4. {t('stage4').split(' — ')[0]}</strong> — {t('stage4').split(' — ')[1]}</li>
          <li><strong>5. {t('stage5').split(' — ')[0]}</strong> — {t('stage5').split(' — ')[1]}</li>
          <li><strong>6. {t('stage6').split(' — ')[0]}</strong> — {t('stage6').split(' — ')[1]}</li>
          <li><strong>7. {t('stage7').split(' — ')[0]}</strong> — {t('stage7').split(' — ')[1]}</li>
        </ol>
      </section>

      {/* Ingestion */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('ingestion')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('ingestionDesc')}</p>
        <ol className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>1. {t('ingestionStep1')}</li>
          <li>2. {t('ingestionStep2')}</li>
          <li>3. {t('ingestionStep3')}</li>
          <li>4. {t('ingestionStep4')}</li>
          <li>5. {t('ingestionStep5')}</li>
          <li>6. {t('ingestionStep6')}</li>
          <li>7. {t('ingestionStep7')}</li>
        </ol>
      </section>

      {/* Routing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('routing')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('routingDesc')}</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>{t('routingExact')}</li>
          <li>{t('routingWildcard')}</li>
          <li>{t('routingAll')}</li>
        </ul>
      </section>

      {/* Delivery */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('delivery')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('deliveryDesc')}</p>
        <ol className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>1. {t('deliveryStep1')}</li>
          <li>2. {t('deliveryStep2')}</li>
          <li>3. {t('deliveryStep3')}</li>
          <li>4. {t('deliveryStep4')}</li>
          <li>5. {t('deliveryStep5')}</li>
          <li>6. {t('deliveryStep6')}</li>
        </ol>
      </section>

      {/* Payload Signing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payload Signing</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Before delivery, HookSniff signs the payload with HMAC-SHA256:
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>Signature: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">v1,{'{'}base64(hmac_sha256(secret, body)){'}'}</code></li>
          <li>Timestamp: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">webhook-timestamp</code> (Unix seconds)</li>
          <li>Delivery ID: <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">webhook-id</code></li>
        </ul>
      </section>

      {/* Fanout */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Fanout</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          A single event can be delivered to multiple endpoints. If you have 5 endpoints listening to <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.created</code>, HookSniff creates 5 separate deliveries — each with their own signing secret, retry policy, and delivery tracking.
        </p>
      </section>

      {/* Ordering */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ordering</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          HookSniff delivers events in FIFO order per endpoint. Each delivery includes a sequence number. When a delivery fails and is retried, subsequent deliveries to the same endpoint are held until the retry completes.
        </p>
      </section>

      {/* Timeouts */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Timeouts</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Each delivery attempt has a 30-second timeout. If your endpoint doesn't respond within 30 seconds, the attempt is marked as failed and retried.
        </p>
        <p className="text-gray-600 dark:text-slate-400">
          <strong>Best practice:</strong> Return 200 immediately and process asynchronously. See <Link href="/docs/best-practices" className="text-brand-600 hover:text-brand-700">Best Practices</Link>.
        </p>
      </section>
    </article>
  );
}

export default async function Page(params: Promise<{ locale: string }>) {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-700" /><div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" /><div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" /><div className="h-64 w-full rounded bg-gray-200 dark:bg-gray-700" /></div>}>
      <EventProcessingPageContent {...params} />
    </Suspense>
  );
}
