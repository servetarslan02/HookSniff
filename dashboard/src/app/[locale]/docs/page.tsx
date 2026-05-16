import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';

// Revalidate every hour for ISR
export const revalidate = 3600;


export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Complete documentation for HookSniff webhook delivery service',
};


export default function DocsPage() {
  const t = useTranslations('docs');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{t('gettingStarted')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        HookSniff is a webhook delivery and monitoring platform. Send webhooks with confidence — we handle delivery, retries, signature verification, and observability.
      </p>

      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-12">
        {[
          { title: '🚀 Quickstart', desc: 'Send your first webhook in under 5 minutes.', href: '/docs/quickstart' },
          { title: '📐 Core Concepts', desc: 'Endpoints, deliveries, retries, and more.', href: '/docs/concepts' },
          { title: '🔒 Security', desc: 'HMAC-SHA256 verification, IP whitelisting, TLS.', href: '/docs/security' },
          { title: '🖥️ Dashboard', desc: 'Monitor deliveries, manage endpoints, view analytics.', href: '/docs/dashboard' },
          { title: '🔌 Integrations', desc: 'Stripe, GitHub, Shopify, and generic guides.', href: '/docs/integrations' },
          { title: '🐳 Self-Hosting', desc: 'Run HookSniff on your own infrastructure.', href: '/docs/self-hosting' },
          { title: '🔄 Retries & DLQ', desc: 'Exponential backoff, replay failed webhooks.', href: '/docs/retries' },
          { title: '📦 SDKs', desc: 'Official Node.js, Python, and Go SDKs.', href: '/docs/sdk-libraries' },
        ].map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="block p-5 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-md transition group"
          >
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
              {card.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">{card.desc}</p>
          </Link>
        ))}
      </div>

      {/* API Info */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('apiBaseUrl')}</h2>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
          {`https://hooksniff-api-1046140057667.europe-west1.run.app/v1`}
        </pre>
      </section>

      {/* Authentication Quick Reference */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('authentication')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-3">
          All API requests require a Bearer token with an <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">hr_live_</code> prefixed API key:
        </p>
        <pre className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 p-4 rounded-xl text-sm font-mono overflow-x-auto">
          {`Authorization: Bearer hr_live_abc123xyz789`}
        </pre>
      </section>

      {/* Rate Limits */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('rateLimits')}</h2>
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="overflow-x-auto"><table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">{t('plan')}</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Requests/min</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Webhooks/month</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr><td className="px-4 py-3">{t('developer')}</td><td className="px-4 py-3">100</td><td className="px-4 py-3">1,000</td></tr>
              <tr><td className="px-4 py-3">{t('startup')}</td><td className="px-4 py-3">1,000</td><td className="px-4 py-3">30,000</td></tr>
              <tr><td className="px-4 py-3">{t('pro')}</td><td className="px-4 py-3">10,000</td><td className="px-4 py-3">100,000</td></tr>
              <tr><td className="px-4 py-3">{t('enterprise')}</td><td className="px-4 py-3">{t('unlimited')}</td><td className="px-4 py-3">{t('unlimited')}</td></tr>
            </tbody>
          </table></div>
        </div>
      </section>
    </article>
  );
}
// deploy trigger Mon May 11 09:46:30 PM CST 2026
