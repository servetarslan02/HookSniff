'use client';

import { useAuth } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { ProfileSection } from './components/ProfileSection';
import { PasswordSection } from './components/PasswordSection';
import { NotificationSection } from './components/NotificationSection';
import { PrivacyConsentSection } from './components/PrivacyConsentSection';
import { DangerZoneSection } from './components/DangerZoneSection';
import { TwoFactorSection } from './components/TwoFactorSection';
import { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';

type Tab = 'profile' | 'security' | 'notifications' | 'privacy' | 'danger';

const tabs: { id: Tab; icon: React.ReactNode; labelKey: string; fallback: string }[] = [
  {
    id: 'profile',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
    labelKey: 'profile',
    fallback: 'Profile',
  },
  {
    id: 'security',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
    labelKey: 'security',
    fallback: 'Security',
  },
  {
    id: 'notifications',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    labelKey: 'notifications',
    fallback: 'Notifications',
  },
  {
    id: 'privacy',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    labelKey: 'privacyConsent',
    fallback: 'Privacy',
  },
  {
    id: 'danger',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    labelKey: 'dangerZone',
    fallback: 'Danger Zone',
  },
];

function getInitialTab(): Tab {
  if (typeof window === 'undefined') return 'profile';
  const urlTab = new URLSearchParams(window.location.search).get('tab');
  if (urlTab && tabs.some((t) => t.id === urlTab)) return urlTab as Tab;
  return 'profile';
}

export default function SettingsPage() {
  const { user, token } = useAuth();
  const t = useTranslations('settings');
  const [activeTab, setActiveTab] = useState<Tab>(getInitialTab);

  // Sync with URL on browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const urlTab = new URLSearchParams(window.location.search).get('tab');
      if (urlTab && tabs.some((t) => t.id === urlTab)) {
        setActiveTab(urlTab as Tab);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabClick = useCallback((id: Tab) => {
    setActiveTab(id);
    // Persist in URL
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (id === 'profile') {
        url.searchParams.delete('tab');
      } else {
        url.searchParams.set('tab', id);
      }
      window.history.replaceState(null, '', url.toString());
    }
  }, []);

  return (
    <div className="max-w-5xl">
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      {/* ── Horizontal Tabs ── */}
      <div className="border-b border-gray-200 dark:border-slate-700 mb-6">
        <nav className="flex gap-1 overflow-x-auto -mb-px" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabClick(tab.id)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-150',
                  isActive
                    ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                )}
              >
                <span className={clsx(
                  'transition-colors',
                  isActive ? 'text-brand-500 dark:text-brand-400' : 'text-gray-400 dark:text-slate-600'
                )}>
                  {tab.icon}
                </span>
                {tab.labelKey === 'privacyConsent' ? (t('privacyConsent') || tab.fallback) : (t(tab.labelKey) || tab.fallback)}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Tab Content ── */}
      <div className="animate-slide-up">
        {activeTab === 'profile' && <ProfileSection user={user} token={token} />}
        {activeTab === 'security' && (
          <div className="space-y-5">
            <PasswordSection token={token} />
            <TwoFactorSection />
          </div>
        )}
        {activeTab === 'notifications' && <NotificationSection />}
        {activeTab === 'privacy' && <PrivacyConsentSection />}
        {activeTab === 'danger' && <DangerZoneSection />}
      </div>
    </div>
  );
}
