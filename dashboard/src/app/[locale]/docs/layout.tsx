'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { clsx } from 'clsx';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import Footer from '@/components/Footer';
import { useState, useEffect, useRef } from 'react';

interface NavItem {
  name: string;
  href: string;
  icon?: string;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const sidebarNav: NavGroup[] = [
    {
      title: 'Getting Started',
      items: [
        { name: 'Introduction', href: '/docs' },
        { name: 'Quickstart', href: '/docs/quickstart', badge: '5 min' },
        { name: 'What is HookSniff?', href: '/docs/what-is-hooksniff' },
        { name: 'Core Concepts', href: '/docs/concepts' },
        { name: 'SDKs & Libraries', href: '/docs/sdk-libraries', badge: '11' },
      ],
    },
    {
      title: 'How-To Guides',
      items: [
        { name: 'Webhook Verification', href: '/docs/guides/webhook-verification' },
        { name: 'Error Handling', href: '/docs/guides/error-handling' },
        { name: 'Pagination', href: '/docs/guides/pagination' },
        { name: 'Streaming & Rate Limits', href: '/docs/guides/streaming' },
        { name: 'Migration from Svix', href: '/docs/guides/migration-from-svix' },
        { name: 'Real-World Examples', href: '/docs/guides/real-world-examples' },
        { name: 'Best Practices', href: '/docs/best-practices' },
        { name: 'Security', href: '/docs/security' },
        { name: 'Retries & DLQ', href: '/docs/retries' },
        { name: 'Debug Failed Webhooks', href: '/docs/debug-failed-webhooks' },
        { name: 'Monitor Performance', href: '/docs/monitor-performance' },
        { name: 'Integrations', href: '/docs/integrations' },
        { name: 'Inbound Webhooks', href: '/docs/inbound-webhooks' },
        { name: 'Smart Routing', href: '/docs/smart-routing' },
        { name: 'Payload Transforms', href: '/docs/transforms' },
        { name: 'Templates', href: '/docs/templates' },
        { name: 'Multi-Tenant', href: '/docs/multi-tenant' },
        { name: 'Organization', href: '/docs/organization' },
        { name: 'Build Stripe-like', href: '/docs/build-stripe-like', badge: 'Popular' },
      ],
    },
    {
      title: 'Reference',
      items: [
        { name: 'API Reference', href: '/docs/api-reference' },
        { name: 'Error Codes', href: '/docs/error-codes' },
        { name: 'Rate Limiting', href: '/docs/rate-limiting' },
        { name: 'Configuration', href: '/docs/configuration' },
        { name: 'Event Types', href: '/docs/event-types' },
        { name: 'Idempotency', href: '/docs/idempotency' },
        { name: 'CloudEvents', href: '/docs/cloudevents' },
        { name: 'Playground', href: '/docs/playground' },
        { name: 'Changelog', href: '/docs/changelog' },
      ],
    },
    {
      title: 'Explanation',
      items: [
        { name: 'Event Processing', href: '/docs/event-processing' },
        { name: 'Delivery Guarantees', href: '/docs/delivery-guarantees' },
        { name: 'Webhook vs Polling', href: '/docs/webhook-vs-polling' },
        { name: 'Architecture', href: '/docs/architecture' },
      ],
    },
    {
      title: 'Operations',
      items: [
        { name: 'Dashboard', href: '/docs/dashboard' },
        { name: 'Self-Hosting', href: '/docs/self-hosting' },
        { name: 'Embeddable Portal', href: '/docs/embed-portal' },
        { name: 'Troubleshooting', href: '/docs/troubleshooting' },
        { name: 'Support', href: '/docs/support' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] transition-colors duration-300">
      {/* ─── Top Nav ─── */}
      <nav
        className={clsx(
          'sticky top-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl shadow-[0_1px_0_rgba(0,0,0,0.06)] dark:shadow-[0_1px_0_rgba(255,255,255,0.06)]'
            : 'bg-white dark:bg-[#0a0a0f]'
        )}
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 -ml-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white rounded-lg transition"
                aria-label="Toggle navigation"
              >
                {sidebarOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 9h16.5m-16.5 6.75h16.5" />
                  </svg>
                )}
              </button>

              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4c6ef5] to-[#7c3aed] flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-[#4c6ef5]/20 group-hover:shadow-[#4c6ef5]/40 transition-shadow">
                  🪝
                </div>
                <span className="text-[15px] font-semibold text-gray-900 dark:text-white tracking-tight">
                  HookSniff
                </span>
              </Link>

              <div className="hidden sm:flex items-center gap-1 ml-2">
                <span className="text-gray-300 dark:text-slate-700">/</span>
                <span className="text-sm text-gray-500 dark:text-slate-500 ml-1">Documentation</span>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/60"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                Dashboard
              </Link>
              <a
                href="https://github.com/servetarslan02/HookSniff"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800/60 transition"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-0 lg:gap-8">
          {/* ─── Sidebar ─── */}
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <aside
            ref={sidebarRef}
            className={clsx(
              'fixed lg:sticky top-16 left-0 z-40 lg:z-0',
              'w-72 lg:w-60 shrink-0',
              'h-[calc(100vh-4rem)] overflow-y-auto',
              'bg-white dark:bg-[#0a0a0f] lg:bg-transparent',
              'border-r border-gray-200 dark:border-white/[0.06] lg:border-0',
              'px-4 py-6 lg:py-8',
              'transition-transform duration-300 lg:transition-none',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            )}
          >
            <nav className="space-y-6">
              {sidebarNav.map((group) => (
                <div key={group.title}>
                  <h4 className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400 dark:text-slate-600">
                    {group.title}
                  </h4>
                  <div className="space-y-px">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={clsx(
                            'group flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
                            isActive
                              ? 'bg-[#4c6ef5]/[0.08] dark:bg-[#4c6ef5]/[0.12] text-[#4c6ef5] dark:text-[#748ffc]'
                              : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                          )}
                        >
                          <span className="truncate">{item.name}</span>
                          {item.badge && (
                            <span
                              className={clsx(
                                'ml-2 px-1.5 py-0.5 text-[10px] font-semibold rounded-md shrink-0',
                                item.badge === 'Popular'
                                  ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                  : 'bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-slate-500'
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* ─── Content ─── */}
          <main className="flex-1 min-w-0 py-8 lg:py-10">
            <div className="max-w-4xl">{children}</div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
