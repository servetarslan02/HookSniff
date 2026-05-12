'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { clsx } from 'clsx';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/store';
import { AuthGuard } from '@/components/AuthGuard';
import { NotificationCenter } from '@/components/NotificationCenter';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';
import ErrorBoundary from '@/components/ErrorBoundary';

/* ─── Hook0-style: Üstte yatay tab menü ─── */

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const locale = useLocale();

  const cleanPath = pathname.replace(new RegExp(`^/${locale}`), '') || '/';

  /* ── Hook0'ın 5 sekmesi ── */
  const tabs = [
    { name: t('dashboard'), href: '/', icon: '📊' },
    { name: t('applications') || 'Uygulamalar', href: '/applications', icon: '📱' },
    { name: t('serviceTokens') || 'Hizmet Jetonları', href: '/api-keys', icon: '🔑' },
    { name: t('team'), href: '/team', icon: '👥' },
    { name: t('settings'), href: '/settings', icon: '⚙️' },
  ];

  const isActive = (href: string) =>
    cleanPath === href || cleanPath.startsWith(href + '/');

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* ─── Üst Header ─── */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Satır 1: Logo + Arama + Profil */}
        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl">🪝</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">HookSniff</span>
            </Link>
            {/* Organizasyon adı (Hook0 gibi) */}
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
              {user?.name || user?.email?.split('@')[0] || 'Organizasyon'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <NotificationCenter />
            <LanguageSwitcher />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
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

        {/* Satır 2: Yatay Tab Menü (Hook0 gibi) */}
        <nav className="flex items-center h-12 px-4 lg:px-6 space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                'flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap',
                isActive(tab.href)
                  ? 'text-green-600 border-b-2 border-green-600 dark:text-green-400 dark:border-green-400'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
              )}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </Link>
          ))}
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
