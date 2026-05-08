'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { endpointsApi, type Endpoint, type RetryPolicyConfig } from '@/lib/api';

const BACKOFF_OPTIONS = [
  { value: 'exponential', label: 'Exponential', desc: 'Delay doubles each attempt (10s → 20s → 40s → 80s...)' },
  { value: 'linear', label: 'Linear', desc: 'Delay increases linearly (10s → 20s → 30s → 40s...)' },
  { value: 'fixed', label: 'Fixed', desc: 'Same delay every attempt (10s → 10s → 10s...)' },
] as const;

export default function EndpointSettingsPage() {
  const { id } = useParams<{ id: string }>();
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

  const fetchEndpoint = useCallback(async () => {
    if (!token || !id) return;
    try {
      // Fetch single endpoint from list (no dedicated GET in client yet)
      const all = await endpointsApi.list(token);
      const ep = all.find((e) => e.id === id);
      if (!ep) {
        toast('Endpoint not found', 'error');
        router.push('/dashboard/endpoints');
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
      const msg = err instanceof Error ? err.message : 'Failed to load endpoint';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, [token, id, toast, router]);

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
      toast('Retry policy updated!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update';
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
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1'}/endpoints/${id}/rotate-secret`,
        { method: 'POST', headers: {}, credentials: 'include' as const }
      );
      if (!res.ok) throw new Error('Rotation failed');
      const data = await res.json();
      setNewSecret(data.signing_secret);
      toast('Secret rotated! Old secret valid for 24 hours.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Rotation failed';
      toast(msg, 'error');
    } finally {
      setRotating(false);
      setShowRotateConfirm(false);
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
        <button
          onClick={() => router.push('/dashboard/endpoints')}
          className="p-2 -ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Endpoint Settings</h2>
          <p className="text-sm font-mono text-gray-500 dark:text-slate-400 mt-1">{endpoint.url}</p>
        </div>
      </div>

      {/* Retry Policy Card */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">🔄</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Retry Policy</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Max Attempts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Max Attempts
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">1–20 attempts</p>
          </div>

          {/* Backoff Strategy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Backoff Strategy
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
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{opt.label}</span>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Initial Delay */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Initial Delay (seconds)
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
              Max Delay (seconds)
            </label>
            <input
              type="number"
              min={1}
              max={86400}
              value={maxDelay}
              onChange={(e) => setMaxDelay(Math.max(1, Math.min(86400, parseInt(e.target.value) || 1)))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Max 86400s (24h)</p>
          </div>
        </div>

        {/* Delay Preview */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800">
          <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
            Retry Schedule Preview
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
          <button
            onClick={handleSaveRetryPolicy}
            disabled={saving}
            className="bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 transition disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Retry Policy'}
          </button>
        </div>
      </div>

      {/* Signature Rotation Card */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🔑</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Signing Secret</h3>
        </div>

        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
          Rotate your signing secret. The old secret remains valid for 24 hours to allow seamless migration.
        </p>

        {endpoint.signing_secret && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800">
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Current Secret</p>
            <code className="text-sm font-mono text-gray-700 dark:text-slate-300 break-all">
              {endpoint.signing_secret.slice(0, 12)}{'*'.repeat(20)}
            </code>
          </div>
        )}

        {newSecret && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-500/10 rounded-xl border border-green-200 dark:border-green-500/20">
            <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">New Secret (save this!)</p>
            <code className="text-sm font-mono text-green-800 dark:text-green-300 break-all">{newSecret}</code>
          </div>
        )}

        <button
          onClick={() => setShowRotateConfirm(true)}
          className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-700 transition"
        >
          Rotate Secret
        </button>
      </div>

      {/* Rate Limit Info Card */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">⚡</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Rate Limits</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800">
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">API Requests</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {endpoint.routing_strategy === 'round-robin' ? '100' : '1,000'}
              <span className="text-sm font-normal text-gray-400 dark:text-slate-500 ml-1">/min</span>
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800">
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Avg Response</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {endpoint.avg_response_ms ?? 0}
              <span className="text-sm font-normal text-gray-400 dark:text-slate-500 ml-1">ms</span>
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-200 dark:border-slate-800">
            <p className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">Failure Streak</p>
            <p className={`text-2xl font-bold ${(endpoint.failure_streak ?? 0) >= 3 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
              {endpoint.failure_streak ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Rotate Confirmation Modal */}
      {showRotateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Rotate Signing Secret?</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              The old secret will remain valid for 24 hours. Update your webhook consumers to use the new secret before then.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowRotateConfirm(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRotateSecret}
                disabled={rotating}
                className="px-4 py-2.5 rounded-xl text-sm font-medium bg-amber-600 text-white hover:bg-amber-700 transition disabled:opacity-60"
              >
                {rotating ? 'Rotating...' : 'Rotate Secret'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
