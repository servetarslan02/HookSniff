'use client';

import { LazySection, Skeletons } from '@/components/LazySection';
import type { CommunicationsTabProps } from './types';

export function CommunicationsTab({
  userComms,
  commsTotal,
  commsPage,
  setCommsPage,
  commFilter,
  setCommFilter,
  t,
  tc,
}: CommunicationsTabProps) {
  return (
    <LazySection fallback={Skeletons.table()} rootMargin={300}>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">💬 {t("communications") || "Communication History"}</h2>
        <div className="flex gap-2">
          <select
            value={commFilter}
            onChange={(e) => { setCommFilter(e.target.value); setCommsPage(1); }}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          >
            <option value="">{t("allTypes") || "All Types"}</option>
            <option value="email">📧 Email</option>
            <option value="impersonate">👤 Impersonate</option>
            <option value="plan_change">📋 Plan Change</option>
            <option value="ban">🚫 Ban/Activate</option>
            <option value="note">📝 Note</option>
            <option value="tag_added">🏷️ Tag Added</option>
            <option value="tag_removed">🏷️ Tag Removed</option>
          </select>
        </div>
      </div>

      {userComms.length > 0 ? (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("type") || "Type"}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("subject") || "Subject"}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("details") || "Details"}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400">{t("date") || "Date"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {userComms.map((comm) => (
                <tr key={comm.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      comm.type === 'email' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                      comm.type === 'impersonate' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                      comm.type === 'plan_change' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                      comm.type === 'ban' || comm.type === 'activated' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                      comm.type.startsWith('tag') ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' :
                      'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
                    }`}>{comm.type}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{comm.subject || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400 max-w-xs truncate">{comm.details ? JSON.stringify(comm.details).slice(0, 100) : '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-slate-400">{new Date(comm.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-slate-400">{t("noCommunications") || "No communication history yet"}</p>
      )}

      {commsTotal > 50 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setCommsPage((p) => Math.max(1, p - 1))} disabled={commsPage === 1} className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-slate-800 disabled:opacity-40">←</button>
          <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-slate-400">{commsPage} / {Math.ceil(commsTotal / 50)}</span>
          <button onClick={() => setCommsPage((p) => p + 1)} disabled={commsPage >= Math.ceil(commsTotal / 50)} className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-slate-800 disabled:opacity-40">→</button>
        </div>
      )}
    </div>
    </LazySection>
  );
}
