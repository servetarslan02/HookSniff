'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

interface HealthTabProps {
  stats: any;
  rateLimitData: any;
  failedDeliveriesData: any;
  queueStatus: any;
  totalEndpoints: number | undefined;
  activeEndpoints: number | undefined;
  disabledEndpoints: number | undefined;
}

export default function HealthTab({ stats: _stats, rateLimitData, failedDeliveriesData, queueStatus, totalEndpoints, activeEndpoints, disabledEndpoints }: HealthTabProps) {
  const t = useTranslations('admin');

  return (
    <>
      {/* Endpoint Status + Security Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('endpointStatus')}</h2>
            <Link href="/admin/users" className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium">{t('viewAllEndpoints')} →</Link>
          </div>
          {totalEndpoints != null ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">{t('totalEndpoints')}</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">{totalEndpoints}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">{t('activeEndpoints')}</span>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{activeEndpoints ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-slate-400">{t('disabledEndpoints')}</span>
                <span className={`text-lg font-bold ${(disabledEndpoints ?? 0) > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>{disabledEndpoints ?? '—'}</span>
              </div>
              {activeEndpoints != null && totalEndpoints > 0 && (
                <div className="mt-2">
                  <div className="w-full h-3 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${(activeEndpoints / totalEndpoints) * 100}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 text-right">%{((activeEndpoints / totalEndpoints) * 100).toFixed(1)} {t('active') || 'active'}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('noEndpoints')}</p>
          )}
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('securityWarnings')}</h2>
            <Link href="/admin/activity" className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium">{t('viewSecurityLogs')} →</Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-400">{t('rateLimitViolations') || 'Rate Limit Violations'}</span>
              <span className={`text-sm font-medium ${(rateLimitData?.count ?? 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {(rateLimitData?.count ?? 0) > 0 ? `⚠️ ${rateLimitData?.count}` : '✅ 0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-400">{t('failedDeliveries') || 'Failed Deliveries (24h)'}</span>
              <span className={`text-sm font-medium ${(failedDeliveriesData?.count ?? 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {(failedDeliveriesData?.count ?? 0) > 0 ? `⚠️ ${failedDeliveriesData?.count}` : '✅ 0'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-slate-400">{t('queueStatus') || 'Queue Status'}</span>
              <span className={`text-sm font-medium ${(queueStatus?.pending ?? 0) > 10 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {queueStatus ? `✅ ${queueStatus.pending} pending` : '✅ Healthy'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Uptime + Service Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🟢</span>
            <h2 className="text-sm font-medium text-gray-500 dark:text-slate-400">{t('uptime')}</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{t('na') || '—'}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('basedOnHealthCheck') || 'Based on health check'}</p>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📅</span>
            <h2 className="text-sm font-medium text-gray-500 dark:text-slate-400">{t('serviceStatus')}</h2>
          </div>
          {queueStatus ? (
            <div>
              <p className={`text-3xl font-bold ${(queueStatus.pending ?? 0) > 10 || (queueStatus.failed ?? 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {(queueStatus.pending ?? 0) > 10 || (queueStatus.failed ?? 0) > 0 ? `⚠️ ${t('issuesDetected') || 'Issues Detected'}` : `✅ ${t('allSystemsOperational')}`}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{queueStatus.pending} pending · {queueStatus.failed} failed · {queueStatus.processing} processing</p>
            </div>
          ) : (
            <div>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{t('allSystemsOperational')}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('basedOnHealthCheck')}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
