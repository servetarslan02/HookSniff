'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { Clock, Info, Shield, ExternalLink, ArrowRight } from '@/components/icons';
import { ProactiveInsight } from './types';
import { PrefetchLink } from '@/components/PrefetchLink';

function describeProactiveInsight(insight: ProactiveInsight, t: any): { title: string; detail: string; severity: string; advice: string; steps: string[] } {
  const type = insight.insight_type;
  const severity = insight.severity;
  const data = (insight as any).data || {};

  const sevLabel = severity === 'critical' ? 'critical' : severity === 'warning' ? 'warning' : severity === 'info' ? 'info' : 'ok';
  const apiTitle = (insight as any).title || type.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

  const base = { title: apiTitle, detail: '', severity: sevLabel, advice: '', steps: [] as string[] };

  if (type === 'proactive_latency_trend') return { ...base, detail: t('detail.latencyTrend', {v: data.trend || 'increasing'}), advice: t('advice.latencyTrend'), steps: [t('steps.checkEndpoint'), t('steps.checkServer'), t('steps.enableFallback')] };
  if (type === 'proactive_rate_limit_risk') return { ...base, detail: t('detail.rateLimitRisk', {v: data.usage_pct || '?'}), advice: t('advice.rateLimitRisk'), steps: [t('steps.upgradePlan'), t('steps.reduceTraffic')] };
  if (type === 'proactive_stress_detection') return { ...base, detail: t('detail.stressDetection', {v: data.metric || 'general'}), advice: t('advice.stressDetection'), steps: [t('steps.checkResources'), t('steps.scaleUp')] };
  if (type === 'proactive_cascade_risk') return { ...base, detail: t('detail.cascadeRisk', {v: data.affected_endpoints || '?'}), advice: t('advice.cascadeRisk'), steps: [t('steps.fixMainEndpoint'), t('steps.checkDependents')] };
  if (type === 'proactive_degradation') {
    const dropPct = data.drop_pct ? Math.round(data.drop_pct) : null;
    const recentSr = data.recent_sr ? Math.round(data.recent_sr) : null;
    const olderSr = data.older_sr ? Math.round(data.older_sr) : null;
    const hoursToAnomaly = data.hours_to_anomaly ? Math.round(data.hours_to_anomaly) : null;
    return {
      ...base,
      title: t('detail.degradationTitle') || 'Endpoint Performance Declining',
      detail: `${olderSr}% → ${recentSr}% (${dropPct}% drop${hoursToAnomaly ? `, ~${hoursToAnomaly}h to threshold` : ''})`,
      advice: t('advice.degradation'),
      steps: [
        t('steps.openEndpoint'),
        t('steps.checkServerLogs'),
        t('steps.checkRecentDeploy'),
        t('steps.enableFallback'),
      ],
    };
  }

  return { ...base, detail: base.title, advice: '', steps: [] };
}

export function ProactiveTab({ token }: { token: string | null }) {
  const t = useTranslations('cortex.proactive');
  const tc = useTranslations('cortex.common');
  const [insights, setInsights] = useState<ProactiveInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!token || fetchedRef.current) return;
    fetchedRef.current = true;
    apiFetch<any>('/cortex/proactive/status', { token })
      .then((d) => {
        const raw = d.proactive_insights || [];
        // API returns arrays [id, customer_id, insight_type, title, severity, data, created_at]
        const mapped = raw.map((r: any) => Array.isArray(r) ? {
          id: r[0], customer_id: r[1], insight_type: r[2], title: r[3],
          severity: r[4], data: r[5], created_at: r[6], description: '', action_url: null, dismissed: false,
        } : r);
        setInsights(mapped);
      })
      .catch((err) => { console.error('[ProactiveTab] fetch error:', err); setError(err?.message || tc('dataLoadError')); })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 dark:bg-slate-800 rounded-xl" />;
  if (error) return <div className="glass-card p-8 text-center"><p className="text-red-500">{error}</p></div>;

  const criticalCount = insights.filter(i => i.severity === 'critical').length;
  const warningCount = insights.filter(i => i.severity === 'warning').length;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('title')}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">{t('description')}</p>
      </div>

      {insights.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{insights.length}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">{t('stats.activeAlerts')}</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">{t('stats.critical')}</p>
          </div>
          <div className="glass-card p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{warningCount}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">{t('stats.warning')}</p>
          </div>
        </div>
      )}

      {insights.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Shield size={48} className="mx-auto text-emerald-400 mb-4" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{t('empty.title')}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('empty.description')}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">{t('empty.info')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const info = describeProactiveInsight(insight, t);
            return (
              <div key={i} className="glass-card p-4 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <span className={`w-3 h-3 rounded-full mt-1 ${
                    info.severity === 'critical' ? 'bg-red-500' :
                    info.severity === 'warning' ? 'bg-orange-500' :
                    info.severity === 'info' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{info.title}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        insight.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        insight.severity === 'warning' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        insight.severity === 'info' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {insight.severity === 'critical' ? tc('severity.critical') : insight.severity === 'warning' ? tc('severity.warning') : insight.severity === 'info' ? tc('severity.info') : tc('severity.normal')}
                      </span>
                    </div>
                    {info.detail && <p className="text-sm text-gray-600 dark:text-slate-400">{info.detail}</p>}
                    {/* Show endpoint link if available */}
                    {(insight as any).data?.endpoint_id && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                        <ExternalLink size={11} />
                        <PrefetchLink href={`/endpoints/${(insight as any).data.endpoint_id}`} className="hover:underline">
                          {t('endpointLink') || 'View endpoint'}: {(insight as any).data.endpoint_id.substring(0, 8)}...
                        </PrefetchLink>
                      </p>
                    )}
                    {/* Actionable steps */}
                    {info.steps && info.steps.length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">{t('nextSteps') || 'Cortex Response:'}</p>
                        <ol className="text-xs text-blue-600 dark:text-blue-400 space-y-0.5">
                          {info.steps.map((step, si) => (
                            <li key={si} className="flex items-start gap-1"><ArrowRight size={10} className="mt-0.5 flex-shrink-0" /> {step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                    {info.advice && (!info.steps || info.steps.length === 0) && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1"><Info size={12} /> {info.advice}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1"><Clock size={12} /> {new Date(insight.created_at).toLocaleString()}</p>
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
