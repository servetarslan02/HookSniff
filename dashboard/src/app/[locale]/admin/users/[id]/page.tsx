'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { adminApi, type AdminUserDetail } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { useTranslations, useLocale } from 'next-intl';

const PLAN_OPTIONS = ['free', 'pro', 'business'];

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const locale = useLocale();
  const { token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPlan, setNewPlan] = useState('');

  const fetchDetail = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const data = await adminApi.getUserDetail(token, id);
      setDetail(data);
      setNewPlan(data.user.plan);
    } catch {
      toast(t("failedToLoadDetails"), "error");
    } finally {
      setLoading(false);
    }
  }, [token, id, toast]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleUpdatePlan = async () => {
    if (!token || !id || !newPlan) return;
    try {
      await adminApi.updateUserPlan(token, id, newPlan);
      toast(t("planUpdated", { plan: newPlan }), "success");
      fetchDetail();
    } catch {
      toast(t("failedToUpdatePlan"), "error");
    }
  };

  const handleToggleStatus = async () => {
    if (!token || !id || !detail) return;
    const newStatus = detail.user.status === 'active' ? 'banned' : 'active';
    try {
      await adminApi.updateUserStatus(token, id, newStatus);
      toast(newStatus === "banned" ? t("userBanned") : t("userActivated"), "success");
      fetchDetail();
    } catch {
      toast(t("failedToUpdateStatus"), "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32" />
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("userNotFound")}</h2>
        <button
          onClick={() => router.push(`/${locale}/admin/users`)}
          className="text-brand-600 dark:text-brand-400 text-sm font-medium"
        >
          {t("backToUsers")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push(`/${locale}/admin/users`)}
          className="text-gray-500 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-400 transition"
        >
          {tc("back")}
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {detail.user.name || detail.user.email}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{t("userDetail")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("userInfo")}</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 dark:text-slate-400">ID</label>
              <p className="text-sm font-mono text-gray-900 dark:text-white">{detail.user.id}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-slate-400">{t("email")}</label>
              <p className="text-sm text-gray-900 dark:text-white">{detail.user.email}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-slate-400">{t("name")}</label>
              <p className="text-sm text-gray-900 dark:text-white">{detail.user.name || '—'}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-slate-400">{t("status")}</label>
              <div className="mt-1">
                <StatusBadge status={detail.user.status} />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-slate-400">{t("created")}</label>
              <p className="text-sm text-gray-900 dark:text-white">
                {new Date(detail.user.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Plan & Status Management */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("management")}</h2>

          <div className="space-y-6">
            {/* Plan Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                {t("plan")}
              </label>
              <div className="flex gap-2">
                <label htmlFor="user-plan-select" className="sr-only">{t("plan")}</label>
                <select
                  id="user-plan-select"
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  aria-label={t("plan")}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                >
                  {PLAN_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
                <button
                  onClick={handleUpdatePlan}
                  disabled={newPlan === detail.user.plan}
                  className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition disabled:opacity-40"
                >
                  {t("update")}
                </button>
              </div>
            </div>

            {/* Status Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                {t("accountStatus")}
              </label>
              <button
                onClick={handleToggleStatus}
                className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  detail.user.status === 'active'
                    ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20'
                    : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20'
                }`}
              >
                {detail.user.status === 'active' ? t('banUser') : t('activateUser')}
              </button>
            </div>

            {/* Usage Stats */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                {t("usageStats")}
              </label>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-slate-400">{t("totalDeliveries")}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {detail.usage_stats?.total_deliveries?.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-slate-400">{t("successRate")}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {detail.usage_stats?.success_rate || 0}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-slate-400">{t("endpoints")}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {detail.usage_stats?.endpoints_count || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Endpoints List */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("endpoints")}</h2>
          {detail.endpoints?.length ? (
            <div className="space-y-3">
              {detail.endpoints.map((ep) => (
                <div
                  key={ep.id}
                  className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700"
                >
                  <p className="text-sm font-mono text-gray-900 dark:text-white truncate">{ep.url}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${ep.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {ep.is_active ? t('active') : t('inactive')}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-slate-400">
                      {new Date(ep.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">{t("noEndpoints")}</p>
          )}
        </div>
      </div>

      {/* Recent Deliveries */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("recentDeliveries")}</h2>
        </div>
        {detail.recent_deliveries?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("event")}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("status")}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("attempts")}</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t("time")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {detail.recent_deliveries.map((d, index) => (
                  <tr key={d.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-gray-100 dark:hover:bg-gray-700 transition`}>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-slate-400">{d.id.slice(0, 10)}…</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-xs font-mono text-gray-700 dark:text-slate-300">
                        {d.event || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{d.attempt_count}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                      {new Date(d.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500 dark:text-slate-400 text-sm">
            {t("noDeliveries")}
          </div>
        )}
      </div>
    </div>
  );
}
