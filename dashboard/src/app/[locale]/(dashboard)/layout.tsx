'use client';

import { useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { clsx } from 'clsx';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/store';
import { AuthGuard } from '@/components/AuthGuard';
import { NotificationCenter } from '@/components/NotificationCenter';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';
import ErrorBoundary from '@/components/ErrorBoundary';

/* ─── Hook0-style: Üstte yatay tab menü, solda sidebar yok ─── */

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);

  const cleanPath = pathname.replace(new RegExp(`^/${locale}`), '') || '/';

  /* ── Ana menüler (Hook0 gibi 5 sekme) ── */
  const mainTabs = [
    { name: t('dashboard'), href: '/', icon: '📊' },
    { name: t('endpoints'), href: '/endpoints', icon: '🔗' },
    { name: t('deliveries'), href: '/deliveries', icon: '📦' },
    { name: t('playground'), href: '/playground', icon: '🧪' },
    { name: t('settings'), href: '/settings', icon: '⚙️' },
  ];

  /* ── "Daha Fazla" dropdown menü ── */
  const moreItems = [
    { name: t('logs'), href: '/logs', icon: '📋' },
    { name: t('search'), href: '/search', icon: '🔍' },
    { name: t('health'), href: '/health', icon: '💓' },
    { name: t('alerts'), href: '/alerts', icon: '🔔' },
    { name: t('apiKeys'), href: '/api-keys', icon: '🔑' },
    { name: t('analytics'), href: '/analytics', icon: '📈' },
    { name: t('transforms'), href: '/transforms', icon: '🔄' },
    { name: t('inbound'), href: '/inbound', icon: '📨' },
    { name: t('schemas'), href: '/schemas', icon: '📐' },
    { name: t('team'), href: '/team', icon: '👥' },
    { name: t('billing'), href: '/billing', icon: '💳' },
    { name: t('notifications'), href: '/notifications', icon: '🔔' },
  ];

  const isActive = (href: string) =>
    cleanPath === href || cleanPath.startsWith(href + '/');

  const isMoreActive = moreItems.some((item) => isActive(item.href));

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* ─── Üst Header: Logo + Tab Menü + Profil ─── */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Satır 1: Logo + Profil */}
        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl">🪝</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">HookSniff</span>
          </Link>

          <div className="flex items-center space-x-3">
            <NotificationCenter />
            <LanguageSwitcher />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
                {user?.name || user?.email}
              </span>
              <button
                onClick={logout}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title={tc('logout')}
              >
                🚪
              </button>
            </div>
          </div>
        </div>

        {/* Satır 2: Yatay Tab Menü */}
        <nav className="flex items-center h-12 px-4 lg:px-6 space-x-1 overflow-x-auto">
          {mainTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                'flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap',
                isActive(tab.href)
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
              )}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </Link>
          ))}

          {/* "Daha Fazla" Dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={clsx(
                'flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap',
                isMoreActive
                  ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
              )}
            >
              ⋯ Daha Fazla
              <svg
                className={clsx('ml-1 w-4 h-4 transition-transform', menuOpen && 'rotate-180')}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-50 mt-1 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                  {moreItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={clsx(
                        'flex items-center px-4 py-2 text-sm transition-colors',
                        isActive(item.href)
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                      )}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ─── Ana İçerik ─── */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <EmailVerificationBanner />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
