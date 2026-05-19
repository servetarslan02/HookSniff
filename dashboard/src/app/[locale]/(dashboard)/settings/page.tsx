'use client';

import { useAuth } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { ProfileSection } from './components/ProfileSection';
import { PasswordSection } from './components/PasswordSection';
import { ApiKeySection } from './components/ApiKeySection';
import { NotificationSection } from './components/NotificationSection';
import { PrivacyConsentSection } from './components/PrivacyConsentSection';
import { DangerZoneSection } from './components/DangerZoneSection';
import { TwoFactorSection } from './components/TwoFactorSection';
import { useState } from 'react';
import { clsx } from 'clsx';

type Tab = 'profile' | 'security' | 'api' | 'notifications' | 'privacy' | 'danger';

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
    id: 'api',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    labelKey: 'api',
    fallback: 'API',
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

export default function SettingsPage() {
  const { user, token, apiKey } = useAuth();
  const t = useTranslations('settings');
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  return (
    <div className="max-w-5xl">
      {/* ── Header ── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* ── Tab Navigation ── */}
        <nav className="lg:w-52 shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-1 px-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150',
                    isActive
                      ? 'bg-gray-100 dark:bg-white/[0.06] text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                  )}
                >
                  <span className={clsx(
                    'transition-colors',
                    isActive ? 'text-[#4c6ef5] dark:text-[#748ffc]' : 'text-gray-400 dark:text-slate-600'
                  )}>
                    {tab.icon}
                  </span>
                  {tab.labelKey === 'privacyConsent' ? (t('privacyConsent') || tab.fallback) : (t(tab.labelKey) || tab.fallback)}
                </button>
              );
            })}
          </div>
        </nav>

        {/* ── Tab Content ── */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <div className="animate-slide-up">
              <ProfileSection user={user} token={token} />
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-5 animate-slide-up">
              <PasswordSection token={token} />
              <TwoFactorSection />
            </div>
          )}

          {activeTab === 'api' && (
            <div className="animate-slide-up">
              <ApiKeySection apiKey={apiKey} />
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="animate-slide-up">
              <NotificationSection />
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="animate-slide-up">
              <PrivacyConsentSection />
            </div>
          )}

          {activeTab === 'danger' && (
            <div className="animate-slide-up">
              <DangerZoneSection />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
