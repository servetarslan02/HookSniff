import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Webhook Templates',
  description: 'Pre-built webhook configurations for common use cases',
};

export default async function TemplatesPage() {
  const t = await getTranslations('docsTemplates');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

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

      {/* API Example */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('apiExample')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('apiExampleDesc')}</p>
        <CodeBlock code={t('curlExample')} />
      </section>

      {/* Template Details */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('templateDetails')}</h2>
        <div className="space-y-6 not-prose">
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🛒 {t('ecommerceTitle')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{t('ecommerceDesc')}</p>
            <code className="text-xs text-gray-500 dark:text-slate-500">{t('ecommerceEvents')}</code>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">☁️ {t('saasTitle')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{t('saasDesc')}</p>
            <code className="text-xs text-gray-500 dark:text-slate-500">{t('saasEvents')}</code>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">🔄 {t('cicdTitle')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{t('cicdDesc')}</p>
            <code className="text-xs text-gray-500 dark:text-slate-500">{t('cicdEvents')}</code>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-slate-700 p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">⚙️ {t('customTitle')}</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t('customDesc')}</p>
          </div>
        </div>
      </section>

      {/* Available Templates */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('availableTemplates')}</h2>
        <ul className="space-y-2">
          <li className="text-gray-600 dark:text-slate-400">• {t('tpl1')}</li>
          <li className="text-gray-600 dark:text-slate-400">• {t('tpl2')}</li>
          <li className="text-gray-600 dark:text-slate-400">• {t('tpl3')}</li>
          <li className="text-gray-600 dark:text-slate-400">• {t('tpl4')}</li>
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
