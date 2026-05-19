'use client';

import { LazySection, Skeletons } from '@/components/LazySection';
import type { EndpointsTabProps } from './types';
import { Link2 } from 'lucide-react';

export function EndpointsTab({ userEndpoints, t }: EndpointsTabProps) {
  return (
    <LazySection fallback={Skeletons.table()} rootMargin={300}>
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white"><Link2 size={16} strokeWidth={1.75} className="inline mr-1" /> {t("endpoints") || "Endpoints"}</h2>
      {userEndpoints.length > 0 ? (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">URL</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("status") || "Status"}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("totalDeliveries") || "Deliveries"}</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("lastDelivery") || "Last Delivery"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {userEndpoints.map((ep) => (
                  <tr key={ep.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white truncate max-w-xs">{ep.url}</td>
                    <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${ep.is_active ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400"}`}>{ep.is_active ? t("active") || "Active" : t("inactive") || "Inactive"}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-slate-400">{ep.total_deliveries.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-slate-400">{ep.last_delivery_at ? new Date(ep.last_delivery_at).toLocaleString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-slate-400">{t("noEndpoints") || "No endpoints"}</p>
      )}
    </div>
    </LazySection>
  );
}
