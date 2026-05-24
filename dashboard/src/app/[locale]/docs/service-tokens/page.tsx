import { Shield } from '@/components/icons';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Service Tokens — HookSniff Docs',
  description: 'Create tokens for CI/CD pipelines and third-party integrations.',
};

export default async function ServiceTokensPage() {
  const t = await getTranslations('docsServiceTokens');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
        <Shield size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('title')}
      </h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">{t('subtitle')}</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whatIs')}</h2>
        <p className="text-gray-600 dark:text-slate-400">{t('whatIsDesc')}</p>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('scopes')}</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr><th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Action</th><th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Endpoint</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              <tr><td className="px-4 py-3 font-medium">List</td><td className="px-4 py-3 font-mono text-sm">GET /v1/service-tokens</td></tr>
              <tr><td className="px-4 py-3 font-medium">Create</td><td className="px-4 py-3 font-mono text-sm">POST /v1/service-tokens</td></tr>
              <tr><td className="px-4 py-3 font-medium">Delete</td><td className="px-4 py-3 font-mono text-sm">DELETE /v1/service-tokens/:id</td></tr>
              <tr><td className="px-4 py-3 font-medium">Reveal</td><td className="px-4 py-3 font-mono text-sm">POST /v1/service-tokens/:id/reveal</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </article>
  );
}