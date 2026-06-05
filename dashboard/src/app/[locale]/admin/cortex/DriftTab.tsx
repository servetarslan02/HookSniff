'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';

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
  const [events, setEvents] = useState<DriftEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<{ drift_events: DriftEvent[] }>('/cortex/drift/events', { token })
      .then(d => setEvents(d.drift_events ?? []))
      .catch((err) => { console.error('[DriftTab] fetch error:', err); setError(err?.message || tc('dataLoadError')); })
      .finally(() => setLoading(false));
  }, [token]);

  const getColor = (severity: number) =>
    severity > 0.7 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
    severity > 0.4 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';

  const getTypeIcon = (type: string) => {
    const key = `typeLabels.${type}`;
    const translated = t(key);
    return translated !== key ? translated : type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="glass-card p-8 text-center"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('title')}</h2>
        <span className="text-sm text-gray-500">{t('eventCount', {n: events.length})}</span>
      </div>

      {events.length === 0 ? (
        <div className="glass-card p-8 text-center">
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
                    <span className="font-medium text-gray-900 dark:text-white capitalize">{ev.drift_type} Drift</span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getColor(ev.severity)}`}>
                      {(ev.severity * 100).toFixed(0)}% {t('severity')}
                    </span>
                  </div>
                </div>
                <time className="text-xs text-gray-500">{new Date(ev.created_at).toLocaleString()}</time>
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                <p><strong>{t('affected')}</strong> {Array.isArray(ev.features_affected) ? ev.features_affected.join(', ') || '—' : String(ev.features_affected)}</p>
                <p><strong>{t('detected')}</strong> {Array.isArray(ev.detected_by) ? ev.detected_by.join(', ') : typeof ev.detected_by === 'object' ? Object.entries(ev.detected_by).map(([k,v]) => `${k}: ${v}`).join(', ') : String(ev.detected_by)}</p>
                <p><strong>{t('action')}</strong> <span className="capitalize">{ev.recommended_action.replace(/_/g, ' ')}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
