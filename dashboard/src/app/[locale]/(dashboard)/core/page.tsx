'use client';

import dynamic from 'next/dynamic';
import { TabbedSection } from '@/components/TabbedSection';
import { useTranslations } from 'next-intl';
import { BarChart3, Key, KeyRound, Shield } from '@/components/icons';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/store';

const tabSkeleton = (
  <div className="animate-pulse space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 bg-gray-200 dark:bg-slate-700 rounded-xl" />
      ))}
    </div>
    <div className="h-64 bg-gray-200 dark:bg-slate-700 rounded-xl" />
  </div>
);

const DashboardOverview = dynamic(() => import('../DashboardOverview').then(mod => ({ default: mod.DashboardOverview })), { ssr: false, loading: () => tabSkeleton });
const ApiKeysPage = dynamic(() => import('../api-keys/page'), { ssr: false, loading: () => tabSkeleton });
const ServiceTokensPage = dynamic(() => import('../service-tokens/page'), { ssr: false, loading: () => tabSkeleton });

export default function CorePage() {
  const t = useTranslations('nav');
  const { user } = useAuth();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Admin Panel shortcut — only for admin users */}
      {user?.is_admin && (
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/30 border border-amber-200 dark:border-amber-800 transition w-fit"
        >
          <Shield size={14} strokeWidth={1.75} />
          {t('adminPanel') || 'Yönetim Paneli'}
        </Link>
      )}
      <TabbedSection
        tabs={[
          { key: 'overview', label: t('dashboard'), icon: <BarChart3 size={16} strokeWidth={1.75} />, content: () => <DashboardOverview /> },
          { key: 'api-keys', label: t('apiKeys'), icon: <Key size={16} strokeWidth={1.75} />, content: () => <ApiKeysPage /> },
          { key: 'service-tokens', label: t('serviceTokens'), icon: <KeyRound size={16} strokeWidth={1.75} />, content: () => <ServiceTokensPage /> },
        ]}
      />
    </div>
  );
}
