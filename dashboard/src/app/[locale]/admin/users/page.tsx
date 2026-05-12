'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { adminApi, type AdminUser } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { useTranslations, useLocale } from 'next-intl';

const PLAN_OPTIONS = [
  { value: 'developer', labelKey: 'developerPlan' },
  { value: 'startup', labelKey: 'startupPlan' },
  { value: 'pro', labelKey: 'proPlan' },
  { value: 'enterprise', labelKey: 'enterprisePlan' },
];

const PLAN_BADGE_COLORS: Record<string, string> = {
  developer: 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300',
  startup: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  pro: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
  enterprise: 'bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400',
};

export default function AdminUsersPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const locale = useLocale();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState('');
  const [planChangeTarget, setPlanChangeTarget] = useState<AdminUser | null>(null);
  const [newPlan, setNewPlan] = useState('');
  const [sortField, setSortField] = useState<'email' | 'name' | 'plan' | 'status' | 'created_at'>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'ban' | 'unban' | 'plan' | null>(null);
  const [bulkPlan, setBulkPlan] = useState('developer');
  const [bulkProcessing, setBulkProcessing] = useState(false);
  // Ban reason dialog
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [banReason, setBanReason] = useState('');
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const perPage = 20;

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const sortedUsers = [...users].sort((a, b) => {
    const aVal = a[sortField] || '';
    const bVal = b[sortField] || '';
    const cmp = String(aVal).localeCompare(String(bVal));
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const handleExportCSV = () => {
    if (!token) return;
    const url = adminApi.exportUsers(token, { plan: planFilter || undefined, status: statusFilter || undefined });
    const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');
    window.open(`${API}${url}&token=${token}`, '_blank');
  };

  const handleImpersonate = async (user: AdminUser) => {
    if (!token) return;
    try {
      const result = await adminApi.impersonateUser(token, user.id);
      // Open impersonated session in new tab
      window.open(`/${locale}/dashboard?impersonate_token=${result.token}`, '_blank');
      toast(t('impersonating') + `: ${user.email}`, 'success');
    } catch {
      toast(tc('error'), 'error');
    }
  };

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      // Calculate date range
      let created_after: string | undefined;
      const now = new Date();
      if (dateRange === '7d') {
        created_after = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      } else if (dateRange === '30d') {
        created_after = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      } else if (dateRange === '90d') {
        created_after = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }

      const data = await adminApi.listUsers(token, {
        page,
        search: search || undefined,
        plan: planFilter || undefined,
        status: statusFilter || undefined,
        created_after,
      });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {
      toast(tc('error'), 'error');
    } finally {
      setLoading(false);
    }
  }, [token, page, search, planFilter, statusFilter, dateRange, toast, tc]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleChangePlan = async () => {
    if (!planChangeTarget || !newPlan || !token) return;
    try {
      await adminApi.updateUserPlan(token, planChangeTarget.id, newPlan);
      toast(t('planUpdated', { plan: newPlan }), 'success');
      setPlanChangeTarget(null);
      fetchUsers();
    } catch {
      toast(tc('error'), 'error');
    }
  };

  const handleToggleStatus = async (user: AdminUser) => {
    if (!token) return;
    if (user.status === 'active') {
      // Show ban reason dialog
      setBanTarget(user);
      setBanReason('');
      return;
    }
    // Unbanning - do directly
    try {
      await adminApi.updateUserStatus(token, user.id, 'active');
      toast(t('userActivated'), 'success');
      fetchUsers();
    } catch {
      toast(tc('error'), 'error');
    }
  };

  const handleConfirmBan = async () => {
    if (!token || !banTarget) return;
    try {
      await adminApi.updateUserStatus(token, banTarget.id, 'banned');
      toast(t('userBanned'), 'success');
      setBanTarget(null);
      setBanReason('');
      fetchUsers();
    } catch {
      toast(tc('error'), 'error');
    }
  };

  const totalPages = Math.ceil(total / perPage);

  // Bulk selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === sortedUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(sortedUsers.map((u) => u.id)));
    }
  };
  const clearSelection = () => setSelectedIds(new Set());

  // Bulk action handler
  const handleBulkAction = async () => {
    if (!token || selectedIds.size === 0) return;
    setBulkProcessing(true);
    let successCount = 0;
    let failCount = 0;
    const ids = Array.from(selectedIds);

    try {
      if (bulkAction === 'ban' || bulkAction === 'unban') {
        const status = bulkAction === 'ban' ? 'banned' : 'active';
        const results = await Promise.allSettled(
          ids.map((id) => adminApi.updateUserStatus(token, id, status))
        );
        successCount = results.filter((r) => r.status === 'fulfilled').length;
        failCount = results.filter((r) => r.status === 'rejected').length;
      } else if (bulkAction === 'plan') {
        const results = await Promise.allSettled(
          ids.map((id) => adminApi.updateUserPlan(token, id, bulkPlan))
        );
        successCount = results.filter((r) => r.status === 'fulfilled').length;
        failCount = results.filter((r) => r.status === 'rejected').length;
      }

      if (successCount > 0) {
        toast(t('bulkActionSuccess', { count: successCount }) || `${successCount} user(s) updated`, 'success');
      }
      if (failCount > 0) {
        toast(t('bulkActionFailed', { count: failCount }) || `${failCount} failed`, 'error');
      }
      clearSelection();
      setBulkAction(null);
      fetchUsers();
    } catch {
      toast(tc('error'), 'error');
    } finally {
      setBulkProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('userManagement')}</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {t('userManagementDesc')}
        </p>
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="glass-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchByEmail')}
              aria-label={t('searchByEmail')}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-red-500 transition text-sm"
            />
          </div>
          <div>
            <label htmlFor="plan-filter" className="sr-only">{t('filterByPlan')}</label>
            <select
              id="plan-filter"
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
              aria-label={t('filterByPlan')}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="">{t('allPlans')}</option>
              {PLAN_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{t(p.labelKey)}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status-filter" className="sr-only">{t('filterByStatus')}</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              aria-label={t('filterByStatus')}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="">{t('allStatuses')}</option>
              <option value="active">{t('active')}</option>
              <option value="banned">{t('banned')}</option>
            </select>
          </div>
          <div>
            <label htmlFor="date-filter" className="sr-only">{t('filterByDate') || 'Date range'}</label>
            <select
              id="date-filter"
              value={dateRange}
              onChange={(e) => { setDateRange(e.target.value); setPage(1); }}
              aria-label={t('filterByDate') || 'Date range'}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="">{t('allTime') || 'All time'}</option>
              <option value="7d">{t('last7Days') || 'Last 7 days'}</option>
              <option value="30d">{t('last30Days') || 'Last 30 days'}</option>
              <option value="90d">{t('last90Days') || 'Last 90 days'}</option>
            </select>
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2"
          >
            <span aria-hidden="true">⬇</span> {t('exportCSV')}
          </button>
        </div>
      </form>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="glass-card p-4 flex flex-wrap items-center gap-3 border-2 border-red-200 dark:border-red-500/30">
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">
            {t('selectedCount', { count: selectedIds.size }) || `${selectedIds.size} selected`}
          </span>
          <div className="flex items-center gap-2 ml-auto">
            <button type="button"
              onClick={() => setBulkAction('ban')}
              className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition"
            >
              🚫 {t('bulkBan') || 'Ban Selected'}
            </button>
            <button type="button"
              onClick={() => setBulkAction('unban')}
              className="px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition"
            >
              ✅ {t('bulkUnban') || 'Unban Selected'}
            </button>
            <button type="button"
              onClick={() => { setBulkAction('plan'); setBulkPlan('developer'); }}
              className="px-3 py-1.5 text-xs font-medium text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-500/20 transition"
            >
              📋 {t('bulkChangePlan') || 'Change Plan'}
            </button>
            <button type="button"
              onClick={clearSelection}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition"
            >
              ✕ {tc('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Bulk Action Confirm Modal */}
      {bulkAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setBulkAction(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {bulkAction === 'ban' ? t('bulkBan') || 'Ban Selected' :
               bulkAction === 'unban' ? t('bulkUnban') || 'Unban Selected' :
               t('bulkChangePlan') || 'Change Plan'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('bulkActionConfirm', { count: selectedIds.size }) || `This will affect ${selectedIds.size} user(s).`}
            </p>
            {bulkAction === 'plan' && (
              <select
                value={bulkPlan}
                onChange={(e) => setBulkPlan(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white mb-4"
              >
                {PLAN_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>{t(p.labelKey)}</option>
                ))}
              </select>
            )}
            <div className="flex gap-3 justify-end">
              <button type="button"
                onClick={() => setBulkAction(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                {tc('cancel')}
              </button>
              <button type="button"
                onClick={handleBulkAction}
                disabled={bulkProcessing}
                className={`px-4 py-2.5 text-sm font-medium text-white rounded-xl transition disabled:opacity-60 ${
                  bulkAction === 'ban' ? 'bg-red-600 hover:bg-red-700' :
                  bulkAction === 'unban' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  'bg-violet-600 hover:bg-violet-700'
                }`}
              >
                {bulkProcessing ? tc('saving') : tc('confirm') || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 dark:text-slate-400 animate-pulse">
            {t('loadingUsers')}
          </div>
        ) : users.length === 0 ? (
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
                        className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-red-600 focus:ring-red-500"
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
                          className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-red-600 focus:ring-red-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-slate-400">
                        {u.id.slice(0, 8)}…
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {(u.name || u.email)?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white">{u.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{u.name || '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PLAN_BADGE_COLORS[u.plan] || PLAN_BADGE_COLORS.developer}`}>
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
                        {new Date(u.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
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
                <div className="flex gap-2">
                  <button type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                  >
                    {tc('previous')}
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-slate-400">
                    {tc('pageOf', { page, totalPages })}
                  </span>
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

      {/* Ban Reason Modal */}
      {banTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setBanTarget(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🚫 {t('banUser')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('banUserConfirm', { email: banTarget.email }) || `Are you sure you want to ban ${banTarget.email}?`}
            </p>
            <div className="mb-4">
              <label htmlFor="ban-reason" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                {t('banReason') || 'Reason (optional)'}
              </label>
              <textarea
                id="ban-reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={3}
                placeholder={t('banReasonPlaceholder') || 'Enter reason for banning this user...'}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button"
                onClick={() => setBanTarget(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                {tc('cancel')}
              </button>
              <button type="button"
                onClick={handleConfirmBan}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition"
              >
                {t('banUser') || 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Change Modal */}
      {planChangeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPlanChangeTarget(null)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('changePlan')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('changePlanFor', { email: planChangeTarget.email })}
            </p>
            <select
              value={newPlan}
              onChange={(e) => setNewPlan(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white mb-4"
            >
              {PLAN_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{t(p.labelKey)}</option>
              ))}
            </select>
            <div className="flex gap-3 justify-end">
              <button type="button"
                onClick={() => setPlanChangeTarget(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                {tc('cancel')}
              </button>
              <button type="button"
                onClick={handleChangePlan}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition"
              >
                {t('updatePlan')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
