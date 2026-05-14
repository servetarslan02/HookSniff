'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { apiFetch } from '@/lib/api';
import type { GlobalRetryPolicy } from './types';
import { DEFAULT_POLICY } from './types';
import { RetrySettingsCard } from './components/RetrySettingsCard';
import { DeadLetterQueueCard } from './components/DeadLetterQueueCard';
import { StatusCodesCard } from './components/StatusCodesCard';
import { DelayPreviewCard } from './components/DelayPreviewCard';

export default function RetryPolicyPage() {
  const t = useTranslations('retryPolicy');
  const { token } = useAuth();
  const { toast } = useToast();
  const [policy, setPolicy] = useState<GlobalRetryPolicy>(DEFAULT_POLICY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPolicy = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiFetch<Array<{ id: string; retry_policy?: { max_attempts?: number; backoff?: string; initial_delay_secs?: number; max_delay_secs?: number } }>>('/endpoints', { token });
      if (data.length > 0) {
        const first = data[0];
        const rp = first.retry_policy;
        if (rp) {
          setPolicy({
            ...DEFAULT_POLICY,
            default_max_attempts: rp.max_attempts ?? DEFAULT_POLICY.default_max_attempts,
            default_initial_delay_secs: rp.initial_delay_secs ?? DEFAULT_POLICY.default_initial_delay_secs,
            default_max_delay_secs: rp.max_delay_secs ?? DEFAULT_POLICY.default_max_delay_secs,
            default_backoff: (rp.backoff as 'exponential' | 'linear' | 'fixed') ?? DEFAULT_POLICY.default_backoff,
          });
        }
      }
    } catch {
      // Use defaults
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchPolicy(); }, [fetchPolicy]);

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    try {
      const endpoints = await apiFetch<Array<{ id: string }>>('/endpoints', { token });
      const errors: string[] = [];
      for (const ep of endpoints) {
        try {
          await apiFetch(`/endpoints/${ep.id}/retry-policy`, {
            method: 'PUT',
            body: {
              max_attempts: policy.default_max_attempts,
              backoff: policy.default_backoff,
              initial_delay_secs: policy.default_initial_delay_secs,
              max_delay_secs: policy.default_max_delay_secs,
            },
            token,
          });
        } catch {
          errors.push(ep.id);
        }
      }
      if (errors.length === 0) {
        toast(t('saved'), 'success');
      } else {
        toast(t('savedWithErrors', { count: errors.length }), 'error');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : t('saveFailed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const updatePolicy = (update: Partial<GlobalRetryPolicy>) => {
    setPolicy({ ...policy, ...update });
  };

  const toggleStatusCode = (code: number) => {
    const codes = policy.retry_on_status_codes.includes(code)
      ? policy.retry_on_status_codes.filter((c) => c !== code)
      : [...policy.retry_on_status_codes, code];
    setPolicy({ ...policy, retry_on_status_codes: codes });
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            {t('subtitle')}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition disabled:opacity-50"
        >
          {saving ? t('saving') : t('saveChanges')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <RetrySettingsCard policy={policy} onChange={updatePolicy} />
          <DeadLetterQueueCard policy={policy} onChange={updatePolicy} />
          <StatusCodesCard selectedCodes={policy.retry_on_status_codes} onToggle={toggleStatusCode} />
        </div>
        <DelayPreviewCard policy={policy} />
      </div>
    </div>
  );
}
