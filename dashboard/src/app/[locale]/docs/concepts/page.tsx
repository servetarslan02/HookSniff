import CodeBlock from '@/components/CodeBlock';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Core Concepts',
  description: "Learn the core concepts behind HookSniff's webhook delivery system",
};

export default async function ConceptsPage() {
  const t = await getTranslations('docsConcepts');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* Why These Concepts Matter */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('whyMatter')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('whyMatterDesc')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>{t('whyQ1')}</li>
          <li>{t('whyQ2')}</li>
          <li>{t('whyQ3')}</li>
          <li>{t('whyQ4')}</li>
        </ul>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          {t('whyConclusion')}
        </p>
      </section>

      {/* Endpoints */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('endpoints')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('endpointDesc')}
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>{t('endpointWhy').split(':')[0]}:</strong>{t('endpointWhy').split(':').slice(1).join(':')}
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('endpointHas')}</p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>{t('endpointUrl').split(' — ')[0]}</strong> — {t('endpointUrl').split(' — ')[1]}</li>
          <li><strong>{t('endpointSecret').split(' — ')[0]}</strong> — {t('endpointSecret').split(' — ')[1]}</li>
          <li><strong>{t('endpointFilter').split(' — ')[0]}</strong> — {t('endpointFilter').split(' — ')[1]}</li>
          <li><strong>{t('endpointStatus').split(' — ')[0]}</strong> — {t('endpointStatus').split(' — ')[1]}</li>
          <li><strong>{t('endpointRetry').split(' — ')[0]}</strong> — {t('endpointRetry').split(' — ')[1]}</li>
        </ul>
        <CodeBlock
          code={`{
  "id": "ep_abc123",
  "url": "https://myapp.com/webhook",
  "description": "Order notifications",
  "signing_secret": "whsec_abc123xyz789...",
  "is_active": true,
  "event_filter": "order.*",
  "created_at": "2026-01-15T10:30:00Z"
}`}
        />
      </section>

      {/* Webhooks & Deliveries */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('webhooksDeliveries')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('webhookDesc')}
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>{t('webhookDistinction').split(':')[0]}:</strong>{t('webhookDistinction').split(':').slice(1).join(':')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mb-4">
          <li><strong>{t('webhookEventTypes').split(' — ')[0]}</strong> — {t('webhookEventTypes').split(' — ')[1]}</li>
          <li><strong>{t('webhookPayloads').split(' — ')[0]}</strong> — {t('webhookPayloads').split(' — ')[1]}</li>
          <li><strong>{t('webhookStatus').split(' — ')[0]}</strong> — {t('webhookStatus').split(' — ')[1]}</li>
          <li><strong>{t('webhookAttempts').split(' — ')[0]}</strong> — {t('webhookAttempts').split(' — ')[1]}</li>
          <li><strong>{t('webhookIdempotency').split(' — ')[0]}</strong> — {t('webhookIdempotency').split(' — ')[1]}</li>
        </ul>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint_id": "ep_abc123",
    "event": "order.created",
    "data": { "order_id": "12345", "total": 99.99 }
  }'`}
        />
      </section>

      {/* Retries */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('retries')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>{t('retryProblem').split(':')[0]}:</strong>{t('retryProblem').split(':').slice(1).join(':')}
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>{t('retrySolution').split(':')[0]}:</strong>{t('retrySolution').split(':').slice(1).join(':')}
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('retryDefault')}</p>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 mb-4">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('retryAttempt')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('retryDelay')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('retryCumulative')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3">1</td><td className="px-4 py-3">~1 saniye</td><td className="px-4 py-3">~1s</td></tr>
              <tr><td className="px-4 py-3">2</td><td className="px-4 py-3">~2 saniye</td><td className="px-4 py-3">~3s</td></tr>
              <tr><td className="px-4 py-3">3</td><td className="px-4 py-3">~4 saniye</td><td className="px-4 py-3">~7s</td></tr>
            </tbody>
          </table></div>
        </div>
        <p className="text-gray-600 dark:text-slate-400">
          {t('retryAfter')} <Link href="/docs/retries" className="text-brand-600 hover:text-brand-700">Retries & DLQ</Link>
        </p>
      </section>

      {/* Dead Letter Queue */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('dlq')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>{t('dlqProblem').split(':')[0]}:</strong>{t('dlqProblem').split(':').slice(1).join(':')}
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>{t('dlqSolution').split(':')[0]}:</strong>{t('dlqSolution').split(':').slice(1).join(':')}
        </p>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li>{t('dlqPayload')}</li>
          <li>{t('dlqAttempts')}</li>
          <li>{t('dlqReplay')}</li>
          <li>{t('dlqRetention')}</li>
        </ul>
      </section>

      {/* API Keys */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('apiKeys')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>{t('apiKeyProblem').split(':')[0]}:</strong>{t('apiKeyProblem').split(':').slice(1).join(':')}
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>{t('apiKeySolution').split(':')[0]}:</strong>{t('apiKeySolution').split(':').slice(1).join(':')}
        </p>
        <CodeBlock
          code={`Authorization: Bearer hr_live_abc123xyz789`}
        />
        <ul className="space-y-2 text-gray-600 dark:text-slate-400 mt-4">
          <li>{t('apiKeyHashed')}</li>
          <li>{t('apiKeyMultiple')}</li>
          <li>{t('apiKeyScoped')}</li>
          <li>{t('apiKeyPrefix')}</li>
        </ul>
      </section>

      {/* FIFO Delivery */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('fifo')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>{t('fifoProblem').split(':')[0]}:</strong>{t('fifoProblem').split(':').slice(1).join(':')}
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          <strong>{t('fifoSolution').split(':')[0]}:</strong>{t('fifoSolution').split(':').slice(1).join(':')}
        </p>
        <CodeBlock
          code={`{
  "delivery_id": "wh_xyz789",
  "sequence_number": 42,
  "event": "order.created",
  "data": { "order_id": "12345" },
  "timestamp": "2026-01-15T10:30:00Z"
}`}
        />
      </section>

      {/* How It All Fits Together */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('howTogether')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('howTogetherDesc')}
        </p>
        <ol className="space-y-3 text-gray-600 dark:text-slate-400">
          <li><strong>1.</strong> {t('flowStep1')}</li>
          <li><strong>2.</strong> {t('flowStep2')}</li>
          <li><strong>3.</strong> {t('flowStep3')}</li>
          <li><strong>4.</strong> {t('flowStep4')}</li>
          <li><strong>5.</strong> {t('flowStep5')}</li>
          <li><strong>6.</strong> {t('flowStep6')}</li>
          <li><strong>7.</strong> {t('flowStep7')}</li>
        </ol>
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          {t('flowConclusion')}
        </p>
      </section>
    </article>
  );
}
