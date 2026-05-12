'use client';

import { useEffect } from 'react';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { clsx } from 'clsx';
import { useAuth } from '@/lib/store';
import { useTranslations, useLocale } from 'next-intl';

/* ─── Hook0-style Admin: Üstte yatay tab menü ─── */

const adminTabs = [
  { nameKey: 'overview', href: '/admin', icon: '📊' },
  { nameKey: 'users', href: '/admin/users', icon: '👥' },
  { nameKey: 'revenue', href: '/admin/revenue', icon: '💰' },
  { nameKey: 'system', href: '/admin/system', icon: '🖥️' },
  { nameKey: 'activityLog', href: '/admin/activity', icon: '📋' },
  { nameKey: 'settingsNav', href: '/admin/settings', icon: '⚙️' },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const locale = useLocale();

  useEffect(() => {
    document.title = 'HookSniff — Admin Panel';
  }, []);

  // Admin auth guard
  useEffect(() => {
    if (user && !user.is_admin) {
      router.push('/');
    }
  }, [user, router, locale]);

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('accessDenied')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('noAdminPrivileges')}</p>
          <Link
            href="/"
            className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg hover:opacity-90 transition"
          >
            {tc('backToDashboard')}
          </Link>
        </div>
      </div>
    );
  }

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* ─── Üst Header ─── */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Satır 1: Logo + Admin Badge + Profil */}
        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl">🪝</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">HookSniff</span>
            </Link>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
              {t('adminBadge') || 'Admin'}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition"
            >
              ← {tc('backToDashboard')}
            </Link>
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm font-medium">
              {(user?.email?.charAt(0) || 'A').toUpperCase()}
            </div>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              title={tc('logout')}
            >
              🚪
            </button>
          </div>
        </div>

        {/* Satır 2: Yatay Tab Menü (Hook0 gibi) */}
        <nav className="flex items-center h-12 px-4 lg:px-6 space-x-1 overflow-x-auto">
          {adminTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={clsx(
                'flex items-center px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap',
                isActive(tab.href)
                  ? 'text-red-600 border-b-2 border-red-600 dark:text-red-400 dark:border-red-400'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
              )}
            >
              <span className="mr-2">{tab.icon}</span>
              {t(`nav.${tab.nameKey}`)}
            </Link>
          ))}
        </nav>
      </header>

      {/* ─── Ana İçerik ─── */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
