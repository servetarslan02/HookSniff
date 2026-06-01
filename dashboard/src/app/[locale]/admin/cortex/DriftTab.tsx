'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';

interface DriftEvent {
  id: number;
  endpoint_id: string;
  drift_type: string;
  severity: number;
  features_affected: string[];
  detected_by: string[];
  recommended_action: string;
  created_at: string;
}

export function DriftTab() {
  const { token } = useAuth();
  const [events, setEvents] = useState<DriftEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<{ drift_events: DriftEvent[] }>('/cortex/drift/events', { token })
      .then(d => setEvents(d.drift_events ?? []))
      .catch((err) => { console.error('[DriftTab] fetch error:', err); setError(err?.message || 'Veri yüklenirken hata oluştu'); })
      .finally(() => setLoading(false));
  }, [token]);

  const getColor = (severity: number) =>
    severity > 0.7 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
    severity > 0.4 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';

  const getTypeIcon = (type: string) =>
    type === 'sudden' ? '⚡' : type === 'gradual' ? '📈' : type === 'incremental' ? '🔄' : '⚠️';

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="glass-card p-8 text-center"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Drift Tespit Olayları</h2>
        <span className="text-sm text-gray-500">{events.length} olay</span>
      </div>

      {events.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-gray-500 dark:text-slate-400">Henüz drift tespit edilmedi. ML modelleri normal çalışıyor. ✅</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(ev => (
            <div key={ev.id} className={`glass-card p-4 border-l-4 ${ev.severity > 0.7 ? 'border-red-500' : ev.severity > 0.4 ? 'border-yellow-500' : 'border-green-500'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getTypeIcon(ev.drift_type)}</span>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">{ev.drift_type} Drift</span>
                    <span className={`ml-2 text-xs px-2 py-1 rounded-full ${getColor(ev.severity)}`}>
                      {(ev.severity * 100).toFixed(0)}% severity
                    </span>
                  </div>
                </div>
                <time className="text-xs text-gray-500">{new Date(ev.created_at).toLocaleString('tr-TR')}</time>
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-slate-400">
                <p><strong>Etkilenen:</strong> {ev.features_affected.join(', ') || '—'}</p>
                <p><strong>Tespit:</strong> {ev.detected_by.join(', ')}</p>
                <p><strong>Aksiyon:</strong> <span className="capitalize">{ev.recommended_action.replace(/_/g, ' ')}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
