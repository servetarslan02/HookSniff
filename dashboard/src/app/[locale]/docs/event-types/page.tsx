import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Event Types',
  description: 'Define and manage webhook event types in HookSniff',
};

export default async function EventTypesPage() {
  const t = await getTranslations('docsEventTypes');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('theProblem')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('problemDesc1')}</p>
        <p className="text-gray-600 dark:text-slate-400">{t('problemDesc2')}</p>
      </section>

      {/* The Solution */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('howWorks')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('howWorksDesc')}</p>
        <div className="grid grid-cols-2 gap-3 mb-4 not-prose">
          {['order.created', 'order.updated', 'order.cancelled', 'payment.succeeded', 'payment.failed', 'user.created', 'user.updated', 'invoice.paid'].map((evt) => (
            <code key={evt} className="bg-gray-100 dark:bg-slate-800 px-3 py-2 rounded-lg text-sm text-center">{evt}</code>
          ))}
        </div>
        <p className="text-gray-600 dark:text-slate-400">{t('anyFormat')}</p>
      </section>

      {/* Registering */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('registering')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('registeringDesc')}</p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint_id": "ep_abc123",
    "event": "order.created",
    "data": {"order_id": "12345"}
  }'`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">{t('nowAvailable')}</p>
      </section>

      {/* Filtering */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('filtering')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('filteringDesc')}</p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://myapp.com/webhooks/orders",
    "description": "Order events only",
    "event_filter": "order.*"
  }'`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4 mb-4">{t('filterPatterns')}</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.created</code> — {t('exactMatch')}</li>
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">order.*</code> — {t('wildcard')}</li>
          <li><code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">*</code> — {t('allEvents')}</li>
        </ul>
      </section>

      {/* Schema Validation */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('schemaValidation')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('schemaValidationDesc')}</p>
        <CodeBlock
          code={`{
  "event_type": "order.created",
  "schema": {
    "type": "object",
    "required": ["order_id", "total"],
    "properties": {
      "order_id": { "type": "string" },
      "total": { "type": "number", "minimum": 0 },
      "currency": { "type": "string", "default": "USD" }
    }
  }
}`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">{t('schemaReject')}</p>
      </section>

      {/* Best Practices */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('bestPractices')}</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t('bpSpecific').split(':')[0]}:</strong> {t('bpSpecific').split(':').slice(1).join(':')}</li>
          <li><strong>{t('bpDots').split(':')[0]}:</strong> {t('bpDots').split(':').slice(1).join(':')}</li>
          <li><strong>{t('bpVersion').split(':')[0]}:</strong> {t('bpVersion').split(':').slice(1).join(':')}</li>
          <li><strong>{t('bpWildcards').split(':')[0]}:</strong> {t('bpWildcards').split(':').slice(1).join(':')}</li>
          <li><strong>{t('bpDocument').split(':')[0]}:</strong> {t('bpDocument').split(':').slice(1).join(':')}</li>
        </ul>
      </section>
    </article>
  );
}
