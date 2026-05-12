'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { adminApi, webhooksApi, type AdminUserDetail, type UserAnalytics, type DeliveryDetail, type DeliveryAttempt } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { LazyBarChart as BarChart, LazyPieChart as PieChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Pie, Cell } from '@/components/LazyCharts';
import { useTranslations, useLocale } from 'next-intl';

const PLAN_OPTIONS = ['developer', 'startup', 'pro', 'enterprise'];

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const locale = useLocale();
  const { token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [newPlan, setNewPlan] = useState('');
  // Delivery detail modal
  const [deliveryDetail, setDeliveryDetail] = useState<DeliveryDetail | null>(null);
  const [deliveryAttempts, setDeliveryAttempts] = useState<DeliveryAttempt[]>([]);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  // Plan history
  const [planHistory, setPlanHistory] = useState<Array<{ action: string; details: Record<string, unknown>; created_at: string }>>([]);
  // Email modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSending, setEmailSending] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const [detailData, analyticsData, planHistoryData] = await Promise.all([
        adminApi.getUserDetail(token, id),
        adminApi.getUserAnalytics(token, id, 30).catch(() => null),
        adminApi.getUserPlanHistory(token, id).catch(() => ({ history: [] })),
      ]);
      setDetail(detailData);
      setAnalytics(analyticsData);
      setNewPlan(detailData.user.plan);
      setPlanHistory(planHistoryData.history || []);
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

  const handleReplay = async (deliveryId: string) => {
    if (!token) return;
    try {
      await adminApi.replayDelivery(token, deliveryId);
      toast(t("replaySuccess"), "success");
      fetchDetail();
    } catch {
      toast(t("replayFailed"), "error");
    }
  };

  const handleViewDelivery = async (deliveryId: string) => {
    if (!token) return;
    setDeliveryLoading(true);
    try {
      const [detail, attempts] = await Promise.all([
        webhooksApi.get(token, deliveryId),
        webhooksApi.getAttempts(token, deliveryId).catch(() => []),
      ]);
      setDeliveryDetail(detail);
      setDeliveryAttempts(attempts);
    } catch {
      toast(tc('error'), 'error');
    } finally {
      setDeliveryLoading(false);
    }
  };

  const handleImpersonate = async () => {
    if (!token || !id || !detail) return;
    try {
      const result = await adminApi.impersonateUser(token, id);
      window.open(`/${locale}/dashboard?impersonate_token=${result.token}`, '_blank');
      toast(t('impersonating') + `: ${detail.user.email}`, 'success');
    } catch {
      toast(tc('error'), 'error');
    }
  };

  const handleSendEmail = async () => {
    if (!token || !id || !emailSubject.trim() || !emailBody.trim()) return;
    setEmailSending(true);
    try {
      await adminApi.sendUserEmail(token, id, emailSubject, emailBody);
      toast(t('emailSent') || 'Email sent successfully', 'success');
      setShowEmailModal(false);
      setEmailSubject('');
      setEmailBody('');
    } catch {
      toast(t('emailSendFailed') || 'Failed to send email', 'error');
    } finally {
      setEmailSending(false);
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
        <button type="button"
          onClick={() => router.push('/admin/users')}
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
        <button type="button"
          onClick={() => router.push('/admin/users')}
          className="text-gray-500 dark:text-slate-400 hover:text-gray-600 dark:hover:text-slate-400 transition"
        >
          {tc("back")}
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {detail.user.name || detail.user.email}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{t("userDetail")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEmailModal(true)}
            className="px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/20 transition"
          >
            📧 {t('sendEmail') || 'Send Email'}
          </button>
          <button
            onClick={handleImpersonate}
            className="px-4 py-2 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-xl text-sm font-medium hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-500/20 transition"
          >
            👁️ {t('impersonateUser')}
          </button>
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
                <select
                  value={newPlan}
                  onChange={(e) => setNewPlan(e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                >
                  {PLAN_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
                <button type="button"
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
              <button type="button"
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

      {/* Plan History */}
      {planHistory.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📋 {t("planHistory") || "Plan History"}</h2>
          </div>
          <div className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
            {planHistory.map((entry, i) => (
              <div key={i} className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {String(entry.details?.new_plan || '—')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {t("changedBy") || "Changed by"}: {String(entry.details?.admin_email || 'system')}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{tc("actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {detail.recent_deliveries.map((d, index) => (
                  <tr key={d.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer`} onClick={() => handleViewDelivery(d.id)}>
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button type="button"
                          onClick={() => handleViewDelivery(d.id)}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
                        >
                          🔍 {t("viewDetails") || "Details"}
                        </button>
                        <button type="button"
                          onClick={() => handleReplay(d.id)}
                          className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium"
                        >
                          ↩ {t("replayDelivery")}
                        </button>
                      </div>
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

      {/* Customer Analytics Charts */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Deliveries Chart */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("dailyDeliveries")}</h2>
            <div className="h-48">
              {analytics.daily_deliveries?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.daily_deliveries.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgb(15 23 42)', border: 'none', borderRadius: '12px', color: 'white' }}
                    />
                    <Bar dataKey="success" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-8">{t("noData")}</p>
              )}
            </div>
          </div>

          {/* Event Distribution */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("eventDistribution")}</h2>
            <div className="h-48">
              {analytics.top_events?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.top_events}
                      dataKey="count"
                      nameKey="event"
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={60}
                      paddingAngle={4}
                    >
                      {analytics.top_events.map((_, i) => (
                        <Cell key={i} fill={['#4c6ef5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgb(15 23 42)', border: 'none', borderRadius: '12px', color: 'white' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-8">{t("noData")}</p>
              )}
            </div>
          </div>

          {/* Endpoint Health */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("endpointHealth")}</h2>
            <div className="space-y-3">
              {analytics.endpoint_health?.length > 0 ? (
                analytics.endpoint_health.map((ep, i) => (
                  <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                    <p className="text-xs font-mono text-gray-900 dark:text-white truncate">{ep.url}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1">
                        <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${ep.success_rate >= 99 ? 'bg-green-500' : ep.success_rate >= 95 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${ep.success_rate}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-gray-600 dark:text-slate-400 w-12 text-right">{ep.success_rate}%</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-1">avg {ep.avg_latency_ms}ms</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-8">{t("noEndpoints")}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowEmailModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              📧 {t('sendEmail') || 'Send Email'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('sendEmailTo', { email: detail.user.email }) || `Send email to ${detail.user.email}`}
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="email-subject" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('subject') || 'Subject'}</label>
                <input
                  id="email-subject"
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="email-body" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('message') || 'Message'}</label>
                <textarea
                  id="email-body"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-4">
              <button type="button"
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                {tc('cancel')}
              </button>
              <button type="button"
                onClick={handleSendEmail}
                disabled={emailSending || !emailSubject.trim() || !emailBody.trim()}
                className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-60"
              >
                {emailSending ? tc('saving') : t('send') || 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Detail Modal */}
      {deliveryDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setDeliveryDetail(null); setDeliveryAttempts([]); }} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                🔍 {t("deliveryDetails") || "Delivery Details"}
              </h3>
              <button type="button"
                onClick={() => { setDeliveryDetail(null); setDeliveryAttempts([]); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition"
              >
                ✕
              </button>
            </div>

            {deliveryLoading ? (
              <div className="py-8 text-center text-gray-500 dark:text-slate-400">{tc('loading')}</div>
            ) : (
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400">ID</label>
                    <p className="text-sm font-mono text-gray-900 dark:text-white break-all">{deliveryDetail.id}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400">{t("status")}</label>
                    <div className="mt-1"><StatusBadge status={deliveryDetail.status} /></div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400">{t("event")}</label>
                    <p className="text-sm text-gray-900 dark:text-white">{deliveryDetail.event || '—'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400">{t("attempts")}</label>
                    <p className="text-sm text-gray-900 dark:text-white">{deliveryDetail.attempt_count}</p>
                  </div>
                  {deliveryDetail.endpoint_url && (
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 dark:text-slate-400">{t("endpoint")}</label>
                      <p className="text-sm font-mono text-gray-900 dark:text-white break-all">{deliveryDetail.endpoint_url}</p>
                    </div>
                  )}
                  {deliveryDetail.error_message && (
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 dark:text-slate-400">{t("error")}</label>
                      <p className="text-sm text-red-600 dark:text-red-400">{deliveryDetail.error_message}</p>
                    </div>
                  )}
                </div>

                {/* Request Body */}
                {deliveryDetail.request_body && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">{t("payload") || "Payload"}</label>
                    <pre className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl text-xs font-mono text-gray-800 dark:text-slate-300 overflow-x-auto max-h-40">
                      {typeof deliveryDetail.request_body === 'string'
                        ? deliveryDetail.request_body
                        : JSON.stringify(deliveryDetail.request_body, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Request Headers */}
                {deliveryDetail.request_headers && Object.keys(deliveryDetail.request_headers).length > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400 mb-1 block">{t("headers") || "Headers"}</label>
                    <pre className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl text-xs font-mono text-gray-800 dark:text-slate-300 overflow-x-auto max-h-32">
                      {JSON.stringify(deliveryDetail.request_headers, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Attempts */}
                {deliveryAttempts.length > 0 && (
                  <div>
                    <label className="text-xs text-gray-500 dark:text-slate-400 mb-2 block">{t("attempts") || "Attempts"}</label>
                    <div className="space-y-2">
                      {deliveryAttempts.map((a) => (
                        <div key={a.id} className="p-3 bg-gray-50 dark:bg-slate-900 rounded-xl">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
                              #{a.attempt_number} — <StatusBadge status={a.status} />
                            </span>
                            <span className="text-xs text-gray-500 dark:text-slate-400">
                              {a.duration_ms ? `${a.duration_ms}ms` : ''} {new Date(a.created_at).toLocaleString()}
                            </span>
                          </div>
                          {a.response_status && (
                            <p className="text-xs text-gray-600 dark:text-slate-400">HTTP {a.response_status}</p>
                          )}
                          {a.error_message && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{a.error_message}</p>
                          )}
                          {a.response_body && (
                            <pre className="mt-2 p-2 bg-gray-100 dark:bg-slate-800 rounded text-xs font-mono text-gray-700 dark:text-slate-300 overflow-x-auto max-h-24">
                              {a.response_body}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
