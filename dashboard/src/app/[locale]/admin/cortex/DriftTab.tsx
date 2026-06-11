'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { useCachedFetch } from './useCortexCache';
import { ExternalLink } from '@/components/icons';
import { PrefetchLink } from '@/components/PrefetchLink';

interface DriftEvent {
  id: number;
  endpoint_id: string;
  drift_type: string;
  severity: number;
  features_affected: string[];
  detected_by: string[] | Record<string, unknown>;
  recommended_action: string;
  created_at: string;
}

export function DriftTab() {
  const t = useTranslations('cortex.drift');
  const tc = useTranslations('cortex.common');
  const { token } = useAuth();
  const { data, loading, error } = useCachedFetch<any>(
    'drift',
    () => apiFetch<any>('/cortex/drift/events', { token: token! }),
    [token]
  );
  const events: DriftEvent[] = data?.drift_events ?? [];

  const getColor = (severity: number) =>
    severity > 0.7 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
    severity > 0.4 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';

  const getTypeIcon = (type: string) => {
    const key = `typeLabels.${type}`;
    const translated = t(key);
    return translated !== key ? translated : type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const translateFeature = (f: string): string => {
    // Normalize: "failure_rate" or "failure rate" → "featureFailureRate"
    const normalized = f.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const key = `feature${normalized.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
    const translated = t(key);
    return translated !== key ? translated : f.replace(/_/g, ' ');
  };

  const translateMethod = (m: string): string => {
    if (m.includes('page_hinkley')) return t('methodPageHinkley') || 'Sudden change detected';
    if (m.includes('adwin')) return t('methodAdwin') || 'Gradual change detected';
    if (m.includes('ks_test')) return t('methodKsTest') || 'Distribution shift detected';
    if (m.includes('stat_test')) return t('methodStatTest') || 'Statistical test';
    if (m.includes('p_value')) {
      const val = m.split(':').pop()?.trim();
      if (val) {
        const p = parseFloat(val);
        if (p < 0.01) return t('methodPValueVerySignificant') || 'Very high confidence';
        if (p < 0.05) return t('methodPValueSignificant') || 'High confidence';
        return t('methodPValueModerate') || 'Moderate confidence';
      }
    }
    return m.replace(/_/g, ' ');
  };

  const translateAction = (action: string): string => {
    // Normalize: "Reset model" → "reset_model" → "actionResetModel"
    const normalized = action.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    const key = `action${normalized.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('')}`;
    const translated = t(key);
    return translated !== key ? translated : action;
  };

  const formatDetectedBy = (detected: string[] | Record<string, unknown>): string => {
    if (Array.isArray(detected)) return detected.map(m => translateMethod(m)).join(', ');
    if (typeof detected === 'object' && detected !== null) {
      const entries = Object.entries(detected);
      // If has method + p_value, combine them into one readable sentence
      const methodEntry = entries.find(([k]) => k === 'method');
      const pValueEntry = entries.find(([k]) => k === 'p_value');
      const otherEntries = entries.filter(([k]) => k !== 'method' && k !== 'p_value');

      const parts: string[] = [];
      if (methodEntry) {
        const methodName = translateMethod(String(methodEntry[1]));
        if (pValueEntry) {
          const p = parseFloat(String(pValueEntry[1]));
          const confPct = ((1 - p) * 100).toFixed(0);
          let confLabel = '';
          if (p < 0.01) confLabel = t('methodPValueVerySignificant') || 'Very high confidence';
          else if (p < 0.05) confLabel = t('methodPValueSignificant') || 'High confidence';
          else confLabel = t('methodPValueModerate') || 'Moderate confidence';
          parts.push(`${methodName} · ${confLabel} (%${confPct})`);
        } else {
          parts.push(methodName);
        }
      } else if (pValueEntry) {
        const p = parseFloat(String(pValueEntry[1]));
        const confPct = ((1 - p) * 100).toFixed(0);
        parts.push(`${t('methodStatTest') || 'Statistical test'}: %${confPct}`);
      }
      for (const [k, v] of otherEntries) {
        parts.push(`${translateMethod(k)}: ${v}`);
      }
      return parts.join(' · ');
    }
    return translateMethod(String(detected));
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="glass-card p-4 sm:p-6 md:p-8 text-center"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('title')}</h2>
        <span className="text-sm text-gray-500">{t('eventCount', {n: events.length})}</span>
      </div>

      {events.length === 0 ? (
        <div className="glass-card p-4 sm:p-6 md:p-8 text-center">
          <p className="text-gray-500 dark:text-slate-400">{t('empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(ev => (
            <div key={ev.id} className={`glass-card p-4 border-l-4 ${ev.severity > 0.7 ? 'border-red-500' : ev.severity > 0.4 ? 'border-yellow-500' : 'border-green-500'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{getTypeIcon(ev.drift_type)}</span>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{getTypeIcon(ev.drift_type)}</span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getColor(ev.severity)}`}>
                      {(ev.severity * 100).toFixed(0)}% {t('severity')}
                    </span>
                  </div>
                </div>
                <time className="text-xs text-gray-500">{new Date(ev.created_at).toLocaleString()}</time>
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                <p><strong>{t('affected')}</strong> {Array.isArray(ev.features_affected) ? ev.features_affected.map(f => translateFeature(f)).join(', ') || '—' : translateFeature(String(ev.features_affected))}</p>
                <p><strong>{t('detected')}</strong> {formatDetectedBy(ev.detected_by)}</p>
                <p><strong>{t('action')}</strong> {translateAction(ev.recommended_action)}</p>
                {ev.endpoint_id && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                    <ExternalLink size={11} />
                    <PrefetchLink href={`/endpoints/${ev.endpoint_id}`} className="hover:underline">
                      {t('endpointLink') || 'View endpoint'}: {ev.endpoint_id.substring(0, 8)}...
                    </PrefetchLink>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
