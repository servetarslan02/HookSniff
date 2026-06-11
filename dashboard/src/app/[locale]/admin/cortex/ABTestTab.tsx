'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { useCachedFetch } from './useCortexCache';

interface AbTest {
  id: number;
  endpoint_id: string;
  model_type: string;
  variant_a: string;
  variant_b: string;
  split_ratio: number;
  status: string;
  winner: string | null;
  created_at: string;
}

/** Parse variant JSON and return human-readable description */
function describeVariant(raw: string, modelType: string, t: any): { label: string; details: string[] } {
  let params: Record<string, unknown> = {};
  try { params = JSON.parse(raw); } catch { return { label: raw, details: [] }; }

  const details: string[] = [];

  // Retry strategy variants
  if (modelType.includes('retry') || modelType.includes('bandit')) {
    if (params.s === 'exp' || params.strategy === 'exponential') {
      return { label: t('variant.exponential') || 'Exponential Backoff', details: [t('variant.exponentialDesc') || 'Delays double each retry (1s → 2s → 4s → 8s...)'] };
    }
    if (params.s === 'lin' || params.strategy === 'linear') {
      return { label: t('variant.linear') || 'Linear Backoff', details: [t('variant.linearDesc') || 'Delays increase linearly (1s → 2s → 3s → 4s...)'] };
    }
    if (params.s === 'fixed' || params.strategy === 'fixed') {
      return { label: t('variant.fixed') || 'Fixed Delay', details: [t('variant.fixedDesc') || 'Same delay between every retry'] };
    }
    if (params.s === 'aggressive' || params.strategy === 'aggressive') {
      return { label: t('variant.aggressive') || 'Aggressive Retry', details: [t('variant.aggressiveDesc') || 'Faster retries with shorter delays'] };
    }
    if (params.s === 'conservative' || params.strategy === 'conservative') {
      return { label: t('variant.conservative') || 'Conservative Retry', details: [t('variant.conservativeDesc') || 'Slower retries with longer delays'] };
    }
  }

  // Timeout variants
  if (modelType.includes('timeout') || params.ms !== undefined) {
    const ms = params.ms || params.timeout || params.value;
    if (ms) {
      const secs = typeof ms === 'number' ? Math.round(ms / 1000) : ms;
      return { label: `${secs}s ${t('variant.timeout') || 'Timeout'}`, details: [`${t('variant.timeoutDesc') || 'Wait up to'} ${secs} ${t('variant.seconds') || 'seconds'} ${t('variant.beforeGivingUp') || 'before giving up'}`] };
    }
  }

  // Circuit breaker variants
  if (modelType.includes('circuit')) {
    if (params.threshold !== undefined) {
      return { label: `${t('variant.threshold') || 'Threshold'}: ${params.threshold}`, details: [`${t('variant.circuitDesc') || 'Open circuit after'} ${params.threshold} ${t('variant.consecutiveFailures') || 'consecutive failures'}`] };
    }
  }

  // Rate limit variants
  if (modelType.includes('rate') || modelType.includes('throttle')) {
    if (params.rpm !== undefined || params.rate !== undefined) {
      const rpm = params.rpm || params.rate;
      return { label: `${rpm} ${t('variant.requestsPerMin') || 'req/min'}`, details: [`${t('variant.rateLimitDesc') || 'Allow up to'} ${rpm} ${t('variant.requestsPerMinute') || 'requests per minute'}`] };
    }
  }

  // Fallback: show key-value pairs nicely
  for (const [key, val] of Object.entries(params)) {
    const label = t(`paramNames.${key}`) || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    details.push(`${label}: ${val}`);
  }
  const label = details.length > 0 ? details[0].split(': ').pop() || raw : raw;
  return { label, details };
}

/** Translate model_type to user-friendly name */
function translateModelType(modelType: string, t: any): string {
  const key = `modelTypes.${modelType}`;
  const translated = t(key);
  return translated !== key ? translated : modelType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function ABTestTab() {
  const t = useTranslations('cortex.abTest');
  const tc = useTranslations('cortex.common');
  const { token } = useAuth();
  const { data, loading, error } = useCachedFetch<any>(
    'abTests',
    () => apiFetch<any>('/cortex/ab-tests', { token: token! }),
    [token]
  );
  const tests: AbTest[] = data?.ab_tests ?? [];

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="glass-card p-4 sm:p-6 md:p-8 text-center"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('title')}</h2>
        <span className="text-sm text-gray-500">{t('testCount', {n: tests.length})}</span>
      </div>

      {tests.length === 0 ? (
        <div className="glass-card p-4 sm:p-6 md:p-8 text-center">
          <p className="text-gray-500 dark:text-slate-400">{t('empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tests.map(abtest => {
            const variantA = describeVariant(abtest.variant_a, abtest.model_type, t);
            const variantB = describeVariant(abtest.variant_b, abtest.model_type, t);
            const isRunning = abtest.status === 'running';
            const splitA = (abtest.split_ratio * 100).toFixed(0);
            const splitB = ((1 - abtest.split_ratio) * 100).toFixed(0);

            return (
              <div key={abtest.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{translateModelType(abtest.model_type, t)}</span>
                    <span className="ml-2 text-xs text-gray-500 font-mono">{abtest.endpoint_id.slice(0, 8)}...</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${isRunning ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                    {t(`statusLabels.${abtest.status}`) !== `statusLabels.${abtest.status}` ? t(`statusLabels.${abtest.status}`) : abtest.status}
                  </span>
                </div>

                <div className="flex gap-3 items-stretch">
                  {/* Variant A */}
                  <div className={`flex-1 p-3 rounded-lg border ${abtest.winner === 'variant_a' ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">A</span>
                      {abtest.winner === 'variant_a' && <span className="text-xs">🏆</span>}
                    </div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{variantA.label}</div>
                    {variantA.details.map((d, i) => <div key={i} className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{d}</div>)}
                    <div className="text-xs text-gray-400 mt-2">{splitA}% {t('traffic')}</div>
                  </div>

                  <div className="flex items-center text-gray-400 font-medium text-sm">vs</div>

                  {/* Variant B */}
                  <div className={`flex-1 p-3 rounded-lg border ${abtest.winner === 'variant_b' ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">B</span>
                      {abtest.winner === 'variant_b' && <span className="text-xs">🏆</span>}
                    </div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{variantB.label}</div>
                    {variantB.details.map((d, i) => <div key={i} className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{d}</div>)}
                    <div className="text-xs text-gray-400 mt-2">{splitB}% {t('traffic')}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
