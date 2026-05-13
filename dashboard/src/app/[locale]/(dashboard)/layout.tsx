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

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const locale = useLocale();

  const cleanPath = pathname.replace(new RegExp(`^/${locale}`), '') || '/';

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    {
      key: 'core',
      label: t('sectionCore'),
      items: [
        { name: t('dashboard'), href: '/', icon: '📊' },
        { name: t('core'), href: '/core', icon: '🔗' },
        { name: t('monitoring'), href: '/monitoring', icon: '📡' },
      ],
    },
    {
      key: 'tools',
      label: t('sectionTools'),
      items: [
        { name: t('devtools'), href: '/devtools', icon: '🛠️' },
        { name: t('contentMgmt'), href: '/content-mgmt', icon: '📐' },
        { name: t('portalSection'), href: '/portal-section', icon: '🖼️' },
      ],
    },
    {
      key: 'advanced',
      label: t('sectionAdvanced'),
      items: [
        { name: t('securitySection'), href: '/security-section', icon: '🔒' },
        { name: t('routingConfig'), href: '/routing-config', icon: '🔀' },
        { name: t('teamMgmt'), href: '/team-mgmt', icon: '👥' },
      ],
    },
    {
      key: 'account',
      label: t('sectionAccount'),
      items: [
        { name: t('billingOverview'), href: '/billing-overview', icon: '💳' },
        { name: t('settingsSection'), href: '/settings-section', icon: '⚙️' },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🪝</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">HookSniff</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {sections.map((section) => (
            <div key={section.key} className="mb-2">
              <button
                onClick={() => toggleSection(section.key)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {section.label}
                <svg
                  className={clsx('w-4 h-4 transition-transform', collapsedSections[section.key] && '-rotate-90')}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {!collapsedSections[section.key] && (
                <div className="mt-1 space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = cleanPath === item.href || cleanPath.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={clsx(
                          'flex items-center px-3 py-2 text-sm rounded-lg transition-colors',
                          isActive
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?'}
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.name || user?.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={logout}
              className="ml-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              title={tc('logout')}
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 lg:px-6">
          <button
            className="p-2 text-gray-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <NotificationCenter />
            <LanguageSwitcher />
          </div>
        </header>

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
