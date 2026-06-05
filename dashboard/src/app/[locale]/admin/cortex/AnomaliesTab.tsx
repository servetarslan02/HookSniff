'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { CheckCircle2, Clock, ExternalLink, ArrowRight } from '@/components/icons';
import { PrefetchLink } from '@/components/PrefetchLink';

function describeAnomaly(score: number, factors: any, category: string, t: any): { title: string; detail: string; severity: string } {
  const current = factors?.current;
  const baseline = factors?.baseline;
  const deviation = factors?.deviation;

  // Category-specific descriptions using i18n
  const categoryDesc: Record<string, string> = {
    latency: t('detail.latencyDesc', { current: current ? `${Math.round(current)}ms` : '?', baseline: baseline ? `${Math.round(baseline)}ms` : '?' }) || `Latency ${current ? `${Math.round(current)}ms` : 'increased'} (baseline: ${baseline ? `${Math.round(baseline)}ms` : 'normal'})`,
    failure_rate: t('detail.failureRateDesc', { current: current ? `${Math.round(current)}%` : '?', baseline: baseline ? `${Math.round(baseline)}%` : '?' }) || `Failure rate ${current ? `${Math.round(current)}%` : 'high'} (baseline: ${baseline ? `${Math.round(baseline)}%` : 'normal'})`,
    volume: t('detail.volumeDesc', { direction: current > baseline ? (t('detail.spike') || 'spike') : (t('detail.drop') || 'drop'), current: current ? Math.round(current) : '?', baseline: baseline ? Math.round(baseline) : '?' }) || `Traffic ${current > baseline ? 'spike' : 'drop'}: ${current ? Math.round(current) : '?'} (baseline: ${baseline ? Math.round(baseline) : '?'})`,
    timeout: t('detail.timeoutDesc', { current: current ? `${Math.round(current)}%` : '' }) || `Timeout rate increased${current ? ` to ${Math.round(current)}%` : ''}`,
    error_pattern: t('detail.errorPatternDesc', { deviation: deviation ? `${Math.round(deviation)}%` : '' }) || `New error pattern detected${deviation ? ` (${Math.round(deviation)}% deviation)` : ''}`,
  };

  const detail = categoryDesc[category] || t('detail.performanceDropped');

  if (score >= 80) return { title: t('severity.critical'), detail, severity: 'critical' };
  if (score >= 60) return { title: t('severity.major'), detail, severity: 'major' };
  if (score >= 40) return { title: t('severity.minor'), detail, severity: 'minor' };
  return { title: t('severity.normal'), detail: t('detail.noConcern'), severity: 'normal' };
}

export function AnomaliesTab({ token }: { token: string | null }) {
  const t = useTranslations('cortex.anomalies');
  const tc = useTranslations('cortex.common');
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<any>('/cortex/anomalies', { token })
      .then((d) => setAnomalies(d.anomalies || []))
      .catch((err) => { console.error('[AnomaliesTab] fetch error:', err); setError(err?.message || tc('dataLoadError')); })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="animate-pulse h-40 bg-gray-100 dark:bg-slate-800 rounded-xl" />;
  if (error) return <div className="glass-card p-8 text-center"><p className="text-red-500">{error}</p></div>;

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('title')}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {t('description')}
        </p>
      </div>

      {anomalies.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <CheckCircle2 size={48} className="mx-auto text-emerald-400 mb-4" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{t('empty.title')}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('empty.description')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {anomalies.slice(0, 20).map((a: any, i: number) => {
            const endpointId = a[1] || '';
            const score = a[3] || 0;
            const factors = a[4] || {};
            const category = a[5] || '';
            const ts = a[6];
            const info = describeAnomaly(score, factors, category, t);
            // Category-specific action steps
            const categorySteps: Record<string, string[]> = {
              latency: [t('steps.checkEndpoint') || 'Check endpoint delivery history', t('steps.checkServer') || 'Check server response times'],
              failure_rate: [t('steps.checkErrors') || 'Check error messages in delivery logs', t('steps.checkEndpoint') || 'Verify endpoint URL is reachable'],
              volume: [t('steps.checkTraffic') || 'Check if traffic spike is expected', t('steps.checkCapacity') || 'Verify server capacity'],
              timeout: [t('steps.increaseTimeout') || 'Consider increasing timeout in endpoint settings', t('steps.checkServer') || 'Check server load'],
              error_pattern: [t('steps.checkLogs') || 'Check server logs for the new error pattern', t('steps.checkDeploy') || 'Check if a recent deploy caused the issue'],
            };
            const steps = categorySteps[category] || [t('steps.checkEndpoint') || 'Check the affected endpoint'];

            return (
              <div key={i} className="glass-card p-4 hover:shadow-md transition">
                <div className="flex items-start gap-3">
                  <span className={`w-3 h-3 rounded-full mt-1 ${
                    info.severity === 'critical' ? 'bg-red-500' :
                    info.severity === 'major' ? 'bg-orange-500' :
                    info.severity === 'minor' ? 'bg-yellow-500' : 'bg-green-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{info.title}</p>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        score >= 80 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        score >= 60 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        score >= 40 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {tc('score')}: {score}
                      </span>
                      {category && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          {category.replace(/_/g, ' ')}
                        </span>
                      )}
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
                    {steps && steps.length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <ol className="text-xs text-blue-600 dark:text-blue-400 space-y-0.5">
                          {steps.map((step: string, si: number) => (
                            <li key={si} className="flex items-start gap-1"><ArrowRight size={10} className="mt-0.5 flex-shrink-0" /> {step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      {ts && (
                        <p className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(ts).toLocaleString()}
                        </p>
                      )}
                      {factors?.method && (
                        <p className="text-xs text-gray-400 dark:text-slate-500">
                          {factors.method === 'ml' ? t('detectedBy.ml') : t('detectedBy.formula')}
                        </p>
                      )}
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
