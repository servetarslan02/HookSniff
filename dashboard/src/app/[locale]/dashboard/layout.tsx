'use client';

import { useState, useEffect } from 'react';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { clsx } from 'clsx';
import { useTranslations, useLocale } from 'next-intl';
import { useAuth } from '@/lib/store';
import { AuthGuard } from '@/components/AuthGuard';

import { NotificationCenter } from '@/components/NotificationCenter';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';
import ErrorBoundary from '@/components/ErrorBoundary';

/** Item 244: Prefetch common dashboard routes on mount */
function PrefetchRoutes() {
  const router = useRouter();
  useEffect(() => {
    const routes = [
      '/dashboard/endpoints',
      '/dashboard/deliveries',
      '/dashboard/logs',
      '/dashboard/analytics',
      '/dashboard/settings',
    ];
    routes.forEach((route) => router.prefetch(route));
  }, [router]);
  return null;
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const te = useTranslations('error');

  const locale = useLocale();

  // Strip locale prefix from pathname for navigation matching
  const cleanPath = pathname.replace(new RegExp(`^/${locale}`), '') || '/';

  // Item 160: Group sidebar items into sections
  // Item 162: Add Schemas, Templates, Routing, Portal links
  const navSections: { label: string; items: { name: string; href: string; icon: string }[] }[] = [
    {
      label: t('sectionCore'),
      items: [
        { name: t('dashboard'), href: '/dashboard', icon: '📊' },
        { name: t('endpoints'), href: '/dashboard/endpoints', icon: '🔗' },
        { name: t('deliveries'), href: '/dashboard/deliveries', icon: '📦' },
        { name: t('logs'), href: '/dashboard/logs', icon: '📋' },
        { name: t('search'), href: '/dashboard/search', icon: '🔍' },
        { name: t('health'), href: '/dashboard/health', icon: '💓' },
        { name: t('alerts'), href: '/dashboard/alerts', icon: '🔔' },
        { name: t('analytics'), href: '/dashboard/analytics', icon: '📈' },
      ],
    },
    {
      label: t('sectionTools'),
      items: [
        { name: t('playground'), href: '/dashboard/playground', icon: '🧪' },
        { name: t('signatureTool'), href: '/dashboard/signature-verifier', icon: '🔐' },
        { name: t('apiImporter'), href: '/dashboard/api-importer', icon: '📥' },
        { name: t('webhookBuilder'), href: '/dashboard/webhook-builder', icon: '🔧' },
        { name: t('schemas'), href: '/dashboard/schemas', icon: '📐' },
        { name: t('templates'), href: '/dashboard/templates', icon: '📄' },
      ],
    },
    {
      label: t('sectionAdvanced'),
      items: [
        { name: t('transforms'), href: '/dashboard/transforms', icon: '🔄' },
        { name: t('inbound'), href: '/dashboard/inbound', icon: '📨' },
        { name: t('routing'), href: '/dashboard/routing', icon: '🔀' },
        { name: t('rateLimiting'), href: '/dashboard/rate-limiting', icon: '⚡' },
        { name: t('retryPolicy'), href: '/dashboard/retry-policy', icon: '🔁' },
        { name: t('auditLog'), href: '/dashboard/audit-log', icon: '📝' },
        { name: t('ssoSaml'), href: '/dashboard/sso', icon: '🔐' },
        { name: t('customDomain'), href: '/dashboard/custom-domain', icon: '🌐' },
        { name: t('portalCustomize'), href: '/dashboard/portal-customize', icon: '🖼️' },
        { name: t('portalManage'), href: '/dashboard/portal-manage', icon: '🏗️' },
      ],
    },
    {
      label: t('sectionAccount'),
      items: [
        { name: t('apiKeys'), href: '/dashboard/api-keys', icon: '🔑' },
        { name: t('team'), href: '/dashboard/team', icon: '👥' },
        { name: t('notifications'), href: '/dashboard/notifications', icon: '🔔' },
        { name: t('billing'), href: '/dashboard/billing', icon: '💳' },
        { name: t('settings'), href: '/dashboard/settings', icon: '⚙️' },
      ],
    },
  ];

  // Flat list for page title lookup
  const allNavItems = navSections.flatMap((s) => s.items);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
      <PrefetchRoutes />
      {/* Skip to content link — Item 214 */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
      >
        {tc('skipToContent')}
      </a>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — Item 163: overflow-y-auto to prevent bottom overlap */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 z-40 transition-transform duration-200 md:translate-x-0 flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <Link href="/" className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-lg">
            🪝
          </div>
          <div>
            <div className="font-bold text-gray-900 dark:text-white">HookSniff</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">{t("webhookDashboard")}</div>
          </div>
        </Link>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6" aria-label={t('mainNavigation')}>
          {navSections.map((section) => (
            <div key={section.label}>
              <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-slate-500">
                {section.label}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = cleanPath === item.href || (item.href !== '/dashboard' && cleanPath.startsWith(item.href + '/'));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition',
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
              </div>
            </div>
          ))}
          {user?.is_admin && (
            <div>
              <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-slate-500">
                {t('sectionAdmin')}
              </div>
              <div className="space-y-0.5">
                <Link
                  href="/admin"
                  onClick={() => setSidebarOpen(false)}
                  aria-current={cleanPath.startsWith('/admin') ? "page" : undefined}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition',
                    cleanPath.startsWith('/admin')
                      ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300'
                      : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300'
                  )}
                >
                  <span className="text-lg">⚡</span>
                  {t('adminPanel')}
                </Link>
              </div>
            </div>
          )}
        </nav>
      </aside>

      {/* Main content — Item 87: full width on mobile, offset on desktop */}
      <div className="min-w-0 md:pl-64">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-3 sm:px-4 md:px-8 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
              aria-label={t("openSidebar")}
              aria-expanded={sidebarOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <title>{t("openSidebar")}</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {allNavItems.find((n) => n.href === cleanPath)?.name || t('dashboard')}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <NotificationCenter />
            <div className="text-sm text-gray-500 dark:text-slate-400 hidden sm:block">
              {user?.email || tc('user')}
            </div>
            <button
              onClick={() => { logout(); router.push(`/${locale}/login`); }}
              className="text-sm text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
            >
              {t('logout')}
            </button>
          </div>
        </header>

        {/* Page content — Item 214: skip-to-content target */}
        <main id="main-content" className="p-3 sm:p-4 md:p-8 page-enter overflow-x-hidden" aria-live="polite">
          <EmailVerificationBanner />
          <ErrorBoundary
            title={te('title')}
            description={te('unexpected')}
            retryLabel={tc('tryAgain')}
          >
            {children}
          </ErrorBoundary>
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
