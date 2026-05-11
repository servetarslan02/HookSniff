'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

interface PublicNavbarProps {
  /** Current page title shown after the slash */
  pageTitle?: string;
}

export default function PublicNavbar({ pageTitle }: PublicNavbarProps) {
  const { token } = useAuth();
  const tNav = useTranslations('landing.nav');

  return (
    <nav className="border-b border-gray-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Logo + breadcrumb */}
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
          {pageTitle && (
            <>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600 dark:text-slate-400">{pageTitle}</span>
            </>
          )}
        </div>

        {/* Center: Nav links (hidden on small screens) */}
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/get-started" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{tNav('getStarted')}</Link>
          <Link href="/pricing" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{tNav('pricing')}</Link>
          <Link href="/docs" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{tNav('docs')}</Link>
          <Link href="/status" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{tNav('status')}</Link>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          {token ? (
            <Link href="/dashboard" className="bg-gray-900 dark:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition">
              {tNav('dashboard')}
            </Link>
          ) : (
            <Link href="/login" className="bg-gray-900 dark:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition">
              {tNav('login')}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
