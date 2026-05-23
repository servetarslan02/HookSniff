import CodeBlock from '@/components/CodeBlock';
import { Layers } from '@/components/icons';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Environments — HookSniff Docs',
  description: 'Manage separate environments for development, staging, and production.',
};

export default async function EnvironmentsPage() {
  const t = await getTranslations('docsEnvironments');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
        <Layers size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('title')}
      </h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">{t('subtitle')}</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whatIs')}</h2>
        <p className="text-gray-600 dark:text-slate-400">{t('whatIsDesc')}</p>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('variables')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('variablesDesc')}</p>
        <CodeBlock code={`# List environments
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://hooksniff-api-1046140057667.europe-west1.run.app/v1/environments

# Create environment
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/environments \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Staging", "slug": "staging"}'

# List variables
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://hooksniff-api-1046140057667.europe-west1.run.app/v1/environments/ENV_ID/variables

# Create variable
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/environments/ENV_ID/variables \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"key": "WEBHOOK_SECRET", "value": "whsec_..."}'`} />
      </section>
    </article>
  );
}