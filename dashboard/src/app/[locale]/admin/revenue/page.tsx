'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { adminApi, type RevenueResponse, type ChurnUser } from '@/lib/api';
import { StatCard } from '@/components/tremor/StatCard';
import { ChartCard } from '@/components/tremor/ChartCard';
import { LazyBarChart as BarChart, LazyPieChart as PieChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Pie, Cell } from '@/components/LazyCharts';
import { useTranslations } from 'next-intl';

const PLAN_COLORS: Record<string, string> = {
  free: '#94a3b8',
  pro: '#4c6ef5',
  business: '#8b5cf6',
};

export default function AdminRevenuePage() {
  const { token } = useAuth();
  const [revenue, setRevenue] = useState<RevenueResponse | null>(null);
  const [churnUsers, setChurnUsers] = useState<ChurnUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations('admin');
  const tc = useTranslations('common');

  const fetchRevenue = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [revenueData, churnData] = await Promise.all([
        adminApi.getRevenue(token),
        adminApi.getChurn(token).catch(() => ({ users: [] })),
      ]);
      setRevenue(revenueData);
      setChurnUsers(churnData.users || []);
    } catch (err) {
      setError(t("failedToLoadRevenue"));
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleExportCSV = () => {
    if (!token) return;
    const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');
    const url = adminApi.exportRevenue(token, 12);
    window.open(`${API}${url}&token=${token}`, '_blank');
  };

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('revenue')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{tc('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('revenue')}</h1>
        </div>
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4 flex items-center justify-between">
          <span className="text-red-700 dark:text-red-400 text-sm">{error}</span>
          <button
            onClick={fetchRevenue}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
          >
            {tc('retry')}
          </button>
        </div>
      </div>
    );
  }

  const monthlyData = revenue?.monthly_revenue || [];
  const planData = revenue?.revenue_by_plan?.map((item) => ({
    name: item.plan.charAt(0).toUpperCase() + item.plan.slice(1),
    value: item.revenue,
    count: item.count,
  })) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t("revenueTitle")}</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {t('revenueDesc')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('mrr')}
          value={`₺${(revenue?.mrr || 0).toLocaleString()}`}
          icon={<span className="text-lg" aria-hidden="true">💰</span>}
          color="violet"
        />
        <StatCard
          label={t('totalRevenueLabel')}
          value={`₺${(revenue?.monthly_revenue?.reduce((sum, m) => sum + m.revenue, 0) || 0).toLocaleString()}`}
          icon={<span className="text-lg" aria-hidden="true">📈</span>}
          color="emerald"
        />
        <StatCard
          label={t('churnRate')}
          value={revenue?.churn_rate?.toFixed(1) || '0'}
          icon={<span className="text-lg" aria-hidden="true">📉</span>}
          color="red"
          isPercent
        />
        <button
          onClick={handleExportCSV}
          className="glass-card p-6 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition cursor-pointer border border-gray-200 dark:border-slate-700"
        >
          <span className="text-2xl" aria-hidden="true">⬇</span>
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{t('exportReport')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2">
          <ChartCard title={t('monthlyRevenue')} subtitle={t('revenueOverTime')}>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    className="text-gray-500 dark:text-slate-400"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    className="text-gray-500 dark:text-slate-400"
                    tickFormatter={(v) => `₺${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(15 23 42)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                    }}
                    formatter={(value: number) => [`₺${value.toLocaleString()}`, t("revenue")]}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#8b5cf6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Revenue by Plan */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('revenueByPlan')}</h2>
          {planData.length > 0 ? (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planData}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {planData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PLAN_COLORS[entry.name.toLowerCase()] || '#94a3b8'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgb(15 23 42)',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                      }}
                      formatter={(value: number) => [`₺${value.toLocaleString()}`, t("revenue")]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-4">
                {planData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: PLAN_COLORS[entry.name.toLowerCase()] || '#94a3b8' }}
                      />
                      <span className="text-sm text-gray-600 dark:text-slate-400">{entry.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ₺{entry.value.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-slate-400 ml-1">
                        ({entry.count} {t('users')})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-gray-500 dark:text-slate-400 text-sm">{t('noRevenue')}</p>
          )}
        </div>
      </div>

      {/* Churn Analysis */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('churnAnalysis')}</h2>
        </div>
        {churnUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{tc('email')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{tc('name')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('plan')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('amount')}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('churnDate')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {churnUsers.map((u, index) => (
                  <tr key={u.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-gray-100 dark:hover:bg-gray-700 transition`}>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{u.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{u.name || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">₺{u.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                      {new Date(u.churn_date).toLocaleDateString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500 dark:text-slate-400 text-sm">
            {t('noChurn')}
          </div>
        )}
      </div>
    </div>
  );
}
