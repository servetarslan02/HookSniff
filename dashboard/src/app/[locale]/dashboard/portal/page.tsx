'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';

interface PortalProfile {
  id: string;
  email: string;
  name?: string;
  plan: string;
  webhook_limit?: number;
  webhook_count?: number;
  created_at: string;
}

interface PortalUsage {
  webhooks_used?: number;
  api_calls_today?: number;
  total_deliveries: number;
  delivered: number;
  failed: number;
  success_rate: number;
  endpoints_count: number;
}

export default function PortalPage() {
  const t = useTranslations('portal');
  const { token } = useAuth();
  const [profile, setProfile] = useState<PortalProfile | null>(null);
  const [usage, setUsage] = useState<PortalUsage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      apiFetch<PortalProfile>('/portal/me', { token }),
      apiFetch<PortalUsage>('/portal/usage', { token }),
    ])
      .then(([p, u]) => { setProfile(p); setUsage(u); })
      .catch((err) => {
        console.error('Failed to load portal data:', err);
        setError(err instanceof Error ? err.message : t('failedToLoad'));
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="p-8 text-gray-500">{t('loading')}</div>;

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

      {profile && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 mb-6">
          <h2 className="text-lg font-semibold mb-4">{t('profile')}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">{t('email')}</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('plan')}</p>
              <p className="font-medium capitalize">{profile.plan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('memberSince')}</p>
              <p className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('webhookLimit')}</p>
              <p className="font-medium">{t('perMonth', { limit: profile.webhook_limit?.toLocaleString() ?? '0' })}</p>
            </div>
          </div>
        </div>
      )}

      {usage && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-4">{t('usage')}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">{t('webhooksUsed')}</p>
              <p className="text-2xl font-bold text-purple-500">{usage.webhooks_used?.toLocaleString() || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('endpoints')}</p>
              <p className="text-2xl font-bold">{usage.endpoints_count || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">{t('apiCallsToday')}</p>
              <p className="text-2xl font-bold">{usage.api_calls_today?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
