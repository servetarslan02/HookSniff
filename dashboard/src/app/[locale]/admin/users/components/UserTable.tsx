'use client';

import { PrefetchLink } from '@/components/PrefetchLink';
import { useAuth } from '@/lib/store';
import { apiFetch } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { VirtualTable } from '@/components/VirtualTable';
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
  total: number;
  locale: string;
  handleToggleStatus: (user: AdminUser) => void;
  handleImpersonate: (user: AdminUser) => void;
  setPlanChangeTarget: (user: AdminUser) => void;
  setNewPlan: (plan: string) => void;
  planBadgeColors: PlanBadgeColors;
  hasMore?: boolean;
  handleLoadMore?: () => void;
  t: any;
  tc: any;
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
  total,
  locale,
  handleToggleStatus: _handleToggleStatus,
  handleImpersonate: _handleImpersonate,
  setPlanChangeTarget,
  setNewPlan,
  planBadgeColors,
  hasMore,
  handleLoadMore,
  t,
  tc,
}: UserTableProps) {
  const { token } = useAuth();

  // Prefetch user detail on hover
  const userDetailPrefetch = (id: string) => token ? [
    { queryKey: ['admin', 'user', id], queryFn: () => apiFetch(`/admin/users/${id}`, { token }), staleTime: 30_000 },
    { queryKey: ['admin', 'user', id, 'endpoints'], queryFn: () => apiFetch(`/admin/users/${id}/endpoints`, { token }), staleTime: 30_000 },
    { queryKey: ['admin', 'user', id, 'webhooks'], queryFn: () => apiFetch(`/admin/users/${id}/webhooks`, { token }), staleTime: 30_000 },
  ] : [];

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
      <VirtualTable
        data={sortedUsers}
        estimateSize={60}
        header={
          <div className="grid grid-cols-[36px_1fr_80px_80px_80px_100px] md:grid-cols-[36px_70px_1fr_80px_80px_80px_100px] lg:grid-cols-[36px_70px_1fr_100px_90px_90px_100px_120px] bg-gray-50/50 dark:bg-slate-800/50">
            <div className="px-2 py-3 flex items-center">
              <input
                type="checkbox"
                checked={sortedUsers.length > 0 && selectedIds.size === sortedUsers.length}
                onChange={toggleSelectAll}
                aria-label={t('selectAll') || 'Select all'}
                className="w-4 h-4 rounded-sm border-gray-300 dark:border-slate-600 text-red-600 focus:ring-red-500"
              />
            </div>
            <div className="hidden md:flex px-2 py-3 items-center"><span className="text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{tc('id')}</span></div>
            <button type="button" onClick={() => handleSort('email')} className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-slate-300 transition flex items-center gap-1" aria-label={t('sortByEmail')}>
              {tc('email')} {sortField === 'email' && (sortDir === 'asc' ? '↑' : '↓')}
            </button>
            <button type="button" onClick={() => handleSort('plan')} className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-slate-300 transition flex items-center gap-1" aria-label={t('sortByPlan')}>
              {tc('plan')} {sortField === 'plan' && (sortDir === 'asc' ? '↑' : '↓')}
            </button>
            <button type="button" onClick={() => handleSort('status')} className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-slate-300 transition flex items-center gap-1" aria-label={t('sortByStatus')}>
              {tc('status')} {sortField === 'status' && (sortDir === 'asc' ? '↑' : '↓')}
            </button>
            <button type="button" onClick={() => handleSort('created_at')} className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-slate-300 transition flex items-center gap-1" aria-label={t('sortByCreated')}>
              {tc('created')} {sortField === 'created_at' && (sortDir === 'asc' ? '↑' : '↓')}
            </button>
            <div className="hidden lg:flex px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider items-center">{tc('actions')}</div>
          </div>
        }
        renderRow={(u) => (
          <div className={`grid grid-cols-[36px_1fr_80px_80px_80px_100px] md:grid-cols-[36px_70px_1fr_80px_80px_80px_100px] lg:grid-cols-[36px_70px_1fr_100px_90px_90px_100px_120px] hover:bg-gray-100 dark:hover:bg-gray-700 transition border-b border-gray-200/50 dark:border-slate-700/50 ${selectedIds.has(u.id) ? 'bg-red-50/50 dark:bg-red-500/5' : ''}`}>
            <div className="px-2 py-3 flex items-center">
              <input
                type="checkbox"
                checked={selectedIds.has(u.id)}
                onChange={() => toggleSelect(u.id)}
                aria-label={`Select ${u.email}`}
                className="w-4 h-4 rounded-sm border-gray-300 dark:border-slate-600 text-red-600 focus:ring-red-500"
              />
            </div>
            <div className="hidden md:flex px-2 py-3 text-xs font-mono text-gray-600 dark:text-slate-400 items-center">{u.id.slice(0, 8)}…</div>
            <div className="px-2 py-3 flex items-center min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-linear-to-br from-red-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {(u.name || u.email)?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <span className="text-xs sm:text-sm text-gray-900 dark:text-white truncate block">{u.email}</span>
                  <span className="text-[11px] text-gray-500 dark:text-slate-400 truncate block lg:hidden">{u.name || '—'}</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:flex px-2 py-3 text-xs text-gray-600 dark:text-slate-400 items-center truncate">{u.name || '—'}</div>
            <div className="px-2 py-3 flex items-center">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium ${planBadgeColors[u.plan ?? 'developer'] || planBadgeColors.developer}`}>
                {u.plan ?? 'dev'}
              </span>
            </div>
            <div className="px-2 py-3 flex items-center">
              <StatusBadge status={u.status ?? 'active'} />
            </div>
            <div className="px-2 py-3 text-[11px] text-gray-500 dark:text-slate-400 flex items-center">
              {new Date(u.created_at ?? '').toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', { day: '2-digit', month: '2-digit', year: '2-digit' })}
            </div>
            <div className="hidden lg:flex px-2 py-3 items-center gap-2">
              <PrefetchLink href={`/admin/users/${u.id}`} prefetchData={userDetailPrefetch(u.id)} hoverDelay={80} className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium">{tc('view')}</PrefetchLink>
              <button type="button" onClick={() => { setPlanChangeTarget(u); setNewPlan(u.plan ?? 'developer'); }} className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 font-medium">{t('changePlan')}</button>
            </div>
          </div>
        )}      />
        {/* Infinite Scroll */}
        {hasMore && (
            <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-slate-700/50 flex items-center justify-center">
              {isLoading ? (
                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500">
                  <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 border-t-brand-500 rounded-full animate-spin" />
                  <span className="text-sm">{tc('loading')}</span>
                </div>
              ) : (
                <button type="button" onClick={handleLoadMore}
                  className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
                >
                  {tc('showing', { from: 1, to: sortedUsers.length, total })} — {tc('loadMore') || 'Load more'}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
