import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Payload Transforms',
  description: 'Transform webhook payloads before delivery',
};

export default async function TransformsPage() {
  const t = await getTranslations('docsTransforms');
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('howItWorks')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('howItWorksDesc')}
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints/ep_abc123/transforms \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Filter order fields",
    "rules": [
      { "action": "include", "field": "order_id" },
      { "action": "include", "field": "total" },
      { "action": "include", "field": "status" },
      { "action": "exclude", "field": "internal_notes" },
      { "action": "rename", "from": "total", "to": "amount" }
    ]
  }'`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('testTransform')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('testDesc')}
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints/ep_abc123/transforms/test \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "payload": { "order_id": "12345", "total": 99.99, "internal_notes": "..." },
    "rules": [
      { "action": "include", "field": "order_id" },
      { "action": "exclude", "field": "internal_notes" }
    ]
  }'`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('useCases')}</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t('uc1').split(' — ')[0]}</strong> — {t('uc1').split(' — ')[1]}</li>
          <li><strong>{t('uc2').split(' — ')[0]}</strong> — {t('uc2').split(' — ')[1]}</li>
          <li><strong>{t('uc3').split(' — ')[0]}</strong> — {t('uc3').split(' — ')[1]}</li>
          <li><strong>{t('uc4').split(' — ')[0]}</strong> — {t('uc4').split(' — ')[1]}</li>
        </ul>
      </section>
    </article>
  );
}
