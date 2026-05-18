import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Multi-Tenant Architecture',
  description: 'Use HookSniff to build multi-tenant webhook systems',
};

export default async function MultiTenantPage() {
  const t = await getTranslations('docsMultiTenant');
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

      {/* How Multi-Tenancy Works */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('howWorks')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('howWorksDesc')}</p>
      </section>

      {/* Implementation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('implementation')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('implementationDesc')}</p>
        <ol className="space-y-3 text-gray-600 dark:text-slate-400">
          <li><strong>1.</strong> {t('isolation1')}</li>
          <li><strong>2.</strong> {t('isolation2')}</li>
          <li><strong>3.</strong> {t('isolation3')}</li>
          <li><strong>4.</strong> {t('isolation4')}</li>
        </ol>
      </section>

      {/* Best Practices */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('bestPractices')}</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>{t('bp1')}</li>
          <li>{t('bp2')}</li>
          <li>{t('bp3')}</li>
          <li>{t('bp4')}</li>
          <li>{t('bp5')}</li>
        </ul>
      </section>
    </article>
  );
}
