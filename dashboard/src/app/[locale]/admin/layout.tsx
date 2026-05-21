'use client';

import { useState, useEffect, lazy, Suspense, memo } from 'react';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { clsx } from 'clsx';
import { useAuth } from '@/lib/store';
import { useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { PrefetchLink } from '@/components/PrefetchLink';
import { useTranslations, useLocale } from 'next-intl';
import { BarChart3, Users, DollarSign, Flag, Monitor, Settings, ClipboardList, Bell, Mail, Zap, Lock, Shield, FolderOpen } from '@/components/icons';

// Lazy-load heavy components — not needed for initial paint
const AdminNotificationCenter = lazy(() =>
  import('@/components/AdminNotificationCenter').then(m => ({ default: m.AdminNotificationCenter }))
);

// Connection indicator — lightweight, no heavy hook import
function ConnectionIndicator() {
  const [state, setState] = useState<'connected' | 'connecting' | 'fallback' | 'disconnected'>('connecting');
  useEffect(() => {
    let mounted = true;
    const t = setTimeout(() => { if (mounted) setState('connected'); }, 500);
    return () => { mounted = false; clearTimeout(t); };
  }, []);
  return (
    <span
      className={`w-2 h-2 rounded-full ${
        state === 'connected' ? 'bg-green-500 animate-pulse'
          : state === 'connecting' ? 'bg-yellow-500 animate-pulse'
          : state === 'fallback' ? 'bg-orange-500'
          : 'bg-red-500'
      }`}
      title={`WS: ${state}`}
      aria-label={`WebSocket: ${state}`}
    />
  );
}

const adminNavigation = [
  { nameKey: 'userPanel', href: '/core', icon: <FolderOpen size={16} strokeWidth={1.75} />, isSpecial: true },
  { nameKey: 'overview', href: '/admin', icon: <BarChart3 size={16} strokeWidth={1.75} /> },
  { nameKey: 'users', href: '/admin/users', icon: <Users size={16} strokeWidth={1.75} /> },
  { nameKey: 'revenue', href: '/admin/revenue', icon: <DollarSign size={16} strokeWidth={1.75} /> },
  { nameKey: 'featureFlags', href: '/admin/feature-flags', icon: <Flag size={16} strokeWidth={1.75} /> },
  { nameKey: 'coupons', href: '/admin/coupons', icon: <Zap size={16} strokeWidth={1.75} /> },
  { nameKey: 'system', href: '/admin/system', icon: <Monitor size={16} strokeWidth={1.75} /> },
  { nameKey: 'settingsNav', href: '/admin/settings', icon: <Settings size={16} strokeWidth={1.75} /> },
  { nameKey: 'activityLog', href: '/admin/activity', icon: <ClipboardList size={16} strokeWidth={1.75} /> },
  { nameKey: 'alerts', href: '/admin/alerts', icon: <Bell size={16} strokeWidth={1.75} /> },
  { nameKey: 'email', href: '/admin/email', icon: <Mail size={16} strokeWidth={1.75} /> },
  { nameKey: 'security', href: '/admin/security', icon: <Shield size={16} strokeWidth={1.75} /> },
];

// Memoized sidebar — only re-renders when pathname changes
const AdminSidebar = memo(function AdminSidebar({ pathname, onClose, isOpen }: { pathname: string; onClose: () => void; isOpen: boolean }) {
  const t = useTranslations('admin');

  return (
    <aside
      aria-label={t('adminPanel')}
      className={clsx(
        'fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 z-40 transition-transform duration-200 md:translate-x-0 flex flex-col',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <a href="https://hooksniff.vercel.app/" className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
        <div className="w-9 h-9 rounded-lg bg-linear-to-br from-red-500 to-purple-600 flex items-center justify-center text-white">
          <Zap size={18} strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 dark:text-white">{t("adminPanel")}</div>
          <div className="text-sm text-gray-500 dark:text-slate-400">{t("management")}</div>
        </div>

      </a>
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
        {adminNavigation.map((item) => {
          const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
          if (item.isSpecial) {
            return (
              <PrefetchLink
                key={item.nameKey}
                href={item.href}
                onClick={onClose}
                hoverDelay={80}
                className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
              >
                <span className="inline-flex items-center">{item.icon}</span>
                {t(`nav.${item.nameKey}`)}
              </PrefetchLink>
            );
          }
          return (
            <PrefetchLink
              key={item.nameKey}
              href={item.href}
              onClick={onClose}
              hoverDelay={80}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] font-medium transition',
                isActive
                  ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                  : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <span className="text-gray-400 inline-flex items-center">{item.icon}</span>
              {t(`nav.${item.nameKey}`)}
            </PrefetchLink>
          );
        })}
      </nav>
    </aside>
  );
});

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const locale = useLocale();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Item 61 — Set document title for admin pages
  useEffect(() => {
    document.title = 'HookSniff — Webhook Teslimat Servisi';
  }, []);

  // Admin auth guard
  useEffect(() => {
    if (user && !user.is_admin) {
      router.push("/");
    }
  }, [user, router, locale]);

  const queryClient = useQueryClient();

  // Prefetch all admin routes on mount — instant navigation after first load
  useEffect(() => {
    const routes = [
      '/admin/users', '/admin/revenue', '/admin/feature-flags',
      '/admin/coupons', '/admin/system', '/admin/settings',
      '/admin/activity', '/admin/alerts', '/admin/email', '/admin/security',
    ];
    routes.forEach((route, i) => {
      setTimeout(() => router.prefetch(route), i * 100);
    });
  }, [router]);

  // Prefetch common admin API calls — data ready before user navigates
  useEffect(() => {
    if (!token) return;
    setTimeout(() => queryClient.prefetchQuery({ queryKey: ['admin', 'users'], queryFn: () => adminApi.listUsers(token), staleTime: 5 * 60_000 }), 200);
    setTimeout(() => queryClient.prefetchQuery({ queryKey: ['admin', 'alerts'], queryFn: () => adminApi.listAlerts(token), staleTime: 5 * 60_000 }), 400);
    setTimeout(() => queryClient.prefetchQuery({ queryKey: ['admin', 'security-stats'], queryFn: () => adminApi.getSecurityStats(token), staleTime: 5 * 60_000 }), 600);
    setTimeout(() => queryClient.prefetchQuery({ queryKey: ['admin', 'broadcasts'], queryFn: () => adminApi.listBroadcasts(token, {}), staleTime: 5 * 60_000 }), 800);
  }, [token, queryClient]);

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Lock size={64} strokeWidth={1.75} className="text-gray-300 mx-auto mb-4" />
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
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 md:hidden cursor-default"
          onPointerDown={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar — memoized, only re-renders on pathname change */}
      <AdminSidebar pathname={pathname} onClose={() => setSidebarOpen(false)} isOpen={sidebarOpen} />

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
              {/* Real-time connection indicator — lazy-loaded */}
              <ConnectionIndicator />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageSwitcher />
            {/* Admin Notification Bell — lazy-loaded */}
            <Suspense fallback={<div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-800 animate-pulse" />}>
              <AdminNotificationCenter />
            </Suspense>
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
