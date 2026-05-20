import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Playground',
  description: 'Test webhooks without writing code',
};

export default async function PlaygroundPage() {
  const t = await getTranslations('docsPlayground');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">{t('subtitle')}</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('theProblem')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('problemDesc')}</p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('thePlayground')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('playgroundDesc')}</p>
        <div className="not-prose rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4">
          <p className="text-sm text-blue-800 dark:text-blue-300">💡 {t('playgroundNote')}</p>
        </div>
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
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{t('step3Title')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('step3Desc')}</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('playgroundFeatures')}</h2>
        <div className="space-y-4 not-prose">
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🌐 {t('feature1Title')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('feature1Desc')}</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📋 {t('feature2Title')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('feature2Desc')}</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🤖 {t('feature3Title')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('feature3Desc')}</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🔍 {t('feature4Title')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('feature4Desc')}</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📜 {t('feature5Title')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('feature5Desc')}</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">📡 {t('feature6Title')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('feature6Desc')}</p>
          </div>
        </div>
      </section>

      {/* API Example */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('apiExample')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('apiExampleDesc')}</p>
        <CodeBlock code={t('curlExample')} />
      </section>

      {/* Simulator */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('simulator')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('simulatorDesc')}</p>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t('simulatorFeatures')}</h3>
        <ul className="space-y-2">
          <li className="text-gray-600 dark:text-slate-400">• {t('sim1')}</li>
          <li className="text-gray-600 dark:text-slate-400">• {t('sim2')}</li>
          <li className="text-gray-600 dark:text-slate-400">• {t('sim3')}</li>
          <li className="text-gray-600 dark:text-slate-400">• {t('sim4')}</li>
          <li className="text-gray-600 dark:text-slate-400">• {t('sim5')}</li>
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
