import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PrefetchLink as Link } from '@/components/PrefetchLink';
import PublicNavbar from '@/components/PublicNavbar';
import { CreditCard, ShoppingBag } from '@/components/icons';
import { Suspense } from 'react';

function GithubIcon({ size = 32, strokeWidth = 1.5, ...props }: { size?: number; strokeWidth?: number; [key: string]: unknown }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export const metadata = {
  title: 'Webhook Provider Guides — Stripe, GitHub, Shopify & More | HookSniff',
  description: 'Step-by-step guides for integrating webhooks from popular providers. Stripe, GitHub, Shopify, and more with HookSniff.',
};

const providers = [
  { name: 'Stripe', icon: <CreditCard size={32} strokeWidth={1.5} className="text-purple-600 dark:text-purple-400" />, desc: 'Payments, subscriptions, disputes, and refunds.', href: '/providers/stripe', color: 'purple' },
  { name: 'GitHub', icon: <GithubIcon size={32} strokeWidth={1.5} />, desc: 'Push, PR, issues, deployments, and CI/CD events.', href: '/providers/github', color: 'gray' },
  { name: 'Shopify', icon: <ShoppingBag size={32} strokeWidth={1.5} className="text-green-600 dark:text-green-400" />, desc: 'Orders, products, customers, and inventory.', href: '/providers/shopify', color: 'green' },
];

async function ProvidersContent({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations('providers');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <PublicNavbar pageTitle={t("title")} />

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">{t("guides")}</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">{t('guidesDesc')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {providers.map((p) => (
            <Link key={p.name} href={p.href} className="group p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors text-center">
              <span className="text-4xl mb-3 block">{p.icon}</span>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-2">{p.name}</h2>
              <p className="text-sm text-gray-600 dark:text-slate-400">{p.desc}</p>
            </Link>
          ))}
        </div>

        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">Don&apos;t see your provider?</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">HookSniff works with any webhook provider. Use the inbound proxy to receive and normalize webhooks from any source.</p>
          <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Start for free →</Link>
        </div>
      </main>
    </div>
  );
}

export default async function ProvidersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-slate-950 animate-pulse" />}>
      <ProvidersContent locale={locale} />
    </Suspense>
  );
}
