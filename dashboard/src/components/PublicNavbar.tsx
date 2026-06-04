'use client';

import { useState } from 'react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Left: Logo + breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
          {pageTitle && (
            <>
              <span className="text-gray-500 hidden sm:inline">/</span>
              <span className="text-gray-600 dark:text-slate-400 text-sm sm:text-base hidden sm:inline">{pageTitle}</span>
            </>
          )}
        </div>

        {/* Center: Nav links (hidden on small screens) */}
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/get-started" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{tNav('getStarted')}</Link>
          <Link href="/playground" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{tNav('playground')}</Link>
          <Link href="/pricing" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{tNav('pricing')}</Link>
          <Link href="/docs" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{tNav('docs')}</Link>
          <Link href="/status" className="text-sm text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition">{tNav('status')}</Link>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          {token ? (
            <Link href="/" className="bg-gray-900 dark:bg-brand-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition">
              {tNav('dashboard')}
            </Link>
          ) : (
            <Link href="/login" className="bg-gray-900 dark:bg-brand-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition">
              {tNav('login')}
            </Link>
          )}
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
          <Link href="/get-started" className="block px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition" onClick={() => setMobileMenuOpen(false)}>{tNav('getStarted')}</Link>
          <Link href="/playground" className="block px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition" onClick={() => setMobileMenuOpen(false)}>{tNav('playground')}</Link>
          <Link href="/pricing" className="block px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition" onClick={() => setMobileMenuOpen(false)}>{tNav('pricing')}</Link>
          <Link href="/docs" className="block px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition" onClick={() => setMobileMenuOpen(false)}>{tNav('docs')}</Link>
          <Link href="/status" className="block px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition" onClick={() => setMobileMenuOpen(false)}>{tNav('status')}</Link>
          <div className="pt-2 border-t border-gray-200 dark:border-slate-700 flex items-center gap-3 px-3 py-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      )}
    </nav>
  );
}
