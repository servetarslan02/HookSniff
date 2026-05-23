import CodeBlock from '@/components/CodeBlock';
import { Radio } from '@/components/icons';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Streaming — HookSniff Docs',
  description: 'Real-time event streaming with SSE channels.',
};

export default async function StreamingPage() {
  const t = await getTranslations('docsStreaming');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
        <Radio size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('title')}
      </h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">{t('subtitle')}</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whatIs')}</h2>
        <p className="text-gray-600 dark:text-slate-400">{t('whatIsDesc')}</p>
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('subscribing')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('subscribingDesc')}</p>
        <CodeBlock code={`const eventSource = new EventSource(
  'https://hooksniff-api-1046140057667.europe-west1.run.app/v1/stream/channels/CHANNEL_ID/subscribe'
);
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('New event:', data);
};`} />
      </section>
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('useCases')}</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>{t('uc1')}</li>
          <li>{t('uc2')}</li>
          <li>{t('uc3')}</li>
          <li>{t('uc4')}</li>
        </ul>
      </section>
    </article>
  );
}