'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { useCachedFetch } from './useCortexCache';
import { Clock, ShieldCheck, ExternalLink } from '@/components/icons';
import { PrefetchLink } from '@/components/PrefetchLink';

function describeHealingAction(actionType: string, reason: string, outcome: string, t: any): { title: string; detail: string; severity: string; actionSeverity: string } {
  const isRecovered = outcome === 'recovered' || outcome === 'success';

  // Translate common reasons
  const reasonMap: Record<string, string> = {
    'Primary timeout': t('reasonMap.primaryTimeout'),
    '10 consecutive failures': t('reasonMap.consecutiveFailures'),
    'Repeated failures': t('reasonMap.repeatedFailures'),
    '50% failure rate': t('reasonMap.highFailureRate'),
    'Overload': t('reasonMap.overload'),
  };
  const translatedReason = reasonMap[reason] || reason;

  // Map action types (API uses different names than i18n keys)
  const actionAliases: Record<string, string> = {
    'fallback_url': 'fallback_url_switch',
    'circuit_break': 'circuit_tighten',
  };
  const normalizedType = actionAliases[actionType] || actionType;

  const actions: Record<string, { title: string; detail: string; severity: string }> = {
    'auto_disable': { title: isRecovered ? t('action.auto_disable.recovered') : t('action.auto_disable.disabled'), detail: isRecovered ? t('detail.auto_disable.recovered') : t('detail.auto_disable.disabled'), severity: isRecovered ? 'ok' : 'disabled' },
    'circuit_tighten': { title: t('action.circuit_tighten'), detail: `${t('detail.circuit_tighten')} — ${translatedReason}`, severity: 'shield' },
    'retry_slowdown': { title: t('action.retry_slowdown'), detail: `${t('detail.retry_slowdown')} — ${translatedReason}`, severity: 'slowdown' },
    'rate_limit_reduce': { title: t('action.rate_limit_reduce'), detail: `${t('detail.rate_limit_reduce')} — ${translatedReason}`, severity: 'throttle' },
    'fallback_url_switch': { title: t('action.fallback_url_switch'), detail: `${t('detail.fallback_url_switch')} — ${translatedReason}`, severity: 'switch' },
    'retry_increase': { title: t('action.retry_increase'), detail: `${t('detail.retry_increase')} — ${translatedReason}`, severity: 'retry' },
    'timeout_adjust': { title: t('action.timeout_adjust'), detail: `${t('detail.timeout_adjust')} — ${translatedReason}`, severity: 'timeout' },
    'proactive_throttle': { title: t('action.proactive_throttle'), detail: t('detail.proactive_throttle'), severity: 'throttle' },
    'cascade_alert': { title: t('action.cascade_alert'), detail: t('detail.cascade_alert'), severity: 'alert' },
  };
  const info = actions[normalizedType] || { title: normalizedType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), detail: translatedReason || t('action.unknown'), severity: 'config' };
  return { ...info, actionSeverity: isRecovered ? 'ok' : 'action' };
}

export function HealingTab({ token }: { token: string | null }) {
  const t = useTranslations('cortex.healing');
  const tc = useTranslations('cortex.common');
  const { data, loading, error } = useCachedFetch<any>(
    'healing',
    () => apiFetch<any>('/cortex/healing/actions', { token: token! }),
    [token]
  );
  const actions = data?.actions || [];

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 dark:bg-slate-800 rounded-xl" />;
  if (error) return <div className="glass-card p-4 sm:p-6 md:p-8 text-center"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('title')}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">{t('description')}</p>
      </div>

      {actions.length === 0 ? (
        <div className="glass-card p-4 sm:p-6 md:p-8 text-center">
          <ShieldCheck size={48} className="mx-auto text-emerald-400 mb-4" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{t('empty.title')}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('empty.description')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.slice(0, 20).map((a: any, i: number) => {
            const endpointId = a[1] || '';
            const actionType = a[2] || '';
            const reason = a[3] || '';
            const outcome = a[5] || 'pending';
            const ts = a[7];
            const info = describeHealingAction(actionType, reason, outcome, t);

            return (
              <div key={i} className="glass-card p-4 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <span className={`w-3 h-3 rounded-full mt-1 ${
                    info.severity === 'ok' ? 'bg-green-500' :
                    info.severity === 'disabled' ? 'bg-red-500' :
                    info.severity === 'shield' ? 'bg-blue-500' :
                    info.severity === 'slowdown' ? 'bg-yellow-500' :
                    info.severity === 'throttle' ? 'bg-orange-500' :
                    info.severity === 'retry' ? 'bg-cyan-500' : 'bg-gray-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{info.title}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        outcome === 'recovered' || outcome === 'success' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        outcome === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {outcome === 'recovered' || outcome === 'success' ? t('status.recovered') : outcome === 'pending' ? t('status.pending') : outcome}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{info.detail}</p>
                    {endpointId && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                        <ExternalLink size={11} />
                        <PrefetchLink href={`/endpoints/${endpointId}`} className="hover:underline">
                          {t('endpointLink') || 'View endpoint'}: {endpointId.substring(0, 8)}...
                        </PrefetchLink>
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      {ts && <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1"><Clock size={12} /> {new Date(ts).toLocaleString()}</p>}
                      {reason && <p className="text-xs text-gray-400 dark:text-slate-500">{t('reason', {v: reason})}</p>}
                    </div>
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
