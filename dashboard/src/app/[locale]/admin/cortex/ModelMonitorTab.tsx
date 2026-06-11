'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { useCachedFetch } from './useCortexCache';

interface ModelHealth {
  endpoint_id: string;
  model_type: string;
  health_status: string;
  accuracy: number;
  f1_score: number;
  false_positive_rate: number;
  predictions_total: number;
  quality_score: number;
  issues: string[];
}

interface PlatformSummary {
  total_models: number;
  healthy: number;
  warning: number;
  critical: number;
  degraded: number;
  avg_accuracy: number;
  avg_f1: number;
  worst_models: ModelHealth[];
}

/** Translate raw model_type to user-friendly name */
function translateModelType(modelType: string, t: any): string {
  const key = `modelTypes.${modelType}`;
  const translated = t(key);
  // If translation exists, use it; otherwise format the raw string
  return translated !== key ? translated : modelType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/** Translate raw health_status to user-friendly label */
function translateHealthStatus(status: string, t: any): string {
  const key = `healthStatuses.${status}`;
  const translated = t(key);
  return translated !== key ? translated : status.charAt(0).toUpperCase() + status.slice(1);
}

/** Translate raw issue codes to user-friendly descriptions */
function translateIssue(issue: string, t: any): string {
  // Issues can be like "model_stale (281h)" or "few_samples (0)"
  const match = issue.match(/^(\w+)\s*\((.+)\)$/);
  const code = match ? match[1] : issue;
  const param = match ? match[2] : null;

  const key = `issues.${code}`;
  const translated = t(key);
  if (translated !== key) {
    return param ? translated.replace('{value}', param) : translated;
  }
  // Fallback: format the raw string
  return code.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) + (param ? ` (${param})` : '');
}

export function ModelMonitorTab() {
  const t = useTranslations('cortex.modelMonitor');
  const tc = useTranslations('cortex.common');
  const { token } = useAuth();
  const { data: summary, loading, error } = useCachedFetch<PlatformSummary>(
    'modelMonitor',
    () => apiFetch<PlatformSummary>('/cortex/models/platform-summary', { token: token! }),
    [token]
  );

  const getStatusColor = (s: string) =>
    s === 'healthy' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' :
    s === 'warning' ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30' :
    s === 'critical' ? 'text-red-600 bg-red-50 dark:bg-red-900/30' :
    'text-orange-600 bg-orange-50 dark:bg-orange-900/30';

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="glass-card p-4 sm:p-6 md:p-8 text-center"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="space-y-4">
      {summary && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: t('stats.totalModels'), value: summary.total_models, color: 'text-gray-900 dark:text-white' },
              { label: t('stats.healthy'), value: summary.healthy, color: 'text-emerald-600' },
              { label: t('stats.warning'), value: summary.warning + summary.degraded, color: 'text-yellow-600' },
              { label: t('stats.critical'), value: summary.critical, color: 'text-red-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="glass-card p-3 text-center">
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          <div className="glass-card p-3 flex gap-6">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{summary.avg_accuracy.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">{t('avgAccuracy')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{summary.avg_f1.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">{t('avgF1')}</div>
            </div>
          </div>

          {summary.worst_models.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('worstModels')}</h3>
              {summary.worst_models.map((m, i) => (
                <div key={i} className="glass-card p-3 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(m.health_status)}`}>
                        {translateHealthStatus(m.health_status, t)}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-slate-300">{translateModelType(m.model_type, t)}</span>
                    </div>
                    <span className="text-sm text-gray-500">{tc('score')}: {m.quality_score.toFixed(0)}</span>
                  </div>
                  {m.issues.length > 0 && (
                    <div className="mt-2 text-xs text-red-500">{m.issues.map(issue => translateIssue(issue, t)).join(' • ')}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
