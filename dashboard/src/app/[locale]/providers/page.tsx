import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { CreditCard, Github, ShoppingBag } from 'lucide-react';

// Revalidate every hour for ISR
export const revalidate = 3600;


export const metadata = {
  title: 'Webhook Provider Guides — Stripe, GitHub, Shopify & More | HookSniff',
  description: 'Step-by-step guides for integrating webhooks from popular providers. Stripe, GitHub, Shopify, and more with HookSniff.',
};

const providers = [
  { name: 'Stripe', icon: <CreditCard size={32} strokeWidth={1.5} className="text-purple-600 dark:text-purple-400" />, desc: 'Payments, subscriptions, disputes, and refunds.', href: '/providers/stripe', color: 'purple' },
  { name: 'GitHub', icon: <Github size={32} strokeWidth={1.5} />, desc: 'Push, PR, issues, deployments, and CI/CD events.', href: '/providers/github', color: 'gray' },
  { name: 'Shopify', icon: <ShoppingBag size={32} strokeWidth={1.5} className="text-green-600 dark:text-green-400" />, desc: 'Orders, products, customers, and inventory.', href: '/providers/shopify', color: 'green' },
];

export default function ProvidersPage() {
  const t = useTranslations('providers');
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <span className="text-gray-600 dark:text-slate-400">{t("title")}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">{t("guides")}</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">Step-by-step guides for receiving webhooks from popular providers. Set up, verify, and process events in minutes.</p>
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
