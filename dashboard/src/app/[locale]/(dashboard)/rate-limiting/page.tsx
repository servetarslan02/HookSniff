'use client';

import { useTranslations } from 'next-intl';
import { useRateLimits } from '@/hooks/useDashboardData';

export default function RateLimitingPage() {
  const t = useTranslations('rateLimiting');
  const tc = useTranslations('common');
  const { data: limits = [], isLoading } = useRateLimits();

  const stats = limits.length > 0 ? {
    total_endpoints: limits.length,
    total_throttled: 0,
    avg_rps: limits.reduce((acc, d) => acc + d.requests_per_second, 0) / limits.length,
    peak_rps: Math.max(...limits.map(d => d.requests_per_second)),
  } : null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">{t('totalEndpoints')}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_endpoints}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">{t('avgRequestsSec')}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avg_rps.toFixed(1)}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">{t('peakRequestsSec')}</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.peak_rps.toFixed(1)}</div>
          </div>
          <div className="glass-card p-4">
            <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">{t('throttledRequests')}</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.total_throttled}</div>
          </div>
        </div>
      )}

      {limits.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('perEndpointLimits')}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('endpoint')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('rps')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('rpm')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('burst')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{t('status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {limits.map((limit) => (
                  <tr key={limit.endpoint_id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4"><div className="text-sm font-mono text-gray-900 dark:text-white truncate max-w-xs">{limit.endpoint_id.slice(0, 12)}...</div></td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{limit.requests_per_second}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{limit.requests_per_second * 60}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{limit.burst_size}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${limit.enabled ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
                        {limit.enabled ? tc('active') : tc('inactive')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!stats && (
        <div className="glass-card p-12 text-center">
          <div className="text-5xl mb-4">⚡</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('emptyTitle')}</h2>
          <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto mb-6">{t('emptyDesc')}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-center"><div className="text-2xl mb-2">🔄</div><div className="text-sm font-medium text-gray-900 dark:text-white">{t('autoRetry')}</div><div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('exponentialBackoff')}</div></div>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-center"><div className="text-2xl mb-2">📊</div><div className="text-sm font-medium text-gray-900 dark:text-white">{t('perEndpoint')}</div><div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('customLimits')}</div></div>
            <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-center"><div className="text-2xl mb-2">🔔</div><div className="text-sm font-medium text-gray-900 dark:text-white">{t('alerts')}</div><div className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('throttleNotifications')}</div></div>
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('howItWorks')}</h2>
        <div className="space-y-3">
          {[
            { icon: '1️⃣', title: t('tokenBucket'), desc: t('tokenBucketDesc') },
            { icon: '2️⃣', title: t('burstHandling'), desc: t('burstHandlingDesc') },
            { icon: '3️⃣', title: t('queueRetry'), desc: t('queueRetryDesc') },
            { icon: '4️⃣', title: t('perEndpointConfig'), desc: t('perEndpointConfigDesc') },
          ].map((item) => (
            <div key={item.icon} className="flex gap-3">
              <span className="text-lg">{item.icon}</span>
              <div><div className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</div><div className="text-sm text-gray-500 dark:text-slate-400">{item.desc}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
