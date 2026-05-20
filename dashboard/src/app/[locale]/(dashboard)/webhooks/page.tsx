import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { BookOpen, HelpCircle, Plug, Scale, Search, Webhook } from 'lucide-react';

// Revalidate every hour for ISR
export const revalidate = 3600;


export const metadata = {
  title: 'Webhooks — Guides, Glossary, Tools & Providers | HookSniff',
  description: 'Everything about webhooks: guides, glossary, comparison tools, and provider integrations. Learn, implement, and scale webhooks with HookSniff.',
};

export default function WebhooksPage() {
  const t = useTranslations('webhooks');
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

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">{t("title")}</h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">A comprehensive resource for webhook implementation, security, and best practices.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {[
            { icon: <BookOpen size={16} strokeWidth={1.75} />, title: 'Guides', desc: 'Step-by-step guides from basics to advanced patterns.', href: '/webhooks/guides' },
            { icon: <HelpCircle size={16} strokeWidth={1.75} />, title: 'Glossary', desc: '35+ webhook terms defined. HMAC, DLQ, CloudEvents, and more.', href: '/webhooks/glossary' },
            { icon: <Scale size={16} strokeWidth={1.75} />, title: 'Build vs Buy', desc: 'Should you build webhook infrastructure or use a service?', href: '/build-vs-buy' },
            { icon: <Search size={16} strokeWidth={1.75} />, title: 'Compare Tools', desc: 'HookSniff vs Svix vs Hookdeck vs Hook0 — side by side.', href: '/compare' },
            { icon: <Plug size={16} strokeWidth={1.75} />, title: 'Provider Guides', desc: 'Stripe, GitHub, Shopify webhook setup guides.', href: '/webhooks/guides' },
            { icon: <Webhook size={16} strokeWidth={1.75} />, title: 'What is a Webhook?', desc: 'The complete introduction to webhooks for beginners.', href: '/what-is-a-webhook' },
          ].map((card) => (
            <Link key={card.title} href={card.href} className="group p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-2 flex items-center gap-2"><span className="text-3xl flex-shrink-0">{card.icon}</span>{card.title}</h2>
              <p className="text-sm text-gray-600 dark:text-slate-400">{card.desc}</p>
            </Link>
          ))}
        </div>

        {/* Alternatives Hub */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">{t('alternativesTitle')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Svix Alternatives', href: '/alternatives/svix-alternatives' },
              { title: 'Hookdeck Alternatives', href: '/alternatives/hookdeck-alternatives' },
              { title: 'Convoy Alternatives', href: '/alternatives/convoy-alternatives' },
              { title: 'HookSniff vs Svix', href: '/alternatives/svix' },
              { title: 'HookSniff vs Hookdeck', href: '/alternatives/hookdeck' },
              { title: 'HookSniff vs Hook0', href: '/alternatives/hook0' },
            ].map((link) => (
              <Link key={link.title} href={link.href} className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors text-sm font-medium text-gray-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400">
                {link.title} →
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">{t('readyTitle')}</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">{t('readyDescAlt')}</p>
          <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">{t('startFree')}</Link>
        </div>
      </main>
    </div>
  );
}
