'use client';

import { useState, useEffect, useCallback } from 'react';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { adminApi, type AdminUser } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { useTranslations } from 'next-intl';

const PLAN_OPTIONS = ['free', 'pro', 'business'];

export default function AdminUsersPage() {
  const { token } = useAuth();
  const { toast } = useToast();
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
      toast(`Plan updated to ${newPlan}`, 'success');
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
      toast(`User ${newStatus === 'banned' ? 'banned' : 'activated'}`, 'success');
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
          Manage users, plans, and account status
        </p>
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearch} className="glass-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchByEmail')}
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
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
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
        </div>
      </form>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 dark:text-slate-500 animate-pulse">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-gray-400 dark:text-slate-500">
            No users found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
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
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/users/${u.id}`}
                            className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => { setPlanChangeTarget(u); setNewPlan(u.plan); }}
                            className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 font-medium"
                          >
                            Plan
                          </button>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`text-xs font-medium ${
                              u.status === 'active'
                                ? 'text-red-600 dark:text-red-400 hover:text-red-700'
                                : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
                            }`}
                          >
                            {u.status === 'active' ? 'Ban' : 'Activate'}
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
                  Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-slate-400">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-slate-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                  >
                    Next
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
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Change Plan
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              Change plan for <span className="font-medium text-gray-900 dark:text-white">{planChangeTarget.email}</span>
            </p>
            <select
              value={newPlan}
              onChange={(e) => setNewPlan(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white mb-4"
            >
              {PLAN_OPTIONS.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setPlanChangeTarget(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePlan}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition"
              >
                Update Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
