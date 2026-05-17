'use client';

import { LazySection, Skeletons } from '@/components/LazySection';
import type { UsageTabProps } from './types';

export function UsageTab({ userUsage, t }: UsageTabProps) {
  if (!userUsage) return null;

  return (
    <LazySection fallback={Skeletons.chart} rootMargin={300}>
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📈 {t("usageStats") || "Usage Statistics"}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center"><p className="text-2xl font-bold text-gray-900 dark:text-white">{userUsage.total_deliveries.toLocaleString()}</p><p className="text-xs text-gray-500 dark:text-slate-400">{t("totalDeliveries") || "Total"}</p></div>
        <div className="glass-card p-4 text-center"><p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{userUsage.success_rate}%</p><p className="text-xs text-gray-500 dark:text-slate-400">{t("successRate") || "Success Rate"}</p></div>
        <div className="glass-card p-4 text-center"><p className="text-2xl font-bold text-gray-900 dark:text-white">{userUsage.endpoints_count}</p><p className="text-xs text-gray-500 dark:text-slate-400">{t("endpoints") || "Endpoints"}</p></div>
        <div className="glass-card p-4 text-center"><p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userUsage.last_7_days.toLocaleString()}</p><p className="text-xs text-gray-500 dark:text-slate-400">{t("last7Days") || "Last 7 Days"}</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">{t("deliveryBreakdown") || "Delivery Breakdown"}</h3>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-slate-400">{t("delivered") || "Delivered"}</span><span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{userUsage.successful.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-slate-400">{t("failed") || "Failed"}</span><span className="text-sm font-semibold text-red-600 dark:text-red-400">{userUsage.failed.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-sm text-gray-600 dark:text-slate-400">{t("pending") || "Pending"}</span><span className="text-sm font-semibold text-amber-600 dark:text-amber-400">{userUsage.pending.toLocaleString()}</span></div>
          </div>
        </div>
        <div className="glass-card p-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-3">{t("topEvents") || "Top Events"}</h3>
          {userUsage.top_events.length > 0 ? (
            <div className="space-y-2">
              {userUsage.top_events.map((ev: any, i: number) => (
                <div key={i} className="flex justify-between items-center"><span className="text-sm text-gray-600 dark:text-slate-400 font-mono">{ev.event || "—"}</span><span className="text-sm font-semibold text-gray-900 dark:text-white">{ev.count.toLocaleString()}</span></div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">{t("noData") || "No data"}</p>
          )}
        </div>
      </div>
    </div>
    </LazySection>
  );
}
