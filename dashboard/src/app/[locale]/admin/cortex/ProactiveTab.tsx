'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Clock, Info, Shield } from '@/components/icons';
import { ProactiveInsight } from './types';

function describeProactiveInsight(insight: ProactiveInsight): { title: string; detail: string; emoji: string; advice: string } {
  const type = insight.insight_type;
  const severity = insight.severity;
  const data = (insight as any).data || {};

  const base = {
    title: (insight as any).title || type.replace(/_/g, ' '),
    detail: data.description || data.detail || '',
    emoji: severity === 'critical' ? '🔴' : severity === 'warning' ? '🟠' : severity === 'info' ? '🟡' : '🟢',
    advice: data.advice || data.recommendation || '',
  };

  if (type === 'proactive_latency_trend') return { ...base, detail: `Gecikme artıyor: ${data.trend || 'yükseliş trendi'}`, advice: base.advice || 'Endpoint\'i kontrol edin, sunucu yavaşlıyor olabilir' };
  if (type === 'proactive_rate_limit_risk') return { ...base, detail: `Hız sınırı riski: ${data.usage_pct || '?'}% kullanım`, advice: base.advice || 'Rate limit\'i artırmayı veya istekleri azaltmayı düşünün' };
  if (type === 'proactive_stress_detection') return { ...base, detail: `Sunucu stresi tespit edildi: ${data.metric || 'genel'}`, advice: base.advice || 'Sunucu kaynaklarını kontrol edin' };
  if (type === 'proactive_cascade_risk') return { ...base, detail: `${data.affected_endpoints || '?'} endpoint etkilenebilir`, advice: base.advice || 'Ana endpoint\'i onarın, diğerleri de etkilenebilir' };

  return base;
}

export function ProactiveTab({ token }: { token: string | null }) {
  const [insights, setInsights] = useState<ProactiveInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    apiFetch<any>('/cortex/proactive/status', { token })
      .then((d) => setInsights(d.proactive_insights || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 dark:bg-slate-800 rounded-xl" />;

  const criticalCount = insights.filter(i => i.severity === 'critical').length;
  const warningCount = insights.filter(i => i.severity === 'warning').length;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Proaktif Korumа</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">Cortex sorun çıkmadan önce uyarı verir.</p>
      </div>

      {insights.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{insights.length}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Aktif Uyarı</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Kritik</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{warningCount}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Uyarı</p>
          </div>
        </div>
      )}

      {insights.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Shield size={48} className="mx-auto text-emerald-400 mb-4" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Proaktif uyarı yok</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Cortex her şeyin normal olduğunu tespit etti.</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">🛡️ Proaktif analiz her 15 dakikada bir çalışır</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const info = describeProactiveInsight(insight);
            return (
              <div key={i} className="glass-card p-4 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{info.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{info.title}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        insight.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        insight.severity === 'warning' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        insight.severity === 'info' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {insight.severity === 'critical' ? 'Kritik' : insight.severity === 'warning' ? 'Uyarı' : insight.severity === 'info' ? 'Bilgi' : 'Normal'}
                      </span>
                    </div>
                    {info.detail && <p className="text-sm text-gray-600 dark:text-slate-400">{info.detail}</p>}
                    {info.advice && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1"><Info size={12} /> {info.advice}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1"><Clock size={12} /> {new Date(insight.created_at).toLocaleString('tr-TR')}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-500">{insight.insight_type.replace(/_/g, ' ')}</p>
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
