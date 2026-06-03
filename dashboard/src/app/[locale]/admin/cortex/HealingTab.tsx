'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { Clock, ShieldCheck } from '@/components/icons';

function describeHealingAction(actionType: string, reason: string, outcome: string, t: any): { title: string; detail: string; emoji: string; actionEmoji: string } {
  const isRecovered = outcome === 'recovered';
  const actions: Record<string, { title: string; detail: string; emoji: string }> = {
    'auto_disable': { title: isRecovered ? t('action.auto_disable.recovered') : t('action.auto_disable.disabled'), detail: isRecovered ? t('detail.auto_disable.recovered') : t('detail.auto_disable.disabled'), emoji: isRecovered ? '✅' : '🚫' },
    'circuit_tighten': { title: t('action.circuit_tighten'), detail: t('detail.circuit_tighten'), emoji: '🛡️' },
    'retry_slowdown': { title: t('action.retry_slowdown'), detail: t('detail.retry_slowdown'), emoji: '⏳' },
    'rate_limit_reduce': { title: t('action.rate_limit_reduce'), detail: t('detail.rate_limit_reduce'), emoji: '🚦' },
    'fallback_url_switch': { title: t('action.fallback_url_switch'), detail: t('detail.fallback_url_switch'), emoji: '🔀' },
    'retry_increase': { title: t('action.retry_increase'), detail: t('detail.retry_increase'), emoji: '🔄' },
    'timeout_adjust': { title: t('action.timeout_adjust'), detail: t('detail.timeout_adjust'), emoji: '⏰' },
    'proactive_throttle': { title: t('action.proactive_throttle'), detail: t('detail.proactive_throttle'), emoji: '🔮' },
    'cascade_alert': { title: t('action.cascade_alert'), detail: t('detail.cascade_alert'), emoji: '🌊' },
  };
  const info = actions[actionType] || { title: actionType.replace(/_/g, ' '), detail: reason || t('action.unknown'), emoji: '⚙️' };
  return { ...info, actionEmoji: isRecovered ? '✅' : '⚡' };
}

export function HealingTab({ token }: { token: string | null }) {
  const t = useTranslations('cortex.healing');
  const tc = useTranslations('cortex.common');
  const [actions, setActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<any>('/cortex/healing/actions', { token })
      .then((d) => setActions(d.actions || []))
      .catch((err) => { console.error('[HealingTab] fetch error:', err); setError(err?.message || tc('dataLoadError')); })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 dark:bg-slate-800 rounded-xl" />;
  if (error) return <div className="glass-card p-8 text-center"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('title')}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">{t('description')}</p>
      </div>

      {actions.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <ShieldCheck size={48} className="mx-auto text-emerald-400 mb-4" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{t('empty.title')}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('empty.description')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.slice(0, 20).map((a: any, i: number) => {
            const actionType = a[2] || '';
            const reason = a[3] || '';
            const outcome = a[5] || 'pending';
            const ts = a[7];
            const info = describeHealingAction(actionType, reason, outcome, t);

            return (
              <div key={i} className="glass-card p-4 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{info.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{info.title}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        outcome === 'recovered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        outcome === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {outcome === 'recovered' ? t('status.recovered') : outcome === 'pending' ? t('status.pending') : outcome}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-slate-400">{info.detail}</p>
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
