'use client';

import { Link } from '@/i18n/navigation';
import { StatusBadge } from '@/components/StatusBadge';
import type { AdminUser } from '@/lib/api';

interface PlanBadgeColors {
  [key: string]: string;
}

interface UserTableProps {
  sortedUsers: AdminUser[];
  isLoading: boolean;
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  toggleSelectAll: () => void;
  sortField: 'email' | 'name' | 'plan' | 'status' | 'created_at';
  sortDir: 'asc' | 'desc';
  handleSort: (field: 'email' | 'name' | 'plan' | 'status' | 'created_at') => void;
  page: number;
  setPage: (page: number | ((p: number) => number)) => void;
  totalPages: number;
  total: number;
  perPage: number;
  locale: string;
  handleToggleStatus: (user: AdminUser) => void;
  handleImpersonate: (user: AdminUser) => void;
  setPlanChangeTarget: (user: AdminUser) => void;
  setNewPlan: (plan: string) => void;
  planBadgeColors: PlanBadgeColors;
  t: (key: string) => string;
  tc: (key: string) => string;
}

export function UserTable({
  sortedUsers,
  isLoading,
  selectedIds,
  toggleSelect,
  toggleSelectAll,
  sortField,
  sortDir,
  handleSort,
  page,
  setPage,
  totalPages,
  total,
  perPage,
  locale,
  handleToggleStatus,
  handleImpersonate,
  setPlanChangeTarget,
  setNewPlan,
  planBadgeColors,
  t,
  tc,
}: UserTableProps) {
  return (
    <div className="glass-card overflow-hidden">
      {isLoading ? (
        <div className="p-12 text-center text-gray-500 dark:text-slate-400 animate-pulse">
          {t('loadingUsers')}
        </div>
      ) : sortedUsers.length === 0 ? (
        <div className="p-12 text-center text-gray-500 dark:text-slate-400">
          {t("noUsers")}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th scope="col" className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={sortedUsers.length > 0 && selectedIds.size === sortedUsers.length}
                      onChange={toggleSelectAll}
                      aria-label={t('selectAll') || 'Select all'}
                      className="w-4 h-4 rounded-sm border-gray-300 dark:border-slate-600 text-red-600 focus:ring-red-500"
                    />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{tc('id')}</th>
                  <th scope="col">
                    <button type="button" onClick={() => handleSort('email')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-slate-300 transition flex items-center gap-1" aria-label={t('sortByEmail')}>
                      {tc('email')} {sortField === 'email' && (sortDir === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th scope="col">
                    <button type="button" onClick={() => handleSort('name')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-slate-300 transition flex items-center gap-1" aria-label={t('sortByName')}>
                      {tc('name')} {sortField === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th scope="col">
                    <button type="button" onClick={() => handleSort('plan')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-slate-300 transition flex items-center gap-1" aria-label={t('sortByPlan')}>
                      {tc('plan')} {sortField === 'plan' && (sortDir === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th scope="col">
                    <button type="button" onClick={() => handleSort('status')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-slate-300 transition flex items-center gap-1" aria-label={t('sortByStatus')}>
                      {tc('status')} {sortField === 'status' && (sortDir === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th scope="col">
                    <button type="button" onClick={() => handleSort('created_at')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-slate-300 transition flex items-center gap-1" aria-label={t('sortByCreated')}>
                      {tc('created')} {sortField === 'created_at' && (sortDir === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{tc('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {sortedUsers.map((u, index) => (
                  <tr key={u.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-gray-100 dark:hover:bg-gray-700 transition ${selectedIds.has(u.id) ? 'bg-red-50/50 dark:bg-red-500/5' : ''}`}>
                    <td className="px-3 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(u.id)}
                        onChange={() => toggleSelect(u.id)}
                        aria-label={`Select ${u.email}`}
                        className="w-4 h-4 rounded-sm border-gray-300 dark:border-slate-600 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-slate-400">
                      {u.id.slice(0, 8)}…
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-red-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(u.name || u.email)?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{u.name || '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${planBadgeColors[u.plan] || planBadgeColors.developer}`}>
                          {u.plan}
                        </span>
                        {u.role && u.role !== 'member' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
                            {u.role}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <StatusBadge status={u.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                      {new Date(u.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium"
                        >
                          {tc('view')}
                        </Link>
                        <button type="button"
                          onClick={() => { setPlanChangeTarget(u); setNewPlan(u.plan); }}
                          className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 font-medium"
                        >
                          {t('changePlan')}
                        </button>
                        <button type="button"
                          onClick={() => handleToggleStatus(u)}
                          className={`text-xs font-medium ${
                            u.status === 'active'
                              ? 'text-red-600 dark:text-red-400 hover:text-red-700'
                              : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
                          }`}
                        >
                          {u.status === 'active' ? t('banUser') : t('activateUser')}
                        </button>
                        <button type="button"
                          onClick={() => handleImpersonate(u)}
                          className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 font-medium"
                          title={t('viewAsUser')}
                        >
                          👁️ {t('impersonateUser')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > perPage && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-slate-700/50 flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-slate-400">
                {tc('showing', { from: (page - 1) * perPage + 1, to: Math.min(page * perPage, total), total })}
              </span>
              <div className="flex gap-1">
                <button type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  {tc('previous')}
                </button>
                {/* Page numbers */}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 3) {
                    pageNum = totalPages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                        page === pageNum
                          ? 'bg-red-600 text-white border-red-600'
                          : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  {tc('next')}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
