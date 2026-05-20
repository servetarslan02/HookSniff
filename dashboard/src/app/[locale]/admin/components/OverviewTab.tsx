'use client';

import { useMemo } from 'react';
import { LazyPieChart as PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from '@/components/LazyCharts';
import { useTranslations } from 'next-intl';
import { Gem, BarChart3 } from '@/components/icons';

const PLAN_COLORS: Record<string, string> = {
  developer: '#94a3b8',
  startup: '#10b981',
  pro: '#4c6ef5',
  enterprise: '#8b5cf6',
};

interface OverviewTabProps {
  stats: any;
  revenue: any;
  mrr: number;
  arr: number;
}

export default function OverviewTab({ stats, revenue, mrr, arr }: OverviewTabProps) {
  const t = useTranslations('admin');

  const pieData = useMemo(() =>
    stats?.users_by_plan?.map((item: any) => ({
      name: item.plan.charAt(0).toUpperCase() + item.plan.slice(1),
      value: item.count,
    })) || [],
    [stats?.users_by_plan]
  );

  return (
    <>
      {/* MRR / ARR Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-6 border-l-4 border-violet-500">
          <div className="flex items-center gap-3 mb-2">
            <Gem size={24} strokeWidth={1.75} className="text-violet-400" />
            <h2 className="text-sm font-medium text-gray-500 dark:text-slate-400">{t('mrrCard')}</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('currencySymbol')}{mrr.toLocaleString()}
          </p>
          {revenue?.mrr_trend != null && revenue.mrr_trend !== 0 && (
            <p className={`text-sm mt-1 ${revenue.mrr_trend > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {revenue.mrr_trend > 0 ? '↑' : '↓'} %{Math.abs(revenue.mrr_trend).toFixed(1)} {t('vsLastMonth') || 'vs last month'}
            </p>
          )}
        </div>
        <div className="glass-card p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 size={24} strokeWidth={1.75} className="text-blue-400" />
            <h2 className="text-sm font-medium text-gray-500 dark:text-slate-400">{t('arrCard')}</h2>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('currencySymbol')}{arr.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">MRR × 12</p>
        </div>
      </div>

      {/* Users by Plan Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('usersByPlan')}</h2>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={4} dataKey="value">
                      {pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PLAN_COLORS[entry.name.toLowerCase()] || '#94a3b8'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgb(15 23 42)', border: 'none', borderRadius: '12px', color: 'white' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {pieData.map((entry: any) => (
                  <div key={entry.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PLAN_COLORS[entry.name.toLowerCase()] || '#94a3b8' }} />
                    <span className="text-sm text-gray-600 dark:text-slate-400">{entry.name}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-8">{t('noChartData')}</p>
          )}
        </div>
      </div>

      {/* Weekly Comparison */}
      {stats?.trends && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('weekComparison')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{t('totalUsers')}</p>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_users.toLocaleString()}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-slate-400">{t('vsYesterday')}:</span>
                <span className={`text-xs font-medium ${stats.total_users >= stats.trends.total_users_yesterday ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stats.total_users >= stats.trends.total_users_yesterday ? '+' : ''}{stats.total_users - stats.trends.total_users_yesterday}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{t('totalDeliveries')}</p>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_deliveries.toLocaleString()}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-slate-400">{t('vsYesterday')}:</span>
                <span className={`text-xs font-medium ${stats.total_deliveries >= stats.trends.total_deliveries_yesterday ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stats.total_deliveries >= stats.trends.total_deliveries_yesterday ? '+' : ''}{stats.total_deliveries - stats.trends.total_deliveries_yesterday}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{t('totalRevenue')}</p>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{t('currencySymbol')}{stats.total_revenue.toLocaleString()}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-slate-400">{t('vsYesterday')}:</span>
                <span className={`text-xs font-medium ${stats.total_revenue >= stats.trends.revenue_yesterday ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {stats.total_revenue >= stats.trends.revenue_yesterday ? '+' : ''}{t('currencySymbol')}{(stats.total_revenue - stats.trends.revenue_yesterday).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
