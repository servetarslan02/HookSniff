import CodeBlock from '@/components/CodeBlock';
import { Key } from '@/components/icons';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'API Keys — HookSniff Docs',
  description: 'Create and manage API keys for authenticating with the HookSniff API.',
};

export default async function APIKeysPage() {
  const t = await getTranslations('docsApiKeys');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
        <Key size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('title')}
      </h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">{t('subtitle')}</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whatIs')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('whatIsDesc')}</p>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('format')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('formatDesc')}</p>
        <CodeBlock code={`hr_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`} />
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('security')}</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>{t('sec1')}</li>
          <li>{t('sec2')}</li>
          <li>{t('sec3')}</li>
          <li>{t('sec4')}</li>
          <li>{t('sec5')}</li>
        </ul>
      </section>
    </article>
  );
}