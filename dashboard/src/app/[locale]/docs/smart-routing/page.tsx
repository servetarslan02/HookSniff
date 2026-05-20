import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Smart Routing',
  description: 'Distribute webhooks intelligently across endpoints',
};

export default async function SmartRoutingPage() {
  const t = await getTranslations('docsSmartRouting');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">{t('subtitle')}</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('theProblem')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('problemDesc')}</p>
      </section>

      {/* Quick Start */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('quickStart')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('quickStartDesc')}</p>
        <div className="space-y-4 not-prose">
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('step1Title')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('step1Desc')}</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('step2Title')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('step2Desc')}</p>
          </div>
        </div>
      </section>

      {/* Routing Strategies */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('routingStrategies')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('routingDesc')}</p>
        <div className="space-y-4 not-prose">
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🔄 {t('roundRobinTitle')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{t('roundRobinDesc')}</p>
            <code className="text-xs text-gray-500 dark:text-slate-500">{t('roundRobinExample')}</code>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🛡️ {t('failoverTitle')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{t('failoverDesc')}</p>
            <code className="text-xs text-gray-500 dark:text-slate-500">{t('failoverExample')}</code>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">⚖️ {t('weighted') || 'Weighted'}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('weightedDesc')}</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🎲 {t('random') || 'Random'}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('randomDesc')}</p>
          </div>
        </div>
      </section>

      {/* Configuration */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('configuration')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('configDesc')}</p>
        <CodeBlock code={t('configCurl')} />
      </section>

      {/* Health Monitoring */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('healthMonitoring')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('healthDesc')}</p>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('healthMetrics')}</h3>
        <ul className="space-y-2">
          <li className="text-gray-600 dark:text-slate-400">• {t('hm1')}</li>
          <li className="text-gray-600 dark:text-slate-400">• {t('hm2')}</li>
          <li className="text-gray-600 dark:text-slate-400">• {t('hm3')}</li>
          <li className="text-gray-600 dark:text-slate-400">• {t('hm4')}</li>
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
