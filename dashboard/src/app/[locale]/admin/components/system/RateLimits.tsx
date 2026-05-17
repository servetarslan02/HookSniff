'use client';

import { useTranslations } from 'next-intl';

interface RateLimitViolation {
  id: string;
  customer_email?: string;
  ip?: string;
  requests_count: number;
  limit_per_window: number;
  window_seconds: number;
  created_at: string;
}

export default function RateLimits({ violations }: { violations: RateLimitViolation[] }) {
  const t = useTranslations('admin');

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">🚦 {t('rateLimitViolations') || 'Rate Limit Violations'}</h2>
      </div>
      {violations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('user') || 'User'}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">IP</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('requests') || 'Requests'}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('limit') || 'Limit'}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('window') || 'Window'}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('time') || 'Time'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
              {violations.map((rv) => (
                <tr key={rv.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rv.customer_email || '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono text-gray-600 dark:text-slate-400">{rv.ip || '—'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">{rv.requests_count}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{rv.limit_per_window}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400">{rv.window_seconds}s</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">{new Date(rv.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500 dark:text-slate-400 text-sm">✅ {t('noViolations') || 'No rate limit violations'}</div>
      )}
    </div>
  );
}
