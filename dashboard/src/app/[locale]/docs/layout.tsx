'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import Footer from '@/components/Footer';
import { useState } from 'react';

interface NavItem {
  name: string;
  href: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations('docs');
  const tNav = useTranslations('nav');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarNav: NavGroup[] = [
    {
      title: t('gettingStarted'),
      items: [
        { name: t('introduction') || 'Introduction', href: '/docs' },
        { name: t('quickstart') || 'Quickstart', href: '/docs/quickstart' },
        { name: t('coreConcepts') || 'Core Concepts', href: '/docs/concepts' },
      ],
    },
    {
      title: t('guides') || 'Guides',
      items: [
        { name: t('webhookSecurity') || 'Webhook Security', href: '/docs/security' },
        { name: t('dashboardGuide') || 'Dashboard', href: '/docs/dashboard' },
        { name: t('integrations') || 'Integrations', href: '/docs/integrations' },
        { name: t('selfHosting') || 'Self-Hosting', href: '/docs/self-hosting' },
        { name: t('architecture') || 'Architecture', href: '/docs/architecture' },
      ],
    },
    {
      title: t('features') || 'Features',
      items: [
        { name: t('retriesAndDlq') || 'Retries & DLQ', href: '/docs/retries' },
        { name: t('deadLetterQueue') || 'Dead Letter Queue', href: '/docs/dlq' },
        { name: t('eventTypes') || 'Event Types', href: '/docs/event-types' },
        { name: t('idempotency') || 'Idempotency', href: '/docs/idempotency' },
        { name: t('embeddablePortal') || 'Embeddable Portal', href: '/docs/embed-portal' },
      ],
    },
    {
      title: t('reference') || 'Reference',
      items: [
        { name: t('apiReference'), href: '/docs/api-reference' },
        { name: 'SDKs', href: '/docs/sdk-libraries' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Top Nav */}
      <nav className="border-b border-gray-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-linear-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-lg">
              🪝
            </div>
            <span className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">HookSniff</span>
            <span className="hidden sm:inline text-sm text-gray-500 dark:text-slate-500 ml-2">{t('docs')}</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mobile sidebar toggle */}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              aria-label="Toggle navigation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <LanguageSwitcher />
            <Link href={"/"} className="hidden sm:inline text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:text-white transition">
              {tNav('dashboard')}
            </Link>
            <Link href="/" className="hidden sm:inline text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:text-white transition">
              {t('home')}
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Sidebar — hidden on mobile, shown via toggle */}
        <aside className={clsx(
          'lg:block lg:w-56 shrink-0',
          sidebarOpen ? 'block' : 'hidden'
        )}>
          <nav className="lg:sticky lg:top-24">
            {sidebarNav.map((group) => (
              <div key={group.title} className="mb-6">
                <h3 className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-500">
                  {group.title}
                </h3>
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={clsx(
                        'block px-3 py-2 sm:py-1.5 rounded-lg text-sm font-medium transition',
                        pathname === item.href
                          ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                          : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 overflow-hidden break-words">{children}</div>
      </div>
      <Footer />
    </div>
  );
}
