'use client';

import { useState } from 'react';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { AuthGuard } from '@/components/AuthGuard';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NotificationCenter } from '@/components/NotificationCenter';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const t = useTranslations('nav');

  // Strip locale prefix from pathname for navigation matching
  const localePrefix = pathname.match(/^\/(tr|de|ja|pt-BR|es|fr|ko)(\/|$)/);
  const cleanPath = localePrefix ? pathname.slice(localePrefix[1].length + 1) || '/' : pathname;

  const navigation = [
    { name: '🚀 Get Started', href: '/get-started', icon: '🚀' },
    { name: t('dashboard'), href: '/dashboard', icon: '📊' },
    { name: t('endpoints'), href: '/dashboard/endpoints', icon: '🔗' },
    { name: t('deliveries'), href: '/dashboard/deliveries', icon: '📦' },
    { name: t('logs'), href: '/dashboard/logs', icon: '📋' },
    { name: t('search'), href: '/dashboard/search', icon: '🔍' },
    { name: t('health'), href: '/dashboard/health', icon: '💓' },
    { name: t('alerts'), href: '/dashboard/alerts', icon: '🔔' },
    { name: t('apiKeys'), href: '/dashboard/api-keys', icon: '🔑' },
    { name: t('playground'), href: '/dashboard/playground', icon: '🧪' },
    { name: t('analytics'), href: '/dashboard/analytics', icon: '📈' },
    { name: t('transforms'), href: '/dashboard/transforms', icon: '🔄' },
    { name: t('inbound'), href: '/dashboard/inbound', icon: '📨' },
    { name: '⚡ Rate Limiting', href: '/dashboard/rate-limiting', icon: '⚡' },
    { name: '🔐 Signature Tool', href: '/dashboard/signature-verifier', icon: '🔐' },
    { name: '📥 API Importer', href: '/dashboard/api-importer', icon: '📥' },
    { name: '🖼️ Portal Customize', href: '/dashboard/portal-customize', icon: '🖼️' },
    { name: '🔧 Webhook Builder', href: '/dashboard/webhook-builder', icon: '🔧' },
    { name: '📋 Audit Log', href: '/dashboard/audit-log', icon: '📋' },
    { name: '🔐 SSO / SAML', href: '/dashboard/sso', icon: '🔐' },
    { name: '🌐 Custom Domain', href: '/dashboard/custom-domain', icon: '🌐' },
    { name: t('team'), href: '/dashboard/team', icon: '👥' },
    { name: t('notifications'), href: '/dashboard/notifications', icon: '🔔' },
    { name: t('billing'), href: '/dashboard/billing', icon: '💳' },
    { name: t('settings'), href: '/dashboard/settings', icon: '⚙️' },
  ];

  // Helper to get locale-aware href
  function getLocalizedHref(href: string) {
    if (localePrefix) {
      return `/${localePrefix[1]}${href}`;
    }
    return href;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 z-40 transition-transform duration-200 md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Link href="/" className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 transition">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-lg">
            🪝
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-white">HookSniff</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">Webhook Dashboard</div>
          </div>
        </Link>
        <nav className="px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = cleanPath === item.href;
            return (
              <Link
                key={item.href}
                href={getLocalizedHref(item.href)}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400'
                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
          {user?.is_admin && (
            <Link
              href={getLocalizedHref('/admin')}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300"
            >
              <span className="text-lg">⚡</span>
              {t('adminPanel')}
            </Link>
          )}
        </nav>
        <div className="absolute bottom-4 left-0 right-0 px-6 flex flex-col gap-2">
          <LanguageSwitcher className="w-full" />
          <ThemeToggle className="w-full" />
        </div>
      </aside>

      {/* Main content */}
      <div className="md:pl-64">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              aria-label="Open sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {navigation.find((n) => n.href === cleanPath)?.name || t('dashboard')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <NotificationCenter />
            <div className="text-sm text-gray-500 dark:text-slate-400 hidden sm:block">
              {user?.email || 'User'}
            </div>
            <button
              onClick={() => { logout(); router.push(getLocalizedHref('/login')); }}
              className="text-sm text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition"
            >
              {t('logout')}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-8 page-enter">
          <EmailVerificationBanner />
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  );
}
