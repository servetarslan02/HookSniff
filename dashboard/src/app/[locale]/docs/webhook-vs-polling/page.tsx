import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Webhook vs Polling',
  description: 'Understand the difference between webhooks and polling, and when to use each',
};

export default async function WebhookVsPollingPage() {
  const t = await getTranslations('docsWebhookVsPolling');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('theProblem')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('problemDesc')}</p>
      </section>

      {/* Polling */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('polling')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('pollingDesc')}</p>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>{t('pollingPros')}</strong></p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li>{t('pollingPro1')}</li>
          <li>{t('pollingPro2')}</li>
          <li>{t('pollingPro3')}</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>{t('pollingCons')}</strong></p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>{t('pollingCon1')}</li>
          <li>{t('pollingCon2')}</li>
          <li>{t('pollingCon3')}</li>
          <li>{t('pollingCon4')}</li>
        </ul>
      </section>

      {/* Webhooks */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('webhooks')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('webhooksDesc')}</p>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>{t('webhookPros')}</strong></p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li>{t('webhookPro1')}</li>
          <li>{t('webhookPro2')}</li>
          <li>{t('webhookPro3')}</li>
          <li>{t('webhookPro4')}</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mb-4"><strong>{t('webhookCons')}</strong></p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>{t('webhookCon1')}</li>
          <li>{t('webhookCon2')}</li>
          <li>{t('webhookCon3')}</li>
        </ul>
      </section>

      {/* Comparison */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('comparison')}</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Özellik</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Polling</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Webhook</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3">Gecikme</td><td className="px-4 py-3">Dakikalar</td><td className="px-4 py-3">Saniyeler</td></tr>
              <tr><td className="px-4 py-3">Verimlilik</td><td className="px-4 py-3">Düşük (israf istekler)</td><td className="px-4 py-3">Yüksek (yalnızca itme)</td></tr>
              <tr><td className="px-4 py-3">Karmaşıklık</td><td className="px-4 py-3">Basit</td><td className="px-4 py-3">Orta</td></tr>
              <tr><td className="px-4 py-3">Ölçekleme</td><td className="px-4 py-3">Zor</td><td className="px-4 py-3">Kolay</td></tr>
              <tr><td className="px-4 py-3">Güvenilirlik</td><td className="px-4 py-3">Zamanlamayı siz kontrol edersiniz</td><td className="px-4 py-3">Gönderene bağlı</td></tr>
              <tr><td className="px-4 py-3">Hız limitleri</td><td className="px-4 py-3">Siz çarparsınız</td><td className="px-4 py-3">Gönderen yönetir</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      {/* When to Use Each */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whenPolling')}</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li>{t('whenPolling1')}</li>
          <li>{t('whenPolling2')}</li>
          <li>{t('whenPolling3')}</li>
        </ul>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 mt-8">{t('whenWebhooks')}</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>{t('whenWebhooks1')}</li>
          <li>{t('whenWebhooks2')}</li>
          <li>{t('whenWebhooks3')}</li>
          <li>{t('whenWebhooks4')}</li>
        </ul>
      </section>

      {/* Hybrid */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('hybrid')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('hybridDesc')}</p>
      </section>
    </article>
  );
}
