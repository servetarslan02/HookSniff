'use client';

import { StatusBadge } from '@/components/StatusBadge';
import { LazySection, Skeletons } from '@/components/LazySection';
import type { WebhooksTabProps } from './types';

export function WebhooksTab({
  userWebhooks,
  webhooksTotal,
  webhooksPage,
  setWebhooksPage,
  webhookFilter,
  setWebhookFilter,
  handleViewDelivery,
  handleReplay,
  t,
  tc,
}: WebhooksTabProps) {
  return (
    <LazySection fallback={Skeletons.table()} rootMargin={300}>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📦 {t("webhooks") || "Webhooks"}</h2>
        <div className="flex items-center gap-2">
          <select value={webhookFilter.status || ""} onChange={(e) => { setWebhookFilter((f: any) => ({ ...f, status: e.target.value || undefined })); setWebhooksPage(1); }} className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
            <option value="">{t("allStatuses") || "All Statuses"}</option>
            <option value="delivered">{t('statusDelivered')}</option>
            <option value="failed">{t('statusFailed')}</option>
            <option value="pending">{t('statusPending')}</option>
          </select>
          <span className="text-sm text-gray-500 dark:text-slate-400">{webhooksTotal} {t("total") || "total"}</span>
        </div>
      </div>
      {userWebhooks.length > 0 ? (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">ID</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("event") || "Event"}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("status") || "Status"}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("attempts") || "Attempts"}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("time") || "Time"}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{tc("actions") || "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {userWebhooks.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition cursor-pointer" onClick={() => handleViewDelivery(d.id)}>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-slate-400">{d.id.slice(0, 10)}…</td>
                    <td className="px-4 py-3"><span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-xs font-mono text-gray-700 dark:text-slate-300">{d.event || "—"}</span></td>
                    <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400">{d.attempt_count}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">{new Date(d.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}><button onClick={() => handleViewDelivery(d.id)} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium">🔍</button><button onClick={() => handleReplay(d.id)} className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium">↩</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {webhooksTotal > 50 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200/50 dark:border-slate-700/50">
              <button onClick={() => setWebhooksPage((p: number) => Math.max(1, p - 1))} disabled={webhooksPage === 1} className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 disabled:opacity-40">← {t("previous") || "Previous"}</button>
              <span className="text-sm text-gray-500 dark:text-slate-400">{t("page") || "Page"} {webhooksPage}</span>
              <button onClick={() => setWebhooksPage((p: number) => p + 1)} disabled={userWebhooks.length < 50} className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 disabled:opacity-40">{t("next") || "Next"} →</button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-slate-400">{t("noDeliveries") || "No deliveries"}</p>
      )}
    </div>
    </LazySection>
  );
}
