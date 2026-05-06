'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import Footer from '@/components/Footer';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const t = useTranslations('docs');
  const tc = useTranslations('common');

  const sidebarNav = [
    { name: t('gettingStarted'), href: '/docs' },
    { name: t('apiReference'), href: '/docs/api' },
    { name: 'SDKs', href: '/docs/sdks' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Top Nav */}
      <nav className="border-b border-gray-200 dark:border-slate-700 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-lg">
              🪝
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">Hookrelay</span>
            <span className="text-sm text-gray-400 dark:text-slate-500 ml-2">Docs</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:text-white transition">
              {tc('nav.dashboard')}
            </Link>
            <Link href="/" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:text-white transition">
              {t('home')}
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-12">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0">
          <nav className="space-y-1 sticky top-24">
            {sidebarNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'block px-3 py-2 rounded-lg text-sm font-medium transition',
                  pathname === item.href
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:bg-slate-950 hover:text-gray-900 dark:text-white'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
      <Footer />
    </div>
  );
}
