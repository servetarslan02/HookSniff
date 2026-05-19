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
          code={`// List available templates
curl https://hooksniff-api-1046140057667.europe-west1.run.app/v1/templates \\
  -H "Authorization: Bearer hr_live_YOUR_KEY"`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('applyTemplate')}</h2>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/templates/tmpl_ecommerce/apply \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint_url": "https://myapp.com/webhooks",
    "customizations": {
      "retry_attempts": 5,
      "event_filter": "order.*"
    }
  }'`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          {t('applyNote')}
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('availableTemplates')}</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t('tpl1').split(' — ')[0]}</strong> — {t('tpl1').split(' — ')[1]}</li>
          <li><strong>{t('tpl2').split(' — ')[0]}</strong> — {t('tpl2').split(' — ')[1]}</li>
          <li><strong>{t('tpl3').split(' — ')[0]}</strong> — {t('tpl3').split(' — ')[1]}</li>
          <li><strong>{t('tpl4').split(' — ')[0]}</strong> — {t('tpl4').split(' — ')[1]}</li>
        </ul>
      </section>
    </article>
  );
}
