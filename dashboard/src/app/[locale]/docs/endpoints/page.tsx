import CodeBlock from '@/components/CodeBlock';
import { Globe } from '@/components/icons';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Endpoints — HookSniff Docs',
  description: 'Endpoints are the URLs where HookSniff delivers your webhooks.',
};

export default async function EndpointsPage() {
  const t = await getTranslations('docsEndpoints');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
        <Globe size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('title')}
      </h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">{t('subtitle')}</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whatIs')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('whatIsDesc')}</p>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('endpointFields')}</h2>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr><th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Field</th><th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Description</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              <tr><td className="px-4 py-3 font-mono text-sm">url</td><td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('fieldUrl')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">routing_strategy</td><td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('fieldRouting')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">fallback_url</td><td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('fieldFallback')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">format</td><td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('fieldFormat')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">allowed_ips</td><td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('fieldAllowedIps')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">custom_headers</td><td className="px-4 py-3 text-gray-600 dark:text-slate-400">{t('fieldCustomHeaders')}</td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <section className="mb-12">
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