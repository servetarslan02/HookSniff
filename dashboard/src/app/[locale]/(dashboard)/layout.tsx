'use client';

import { useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/store';
import { AuthGuard } from '@/components/AuthGuard';
import { NotificationCenter } from '@/components/NotificationCenter';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AppSidebar } from '@/components/AppSidebar';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const tc = useTranslations('common');
  const locale = useLocale();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const cleanPath = pathname.replace(new RegExp(`^/${locale}`), '') || '/';

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* ─── Desktop Sidebar ─── */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <AppSidebar />
      </div>

      {/* ─── Mobile Sidebar Overlay ─── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64">
            <AppSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ─── Main Content Area ─── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* ─── Top Header Bar ─── */}
        <header className="flex items-center justify-between h-14 px-4 lg:px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Hamburger (mobile) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label={tc('openSidebar')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Search */}
            <div className="hidden sm:flex items-center">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={tc('search') + '...'}
                  className="w-64 pl-10 pr-4 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <NotificationCenter />
            <LanguageSwitcher />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-medium">
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
        </header>

        {/* ─── Page Content ─── */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <EmailVerificationBanner />
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
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
