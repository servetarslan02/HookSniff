import { Suspense } from 'react';
import CodeBlock from '@/components/CodeBlock';
import { Settings } from '@/components/icons';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';


export const metadata: Metadata = {
  title: 'Background Tasks — HookSniff Docs',
  description: 'Monitor and manage asynchronous background jobs.',
};



async function BackgroundTasksPageContent(params: Promise<{ locale: string }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('docsBackgroundTasks');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
        <Settings size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('title')}
      </h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">{t('subtitle')}</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whatIs')}</h2>
        <p className="text-gray-600 dark:text-slate-400">{t('whatIsDesc')}</p>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('monitoring')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('monitoringDesc')}</p>
        <CodeBlock code={`# List tasks
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://hooksniff-api-1046140057667.europe-west1.run.app/v1/background-tasks

# Cancel task (requires admin)
curl -X PUT https://hooksniff-api-1046140057667.europe-west1.run.app/v1/background-tasks/TASK_ID \\
  -H "Authorization: Bearer YOUR_API_KEY"`} />
      </section>
    </article>
  );
}

export default async function Page(params: Promise<{ locale: string }>) {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-700" /><div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" /><div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" /><div className="h-64 w-full rounded bg-gray-200 dark:bg-gray-700" /></div>}>
      <BackgroundTasksPageContent {...params} />
    </Suspense>
  );
}
