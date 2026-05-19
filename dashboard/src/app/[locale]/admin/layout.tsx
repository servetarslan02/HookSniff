'use client';

import { useState, useEffect } from 'react';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { clsx } from 'clsx';
import { useAuth } from '@/lib/store';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { PrefetchLink } from '@/components/PrefetchLink';
import { useTranslations, useLocale } from 'next-intl';
import { notificationsApi } from '@/lib/api';
import { useRealtime } from '@/hooks/useRealtime';

const adminNavigation = [
  { nameKey: 'overview', href: '/admin', icon: '📊' },
  { nameKey: 'users', href: '/admin/users', icon: '👥' },
  { nameKey: 'revenue', href: '/admin/revenue', icon: '💰' },
  { nameKey: 'featureFlags', href: '/admin/feature-flags', icon: '🚩' },
  { nameKey: 'system', href: '/admin/system', icon: '🖥️' },
  { nameKey: 'settingsNav', href: '/admin/settings', icon: '⚙️' },
  { nameKey: 'activityLog', href: '/admin/activity', icon: '📋' },
  { nameKey: 'alerts', href: '/admin/alerts', icon: '🔔' },
  { nameKey: 'email', href: '/admin/email', icon: '📧' },
];

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { connectionState } = useRealtime();

  // Item 61 — Set document title for admin pages
  useEffect(() => {
    document.title = 'HookSniff — Webhook Teslimat Servisi';
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    if (!token) return;
    notificationsApi.getUnreadCount(token).then((data) => {
      setUnreadCount(data.unread_count || 0);
    }).catch(() => {});
  }, [token]);

  // Admin auth guard
  useEffect(() => {
    if (user && !user.is_admin) {
      router.push("/");
    }
  }, [user, router, locale]);

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("accessDenied")}</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-4">{t("noAdminPrivileges")}</p>
          <Link
            href={"/applications"}
            className="inline-flex px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition"
          >
            {tc('backToDashboard')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Item 128 — Skip to content link */}
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:px-4 focus:py-2 focus:bg-red-600 focus:text-white focus:rounded-xl focus:shadow-lg focus:outline-hidden focus:ring-2 focus:ring-red-400"
      >
        {t('skipToContent')}
      </a>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={(e) => { e.stopPropagation(); setSidebarOpen(false); }}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label={t('adminPanel')}
        className={clsx(
          'fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 z-40 transition-transform duration-200 md:translate-x-0 flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-slate-700">
          <div className="w-9 h-9 rounded-lg bg-linear-to-br from-red-500 to-purple-600 flex items-center justify-center text-white text-lg">
            ⚡
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-white">{t("adminPanel")}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">{t("management")}</div>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {adminNavigation.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            return (
              <PrefetchLink
                key={item.nameKey}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                hoverDelay={80}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition',
                  isActive
                    ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {t(`nav.${item.nameKey}`)}
              </PrefetchLink>
            );
          })}
        </nav>
        <div className="border-t border-gray-200 dark:border-slate-700 mx-3 mt-2 pt-3">
          <Link
            href={"/applications"}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition"
          >
            <span className="text-lg">📁</span>
            {t('userPanel') || 'Kullanıcı Paneli'}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="md:pl-64">
        {/* Item 127 — Top bar with ARIA landmark */}
        <header role="banner" className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4 md:px-8 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition"
              aria-label={tc("openSidebar")}
            >
              <svg aria-hidden="true" className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {adminNavigation.find((n) => n.href === pathname)?.nameKey ? t(`nav.${adminNavigation.find((n) => n.href === pathname)!.nameKey}`) : t('adminPanel')}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400">
                {t('adminBadge')}
              </span>
              {/* Real-time connection indicator */}
              <span
                className={`w-2 h-2 rounded-full ${
                  connectionState === 'connected' ? 'bg-green-500 animate-pulse'
                    : connectionState === 'connecting' ? 'bg-yellow-500 animate-pulse'
                    : connectionState === 'fallback' ? 'bg-orange-500'
                    : 'bg-red-500'
                }`}
                title={`WS: ${connectionState}`}
                aria-label={`WebSocket: ${connectionState}`}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher />
            {/* Notification Bell */}
            <Link
              href="/admin/system"
              className="relative p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition"
              aria-label={t('notifications') || 'Notifications'}
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
            {/* Profile Dropdown */}
            <div className="relative group">
              <button type="button" className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-red-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {(user?.email?.charAt(0) || 'A').toUpperCase()}
                </div>
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.email}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Admin</p>
                </div>
                <Link href={"/applications"} className="block px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                  {t('userPanel') || 'Kullanıcı Paneli'}
                </Link>
                <button type="button"
                  onClick={() => { logout(); router.push('/login'); }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                >
                  {tc('logout')}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Item 127/128 — Page content with ARIA landmark and skip-to-content target */}
        <main id="admin-main-content" role="main" className="p-3 sm:p-4 md:p-6 lg:p-8 page-enter">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
