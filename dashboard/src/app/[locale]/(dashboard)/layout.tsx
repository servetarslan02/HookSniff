'use client';

import { useState, useRef, useEffect } from 'react';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { clsx } from 'clsx';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/store';
import { AuthGuard } from '@/components/AuthGuard';
import { NotificationCenter } from '@/components/NotificationCenter';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PrefetchLink } from '@/components/PrefetchLink';
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useRealtime } from '@/hooks/useRealtime';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const locale = useLocale();
  const { connectionState } = useRealtime();

  const cleanPath = pathname.replace(new RegExp(`^/${locale}`), '') || '/';

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleSection = (key: string) => {
    setCollapsedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    {
      key: 'core',
      label: t('sectionCore'),
      items: [
        { name: t('core'), href: '/core', icon: '📊' },
        { name: t('applications'), href: '/applications', icon: '📱' },
      ],
    },
    {
      key: 'deliveries',
      label: t('sectionDeliveries'),
      items: [
        { name: t('deliveries'), href: '/deliveries', icon: '🔗' },
      ],
    },
    {
      key: 'webhooks',
      label: t('sectionWebhooks'),
      items: [
        { name: t('inboundWebhooks'), href: '/inbound', icon: '📥' },
        { name: t('operationalWebhooks'), href: '/operational-webhooks', icon: '🪝' },
        { name: t('messagePoller'), href: '/message-poller', icon: '📬' },
        { name: t('backgroundTasks'), href: '/background-tasks', icon: '⏳' },
      ],
    },
    {
      key: 'integrations',
      label: t('sectionIntegrations'),
      items: [
        { name: t('connectors'), href: '/connectors', icon: '🔌' },
        { name: t('integrations'), href: '/integrations', icon: '🔗' },
        { name: t('streaming'), href: '/streaming', icon: '📡' },
      ],
    },
    {
      key: 'monitoring',
      label: t('sectionMonitoring'),
      items: [
        { name: t('observability'), href: '/observability', icon: '📡' },
      ],
    },
    {
      key: 'devtools',
      label: t('sectionDevtools'),
      items: [
        { name: t('devtools'), href: '/devtools', icon: '🛠️' },
        { name: t('contentMgmt'), href: '/content-mgmt', icon: '📐' },
      ],
    },
    {
      key: 'config',
      label: t('sectionConfig'),
      items: [
        { name: t('routingConfig'), href: '/routing-config', icon: '🔀' },
        { name: t('securitySection'), href: '/security-section', icon: '🔒' },
        { name: t('environments'), href: '/environments', icon: '🌐' },
      ],
    },
    {
      key: 'portal',
      label: t('sectionPortal'),
      items: [
        { name: t('portalSection'), href: '/portal-section', icon: '🪝' },
      ],
    },
    {
      key: 'billing',
      label: t('sectionBilling'),
      items: [
        { name: t('billingSection'), href: '/billing-section', icon: '💳' },
      ],
    },
    {
      key: 'account',
      label: t('sectionAccount'),
      items: [
        { name: t('account'), href: '/account', icon: '👤' },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <Link href="/core" className="flex items-center space-x-2">
            <span className="text-2xl">🪝</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">HookSniff</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {/* Admin Panel link — only for admin users */}
          {user?.is_admin && (
            <Link
              href="/admin"
              className="flex items-center px-3 py-2 mb-3 text-sm font-medium rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30 transition-colors"
            >
              <span className="mr-3">⚡</span>
              {t('adminPanel') || 'Admin Panel'}
            </Link>
          )}
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
                      <PrefetchLink
                        key={item.href}
                        href={item.href}
                        hoverDelay={80}
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
                      </PrefetchLink>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 lg:px-6">
          <button
            className="p-2 text-gray-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </button>
          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <NotificationCenter />
            <LanguageSwitcher />
            <ThemeToggle />
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

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {(user?.name?.charAt(0) || user?.email?.charAt(0) || '?').toUpperCase()}
                </div>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    href="/settings-section"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    onClick={() => setProfileOpen(false)}
                  >
                    ⚙️ {t('settingsSection')}
                  </Link>
                  <a
                    href="https://hooksniff.vercel.app/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    onClick={() => setProfileOpen(false)}
                  >
                    📖 {tc('documentation') || 'Documentation'}
                  </a>
                  <a
                    href="https://hooksniff.vercel.app/docs/api-reference"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    onClick={() => setProfileOpen(false)}
                  >
                    🔗 API Reference
                  </a>
                  <div className="border-t border-gray-100 dark:border-gray-700 mt-1" />
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); logout(); router.push('/login'); }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    🚪 {tc('logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
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
