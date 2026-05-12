'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { endpointsApi, type Endpoint, type RetryPolicyConfig } from '@/lib/api';
import { RetryPolicyCard } from './components/RetryPolicyCard';
import { SignatureCard } from './components/SignatureCard';
import { RateLimitCard } from './components/RateLimitCard';
import { TestWebhookCard } from './components/TestWebhookCard';

export default function EndpointSettingsPage() {
  const t = useTranslations('endpointSettings');
  const { id } = useParams<{ id: string }>();
  const locale = useLocale();
  const { token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [endpoint, setEndpoint] = useState<Endpoint | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEndpoint = useCallback(async () => {
    if (!token || !id) return;
    try {
      const ep = await endpointsApi.get(token, id);
      if (!ep) {
        toast(t('toastEndpointNotFound'), 'error');
        router.push(`/${locale}/dashboard/endpoints`);
        return;
      }
      setEndpoint(ep);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('toastLoadFailed');
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [token, id, toast, router, t]);

  useEffect(() => { fetchEndpoint(); }, [fetchEndpoint]);

  const handleSaveRetryPolicy = async (policy: RetryPolicyConfig) => {
    if (!token || !id) return;
    try {
      await endpointsApi.updateRetryPolicy(token, id, policy);
      toast(t('toastRetryUpdated'), 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('toastUpdateFailed');
      toast(msg, 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (!endpoint) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button type="button"
          onClick={() => router.push(`/${locale}/dashboard/endpoints`)}
          className="p-2 -ml-2 text-gray-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
          <p className="text-sm font-mono text-gray-500 dark:text-slate-400 mt-1">{endpoint.url}</p>
        </div>
      </div>

      <RetryPolicyCard
        initialMaxAttempts={endpoint.retry_policy?.max_attempts ?? 5}
        initialBackoff={endpoint.retry_policy?.backoff ?? 'exponential'}
        initialDelay={endpoint.retry_policy?.initial_delay_secs ?? 10}
        initialMaxDelay={endpoint.retry_policy?.max_delay_secs ?? 3600}
        onSave={handleSaveRetryPolicy}
      />

      <SignatureCard
        endpointId={id}
        signingSecret={endpoint.signing_secret}
      />

      <RateLimitCard endpoint={endpoint} />

      <TestWebhookCard
        endpointId={id}
        endpointUrl={endpoint.url}
      />
    </div>
  );
}
