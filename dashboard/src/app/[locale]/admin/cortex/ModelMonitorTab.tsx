'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';

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

export function ModelMonitorTab() {
  const { token } = useAuth();
  const [summary, setSummary] = useState<PlatformSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<PlatformSummary>('/cortex/models/platform-summary', { token })
      .then(setSummary)
      .catch((err) => { console.error('[ModelMonitorTab] fetch error:', err); setError(err?.message || 'Veri yüklenirken hata oluştu'); })
      .finally(() => setLoading(false));
  }, [token]);

  const getStatusColor = (s: string) =>
    s === 'healthy' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' :
    s === 'warning' ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30' :
    s === 'critical' ? 'text-red-600 bg-red-50 dark:bg-red-900/30' :
    'text-orange-600 bg-orange-50 dark:bg-orange-900/30';

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full" /></div>;
  if (error) return <div className="glass-card p-8 text-center"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="space-y-4">
      {summary && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Toplam Model', value: summary.total_models, color: 'text-gray-900 dark:text-white' },
              { label: 'Sağlıklı', value: summary.healthy, color: 'text-emerald-600' },
              { label: 'Uyarı', value: summary.warning + summary.degraded, color: 'text-yellow-600' },
              { label: 'Kritik', value: summary.critical, color: 'text-red-600' },
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
              <div className="text-xs text-gray-500">Ort. Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">{summary.avg_f1.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">Ort. F1 Score</div>
            </div>
          </div>

          {summary.worst_models.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">En Kötü Modeller</h3>
              {summary.worst_models.map((m, i) => (
                <div key={i} className="glass-card p-3 mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(m.health_status)}`}>
                        {m.health_status}
                      </span>
                      <span className="text-sm font-mono text-gray-700 dark:text-slate-300">{m.model_type}</span>
                    </div>
                    <span className="text-sm text-gray-500">Skor: {m.quality_score.toFixed(0)}</span>
                  </div>
                  {m.issues.length > 0 && (
                    <div className="mt-2 text-xs text-red-500">{m.issues.join(' • ')}</div>
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
