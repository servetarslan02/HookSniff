'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { adminApi, type AdminUser } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { useTranslations, useLocale } from 'next-intl';

const PLAN_OPTIONS = [
  { value: 'free', labelKey: 'freePlan' },
  { value: 'pro', labelKey: 'proPlan' },
  { value: 'business', labelKey: 'businessPlan' },
];

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
  const [planChangeTarget, setPlanChangeTarget] = useState<AdminUser | null>(null);
  const [newPlan, setNewPlan] = useState('');
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const perPage = 20;

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
      const data = await adminApi.listUsers(token, {
        page,
        search: search || undefined,
        plan: planFilter || undefined,
        status: statusFilter || undefined,
      });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch {
      toast(tc('error'), 'error');
    } finally {
      setLoading(false);
    }
  }, [token, page, search, planFilter, statusFilter, toast, tc]);

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
    const newStatus = user.status === 'active' ? 'banned' : 'active';
    try {
      await adminApi.updateUserStatus(token, user.id, newStatus);
      toast(newStatus === 'banned' ? t('userBanned') : t('userActivated'), 'success');
      fetchUsers();
    } catch {
      toast(tc('error'), 'error');
    }
  };

  const totalPages = Math.ceil(total / perPage);

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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
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
            <select
              value={planFilter}
              onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="">{t('allPlans')}</option>
              {PLAN_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>{t(p.labelKey)}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="">{t('allStatuses')}</option>
              <option value="active">{t('active')}</option>
              <option value="banned">{t('banned')}</option>
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{tc('id')}</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{tc('email')}</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{tc('name')}</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{tc('plan')}</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{tc('status')}</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{tc('created')}</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">{tc('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                  {users.map((u, index) => (
                    <tr key={u.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-gray-100 dark:hover:bg-gray-700 transition`}>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-slate-400">
                        {u.id.slice(0, 8)}…
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{u.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{u.name || '—'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">
                          {u.plan}
                        </span>
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
                          <button
                            onClick={() => { setPlanChangeTarget(u); setNewPlan(u.plan); }}
                            className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 font-medium"
                          >
                            {t('changePlan')}
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`text-xs font-medium ${
                              u.status === 'active'
                                ? 'text-red-600 dark:text-red-400 hover:text-red-700'
                                : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
                            }`}
                          >
                            {u.status === 'active' ? t('banUser') : t('activateUser')}
                          </button>
                          <button
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
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                  >
                    {tc('previous')}
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-slate-400">
                    {tc('pageOf', { page, totalPages })}
                  </span>
                  <button
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
              <button
                onClick={() => setPlanChangeTarget(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                {tc('cancel')}
              </button>
              <button
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
