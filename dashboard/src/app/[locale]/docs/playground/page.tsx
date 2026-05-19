import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Playground',
  description: 'Test webhooks instantly with the HookSniff playground',
};

export default async function PlaygroundPage() {
  const t = await getTranslations('docsPlayground');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('theProblem')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('problemDesc')}
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('thePlayground')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('playgroundDesc')}
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/playground/test \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint_id": "ep_abc123",
    "event": "test.ping",
    "data": { "message": "Hello from the playground!" }
  }'`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          {t('playgroundNote')}
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('simulator')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('simulatorDesc')}
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/simulator \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint_id": "ep_abc123",
    "count": 100,
    "event": "order.created",
    "interval_ms": 100
  }'`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          {t('simulatorNote')}
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('dashboardPlayground')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('dashboardPlaygroundDesc')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>{t('dp1')}</li>
          <li>{t('dp2')}</li>
          <li>{t('dp3')}</li>
          <li>{t('dp4')}</li>
        </ul>
      </section>
    </article>
  );
}
