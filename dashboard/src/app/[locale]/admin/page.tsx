'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/store';
import { adminApi, type AdminStatsResponse, type AuditLogEntry, type RevenueResponse } from '@/lib/api';
import { useTranslations, useLocale } from 'next-intl';

/* ─── Hook0-style Admin Overview: 4 metric + son aktivite tablosu ─── */

export default function AdminOverviewPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [revenue, setRevenue] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const locale = useLocale();

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [statsData, logsData, revData] = await Promise.all([
        adminApi.getStats(token),
        adminApi.getAuditLogs(token, { limit: 10 }).catch(() => ({ entries: [], total: 0, limit: 10, offset: 0 })),
        adminApi.getRevenue(token).catch(() => null),
      ]);
      setStats(statsData);
      setAuditLogs(logsData.entries || []);
      setRevenue(revData);
    } catch {
      setError(t('failedToLoadStats'));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const mrr = revenue?.mrr || 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('overview')}</h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
          <button type="button" onClick={fetchData} className="text-sm text-red-600 dark:text-red-400 hover:underline">
            {tc('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Başlık ── */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('overviewTitle') || 'Genel Bakış'}</h2>

      {/* ── 4 Metric Kart ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalUsers')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats?.total_users?.toLocaleString() || '0'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalDeliveries')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats?.total_deliveries?.toLocaleString() || '0'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalRevenue')}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{t('currencySymbol')}{(stats?.total_revenue || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">MRR</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{t('currencySymbol')}{mrr.toLocaleString()}</p>
        </div>
      </div>

      {/* ── Son Aktivite Tablosu ── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('recentActivity')}</h3>
          <Link href="/admin/activity" className="text-xs text-green-600 dark:text-green-400 hover:underline">
            {t('viewAll')} →
          </Link>
        </div>

        {auditLogs.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            {t('noActivity')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('action') || 'Eylem'}</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('resource') || 'Kaynak'}</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('time') || 'Zaman'}</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((entry) => (
                  <tr key={entry.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-5 py-3 text-gray-900 dark:text-white">{entry.action.replace(/[._]/g, ' ')}</td>
                    <td className="px-5 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                      {entry.resource_type}{entry.resource_id ? ` · ${entry.resource_id.slice(0, 8)}…` : ''}
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                      {new Date(entry.created_at).toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Son Kayıtlar ── */}
      {stats?.recent_signups?.length ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('recentSignups')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('email') || 'E-posta'}</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('plan') || 'Plan'}</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('date') || 'Tarih'}</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_signups.map((user) => (
                  <tr key={user.id} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-5 py-3 text-gray-900 dark:text-white">{user.email}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
