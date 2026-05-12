'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/store';
import { statsApi, webhooksApi, type StatsResponse, type Delivery } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

/* ─── Hook0-style: Basit dashboard — 3 metric + tablo ─── */

export default function DashboardOverview() {
  const { token } = useAuth();
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let mounted = true;
    Promise.all([
      statsApi.get(token!).catch(() => null),
      webhooksApi.list(token!, { page: 1 }).catch(() => null),
    ]).then(([s, d]) => {
      if (!mounted) return;
      if (s) setStats(s);
      if (d) setDeliveries(d.deliveries.slice(0, 10));
    }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [token]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── 3 Metric Kart (Hook0 gibi) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.totalDeliveries')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats?.total_deliveries ?? 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('stats.successRate')}</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{stats?.success_rate ?? 0}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('endpoints')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats?.endpoints_count ?? 0}</p>
        </div>
      </div>

      {/* ── Son Teslimatlar Tablosu (Hook0 gibi) ── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('recentDeliveries')}</h3>
          <Link href="/deliveries" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            {tc('viewAll')} →
          </Link>
        </div>

        {deliveries.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('noDeliveriesYet')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">ID</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('status')}</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('endpoint')}</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('time')}</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-5 py-3 font-mono text-gray-900 dark:text-gray-200">{d.id.slice(0, 8)}…</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        d.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        d.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-gray-600 dark:text-gray-400">{d.endpoint_id?.slice(0, 8)}…</td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{new Date(d.created_at).toLocaleString('tr-TR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
