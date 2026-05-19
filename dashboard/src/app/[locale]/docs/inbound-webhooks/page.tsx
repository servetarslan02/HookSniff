import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Inbound Webhooks',
  description: 'Receive webhooks from external providers through HookSniff',
};

export default async function InboundWebhooksPage() {
  const t = await getTranslations('docsInbound');
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
        <ol className="space-y-3 text-gray-600 dark:text-slate-400">
          <li><strong>1.</strong> {t('step1')}</li>
          <li><strong>2.</strong> {t('step2')}</li>
          <li><strong>3.</strong> {t('step3')}</li>
          <li><strong>4.</strong> {t('step4')}</li>
        </ol>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('createConfig')}</h2>
        <CodeBlock
          code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/inbound/configs \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "provider": "stripe",
    "endpoint_id": "ep_abc123",
    "secret": "whsec_stripe_secret_from_dashboard"
  }'`}
        />
        <p className="text-gray-600 dark:text-slate-400 mt-4">
          {t('configResponse')}
        </p>
        <CodeBlock
          code={`{
  "id": "inbound_abc123",
  "provider": "stripe",
  "inbound_url": "https://hooksniff-api.../v1/inbound/stripe",
  "endpoint_id": "ep_abc123"
}`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('supportedProviders')}</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('provider')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('signatureHeader')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('autoDetection')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3 font-medium">Stripe</td><td className="px-4 py-3 font-mono text-sm">stripe-signature</td><td className="px-4 py-3">✅</td></tr>
              <tr><td className="px-4 py-3 font-medium">GitHub</td><td className="px-4 py-3 font-mono text-sm">x-hub-signature-256</td><td className="px-4 py-3">✅</td></tr>
              <tr><td className="px-4 py-3 font-medium">Shopify</td><td className="px-4 py-3 font-mono text-sm">x-shopify-hmac-sha256</td><td className="px-4 py-3">✅</td></tr>
              <tr><td className="px-4 py-3 font-medium">Custom</td><td className="px-4 py-3 font-mono text-sm">Configurable</td><td className="px-4 py-3">—</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('benefits')}</h2>
        <ul className="space-y-2 text-gray-600 dark:text-slate-400">
          <li><strong>{t('benefit1').split(' — ')[0]}</strong> — {t('benefit1').split(' — ')[1]}</li>
          <li><strong>{t('benefit2').split(' — ')[0]}</strong> — {t('benefit2').split(' — ')[1]}</li>
          <li><strong>{t('benefit3').split(' — ')[0]}</strong> — {t('benefit3').split(' — ')[1]}</li>
          <li><strong>{t('benefit4').split(' — ')[0]}</strong> — {t('benefit4').split(' — ')[1]}</li>
          <li><strong>{t('benefit5').split(' — ')[0]}</strong> — {t('benefit5').split(' — ')[1]}</li>
        </ul>
      </section>
    </article>
  );
}
