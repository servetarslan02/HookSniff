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
import { BroadcastBanner } from '@/components/BroadcastBanner';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useRealtime } from '@/hooks/useRealtime';
import { LayoutDashboard, Smartphone, Link2, Layers, Zap, Eye, Code2, Settings, Users, CreditCard, UserCircle, Shield, BookOpen, ExternalLink, LogOut } from 'lucide-react';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const navItems = [
    { name: t('core'), href: '/core', icon: <LayoutDashboard size={20} strokeWidth={1.75} /> },
    { name: t('applications'), href: '/applications', icon: <Smartphone size={20} strokeWidth={1.75} /> },
    { name: t('deliveries'), href: '/deliveries', icon: <Link2 size={20} strokeWidth={1.75} /> },
    { name: t('webhookDashboard'), href: '/operational-webhooks', icon: <Layers size={20} strokeWidth={1.75} /> },
    { name: t('integrations'), href: '/integrations', icon: <Zap size={20} strokeWidth={1.75} /> },
    { name: t('observability'), href: '/observability', icon: <Eye size={20} strokeWidth={1.75} /> },
    { name: t('devtools'), href: '/devtools', icon: <Code2 size={20} strokeWidth={1.75} /> },
    { name: t('routingConfig'), href: '/routing-config', icon: <Settings size={20} strokeWidth={1.75} /> },
    { name: t('organization'), href: '/organization', icon: <Users size={20} strokeWidth={1.75} /> },
    { name: t('billingSection'), href: '/billing-section', icon: <CreditCard size={20} strokeWidth={1.75} /> },
    { name: t('account'), href: '/account', icon: <UserCircle size={20} strokeWidth={1.75} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile overlay — must be rendered BEFORE sidebar for click events */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden cursor-default"
          onPointerDown={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <Link href="/core" className="flex items-center space-x-2">
            <span className="text-2xl">🪝</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">HookSniff</span>
          </Link>
          <button
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 lg:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {/* Admin Panel link — only for admin users */}
          {user?.is_admin && (
            <Link
              href="/admin"
              className="flex items-center px-3 py-2 mb-2 text-sm font-medium rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30 transition-colors"
            >
              <span className="mr-3"><Shield size={20} strokeWidth={1.75} /></span>
              {t('adminPanel') || 'Admin Panel'}
            </Link>
          )}
          {navItems.map((item) => {
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
                <span className="mr-3 flex-shrink-0">{item.icon}</span>
                {item.name}
              </PrefetchLink>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-3 sm:px-4 lg:px-6">
          <button
            className="p-2 -ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 lg:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />

          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Hide secondary icons on very small screens */}
            <div className="hidden sm:flex items-center gap-3">
              <NotificationCenter />
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
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
                  {/* Mobile-only quick actions */}
                  <div className="sm:hidden border-b border-gray-100 dark:border-gray-700 py-1">
                    <div className="px-4 py-2 flex items-center gap-2">
                      <NotificationCenter />
                      <LanguageSwitcher />
                      <ThemeToggle />
                    </div>
                  </div>
                  <Link
                    href="/settings-section"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings size={16} strokeWidth={1.75} className="text-gray-400" />
                    {t('settingsSection')}
                  </Link>
                  <a
                    href="https://hooksniff.vercel.app/docs"
                    target="_blank"
                   rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    onClick={() => setProfileOpen(false)}
                  >
                    <BookOpen size={16} strokeWidth={1.75} className="text-gray-400" />
                    {tc('documentation') || 'Documentation'}
                  </a>
                  <a
                    href="https://hooksniff.vercel.app/docs/api-reference"
                    target="_blank"
                   rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    onClick={() => setProfileOpen(false)}
                  >
                    <ExternalLink size={16} strokeWidth={1.75} className="text-gray-400" />
                    API Reference
                  </a>
                  <div className="border-t border-gray-100 dark:border-gray-700 mt-1" />
                  <button
                    type="button"
                    onClick={() => { setProfileOpen(false); logout(); router.push('/login'); }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    <LogOut size={16} strokeWidth={1.75} />
                    {tc('logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          <EmailVerificationBanner />
          <BroadcastBanner />
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
