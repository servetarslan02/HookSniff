'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { adminApi, type RevenueResponse } from '@/lib/api';
import { useTranslations } from 'next-intl';

/* ─── Hook0-style Admin Revenue: 4 metric + plan dağılımı tablosu ─── */

export default function AdminRevenuePage() {
  const { token } = useAuth();
  const [revenue, setRevenue] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('admin');
  const tc = useTranslations('common');

  const fetchRevenue = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getRevenue(token);
      setRevenue(data);
    } catch {
      setError(t('failedToLoadRevenue') || 'Gelir verileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => { fetchRevenue(); }, [fetchRevenue]);

  const mrr = revenue?.mrr || 0;
  const arr = mrr * 12;

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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('revenue') || 'Gelir'}</h2>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center justify-between">
          <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
          <button type="button" onClick={fetchRevenue} className="text-sm text-red-600 dark:text-red-400 hover:underline">
            {tc('retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('revenue') || 'Gelir'}</h2>

      {/* ── 4 Metric Kart ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">MRR</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{t('currencySymbol')}{mrr.toLocaleString()}</p>
          {revenue?.mrr_trend != null && revenue.mrr_trend !== 0 && (
            <p className={`text-xs mt-1 ${revenue.mrr_trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {revenue.mrr_trend > 0 ? '↑' : '↓'} %{Math.abs(revenue.mrr_trend).toFixed(1)}
            </p>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">ARR</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{t('currencySymbol')}{arr.toLocaleString()}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">MRR × 12</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('churnRate') || 'Churn Rate'}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">%{(revenue?.churn_rate || 0).toFixed(1)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalPlans') || 'Toplam Plan'}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{revenue?.revenue_by_plan?.length || 0}</p>
        </div>
      </div>

      {/* ── Plan Dağılımı Tablosu ── */}
      {revenue?.revenue_by_plan?.length ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('revenueByPlan') || 'Plan Bazında Gelir'}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('plan') || 'Plan'}</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('users') || 'Kullanıcı'}</th>
                  <th className="text-left px-5 py-3 text-gray-500 dark:text-gray-400 font-medium">{t('revenue') || 'Gelir'}</th>
                </tr>
              </thead>
              <tbody>
                {revenue.revenue_by_plan.map((p) => (
                  <tr key={p.plan} className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {p.plan}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-900 dark:text-white">{p.count}</td>
                    <td className="px-5 py-3 text-gray-900 dark:text-white">{t('currencySymbol')}{p.revenue.toLocaleString()}</td>
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
