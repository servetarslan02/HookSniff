'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useEndpoints } from '@/hooks/useDashboardData';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { endpointsApi, type RetryPolicyConfig } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

const BACKOFF_OPTIONS = [
  { value: 'exponential', icon: '📈' },
  { value: 'linear', icon: '📊' },
  { value: 'fixed', icon: '➡️' },
];

export default function RetryPolicyPage() {
  const t = useTranslations('retryPolicy');
  const tc = useTranslations('common');
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: endpoints = [], isLoading } = useEndpoints();

  const [editId, setEditId] = useState<string | null>(null);
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [backoff, setBackoff] = useState('exponential');
  const [initialDelay, setInitialDelay] = useState(10);
  const [maxDelay, setMaxDelay] = useState(3600);
  const [saving, setSaving] = useState(false);

  const handleEdit = (ep: { id: string; retry_policy?: { max_attempts?: number; backoff?: string; initial_delay_secs?: number; max_delay_secs?: number } | null }) => {
    setEditId(ep.id);
    setMaxAttempts(ep.retry_policy?.max_attempts ?? 3);
    setBackoff(ep.retry_policy?.backoff ?? 'exponential');
    setInitialDelay(ep.retry_policy?.initial_delay_secs ?? 10);
    setMaxDelay(ep.retry_policy?.max_delay_secs ?? 3600);
  };

  const handleResetToDefault = () => {
    setMaxAttempts(3);
    setBackoff('exponential');
    setInitialDelay(10);
    setMaxDelay(3600);
  };

  const handleSave = async () => {
    if (!editId || !token) return;
    setSaving(true);
    try {
      await endpointsApi.updateRetryPolicy(token, editId, {
        max_attempts: maxAttempts,
        backoff: backoff as RetryPolicyConfig['backoff'],
        initial_delay_secs: initialDelay,
        max_delay_secs: maxDelay,
      });
      await queryClient.invalidateQueries({ queryKey: ['endpoints'] });
      toast(t('policyUpdated') || 'Retry policy updated', 'success');
      setEditId(null);
    } catch (err) {
      toast(err instanceof Error ? err.message : tc('unknownError'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const previewDelays = () => {
    const delays: number[] = [];
    for (let i = 1; i <= Math.min(maxAttempts, 6); i++) {
      let delay: number;
      switch (backoff) {
        case 'exponential': delay = initialDelay * Math.pow(2, i - 1); break;
        case 'linear': delay = initialDelay * i; break;
        default: delay = initialDelay;
      }
      delays.push(Math.min(delay, maxDelay));
    }
    return delays;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      {/* Quick explanation */}
      <div className="grid grid-cols-3 gap-3">
        {BACKOFF_OPTIONS.map((s) => (
          <div key={s.value} className="glass-card p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{t(s.value) || s.value}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t(`${s.value}Desc`) || ''}</div>
          </div>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 dark:text-slate-400">{tc('loading')}</div>
        ) : endpoints.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">🔁</div>
            <p className="text-gray-500 dark:text-slate-400 mb-4">{t('noEndpoints')}</p>
            <a href="/webhooks" className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition">
              {t('createEndpoint') || 'Create Endpoint'}
            </a>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {endpoints.map((ep) => {
              const policy = ep.retry_policy;
              return (
                <div key={ep.id} className="px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                  {editId === ep.id ? (
                    /* Edit mode */
                    <div className="space-y-4">
                      <code className="text-sm font-mono text-gray-700 dark:text-slate-300 block truncate">{ep.url}</code>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">{t('maxAttempts') || 'Max Attempts'}</label>
                          <input type="number" min={1} max={20} value={maxAttempts}
                            onChange={(e) => setMaxAttempts(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">{t('initialDelay') || 'Initial Delay (s)'}</label>
                          <input type="number" min={1} max={300} value={initialDelay}
                            onChange={(e) => setInitialDelay(Math.max(1, Math.min(300, parseInt(e.target.value) || 1)))}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">{t('backoffStrategy') || 'Backoff Strategy'}</label>
                        <div className="flex gap-2">
                          {BACKOFF_OPTIONS.map((s) => (
                            <button key={s.value} type="button" onClick={() => setBackoff(s.value)}
                              className={`flex-1 p-3 rounded-xl border text-center transition ${
                                backoff === s.value
                                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                                  : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'
                              }`}>
                              <span className="text-lg">{s.icon}</span>
                              <div className="text-xs font-medium text-gray-900 dark:text-white mt-1">{t(s.value) || s.value}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1.5">{t('maxDelay') || 'Max Delay (s)'}</label>
                        <input type="number" min={1} max={86400} value={maxDelay}
                          onChange={(e) => setMaxDelay(Math.max(1, Math.min(86400, parseInt(e.target.value) || 1)))}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm" />
                      </div>

                      {/* Preview */}
                      <div className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl">
                        <p className="text-xs font-medium text-gray-500 dark:text-slate-400 mb-2">{t('retrySchedulePreview') || 'Retry Schedule'}</p>
                        <div className="flex flex-wrap gap-2">
                          {previewDelays().map((delay, i) => (
                            <span key={i} className="px-2 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-mono">
                              #{i + 1}: {delay < 60 ? `${delay}s` : `${Math.round(delay / 60)}m`}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button type="button" onClick={handleResetToDefault} className="px-4 py-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 border border-gray-200 dark:border-slate-700 rounded-xl">
                          {t('resetToDefault') || 'Reset to Default'}
                        </button>
                        <button type="button" onClick={() => setEditId(null)} className="px-4 py-2 text-sm text-gray-600 dark:text-slate-400 hover:text-gray-800">
                          {tc('cancel')}
                        </button>
                        <button type="button" onClick={handleSave} disabled={saving} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition disabled:opacity-60">
                          {saving ? tc('saving') : tc('save')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display mode */
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <a href={`/endpoints/${ep.id}`} className="text-sm font-mono text-gray-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:underline truncate block">
                          {ep.url}
                        </a>
                        {ep.description && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{ep.description}</p>}
                      </div>
                      <div className="flex items-center gap-3 ml-4 shrink-0">
                        {policy ? (
                          <div className="text-sm text-gray-600 dark:text-slate-400">
                            <span className="font-medium">{policy.max_attempts ?? 3}</span> {t('attempts')} · {(t(policy.backoff ?? 'exponential') || policy.backoff) ?? 'exponential'} · {policy.initial_delay_secs ?? 10}s
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-slate-500">{t('defaultPolicy')}</span>
                        )}
                        <button type="button" onClick={() => handleEdit(ep)} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                          ✏️ {t('edit') || 'Edit'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
