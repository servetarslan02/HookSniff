'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { endpointsApi, apiFetch, type Endpoint, type RetryPolicyConfig } from '@/lib/api';
import ConfirmDialog from '@/components/ConfirmDialog';

const BACKOFF_OPTIONS = [
  { value: 'exponential', labelKey: 'exponential', descKey: 'exponentialDesc' },
  { value: 'linear', labelKey: 'linear', descKey: 'linearDesc' },
  { value: 'fixed', labelKey: 'fixed', descKey: 'fixedDesc' },
] as const;

export default function EndpointSettingsPage() {
  const t = useTranslations('endpointSettings');
  const tCommon = useTranslations('common');
  const { id } = useParams<{ id: string }>();
  const locale = useLocale();
  const { token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [endpoint, setEndpoint] = useState<Endpoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Retry Policy state
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [backoff, setBackoff] = useState<string>('exponential');
  const [initialDelay, setInitialDelay] = useState(10);
  const [maxDelay, setMaxDelay] = useState(3600);

  // Signature state
  const [showRotateConfirm, setShowRotateConfirm] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [newSecret, setNewSecret] = useState<string | null>(null);

  // Test webhook state
  const [testSending, setTestSending] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

  const fetchEndpoint = useCallback(async () => {
    if (!token || !id) return;
    try {
      // Fetch single endpoint directly (avoids N+1 query)
      const ep = await endpointsApi.get(token, id);
      if (!ep) {
        toast(t('toastEndpointNotFound'), 'error');
        router.push(`/${locale}/dashboard/endpoints`);
        return;
      }
      setEndpoint(ep);

      // Load retry policy
      if (ep.retry_policy) {
        setMaxAttempts(ep.retry_policy.max_attempts ?? 5);
        setBackoff(ep.retry_policy.backoff ?? 'exponential');
        setInitialDelay(ep.retry_policy.initial_delay_secs ?? 10);
        setMaxDelay(ep.retry_policy.max_delay_secs ?? 3600);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('toastLoadFailed');
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [token, id, toast, router, t]);

  useEffect(() => { fetchEndpoint(); }, [fetchEndpoint]);

  const handleSaveRetryPolicy = async () => {
    if (!token || !id) return;
    setSaving(true);
    try {
      const policy: RetryPolicyConfig = {
        max_attempts: maxAttempts,
        backoff: backoff as RetryPolicyConfig['backoff'],
        initial_delay_secs: initialDelay,
        max_delay_secs: maxDelay,
      };
      await endpointsApi.updateRetryPolicy(token, id, policy);
      toast(t('toastRetryUpdated'), 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('toastUpdateFailed');
      toast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRotateSecret = async () => {
    if (!token || !id) return;
    setRotating(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1')}/endpoints/${id}/rotate-secret`,
        { method: 'POST', headers: {}, credentials: 'include' as const }
      );
      if (!res.ok) throw new Error(t('toastRotationFailed'));
      const data = await res.json();
      setNewSecret(data.signing_secret);
      toast(t('toastSecretRotated'), 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('toastRotationFailed');
      toast(msg, 'error');
    } finally {
      setRotating(false);
      setShowRotateConfirm(false);
    }
  };

  const handleSendTestWebhook = async () => {
    if (!token || !id || !endpoint) return;
    setTestSending(true);
    setTestResult(null);
    try {
      await apiFetch('/webhooks', {
        method: 'POST',
        body: {
          endpoint_id: id,
          event: 'test.ping',
          data: {
            test: true,
            message: 'Hello from HookSniff! 🪝',
            timestamp: new Date().toISOString(),
            endpoint_url: endpoint.url,
          },
        },
        token,
      });
      setTestResult('success');
      toast(t('toastTestSent'), 'success');
    } catch (err: unknown) {
      setTestResult('error');
      const msg = err instanceof Error ? err.message : t('toastTestFailed');
      toast(msg, 'error');
    } finally {
      setTestSending(false);
    }
  };

  // Preview retry delays
  const previewDelays = () => {
    const delays: number[] = [];
    for (let i = 1; i <= Math.min(maxAttempts, 8); i++) {
      let delay: number;
      switch (backoff) {
        case 'exponential':
          delay = initialDelay * Math.pow(2, i - 1);
          break;
        case 'linear':
          delay = initialDelay * i;
          break;
        default:
          delay = initialDelay;
      }
      delays.push(Math.min(delay, maxDelay));
    }
    return delays;
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

      {/* Retry Policy Card */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">🔄</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('retryPolicy')}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Max Attempts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              {t('maxAttempts')}
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">{t('maxAttemptsHint')}</p>
          </div>

          {/* Backoff Strategy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              {t('backoffStrategy')}
            </label>
            <div className="space-y-2">
              {BACKOFF_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    backoff === opt.value
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="backoff"
                    value={opt.value}
                    checked={backoff === opt.value}
                    onChange={(e) => setBackoff(e.target.value)}
                    className="mt-0.5 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{t(opt.labelKey)}</span>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{t(opt.descKey)}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Initial Delay */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              {t('initialDelay')}
            </label>
            <input
              type="number"
              min={1}
              max={300}
              value={initialDelay}
              onChange={(e) => setInitialDelay(Math.max(1, Math.min(300, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Max Delay */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              {t('maxDelay')}
            </label>
            <input
              type="number"
              min={1}
              max={86400}
              value={maxDelay}
              onChange={(e) => setMaxDelay(Math.max(1, Math.min(86400, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">{t('maxDelayHint')}</p>
          </div>
        </div>

        {/* Delay Preview */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-700">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
            {t('retrySchedulePreview')}
          </p>
          <div className="flex flex-wrap gap-2">
            {previewDelays().map((delay, i) => (
              <span
                key={i}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-mono"
              >
                #{i + 1}: {delay < 60 ? `${delay}s` : `${Math.round(delay / 60)}m`}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <button type="button"
            onClick={handleSaveRetryPolicy}
            disabled={saving}
            className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition disabled:opacity-60"
          >
            {saving ? t('saving') : t('saveRetryPolicy')}
          </button>
        </div>
      </div>

      {/* Signature Rotation Card */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🔑</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('signingSecret')}</h3>
        </div>

        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
          {t('rotateSecretDesc')}
        </p>

        {endpoint.signing_secret && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-700">
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">{t('currentSecret')}</p>
            <code className="text-sm font-mono text-gray-700 dark:text-slate-300 break-all">
              {endpoint.signing_secret.slice(0, 12)}{'*'.repeat(20)}
            </code>
          </div>
        )}

        {newSecret && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/20">
            <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">{t('newSecret')}</p>
            <code className="text-sm font-mono text-green-800 dark:text-green-300 break-all">{newSecret}</code>
          </div>
        )}

        <button type="button"
          onClick={() => setShowRotateConfirm(true)}
          className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-700 transition"
        >
          {t('rotateSecret')}
        </button>
      </div>

      {/* Rate Limit Info Card */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">⚡</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('rateLimits')}</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-700">
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('apiRequests')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {endpoint.routing_strategy === 'round-robin' ? '100' : '1,000'}
              <span className="text-sm font-normal text-gray-500 dark:text-slate-500 ml-1">{t('perMin')}</span>
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-700">
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('avgResponse')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {endpoint.avg_response_ms ?? 0}
              <span className="text-sm font-normal text-gray-500 dark:text-slate-500 ml-1">{t('msUnit')}</span>
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-700">
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">{t('failureStreak')}</p>
            <p className={`text-2xl font-bold ${(endpoint.failure_streak ?? 0) >= 3 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              {endpoint.failure_streak ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Send Test Webhook Card */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('testWebhookTitle')}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
          {t('testWebhookDesc')}
        </p>
        <div className="flex items-center gap-4">
          <button type="button"
            onClick={handleSendTestWebhook}
            disabled={testSending}
            className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {testSending ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('sending')}
              </>
            ) : (
              <>{t('sendTestWebhook')}</>
            )}
          </button>
          {testResult === 'success' && (
            <span className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-1">
              {t('testSent')}
            </span>
          )}
          {testResult === 'error' && (
            <span className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-1">
              {t('testFailed')}
            </span>
          )}
        </div>
        <div className="mt-3 text-xs text-gray-500 dark:text-slate-500">
          {t('payloadLabel')} <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{"{"}&quot;event&quot;: &quot;test.ping&quot;, &quot;data&quot;: {"{"}&quot;message&quot;: &quot;Hello from HookSniff! 🪝&quot;{"}"}{"}"}</code>
        </div>
      </div>

      {/* Rotate Confirmation Dialog */}
      <ConfirmDialog
        open={showRotateConfirm}
        title={t('rotateConfirmTitle')}
        message={t('rotateConfirmDesc')}
        confirmLabel={rotating ? t('rotating') : t('rotateSecret')}
        cancelLabel={tCommon('cancel')}
        variant="danger"
        onConfirm={handleRotateSecret}
        onCancel={() => setShowRotateConfirm(false)}
        loading={rotating}
      />
    </div>
  );
}
