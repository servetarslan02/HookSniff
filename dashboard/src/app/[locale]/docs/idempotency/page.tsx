import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Idempotency',
  description: 'Ensure webhook deliveries are processed exactly once',
};

export default async function IdempotencyPage() {
  const t = await getTranslations('docsIdempotency');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* The Problem */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('theProblem')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('problemDesc1')}
        </p>
        <p className="text-gray-600 dark:text-slate-400">
          {t('problemDesc2')}
        </p>
      </section>

      {/* The Solution */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('howItWorks')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('howItWorksDesc')}
        </p>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: order-12345-created" \\
  -d '{
    "endpoint_id": "ep_abc123",
    "event": "order.created",
    "data": {"order_id": "12345", "total": 99.99}
  }'`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4 mb-4">{t('whatHappens')}</p>
        <CodeBlock
          code={`// ${t('firstRequest')}
POST /v1/webhooks
Idempotency-Key: order-12345-created
→ 200 { "id": "wh_abc123", "status": "pending" }

// ${t('secondRequest')}
POST /v1/webhooks
Idempotency-Key: order-12345-created
→ 200 { "id": "wh_abc123", "status": "pending" }  // ${t('sameResponse')}

// ${t('differentKey')}
POST /v1/webhooks
Idempotency-Key: order-12345-updated
→ 200 { "id": "wh_def456", "status": "pending" }`}
        />
      </section>

      {/* Key Design */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('keyDesign')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('keyDesignDesc')}
        </p>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 mb-4">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('pattern')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('example')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('whenToUse')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-mono text-sm">{'{resource}-{id}-{action}'}</td><td className="px-4 py-3 font-mono text-sm">order-12345-created</td><td className="px-4 py-3">{t('orderEvents')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">payment-{'{id}'}-succeeded</td><td className="px-4 py-3 font-mono text-sm">payment-pay_abc-succeeded</td><td className="px-4 py-3">{t('paymentEvents')}</td></tr>
              <tr><td className="px-4 py-3 font-mono text-sm">user-{'{id}'}-signup-{'{date}'}</td><td className="px-4 py-3 font-mono text-sm">user-456-signup-20260115</td><td className="px-4 py-3">{t('userEvents')}</td></tr>
            </tbody>
          </table></div>
        </div>
        <p className="text-gray-600 dark:text-slate-400">
          {t('keysExpire')}
        </p>
      </section>

      {/* Best Practices */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('bestPractices')}</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t('bp1')}</strong></li>
          <li><strong>{t('bp2')}</strong></li>
          <li><strong>{t('bp3')}</strong> — <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">{t('bp3Example1')}</code> ve <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">{t('bp3Example2')}</code> {t('bp3Desc')}</li>
          <li><strong>{t('bp4')}</strong></li>
          <li><strong>{t('bp5')}</strong></li>
        </ul>
      </section>
    </article>
  );
}
