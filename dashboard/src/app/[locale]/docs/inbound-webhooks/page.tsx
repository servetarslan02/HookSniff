import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Inbound Webhooks',
  description: 'Receive webhooks from Stripe, GitHub, Shopify and other providers',
};

export default async function InboundWebhooksPage() {
  const t = await getTranslations('docsInbound');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">{t('subtitle')}</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('theProblem')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('problemDesc')}</p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('howItWorks')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">{t('howItWorksDesc')}</p>
        <ol className="space-y-2 list-decimal list-inside">
          <li className="text-gray-600 dark:text-slate-400">{t('step1')}</li>
          <li className="text-gray-600 dark:text-slate-400">{t('step2')}</li>
          <li className="text-gray-600 dark:text-slate-400">{t('step3')}</li>
          <li className="text-gray-600 dark:text-slate-400">{t('step4')}</li>
        </ol>
      </section>

      {/* Create Config */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('createConfig')}</h2>
        <CodeBlock code={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/inbound \\
  -H "Authorization: Bearer hr_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{\\"provider\\": \\"stripe\\", \\"endpoint_id\\": \\"ep_abc123\\"}'`} />
        <p className="text-gray-600 dark:text-slate-400 mt-4">{t('configResponse')}</p>
        <CodeBlock code={`{
  "id": "inb_xyz789",
  "provider": "stripe",
  "inbound_url": "https://hooksniff-api-...run.app/v1/inbound/stripe/inb_xyz789",
  "endpoint_id": "ep_abc123"
}`} />
      </section>

      {/* Supported Providers */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('supportedProviders')}</h2>
        <div className="not-prose overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800">
                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">{t('provider')}</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">{t('signatureHeader')}</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">{t('autoDetection')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              <tr><td className="px-4 py-3 text-gray-600 dark:text-slate-400">Stripe</td><td className="px-4 py-3 font-mono text-gray-600 dark:text-slate-400">Stripe-Signature</td><td className="px-4 py-3 text-gray-600 dark:text-slate-400">✅</td></tr>
              <tr><td className="px-4 py-3 text-gray-600 dark:text-slate-400">GitHub</td><td className="px-4 py-3 font-mono text-gray-600 dark:text-slate-400">X-Hub-Signature-256</td><td className="px-4 py-3 text-gray-600 dark:text-slate-400">✅</td></tr>
              <tr><td className="px-4 py-3 text-gray-600 dark:text-slate-400">Shopify</td><td className="px-4 py-3 font-mono text-gray-600 dark:text-slate-400">X-Shopify-Hmac-SHA256</td><td className="px-4 py-3 text-gray-600 dark:text-slate-400">✅</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Benefits */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('benefits')}</h2>
        <ul className="space-y-2">
          <li className="text-gray-600 dark:text-slate-400">✅ {t('benefit1')}</li>
          <li className="text-gray-600 dark:text-slate-400">✅ {t('benefit2')}</li>
          <li className="text-gray-600 dark:text-slate-400">✅ {t('benefit3')}</li>
          <li className="text-gray-600 dark:text-slate-400">✅ {t('benefit4')}</li>
          <li className="text-gray-600 dark:text-slate-400">✅ {t('benefit5')}</li>
        </ul>
      </section>
    </article>
  );
}
